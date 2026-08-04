import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { parse as parseYaml } from "yaml";
import {
  CONTRACT_VERSION,
  IMPORT_SCHEMA,
  SNAPSHOT_ROOT,
  publicDocumentPathAllowed,
  publicSourceDomain,
  sha256,
  stableJson,
  validateGraph,
} from "../scripts/lib/snowflake-common.mjs";
import {
  buildDeterministicProjections,
  classifyDocuments,
  detectTargetConflicts,
  findOrphanedGeneratedTargets,
  loadPreviousImport,
} from "../scripts/lib/snowflake-projections.mjs";
import {
  buildPublicDataset,
  writePublicDataset,
} from "../scripts/lib/snowflake-site.mjs";
import {
  buildLineDiff,
  buildTournamentDataset,
} from "../scripts/lib/snowflake-tournament.mjs";

const DEFAULT_CONTENT = `# Test document

Status: accepted
Snowflake step: 04

Test content.
`;

function sourceDocument(overrides = {}) {
  const content = Buffer.from(overrides.content ?? DEFAULT_CONTENT);
  return {
    id: "story:test-document",
    path: "canon/story/04-test-document.md",
    domain: "story",
    role: "deliverable",
    family: "book-summary",
    visibility: "public",
    step: "04",
    supersedes: [],
    extensions: {},
    status: "accepted",
    title: "Test document",
    excerpt: "Test content.",
    ...overrides,
    content,
    sourceHash: overrides.sourceHash ?? sha256(content),
  };
}

function catalogEntry(document) {
  const keys = [
    "id",
    "path",
    "domain",
    "role",
    "family",
    "visibility",
    "subject",
    "step",
    "supersedes",
    "extensions",
  ];
  return Object.fromEntries(
    keys
      .filter((key) => document[key] !== undefined)
      .map((key) => [key, structuredClone(document[key])]),
  );
}

function minimalConfig(overrides = {}) {
  return {
    schema: "causal-projector.snowflake-projections/v1",
    contract: {
      catalogPath: "exports/authorbot.json",
      schemaPath: "contracts/snowflake-export.schema.json",
      version: CONTRACT_VERSION,
      workPointer: {
        id: "workflow:current-work",
        path: "work/README.md",
      },
    },
    snapshotRoot: SNAPSHOT_ROOT,
    exactCopies: [],
    openQuestions: {
      target: "story/open-questions.md",
      sources: [],
    },
    synopsis: {
      target: "story/synopsis.md",
      sources: [],
      optionalSources: [],
    },
    characters: [],
    canon: {
      target: "story/canon.md",
      sources: [],
    },
    reviewOnly: {
      steps: ["05", "07", "08", "09", "10"],
      families: ["scene-list", "scene-briefs", "timeline", "manuscript"],
      message: "Review required.",
    },
    ...overrides,
  };
}

function snapshotFor(
  documents,
  { retiredDocuments = [], config = minimalConfig() } = {},
) {
  const catalog = {
    schema: CONTRACT_VERSION,
    excludedRoots: [],
    excludedPaths: [],
    documents: documents.map(catalogEntry),
    retiredDocuments,
    extensions: {},
  };
  return {
    repository: "private-source-repository",
    commit: "a".repeat(40),
    catalog,
    catalogBuffer: Buffer.from(stableJson(catalog)),
    config,
    documents,
    byId: new Map(documents.map((document) => [document.id, document])),
    byPath: new Map(documents.map((document) => [document.path, document])),
  };
}

function previousImportFor(documents) {
  return {
    documents: documents.map((document) => ({
      id: document.id,
      path: document.path,
      status: document.status,
      visibility: document.visibility,
      sourceHash: document.sourceHash,
    })),
    catalog: {
      documents: documents.map(catalogEntry),
      retiredDocuments: [],
    },
    generatedTargets: [],
  };
}

async function temporaryDirectory(t) {
  const root = await mkdtemp(join(tmpdir(), "snowflake-importer-test-"));
  t.after(async () => {
    await rm(root, { recursive: true, force: true });
  });
  return root;
}

