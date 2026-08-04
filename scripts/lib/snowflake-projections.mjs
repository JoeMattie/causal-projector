import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { isDeepStrictEqual } from "node:util";
import { stringify as stringifyYaml } from "yaml";
import {
  IMPORTER_VERSION,
  IMPORT_SCHEMA,
  SNAPSHOT_ROOT,
  SnowflakeError,
  fileHash,
  listFilesRecursive,
  markdownTitle,
  oneSentenceDescription,
  parseFrontmatter,
  pathExists,
  projectionTargets,
  resolveInside,
  sha256,
  stableJson,
  transactionId,
} from "./snowflake-common.mjs";

function removeSourceMetadata(content, { removeTitle = false } = {}) {
  let result = content
    .replace(/^---\n[\s\S]*?\n---\n/, "")
    .replace(/^(?:Status|Snowflake step):\s*.*$\n?/gm, "")
    .replace(/^\n{3,}/, "\n\n")
    .trim();
  if (removeTitle) {
    result = result.replace(/^#\s+[^\n]*\n?/, "").trim();
  }
  return result;
}

function demoteTopHeading(content) {
  return content.replace(/^(#{1,5})\s+/gm, (_match, hashes) => `${hashes}# `);
}

function composeDocument(title, sources, note) {
  const blocks = [`# ${title}`];
  if (note) blocks.push(note);
  for (const source of sources) {
    const content = source.content.toString("utf8");
    blocks.push(demoteTopHeading(removeSourceMetadata(content)));
  }
  return `${blocks.filter(Boolean).join("\n\n")}\n`;
}

function requireMapping(snapshot, mapping, role) {
  const document = snapshot.byId.get(mapping.sourceId);
  if (!document) {
    throw new SnowflakeError(
      "PROJECTION_SOURCE_MISSING",
      `${role} mapping names missing document ${mapping.sourceId}`,
    );
  }
  if (document.role === "derived-draft") {
    throw new SnowflakeError(
      "DERIVED_DRAFT_NATIVE_PROJECTION",
      `${document.id} is noncanonical and cannot update ${role}`,
    );
  }
  return document;
}

function requireAccepted(snapshot, mapping, role) {
  const document = requireMapping(snapshot, mapping, role);
  if (document.status !== "accepted") {
    throw new SnowflakeError(
      "PROVISIONAL_NATIVE_PROJECTION",
      `${mapping.sourceId} is ${document.status ?? "unstated"} and cannot update ${role}`,
    );
  }
  return document;
}

function targetRecord(path, content, sourceIds, kind) {
  const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content);
  return {
    path,
    content: buffer,
    hash: sha256(buffer),
    sourceIds: [...sourceIds],
    kind,
  };
}

async function characterProjection(repoRoot, snapshot, mapping) {
  const source = requireAccepted(snapshot, mapping, mapping.target);
  const currentPath = resolveInside(repoRoot, mapping.target, "character target");
  if (!(await pathExists(currentPath))) {
    throw new SnowflakeError(
      "CHARACTER_TARGET_MISSING",
      `${mapping.target} must exist so downstream-owned metadata can be preserved`,
    );
  }
  const existing = parseFrontmatter(
    await readFile(currentPath, "utf8"),
    mapping.target,
  ).data;
  if (
    existing?.schema !== "authorbot.character/v1" ||
    existing?.id !== mapping.authorbotId
  ) {
    throw new SnowflakeError(
      "CHARACTER_METADATA_INVALID",
      `${mapping.target} does not contain expected Authorbot ID ${mapping.authorbotId}`,
    );
  }

  const sourceText = source.content.toString("utf8");
  const sourceName = markdownTitle(sourceText, existing.name);
  const summary = oneSentenceDescription(sourceText);
  if (!summary) {
    throw new SnowflakeError(
      "CHARACTER_SUMMARY_MISSING",
      `${source.id} is missing ## One-sentence description`,
    );
  }

  const frontmatter = {
    schema: "authorbot.character/v1",
    id: mapping.authorbotId,
    name: existing.name || sourceName,
  };
  if (existing.image) frontmatter.image = existing.image;
  frontmatter.summary = summary;

  const body = removeSourceMetadata(sourceText, { removeTitle: true });
  const output =
    `---\n${stringifyYaml(frontmatter, { lineWidth: 0 }).trimEnd()}\n---\n\n` +
    `# ${existing.name || sourceName}\n\n${body}\n`;
  return targetRecord(
    mapping.target,
    output,
    [source.id],
    "character",
  );
}

export async function buildDeterministicProjections({ repoRoot, snapshot }) {
  const config = snapshot.config;
  const targets = [];
  const seenTargets = new Set();
  const add = (record) => {
    for (const sourceId of record.sourceIds) {
      if (snapshot.byId.get(sourceId)?.role === "derived-draft") {
        throw new SnowflakeError(
          "DERIVED_DRAFT_NATIVE_PROJECTION",
          `${sourceId} is noncanonical and cannot update ${record.path}`,
        );
      }
    }
    if (seenTargets.has(record.path)) {
      throw new SnowflakeError(
        "PROJECTION_TARGET_DUPLICATE",
        `more than one projection owns ${record.path}`,
      );
    }
    seenTargets.add(record.path);
    targets.push(record);
  };

  for (const mapping of config.exactCopies) {
    const source = requireMapping(snapshot, mapping, mapping.target);
    add(
      targetRecord(
        mapping.target,
        source.content,
        [source.id],
        "exact-copy",
      ),
    );
  }

  const questionSources = config.openQuestions.sources.map((mapping) => {
    const source = requireMapping(
      snapshot,
      mapping,
      config.openQuestions.target,
    );
    if (
      source.role !== "open-questions" ||
      source.visibility !== "internal" ||
      source.status !== "unresolved"
    ) {
      throw new SnowflakeError(
        "QUESTION_PROJECTION_INVALID",
        `${source.id} is not an internal unresolved question document`,
      );
    }
    return source;
  });
  add(
    targetRecord(
      config.openQuestions.target,
      composeDocument(
        "Open questions",
        questionSources,
        "Generated deterministically from the internal Snowflake question owners.",
      ),
      questionSources.map((source) => source.id),
      "open-questions",
    ),
  );

  const synopsisSources = config.synopsis.sources.map((mapping) =>
    requireAccepted(snapshot, mapping, config.synopsis.target),
  );
  for (const mapping of config.synopsis.optionalSources ?? []) {
    const source = snapshot.byId.get(mapping.sourceId);
    if (!source) continue;
    if (source.role === "derived-draft") {
      throw new SnowflakeError(
        "DERIVED_DRAFT_NATIVE_PROJECTION",
        `${source.id} is noncanonical and cannot update ${config.synopsis.target}`,
      );
    }
    if (source.status === "accepted") synopsisSources.push(source);
  }
  add(
    targetRecord(
      config.synopsis.target,
      composeDocument(
        "Synopsis",
        synopsisSources,
        "Generated from accepted book-level Snowflake summaries without added prose.",
      ),
      synopsisSources.map((source) => source.id),
      "synopsis",
    ),
  );

  for (const mapping of config.characters) {
    add(await characterProjection(repoRoot, snapshot, mapping));
  }

  const canonSources = config.canon.sources.map((mapping) => {
    const source = requireAccepted(snapshot, mapping, config.canon.target);
    if (source.role !== "stable-reference") {
      throw new SnowflakeError(
        "CANON_PROJECTION_INVALID",
        `${source.id} is not an accepted stable reference`,
      );
    }
    return source;
  });
  add(
    targetRecord(
      config.canon.target,
      composeDocument(
        "Canon",
        canonSources,
        "Generated from explicitly mapped accepted Snowflake references without summarization.",
      ),
      canonSources.map((source) => source.id),
      "canon",
    ),
  );

  const configuredTargets = new Set(projectionTargets(config));
  for (const record of targets) {
    if (!configuredTargets.has(record.path)) {
      throw new SnowflakeError(
        "PROJECTION_CONFIG_INVALID",
        `${record.path} is not declared in the projection config`,
      );
    }
  }
  return targets.sort((left, right) => left.path.localeCompare(right.path));
}

export async function loadPreviousImport(repoRoot) {
  const path = join(repoRoot, SNAPSHOT_ROOT, "import.json");
  const catalogPath = join(repoRoot, SNAPSHOT_ROOT, "catalog.json");
  if (!(await pathExists(path))) return null;
  let ledger;
  let catalog;
  try {
    ledger = JSON.parse(await readFile(path, "utf8"));
    catalog = JSON.parse(await readFile(catalogPath, "utf8"));
  } catch (error) {
    throw new SnowflakeError(
      "IMPORT_LEDGER_INVALID",
      `Could not read ${SNAPSHOT_ROOT}/import.json: ${error.message}`,
    );
  }
  if (ledger.schema !== IMPORT_SCHEMA) {
    throw new SnowflakeError(
      "IMPORT_LEDGER_INVALID",
      `Unsupported import ledger schema ${ledger.schema}`,
    );
  }
  if (ledger.catalogHash !== sha256(await readFile(catalogPath))) {
    throw new SnowflakeError(
      "IMPORT_CATALOG_DRIFT",
      "Existing imported catalog differs from its recorded hash",
    );
  }
  if (
    !Array.isArray(ledger.documents) ||
    !Array.isArray(catalog.documents)
  ) {
    throw new SnowflakeError(
      "IMPORT_LEDGER_INVALID",
      "Existing Snowflake import ledger is incomplete",
    );
  }
  const catalogPaths = new Set(catalog.documents.map((entry) => entry.path));
  const catalogIds = new Set(catalog.documents.map((entry) => entry.id));
  const ledgerIds = new Set(ledger.documents.map((entry) => entry.id));
  if (
    catalogPaths.size !== catalog.documents.length ||
    catalogIds.size !== catalog.documents.length ||
    ledgerIds.size !== ledger.documents.length ||
    ledger.documents.length !== catalog.documents.length ||
    [...ledgerIds].some((id) => !catalogIds.has(id))
  ) {
    throw new SnowflakeError(
      "IMPORT_LEDGER_INVALID",
      "Existing Snowflake import document set is inconsistent",
    );
  }
  for (const document of ledger.documents) {
    const sourcePath = resolveInside(
      repoRoot,
      join(SNAPSHOT_ROOT, "source", document.path),
      "imported source",
    );
    if (
      !catalogPaths.has(document.path) ||
      !(await pathExists(sourcePath)) ||
      (await fileHash(sourcePath)) !== document.sourceHash
    ) {
      throw new SnowflakeError(
        "IMPORT_SOURCE_DRIFT",
        `Existing imported source differs from its ledger for ${document.id}`,
      );
    }
  }
  const importedFiles = await listFilesRecursive(
    join(repoRoot, SNAPSHOT_ROOT, "source"),
  );
  if (
    JSON.stringify(importedFiles) !==
    JSON.stringify([...catalogPaths].sort())
  ) {
    throw new SnowflakeError(
      "IMPORT_SOURCE_LEAK",
      "Existing imported source tree differs from the catalog allowlist",
    );
  }
  return { ...ledger, catalog };
}

export function classifyDocuments(snapshot, previousImport) {
  const previous = new Map(
    (previousImport?.documents ?? []).map((document) => [
      document.id,
      document,
    ]),
  );
  const retired = new Map(
    snapshot.catalog.retiredDocuments.map((document) => [
      document.id,
      document,
    ]),
  );
  const previousCatalogDocuments = new Map(
    (previousImport?.catalog?.documents ?? []).map((document) => [
      document.id,
      document,
    ]),
  );
  const previousRetired = new Map(
    (previousImport?.catalog?.retiredDocuments ?? []).map((document) => [
      document.id,
      document,
    ]),
  );
  const results = [];
  const errors = [];

  for (const document of snapshot.documents) {
    const prior = previous.get(document.id);
    const changes = [];
    let result = "added";
    if (prior) {
      if (prior.path !== document.path) changes.push("path");
      if (prior.sourceHash !== document.sourceHash) changes.push("content");
      if (prior.status !== document.status) changes.push("status");
      if (prior.visibility !== document.visibility) changes.push("visibility");
      const priorCatalog = previousCatalogDocuments.get(document.id);
      if (
        priorCatalog &&
        !isDeepStrictEqual(
          {
            domain: priorCatalog.domain,
            role: priorCatalog.role,
            family: priorCatalog.family,
            subject: priorCatalog.subject,
            step: priorCatalog.step,
            supersedes: priorCatalog.supersedes,
            extensions: priorCatalog.extensions,
          },
          {
            domain: document.domain,
            role: document.role,
            family: document.family,
            subject: document.subject,
            step: document.step,
            supersedes: document.supersedes,
            extensions: document.extensions,
          },
        )
      ) {
        changes.push("metadata");
      }
      if (prior.status === "accepted" && document.status === "provisional") {
        errors.push(
          `${document.id} regressed from accepted to provisional status`,
        );
      }
      if (
        prior.visibility === "public" &&
        document.visibility === "internal"
      ) {
        result = "excluded";
      } else if (prior.path !== document.path) {
        result = "renamed";
      } else if (changes.length > 0) {
        result = "modified";
      } else {
        result = "unchanged";
      }
      previous.delete(document.id);
    }
    results.push({
      id: document.id,
      path: document.path,
      result,
      changes,
    });
  }

  for (const prior of previous.values()) {
    const retirement = retired.get(prior.id);
    if (!retirement) {
      errors.push(
        `${prior.id} disappeared without a retiredDocuments tombstone`,
      );
      results.push({
        id: prior.id,
        path: prior.path,
        result: "conflicting",
        changes: ["removed-without-retirement"],
      });
    } else {
      if (retirement.formerPath !== prior.path) {
        errors.push(
          `${prior.id} retirement formerPath ${retirement.formerPath} does not match ${prior.path}`,
        );
      }
      results.push({
        id: prior.id,
        path:
          retirement.formerPath === prior.path
            ? retirement.formerPath
            : prior.path,
        result:
          retirement.formerPath === prior.path ? "retired" : "conflicting",
        changes:
          retirement.formerPath === prior.path
            ? ["retired"]
            : ["retirement-path-mismatch"],
      });
    }
  }
  for (const [id, prior] of previousRetired) {
    const current = retired.get(id);
    if (!current) {
      errors.push(`retired document ${id} was removed from the catalog`);
    } else if (!isDeepStrictEqual(current, prior)) {
      errors.push(`retired document ${id} is append-only and changed`);
    }
  }

  if (errors.length > 0) {
    throw new SnowflakeError(
      "SOURCE_TRANSITION_BLOCKED",
      "Source transition is unsafe",
      errors,
    );
  }
  return results.sort((left, right) => left.id.localeCompare(right.id));
}

export async function detectTargetConflicts(repoRoot, previousImport) {
  if (!previousImport) return [];
  const conflicts = [];
  for (const target of previousImport.generatedTargets ?? []) {
    const absolute = resolveInside(repoRoot, target.path, "generated target");
    if (!(await pathExists(absolute))) {
      conflicts.push({
        path: target.path,
        expected: target.hash,
        actual: null,
        reason: "generated target was removed",
      });
      continue;
    }
    const actual = await fileHash(absolute);
    if (actual !== target.hash) {
      conflicts.push({
        path: target.path,
        expected: target.hash,
        actual,
        reason: "generated target was edited downstream",
      });
    }
  }
  return conflicts;
}

export function findOrphanedGeneratedTargets(previousImport, projections) {
  if (!previousImport) return [];
  const currentTargets = new Set(
    projections.map((projection) => projection.path),
  );
  return (previousImport.generatedTargets ?? [])
    .filter((target) => !currentTargets.has(target.path))
    .map((target) => ({
      path: target.path,
      expected: target.hash,
      actual: target.hash,
      reason:
        "generated target no longer has a projection mapping and requires explicit reconciliation",
      sourceIds: [...(target.sourceIds ?? [])],
    }));
}

function reviewOnlyItems(snapshot, projectedSourceIds) {
  const items = [];
  for (const document of snapshot.documents) {
    if (document.visibility !== "public") continue;
    if (document.role === "derived-draft") {
      items.push({
        id: document.id,
        reason:
          "Noncanonical derived drafts are published only in the tournament and labeled Snowflake library views.",
      });
    }
    if (document.status === "provisional") {
      items.push({
        id: document.id,
        reason:
          "Provisional planning is published only in the labeled Snowflake library.",
      });
    }
    if (["05", "07"].includes(document.step)) {
      items.push({
        id: document.id,
        reason:
          "Public character dossiers at Snowflake Steps 5 and 7 require semantic review.",
      });
    }
    if (
      ["08", "09", "10"].includes(document.step) ||
      snapshot.config.reviewOnly.families.includes(document.family)
    ) {
      items.push({
        id: document.id,
        reason:
          "Scene, timeline, and manuscript projections require explicit approval.",
      });
    }
    if (
      document.status === "accepted" &&
      !projectedSourceIds.has(document.id) &&
      ["scene-list", "scene-briefs", "timeline", "manuscript"].includes(
        document.family,
      )
    ) {
      items.push({
        id: document.id,
        reason: "Accepted material has no deterministic native projection.",
      });
    }
  }
  const unique = new Map(
    items.map((item) => [`${item.id}\0${item.reason}`, item]),
  );
  return [...unique.values()].sort(
    (left, right) =>
      left.id.localeCompare(right.id) ||
      left.reason.localeCompare(right.reason),
  );
}

function projectionTargetsBySource(projections) {
  const bySource = new Map();
  for (const projection of projections) {
    for (const sourceId of projection.sourceIds) {
      const targets = bySource.get(sourceId) ?? [];
      targets.push(projection.path);
      bySource.set(sourceId, targets);
    }
  }
  return bySource;
}

export function makeImportLedger({
  snapshot,
  classifications,
  projections,
  importedAt,
  id,
}) {
  const targetBySource = projectionTargetsBySource(projections);
  const resultById = new Map(
    classifications.map((entry) => [entry.id, entry.result]),
  );
  return {
    schema: IMPORT_SCHEMA,
    source: {
      repository: snapshot.repository,
      commit: snapshot.commit,
    },
    contractVersion: snapshot.catalog.schema,
    catalogHash: sha256(snapshot.catalogBuffer),
    projectionConfigHash: sha256(stableJson(snapshot.config)),
    importerVersion: IMPORTER_VERSION,
    transaction: {
      id,
      importedAt,
    },
    documents: snapshot.documents
      .map((document) => ({
        id: document.id,
        path: document.path,
        status: document.status,
        visibility: document.visibility,
        sourceHash: document.sourceHash,
        projectionTargets: (targetBySource.get(document.id) ?? []).sort(),
        result: resultById.get(document.id) ?? "unchanged",
      }))
      .sort((left, right) => left.id.localeCompare(right.id)),
    retiredDocuments: snapshot.catalog.retiredDocuments,
    generatedTargets: projections.map((projection) => ({
      path: projection.path,
      hash: projection.hash,
      sourceIds: [...projection.sourceIds].sort(),
    })),
  };
}

function resultCounts(classifications) {
  const counts = {};
  for (const entry of classifications) {
    counts[entry.result] = (counts[entry.result] ?? 0) + 1;
  }
  return counts;
}

export function makeReconciliation({
  snapshot,
  classifications,
  conflicts,
  reviewItems,
  importedAt,
  id,
  checks,
}) {
  const counts = resultCounts(classifications);
  const lines = [
    "# Snowflake reconciliation",
    "",
    "This report is downstream-owned review material. It does not change upstream planning authority.",
    "",
    "## Import transaction",
    "",
    `- Transaction: \`${id}\``,
    `- Timestamp: \`${importedAt}\``,
    `- Source repository: \`${snapshot.repository}\``,
    `- Source commit: \`${snapshot.commit}\``,
    `- Contract: \`${snapshot.catalog.schema}\``,
    `- Importer: \`${IMPORTER_VERSION}\``,
    "",
    "## Classification summary",
    "",
  ];
  for (const key of [
    "added",
    "unchanged",
    "modified",
    "renamed",
    "retired",
    "excluded",
    "conflicting",
  ]) {
    lines.push(`- ${key}: ${counts[key] ?? 0}`);
  }
  lines.push("", "## Document reconciliation", "");
  for (const entry of classifications) {
    const changes =
      entry.changes.length > 0 ? ` (${entry.changes.join(", ")})` : "";
    lines.push(
      `- \`${entry.id}\`: **${entry.result}** at \`${entry.path}\`${changes}`,
    );
  }
  lines.push("", "## Generated-target conflicts", "");
  if (conflicts.length === 0) {
    lines.push("- None.");
  } else {
    for (const conflict of conflicts) {
      lines.push(`- \`${conflict.path}\`: ${conflict.reason}.`);
    }
  }
  lines.push("", "## Review-only items", "");
  if (reviewItems.length === 0) {
    lines.push("- None.");
  } else {
    for (const item of reviewItems) {
      lines.push(`- \`${item.id}\`: ${item.reason}`);
    }
  }
  lines.push(
    "",
    "Timeline events and manuscript chapters were left untouched.",
    "",
    "## Staged checks",
    "",
  );
  for (const check of checks) {
    lines.push(`- ${check.name}: **${check.status}**${check.detail ? `, ${check.detail}` : ""}`);
  }
  return `${lines.join("\n")}\n`;
}

export async function buildImportPlan({ repoRoot, snapshot }) {
  const previousImport = await loadPreviousImport(repoRoot);
  const classifications = classifyDocuments(snapshot, previousImport);
  const conflicts = await detectTargetConflicts(repoRoot, previousImport);
  const projections = await buildDeterministicProjections({
    repoRoot,
    snapshot,
  });
  conflicts.push(
    ...findOrphanedGeneratedTargets(previousImport, projections),
  );
  if (conflicts.length > 0) {
    for (const classification of classifications) {
      const sourceConflict = conflicts.find((conflict) => {
        const sourceIds =
          conflict.sourceIds ??
          previousImport.generatedTargets.find(
            (target) => target.path === conflict.path,
          )?.sourceIds ??
          [];
        return sourceIds.includes(classification.id);
      });
      if (sourceConflict) {
        classification.result = "conflicting";
        const change = sourceConflict.reason.includes(
          "no longer has a projection mapping",
        )
          ? "projection-removed"
          : "downstream-edit";
        if (!classification.changes.includes(change)) {
          classification.changes.push(change);
        }
      }
    }
  }

  const projectedSourceIds = new Set(
    projections.flatMap((projection) => projection.sourceIds),
  );
  const reviewItems = reviewOnlyItems(snapshot, projectedSourceIds);
  for (const conflict of conflicts.filter((entry) =>
    entry.reason.includes("no longer has a projection mapping"),
  )) {
    reviewItems.push({
      id: conflict.path,
      reason:
        "A previously generated native target lost its mapping. It remains untouched until an explicit removal or replacement is reviewed.",
    });
  }
  const importedAt = new Date().toISOString();
  const id = transactionId();
  const checks = [
    { name: "Snowflake source contract", status: "passed" },
    { name: "Generated target drift", status: conflicts.length ? "failed" : "passed" },
    { name: "Authorbot validation", status: "pending" },
    { name: "Full site build", status: "pending" },
    { name: "Public data leakage scan", status: "pending" },
  ];
  const ledger = makeImportLedger({
    snapshot,
    classifications,
    projections,
    importedAt,
    id,
  });
  const plan = {
    snapshot,
    previousImport,
    classifications,
    conflicts,
    projections,
    reviewItems,
    importedAt,
    id,
    checks,
    ledger,
  };
  plan.reconciliation = makeReconciliation(plan);
  return plan;
}

export function refreshPlanDocuments(plan) {
  plan.ledger = makeImportLedger(plan);
  plan.reconciliation = makeReconciliation(plan);
}

export function snapshotFilesForPlan(plan) {
  const files = new Map();
  files.set("catalog.json", plan.snapshot.catalogBuffer);
  for (const document of plan.snapshot.documents) {
    files.set(`source/${document.path}`, document.content);
  }
  files.set("import.json", Buffer.from(stableJson(plan.ledger)));
  files.set("reconciliation.md", Buffer.from(plan.reconciliation));
  return files;
}

export async function planIsNoop(repoRoot, plan) {
  if (!plan.previousImport) return false;
  if (
    plan.previousImport.source?.commit !== plan.snapshot.commit ||
    plan.previousImport.contractVersion !== plan.snapshot.catalog.schema ||
    plan.previousImport.catalogHash !== sha256(plan.snapshot.catalogBuffer) ||
    plan.previousImport.projectionConfigHash !==
      sha256(stableJson(plan.snapshot.config)) ||
    plan.previousImport.importerVersion !== IMPORTER_VERSION
  ) {
    return false;
  }
  if (
    plan.classifications.some(
      (entry) => !["unchanged"].includes(entry.result),
    )
  ) {
    return false;
  }
  for (const projection of plan.projections) {
    const path = resolveInside(repoRoot, projection.path, "projection target");
    if (!(await pathExists(path)) || (await fileHash(path)) !== projection.hash) {
      return false;
    }
  }
  for (const document of plan.snapshot.documents) {
    const path = join(
      repoRoot,
      SNAPSHOT_ROOT,
      "source",
      document.path,
    );
    if (
      !(await pathExists(path)) ||
      (await fileHash(path)) !== document.sourceHash
    ) {
      return false;
    }
  }
  return true;
}
