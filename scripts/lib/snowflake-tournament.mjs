import { diffLines, diffWordsWithSpace } from "diff";
import {
  SnowflakeError,
  stableJson,
} from "./snowflake-common.mjs";

export const TOURNAMENT_PUBLIC_SCHEMA =
  "causal-projector.snowflake-tournament-public/v1";

const TOURNAMENT_FAMILY = "condensed-tournament";
const VERSION_ID = /^draft:condensed-tournament:round(\d+)-(base|[ab])$/;

const wordCount = (value) => value.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu)?.length ?? 0;

function versionSlug(id) {
  const slug = id.replaceAll(":", "--");
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new SnowflakeError(
      "TOURNAMENT_VERSION_ID_INVALID",
      `Cannot create a tournament fragment name for ${id}`,
    );
  }
  return slug;
}

function storyBody(value, id) {
  const normalized = value.replaceAll("\r\n", "\n");
  const start = normalized.search(/^##\s+/m);
  if (start === -1) {
    throw new SnowflakeError(
      "TOURNAMENT_BODY_INVALID",
      `${id} does not contain a story section after its provenance header`,
    );
  }
  return `${normalized.slice(start).trim()}\n`;
}

function componentLines(value) {
  const lines = value.split("\n");
  if (lines.at(-1) === "") lines.pop();
  return lines;
}

function inlineParts(left, right) {
  const parts = diffWordsWithSpace(left ?? "", right ?? "");
  return {
    left: parts
      .filter((part) => !part.added)
      .map((part) => ({
        type: part.removed ? "delete" : "equal",
        text: part.value,
      })),
    right: parts
      .filter((part) => !part.removed)
      .map((part) => ({
        type: part.added ? "insert" : "equal",
        text: part.value,
      })),
  };
}

export function buildLineDiff(baseline, candidate) {
  const components = diffLines(baseline, candidate);
  const rows = [];
  let baselineLine = 1;
  let candidateLine = 1;
  let changeGroup = 0;
  let addedLines = 0;
  let removedLines = 0;

  for (let index = 0; index < components.length; index += 1) {
    const component = components[index];
    if (!component.added && !component.removed) {
      for (const text of componentLines(component.value)) {
        rows.push({
          type: "context",
          baselineLine: baselineLine++,
          candidateLine: candidateLine++,
          text,
        });
      }
      continue;
    }

    const removed = [];
    const added = [];
    while (
      index < components.length &&
      (components[index].added || components[index].removed)
    ) {
      const changed = components[index];
      const lines = componentLines(changed.value);
      if (changed.removed) removed.push(...lines);
      if (changed.added) added.push(...lines);
      index += 1;
    }
    index -= 1;
    changeGroup += 1;
    removedLines += removed.length;
    addedLines += added.length;

    const count = Math.max(removed.length, added.length);
    for (let offset = 0; offset < count; offset += 1) {
      const leftText = removed[offset] ?? null;
      const rightText = added[offset] ?? null;
      const parts = inlineParts(leftText, rightText);
      rows.push({
        type: "change",
        changeGroup,
        baselineLine: leftText === null ? null : baselineLine++,
        candidateLine: rightText === null ? null : candidateLine++,
        left: leftText === null ? null : parts.left,
        right: rightText === null ? null : parts.right,
      });
    }
  }

  const wordParts = diffWordsWithSpace(baseline, candidate);
  return {
    rows,
    stats: {
      baselineWords: wordCount(baseline),
      candidateWords: wordCount(candidate),
      addedWords: wordParts
        .filter((part) => part.added)
        .reduce((total, part) => total + wordCount(part.value), 0),
      removedWords: wordParts
        .filter((part) => part.removed)
        .reduce((total, part) => total + wordCount(part.value), 0),
      addedLines,
      removedLines,
      changeGroups: changeGroup,
    },
  };
}

function unavailableDataset(state = "unavailable") {
  const generated = new Map();
  generated.set(
    "index.json",
    stableJson({
      schema: TOURNAMENT_PUBLIC_SCHEMA,
      state,
      baselineId: null,
      championId: null,
      logDocumentUrl: null,
      versions: [],
    }),
  );
  return { state, versions: [], generated };
}

export function reviewRequiredTournamentDataset() {
  return unavailableDataset("review-required");
}

export function buildTournamentDataset(snapshot, { redact = (value) => value } = {}) {
  const family = snapshot.documents.filter(
    (document) =>
      document.visibility === "public" &&
      document.role === "derived-draft" &&
      document.family === TOURNAMENT_FAMILY &&
      ["accepted", "provisional"].includes(document.status),
  );
  if (family.length === 0) return unavailableDataset();

  const log = family.find(
    (document) => document.id === "draft:condensed-tournament:tournament-log",
  );
  const manuscripts = family
    .map((document) => {
      const match = VERSION_ID.exec(document.id);
      if (!match) return null;
      const round = Number(match[1]);
      const slot = match[2];
      return {
        document,
        round,
        slot,
        eliminated: document.path.endsWith(".dead.md"),
        body: storyBody(
          redact(document.content.toString("utf8")),
          document.id,
        ),
      };
    })
    .filter(Boolean)
    .sort(
      (left, right) =>
        left.round - right.round || left.slot.localeCompare(right.slot),
    );
  const baseline = manuscripts.find(
    (version) => version.round === 0 && version.slot === "base",
  );
  if (!baseline) {
    throw new SnowflakeError(
      "TOURNAMENT_BASELINE_MISSING",
      "The condensed tournament requires round0-base as its comparison seed",
    );
  }
  const mapping = snapshot.config.publicPages?.condensedTournament;
  if (
    mapping?.family !== TOURNAMENT_FAMILY ||
    mapping.seedId !== baseline.document.id ||
    mapping.logId !== log?.id ||
    !Array.isArray(mapping.rounds)
  ) {
    throw new SnowflakeError(
      "TOURNAMENT_CONFIG_INVALID",
      "The projection config does not declare the imported condensed tournament",
    );
  }
  const versionById = new Map(
    manuscripts.map((version) => [version.document.id, version]),
  );
  const configuredIds = new Set([mapping.seedId]);
  const rounds = [];
  let priorWinnerId = mapping.seedId;
  for (const [index, round] of mapping.rounds.entries()) {
    const number = index + 1;
    if (
      round.round !== number ||
      round.seedId !== priorWinnerId ||
      !Array.isArray(round.candidateIds) ||
      round.candidateIds.length !== 2 ||
      new Set(round.candidateIds).size !== 2 ||
      !round.candidateIds.includes(round.winnerId) ||
      !Number.isInteger(round.votes?.A) ||
      !Number.isInteger(round.votes?.B)
    ) {
      throw new SnowflakeError(
        "TOURNAMENT_CONFIG_INVALID",
        `Tournament round ${number} has an invalid seed, bracket, or vote record`,
      );
    }
    const candidates = round.candidateIds.map((id) => versionById.get(id));
    if (
      candidates.some(
        (candidate) => !candidate || candidate.round !== number,
      ) ||
      candidates[0].slot !== "a" ||
      candidates[1].slot !== "b"
    ) {
      throw new SnowflakeError(
        "TOURNAMENT_CONFIG_INVALID",
        `Tournament round ${number} does not map candidate A and B in order`,
      );
    }
    const winner = versionById.get(round.winnerId);
    const loser = candidates.find(
      (candidate) => candidate.document.id !== round.winnerId,
    );
    const winningSlot = winner.slot.toUpperCase();
    const losingSlot = loser.slot.toUpperCase();
    if (
      winner.eliminated ||
      !loser.eliminated ||
      round.votes[winningSlot] <= round.votes[losingSlot]
    ) {
      throw new SnowflakeError(
        "TOURNAMENT_CONFIG_INVALID",
        `Tournament round ${number} conflicts with its winner and eliminated files`,
      );
    }
    for (const id of round.candidateIds) configuredIds.add(id);
    rounds.push({
      round: number,
      seedId: round.seedId,
      candidateIds: [...round.candidateIds],
      winnerId: round.winnerId,
      votes: { A: round.votes.A, B: round.votes.B },
    });
    priorWinnerId = round.winnerId;
  }
  if (
    configuredIds.size !== manuscripts.length ||
    manuscripts.some((version) => !configuredIds.has(version.document.id))
  ) {
    throw new SnowflakeError(
      "TOURNAMENT_CONFIG_INVALID",
      "Tournament config and imported manuscript versions do not match exactly",
    );
  }
  const champion = versionById.get(priorWinnerId) ?? baseline;
  const roundByCandidateId = new Map(
    rounds.flatMap((round) =>
      round.candidateIds.map((id) => [id, round]),
    ),
  );

  const generated = new Map();
  const versions = manuscripts.map((version) => {
    const isBaseline = version === baseline;
    const isChampion = version === champion && !isBaseline;
    const round = roundByCandidateId.get(version.document.id);
    const state = isBaseline
      ? "seed"
      : version.eliminated
        ? "eliminated"
        : isChampion
          ? "champion"
          : "advanced";
    const label = isBaseline
      ? "Round 0 · Seed"
      : `Round ${version.round} · Candidate ${version.slot.toUpperCase()}`;
    const slug = versionSlug(version.document.id);
    const diff = buildLineDiff(baseline.body, version.body);
    const record = {
      id: version.document.id,
      label,
      round: version.round,
      candidate: isBaseline ? "seed" : version.slot.toUpperCase(),
      status: version.document.status,
      state,
      wordCount: diff.stats.candidateWords,
      basedOnId: isBaseline ? null : round.seedId,
      votes: isBaseline ? null : round.votes[version.slot.toUpperCase()],
      url: `versions/${slug}.json`,
      documentUrl: `../?document=${encodeURIComponent(version.document.id)}`,
      standaloneUrl: `../data/documents/${slug}.html`,
    };
    generated.set(
      record.url,
      stableJson({
        schema: TOURNAMENT_PUBLIC_SCHEMA,
        baselineId: baseline.document.id,
        candidateId: version.document.id,
        label,
        state,
        ...diff,
      }),
    );
    return record;
  });

  const index = {
    schema: TOURNAMENT_PUBLIC_SCHEMA,
    state: "ready",
    baselineId: baseline.document.id,
    championId: champion.document.id,
    logDocumentUrl: log
      ? `../?document=${encodeURIComponent(log.id)}`
      : null,
    rounds,
    versions,
  };
  generated.set("index.json", stableJson(index));
  return { state: "ready", versions, generated };
}