async function writeEnsured(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, value);
}

test("same stable ID at a new path is classified as a rename", () => {
  const previousDocument = sourceDocument();
  const renamed = sourceDocument({
    path: "canon/story/04-renamed-document.md",
    sourceHash: previousDocument.sourceHash,
  });

  const classifications = classifyDocuments(
    snapshotFor([renamed]),
    previousImportFor([previousDocument]),
  );

  assert.deepEqual(classifications, [
    {
      id: renamed.id,
      path: renamed.path,
      result: "renamed",
      changes: ["path"],
    },
  ]);
});

test("stable ID remains authoritative for a mapped source rename", async () => {
  const renamed = sourceDocument({
    path: "canon/story/04-renamed-document.md",
  });
  const target = "story/renamed-copy.md";
  const config = minimalConfig({
    exactCopies: [
      {
        sourceId: renamed.id,
        sourcePath: "canon/story/04-test-document.md",
        target,
      },
    ],
  });

  const projections = await buildDeterministicProjections({
    repoRoot: process.cwd(),
    snapshot: snapshotFor([renamed], { config }),
  });
  const projection = projections.find((entry) => entry.path === target);
  assert(projection);
  assert.equal(projection.content.toString("utf8"), DEFAULT_CONTENT);
  assert.deepEqual(projection.sourceIds, [renamed.id]);
});

test("disappearance without a retirement tombstone is blocked", () => {
  const previousDocument = sourceDocument();

  assert.throws(
    () =>
      classifyDocuments(
        snapshotFor([]),
        previousImportFor([previousDocument]),
      ),
    (error) => {
      assert.equal(error.code, "SOURCE_TRANSITION_BLOCKED");
      assert(
        error.details.some((detail) =>
          detail.includes("disappeared without a retiredDocuments tombstone"),
        ),
      );
      return true;
    },
  );
});

test("retirement formerPath must match the previous active path", () => {
  const previousDocument = sourceDocument();
  const retiredDocuments = [
    {
      id: previousDocument.id,
      formerPath: "canon/story/04-wrong-path.md",
      supersededBy: [],
      extensions: {},
    },
  ];

  assert.throws(
    () =>
      classifyDocuments(
        snapshotFor([], { retiredDocuments }),
        previousImportFor([previousDocument]),
      ),
    (error) => {
      assert.equal(error.code, "SOURCE_TRANSITION_BLOCKED");
      assert(
        error.details.some((detail) =>
          detail.includes("retirement formerPath"),
        ),
      );
      return true;
    },
  );
});

test("accepted-to-provisional status regression is blocked", () => {
  const previousDocument = sourceDocument();
  const provisionalContent = DEFAULT_CONTENT.replace(
    "Status: accepted",
    "Status: provisional",
  );
  const provisional = sourceDocument({
    content: provisionalContent,
    status: "provisional",
  });

  assert.throws(
    () =>
      classifyDocuments(
        snapshotFor([provisional]),
        previousImportFor([previousDocument]),
      ),
    (error) => {
      assert.equal(error.code, "SOURCE_TRANSITION_BLOCKED");
      assert(
        error.details.some((detail) =>
          detail.includes("regressed from accepted to provisional"),
        ),
      );
      return true;
    },
  );
});

test("catalog-only metadata changes classify as modified", () => {
  const previousDocument = sourceDocument();
  const metadataOnly = sourceDocument({
    sourceHash: previousDocument.sourceHash,
    extensions: {
      downstreamView: "story",
    },
  });

  const classifications = classifyDocuments(
    snapshotFor([metadataOnly]),
    previousImportFor([previousDocument]),
  );

  assert.deepEqual(classifications, [
    {
      id: metadataOnly.id,
      path: metadataOnly.path,
      result: "modified",
      changes: ["metadata"],
    },
  ]);
});

test("provisional public planning enters the library but no native projection", async () => {
  const provisional = sourceDocument({
    id: "character:test:full-character-synopsis",
    path: "canon/characters/test/05-full-character-synopsis.md",
    domain: "character",
    family: "character-development",
    subject: "test",
    step: "05",
    status: "provisional",
    content: `# Test full character synopsis

Status: provisional
Snowflake step: 05

Provisional treatment text.
`,
  });
  const snapshot = snapshotFor([provisional]);

  const dataset = buildPublicDataset(snapshot);
  const projections = await buildDeterministicProjections({
    repoRoot: process.cwd(),
    snapshot,
  });

  assert.deepEqual(
    dataset.records.map(({ id, status }) => ({ id, status })),
    [{ id: provisional.id, status: "provisional" }],
  );
  assert(
    projections.every(
      (projection) => !projection.sourceIds.includes(provisional.id),
    ),
  );
});

test("derived tournament drafts are library-only under every native mapping", async () => {
  const draft = sourceDocument({
    id: "draft:condensed-tournament:round4-a",
    path: "drafts/condensed-tournament/round4-a.md",
    role: "derived-draft",
    family: "condensed-tournament",
    step: undefined,
    status: "accepted",
    content: `# Condensed tournament champion

Status: accepted

> Derivative experiment file. Not canon.

Draft prose.
`,
  });
  const snapshot = snapshotFor([draft]);

  assert.deepEqual(
    buildPublicDataset(snapshot).records.map(({ id, role, status }) => ({
      id,
      role,
      status,
    })),
    [{ id: draft.id, role: "derived-draft", status: "accepted" }],
  );

  const mapping = { sourceId: draft.id, sourcePath: draft.path };
  const configs = [
    minimalConfig({
      exactCopies: [{ ...mapping, target: "story/outline.yml" }],
    }),
    minimalConfig({
      synopsis: {
        target: "story/synopsis.md",
        sources: [mapping],
        optionalSources: [],
      },
    }),
    minimalConfig({
      synopsis: {
        target: "story/synopsis.md",
        sources: [],
        optionalSources: [mapping],
      },
    }),
    minimalConfig({
      characters: [
        {
          ...mapping,
          target: "story/characters/test.md",
          authorbotId: "character:test",
        },
      ],
    }),
  ];
  for (const config of configs) {
    await assert.rejects(
      buildDeterministicProjections({
        repoRoot: process.cwd(),
        snapshot: snapshotFor([draft], { config }),
      }),
      (error) => {
        assert.equal(error.code, "DERIVED_DRAFT_NATIVE_PROJECTION");
        return true;
      },
    );
  }
});

test("character projection preserves Authorbot identity and image while replacing summary", async (t) => {
  const repoRoot = await temporaryDirectory(t);
  const target = "story/characters/evan-hale.md";
  await writeEnsured(
    join(repoRoot, target),
    `---
schema: authorbot.character/v1
id: character:evan-hale
name: Existing Evan
image: /characters/evan-hale.png
summary: Old downstream summary.
---

# Existing Evan

Old downstream body.
`,
  );

  const character = sourceDocument({
    id: "character:evan-hale:summary-sheet",
    path: "canon/characters/evan-hale/03-summary-sheet.md",
    domain: "character",
    family: "character-development",
    subject: "evan-hale",
    step: "03",
    content: `# Evan Hale

Status: accepted
Snowflake step: 03

## One-sentence description

A controls engineer who mistakes intervention for care.

## Motivation

He wants to make the machinery answerable.
`,
  });
  const config = minimalConfig({
    characters: [
      {
        sourceId: character.id,
        sourcePath: character.path,
        target,
        authorbotId: "character:evan-hale",
      },
    ],
  });

  const projections = await buildDeterministicProjections({
    repoRoot,
    snapshot: snapshotFor([character], { config }),
  });
  const projection = projections.find((entry) => entry.path === target);
  assert(projection);

  const output = projection.content.toString("utf8");
  const frontmatter = parseYaml(
    output.slice(4, output.indexOf("\n---\n", 4)),
  );
  assert.deepEqual(frontmatter, {
    schema: "authorbot.character/v1",
    id: "character:evan-hale",
    name: "Existing Evan",
    image: "/characters/evan-hale.png",
    summary: "A controls engineer who mistakes intervention for care.",
  });
  assert.match(output, /^# Existing Evan$/m);
  assert.match(output, /## Motivation/);
  assert.doesNotMatch(output, /Old downstream body/);
  assert.doesNotMatch(output, /^Status:/m);
  assert.doesNotMatch(output, /^Snowflake step:/m);
});

test("edited generated targets are reported as conflicts", async (t) => {
  const repoRoot = await temporaryDirectory(t);
  const target = "story/synopsis.md";
  const expected = Buffer.from("generated synopsis\n");
  await writeEnsured(join(repoRoot, target), "manual downstream edit\n");

  const conflicts = await detectTargetConflicts(repoRoot, {
    generatedTargets: [
      {
        path: target,
        hash: sha256(expected),
        sourceIds: ["story:five-sentence-summary"],
      },
    ],
  });

  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].path, target);
  assert.equal(conflicts[0].expected, sha256(expected));
  assert.notEqual(conflicts[0].actual, conflicts[0].expected);
  assert.equal(conflicts[0].reason, "generated target was edited downstream");
});

test("removed projection mappings block stale generated targets", () => {
  const previousImport = {
    generatedTargets: [
      {
        path: "story/characters/retired.md",
        hash: "a".repeat(64),
        sourceIds: ["character:retired:summary-sheet"],
      },
    ],
  };
  const conflicts = findOrphanedGeneratedTargets(previousImport, []);

  assert.deepEqual(conflicts, [
    {
      path: "story/characters/retired.md",
      expected: "a".repeat(64),
      actual: "a".repeat(64),
      reason:
        "generated target no longer has a projection mapping and requires explicit reconciliation",
      sourceIds: ["character:retired:summary-sheet"],
    },
  ]);
});

test("tampered imported catalog is rejected against its ledger hash", async (t) => {
  const repoRoot = await temporaryDirectory(t);
  const root = join(repoRoot, SNAPSHOT_ROOT);
  const originalCatalog = Buffer.from('{"schema":"original"}\n');
  const tamperedCatalog = Buffer.from('{"schema":"tampered"}\n');
  const ledger = {
    schema: IMPORT_SCHEMA,
    catalogHash: sha256(originalCatalog),
    documents: [],
    generatedTargets: [],
  };

  await writeEnsured(join(root, "catalog.json"), tamperedCatalog);
  await writeEnsured(join(root, "import.json"), stableJson(ledger));

  await assert.rejects(loadPreviousImport(repoRoot), (error) => {
    assert.equal(error.code, "IMPORT_CATALOG_DRIFT");
    return true;
  });
});

test("public rendering disables raw HTML and redacts internal or unsafe links", () => {
  const publicDocument = sourceDocument({
    id: "story:public-rendering",
    path: "canon/story/04-public-rendering.md",
    content: `# Public rendering

Status: accepted
Snowflake step: 04

<script>alert("unsafe")</script>

[private notes](../../work/open-questions/private.md)

[unsafe protocol](javascript:alert("unsafe"))
`,
  });
  const internalDocument = sourceDocument({
    id: "questions:private",
    path: "work/open-questions/private.md",
    domain: "story",
    role: "open-questions",
    family: "open-questions",
    visibility: "internal",
    step: undefined,
    status: "unresolved",
    content: `# Private questions

Status: unresolved

Private material.
`,
  });
  const snapshot = snapshotFor([publicDocument, internalDocument]);

  const dataset = buildPublicDataset(snapshot);
  const fragment = JSON.parse(
    dataset.generated.get("documents/story--public-rendering.json"),
  );

  assert.match(fragment.html, /&lt;script&gt;/);
  assert.doesNotMatch(fragment.html, /<script\b/i);
  assert.doesNotMatch(fragment.html, /javascript:/i);
  assert.doesNotMatch(fragment.html, /work\/open-questions\/private\.md/);
  assert.doesNotMatch(fragment.html, /private notes/);
  assert.match(fragment.html, /Internal planning reference/);
  assert.deepEqual(fragment.sourceLinks, []);
});

test("tournament data compares every version with Round 0 and reconstructs the candidate", () => {
  const body = (sentence) => `# Condensed version

Status: provisional

> Derivative experiment file. Not canon.

## 1. The cold notch

${sentence}
`;
  const seed = sourceDocument({
    id: "draft:condensed-tournament:round0-base",
    path: "drafts/condensed-tournament/round0-base.md",
    role: "derived-draft",
    family: "condensed-tournament",
    step: undefined,
    status: "provisional",
    content: body("The machine is cold, loud, and failure-prone."),
  });
  const candidateA = sourceDocument({
    id: "draft:condensed-tournament:round1-a",
    path: "drafts/condensed-tournament/round1-a.dead.md",
    role: "derived-draft",
    family: "condensed-tournament",
    step: undefined,
    status: "provisional",
    content: body("The machine is cold and failure-prone."),
  });
  const candidateB = sourceDocument({
    id: "draft:condensed-tournament:round1-b",
    path: "drafts/condensed-tournament/round1-b.md",
    role: "derived-draft",
    family: "condensed-tournament",
    step: undefined,
    status: "provisional",
    content: body("The machine is loud enough to feel through the floor."),
  });
  const log = sourceDocument({
    id: "draft:condensed-tournament:tournament-log",
    path: "drafts/condensed-tournament/tournament-log.md",
    role: "derived-draft",
    family: "condensed-tournament",
    step: undefined,
    status: "provisional",
    content: "# Tournament log\n\nStatus: provisional\n\nRound 1: B wins.\n",
  });
  const config = minimalConfig({
    publicPages: {
      condensedTournament: {
        family: "condensed-tournament",
        seedId: seed.id,
        logId: log.id,
        rounds: [
          {
            round: 1,
            seedId: seed.id,
            candidateIds: [candidateA.id, candidateB.id],
            winnerId: candidateB.id,
            votes: { A: 0, B: 2 },
          },
        ],
      },
    },
  });
  const tournament = buildTournamentDataset(
    snapshotFor([seed, candidateA, candidateB, log], { config }),
  );
  const index = JSON.parse(tournament.generated.get("index.json"));
  const selected = index.versions.find((version) => version.id === candidateB.id);
  const comparison = JSON.parse(tournament.generated.get(selected.url));

  assert.equal(index.baselineId, seed.id);
  assert.equal(index.championId, candidateB.id);
  assert.equal(index.versions.length, 3);
  assert.equal(selected.state, "champion");
  assert.equal(selected.basedOnId, seed.id);
  assert.equal(selected.votes, 2);
  assert(comparison.stats.addedWords > 0);
  assert(comparison.stats.removedWords > 0);

  const reconstructed = comparison.rows
    .flatMap((row) => {
      if (row.type === "context") return [row.text];
      if (!row.right) return [];
      return [row.right.map((part) => part.text).join("")];
    })
    .join("\n");
  assert.equal(
    `${reconstructed}\n`,
    "## 1. The cold notch\n\nThe machine is loud enough to feel through the floor.\n",
  );

  const direct = buildLineDiff("one two\n", "one bright two\n");
  assert.equal(direct.stats.addedWords, 1);
  assert.equal(direct.stats.removedWords, 0);
});

test("public generation imports the exact content-hashed Astro theme into custom pages", async (t) => {
  const outDir = await temporaryDirectory(t);
  await writeEnsured(
    join(outDir, "_astro/_chapterPath_.theme-hash.css"),
    ":root{--surface-page:#1b1815;--font-display:system-ui}.site-header{height:57px}",
  );
  await writeEnsured(
    join(outDir, "snowflake/snowflake.css"),
    `/* AUTHORBOT_THEME_IMPORT_START */
/* The generator imports the content-hashed Astro stylesheet here. */
/* AUTHORBOT_THEME_IMPORT_END */

.workspace { display: grid; }
`,
  );
  await writeEnsured(
    join(outDir, "outline-graph/outline-graph.css"),
    `/* AUTHORBOT_THEME_IMPORT_START */
/* The generator imports the content-hashed Astro stylesheet here. */
/* AUTHORBOT_THEME_IMPORT_END */

.graph-panel { display: grid; }
`,
  );
  await writeEnsured(
    join(outDir, "snowflake/index.html"),
    `<!doctype html>
<html><body>
<!-- SNOWFLAKE_NOSCRIPT_DOCUMENTS_START -->
<!-- SNOWFLAKE_NOSCRIPT_DOCUMENTS_END -->
</body></html>
`,
  );
  await writeEnsured(
    join(outDir, "snowflake/condensed-tournament/index.html"),
    `<!doctype html>
<html><body>
<!-- TOURNAMENT_NOSCRIPT_VERSIONS_START -->
<!-- TOURNAMENT_NOSCRIPT_VERSIONS_END -->
</body></html>
`,
  );

  const first = await writePublicDataset({ outDir });
  const second = await writePublicDataset({ outDir });
  const css = await readFile(join(outDir, "snowflake/snowflake.css"), "utf8");
  const graphCss = await readFile(
    join(outDir, "outline-graph/outline-graph.css"),
    "utf8",
  );

  assert.equal(first.themeStylesheet, "_chapterPath_.theme-hash.css");
  assert.equal(second.themeStylesheet, first.themeStylesheet);
  assert.equal(
    css.match(
      /@import url\("\.\.\/_astro\/_chapterPath_\.theme-hash\.css"\);/g,
    )?.length,
    1,
  );
  assert.equal(
    graphCss.match(
      /@import url\("\.\.\/_astro\/_chapterPath_\.theme-hash\.css"\);/g,
    )?.length,
    1,
  );
});

test("graph validation accepts Authorbot chapter nodes and rejects custom nodes", () => {
  const valid = `schema: authorbot.story-graph/v1
nodes:
  - id: premise:test
    type: premise
    order: 1
  - id: character:ruined-sovereign
    type: character
    order: 2
  - id: character:turning-knot
    type: character
    order: 3
  - id: chapter:test
    type: chapter
    chapter_id: 019fabcd-abcd-7abc-8abc-abcdefabcdef
    status: draft
    parent: premise:test
    order: 4
links:
  - from: premise:test
    to: chapter:test
    type: contains
`;
  const validErrors = [];
  validateGraph(valid, validErrors);
  assert.deepEqual(validErrors, []);

  const invalidErrors = [];
  validateGraph(
    valid.replace(
      "type: premise",
      "type: custom",
    ),
    invalidErrors,
  );
  assert(
    invalidErrors.some((error) =>
      error.includes("nonsemantic graph type custom"),
    ),
  );
});

test("public source paths use explicit canon roots or the narrow tournament root", () => {
  assert.equal(publicSourceDomain("canon/story/foundation.md"), "story");
  assert.equal(
    publicSourceDomain("canon/characters/evan/03-summary-sheet.md"),
    "character",
  );
  assert.equal(publicSourceDomain("canon/entities/knot/foundation.md"), "entity");
  assert.equal(publicSourceDomain("canon/science/contact.md"), "science");
  assert.equal(
    publicSourceDomain("drafts/condensed-tournament/round4-a.md"),
    "story",
  );
  assert.equal(publicSourceDomain("drafts/other/round4-a.md"), null);
  assert.equal(publicSourceDomain("canon/misc/notes.md"), null);
  assert.equal(publicSourceDomain("work/README.md"), null);

  assert.equal(
    publicDocumentPathAllowed({
      path: "drafts/condensed-tournament/round4-a.md",
      domain: "story",
      role: "derived-draft",
      family: "condensed-tournament",
      visibility: "public",
    }),
    true,
  );
  for (const change of [
    { role: "stable-reference" },
    { family: "other" },
    { domain: "integration" },
    { visibility: "internal" },
    { step: "10" },
    { subject: "book" },
    { path: "drafts/other/round4-a.md" },
  ]) {
    assert.equal(
      publicDocumentPathAllowed({
        path: "drafts/condensed-tournament/round4-a.md",
        domain: "story",
        role: "derived-draft",
        family: "condensed-tournament",
        visibility: "public",
        ...change,
      }),
      false,
    );
  }
});
