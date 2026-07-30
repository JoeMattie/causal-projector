import { readFile } from "node:fs/promises";
import { basename, dirname, join, posix, resolve } from "node:path";
import { isDeepStrictEqual } from "node:util";
import { Marked } from "marked";
import {
  CONTRACT_VERSION,
  IMPORTER_VERSION,
  IMPORT_SCHEMA,
  PUBLIC_SCHEMA,
  SNAPSHOT_ROOT,
  SnowflakeError,
  assertSafeRelativePath,
  documentStatus,
  fileHash,
  listFilesRecursive,
  loadProjectionConfig,
  markdownExcerpt,
  markdownTitle,
  parseFrontmatter,
  pathExists,
  projectionTargets,
  publicSourceDomain,
  resetDirectory,
  resolveInside,
  sha256,
  stableJson,
  writeFileEnsured,
} from "./snowflake-common.mjs";

const START_MARKER = "<!-- SNOWFLAKE_NOSCRIPT_DOCUMENTS_START -->";
const END_MARKER = "<!-- SNOWFLAKE_NOSCRIPT_DOCUMENTS_END -->";

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const stripTags = (value) =>
  String(value)
    .replace(/<[^>]*>/g, "")
    .replace(/&(?:amp|lt|gt|quot|#39);/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function headingSlug(value, used) {
  const base =
    stripTags(value)
      .toLocaleLowerCase()
      .normalize("NFKD")
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .trim()
      .replace(/[\s-]+/g, "-") || "section";
  const count = used.get(base) ?? 0;
  used.set(base, count + 1);
  return count === 0 ? base : `${base}-${count}`;
}

function splitHref(raw) {
  const match = /^([^?#]*)(\?[^#]*)?(#.*)?$/.exec(raw);
  return {
    path: match?.[1] ?? raw,
    query: match?.[2] ?? "",
    hash: match?.[3] ?? "",
  };
}

function safeExternalHref(raw) {
  try {
    const url = new URL(raw);
    if (
      !["http:", "https:", "mailto:"].includes(url.protocol) ||
      url.username ||
      url.password
    ) {
      return null;
    }
    return url.href;
  } catch {
    return null;
  }
}

function publicViews(document) {
  const views = [];
  if (document.step) views.push("step");
  if (document.subject) views.push("subject");
  if (document.domain === "science") views.push("science");
  if (["story", "character", "entity"].includes(document.domain)) {
    views.push("story");
  }
  return views;
}

function documentSlug(id) {
  const slug = id.replaceAll(":", "--");
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new SnowflakeError(
      "PUBLIC_DOCUMENT_ID_INVALID",
      `Cannot create a public fragment name for ${id}`,
    );
  }
  return slug;
}

function renderMarkdown(snapshot, document) {
  const sourceLinks = new Set();
  const usedHeadings = new Map();
  const byPath = new Map(
    snapshot.documents.map((entry) => [entry.path, entry]),
  );
  const renderer = {
    html(token) {
      const raw = typeof token === "string" ? token : token?.raw ?? token?.text;
      return escapeHtml(raw ?? "");
    },
    heading(text, level, raw) {
      const safeLevel = Math.min(6, Math.max(1, Number(level) || 2));
      const slug = headingSlug(raw ?? text, usedHeadings);
      return `<h${safeLevel} id="${escapeHtml(slug)}">${text}</h${safeLevel}>\n`;
    },
    link(href, title, text) {
      const rawHref =
        typeof href === "string" ? href : href?.href ?? href?.raw ?? "";
      const rawTitle =
        typeof href === "object" && href !== null ? href.title : title;
      if (rawHref.startsWith("#")) {
        const safeHash = /^#[A-Za-z0-9_.:-]+$/.test(rawHref)
          ? rawHref
          : "#";
        return `<a href="${escapeHtml(safeHash)}">${text}</a>`;
      }
      const external = safeExternalHref(rawHref);
      if (external) {
        const titleAttribute = rawTitle
          ? ` title="${escapeHtml(rawTitle)}"`
          : "";
        return `<a href="${escapeHtml(external)}"${titleAttribute} rel="external noreferrer">${text}</a>`;
      }

      const parts = splitHref(rawHref);
      let decodedPath;
      try {
        decodedPath = decodeURIComponent(parts.path);
      } catch {
        return text;
      }
      if (!decodedPath || decodedPath.startsWith("/")) return text;
      const resolved = posix.normalize(
        posix.join(posix.dirname(document.path), decodedPath),
      );
      const target = byPath.get(resolved);
      if (!target || target.visibility !== "public") {
        return '<span class="unavailable-source-link">Internal planning reference</span>';
      }
      sourceLinks.add(target.id);
      const fragment =
        parts.hash && /^#[A-Za-z0-9_.:-]+$/.test(parts.hash)
          ? parts.hash
          : "";
      return `<a href="?document=${encodeURIComponent(target.id)}${escapeHtml(fragment)}">${text}</a>`;
    },
    image(href, title, text) {
      const alt =
        typeof href === "object" && href !== null
          ? href.text ?? href.title ?? ""
          : text ?? title ?? "";
      return `<span class="image-description">${escapeHtml(alt)}</span>`;
    },
  };
  const parser = new Marked({
    gfm: true,
    breaks: false,
    async: false,
    renderer,
  });
  const html = parser.parse(document.content.toString("utf8"));
  if (
    /<(?:script|style|iframe|object|embed|form|svg|math)\b/i.test(html) ||
    /\son[a-z]+\s*=/i.test(html) ||
    /(?:javascript|data):/i.test(html)
  ) {
    throw new SnowflakeError(
      "PUBLIC_HTML_UNSAFE",
      `Rendered HTML for ${document.id} contains unsafe markup`,
    );
  }
  return { html, sourceLinks: [...sourceLinks].sort() };
}

function standaloneDocumentHtml(record, fragment, slugById) {
  let body = fragment.html;
  body = body.replace(
    /href="\?document=([^"#&]+)(#[^"]*)?"/g,
    (_match, encodedId, hash = "") => {
      let id;
      try {
        id = decodeURIComponent(encodedId);
      } catch {
        return 'href="../../"';
      }
      const slug = slugById.get(id);
      return slug
        ? `href="./${slug}.html${escapeHtml(hash)}"`
        : 'href="../../"';
    },
  );
  return `<!doctype html>
<html lang="en-US">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'none'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'">
    <title>${escapeHtml(record.title)} · Snowflake library</title>
    <link rel="stylesheet" href="../../snowflake.css">
  </head>
  <body class="standalone-document">
    <main class="document-viewer">
      <p><a href="../../">← Snowflake library</a></p>
      <p class="section-kicker">${escapeHtml(record.status)} planning</p>
      <h1>${escapeHtml(record.title)}</h1>
      <div class="document-body">${body}</div>
    </main>
  </body>
</html>
`;
}

function publicLeakTerms(snapshot) {
  return [
    snapshot.repository,
    snapshot.commit,
    ...snapshot.documents
      .filter((document) => document.visibility === "internal")
      .map((document) => document.path),
    ...(snapshot.catalog.excludedRoots ?? []).map((entry) => entry.path),
    ...(snapshot.catalog.excludedPaths ?? []).map((entry) => entry.path),
    "story/methods/snowflake",
    "causal-projector-snowflake",
  ].filter((value) => typeof value === "string" && value.length > 0);
}

function scanPublicLeakage(snapshot, generated) {
  const leaks = [];
  const terms = publicLeakTerms(snapshot);
  for (const [path, value] of generated) {
    const text = Buffer.isBuffer(value) ? value.toString("utf8") : String(value);
    for (const term of terms) {
      if (text.includes(term)) {
        leaks.push(`${path} contains private provenance or internal path ${term}`);
      }
    }
  }
  if (leaks.length > 0) {
    throw new SnowflakeError(
      "PUBLIC_DATA_LEAK",
      "Generated Snowflake public data leaks private provenance",
      leaks,
    );
  }
}

function currentStepFromSnapshot(snapshot) {
  const pointer = snapshot.byId.get(snapshot.config.contract.workPointer.id);
  if (!pointer) return null;
  const { data } = parseFrontmatter(
    pointer.content.toString("utf8"),
    pointer.path,
  );
  const step = Number(data.activeStep);
  return Number.isInteger(step) && step >= 1 && step <= 10 ? step : null;
}

export function buildPublicDataset(snapshot) {
  const documents = snapshot.documents
    .filter(
      (document) =>
        document.visibility === "public" &&
        ["accepted", "provisional"].includes(document.status),
    )
    .sort(
      (left, right) =>
        (Number(left.step) || 99) - (Number(right.step) || 99) ||
        left.title.localeCompare(right.title),
    );
  const slugById = new Map(
    documents.map((document) => [document.id, documentSlug(document.id)]),
  );
  const records = [];
  const generated = new Map();
  for (const document of documents) {
    const slug = slugById.get(document.id);
    const fragment = renderMarkdown(snapshot, document);
    const record = {
      id: document.id,
      title: document.title,
      status: document.status,
      step: document.step ? Number(document.step) : null,
      domain: document.domain,
      role: document.role,
      family: document.family,
      subject: document.subject ?? null,
      excerpt: document.excerpt,
      url: `documents/${slug}.json`,
      views: publicViews(document),
    };
    records.push(record);
    generated.set(
      `documents/${slug}.json`,
      stableJson({
        id: document.id,
        title: document.title,
        status: document.status,
        html: fragment.html,
        sourceLinks: fragment.sourceLinks,
      }),
    );
    generated.set(
      `documents/${slug}.html`,
      standaloneDocumentHtml(record, fragment, slugById),
    );
  }
  generated.set(
    "index.json",
    stableJson({
      schema: PUBLIC_SCHEMA,
      state: "ready",
      currentStep: currentStepFromSnapshot(snapshot),
      records,
    }),
  );
  scanPublicLeakage(snapshot, generated);
  return { records, generated };
}

function reviewRequiredDataset() {
  const generated = new Map();
  generated.set(
    "index.json",
    stableJson({
      schema: PUBLIC_SCHEMA,
      state: "review-required",
      currentStep: null,
      records: [],
    }),
  );
  return { records: [], generated };
}

function noscriptMarkup(dataset) {
  if (dataset.records.length === 0) {
    return `${START_MARKER}
          <div data-snowflake-noscript-documents>
            <h3>Initial import review required</h3>
            <p>No public planning snapshot has been approved for this site.</p>
          </div>
          ${END_MARKER}`;
  }
  const items = dataset.records
    .map((record) => {
      const slug = documentSlug(record.id);
      return `              <li><a href="./data/documents/${slug}.html">${escapeHtml(record.title)}</a> <span>(${escapeHtml(record.status)})</span></li>`;
    })
    .join("\n");
  return `${START_MARKER}
          <div data-snowflake-noscript-documents>
            <h3>Published planning documents</h3>
            <ul>
${items}
            </ul>
          </div>
          ${END_MARKER}`;
}

function deploymentOutputRoot(outDir, basePath = "") {
  if (!basePath) return resolve(outDir);
  let pathname = basePath;
  if (/^https?:\/\//i.test(basePath)) {
    try {
      pathname = new URL(basePath).pathname;
    } catch (error) {
      throw new SnowflakeError(
        "BASE_PATH_INVALID",
        `Invalid deployment base URL: ${error.message}`,
      );
    }
  }
  if (pathname.includes("?") || pathname.includes("#")) {
    throw new SnowflakeError(
      "BASE_PATH_INVALID",
      "Deployment base path cannot contain a query or fragment",
    );
  }
  const relativePath = pathname.replace(/^\/+|\/+$/g, "");
  if (!relativePath) return resolve(outDir);
  assertSafeRelativePath(relativePath, "deployment base path");
  return resolveInside(outDir, relativePath, "deployment base path");
}

async function injectNoscriptIndex(deploymentRoot, dataset) {
  const path = join(deploymentRoot, "snowflake/index.html");
  if (!(await pathExists(path))) {
    throw new SnowflakeError(
      "SNOWFLAKE_PAGE_MISSING",
      `${path} does not exist; run the Authorbot build first`,
    );
  }
  const html = await readFile(path, "utf8");
  const start = html.indexOf(START_MARKER);
  const end = html.indexOf(END_MARKER);
  if (start === -1 || end === -1 || end < start) {
    throw new SnowflakeError(
      "SNOWFLAKE_PAGE_INVALID",
      "Snowflake index is missing no-JavaScript generation markers",
    );
  }
  const replacement = noscriptMarkup(dataset);
  const next =
    html.slice(0, start) +
    replacement +
    html.slice(end + END_MARKER.length);
  await writeFileEnsured(path, next);
}

export async function writePublicDataset({
  outDir,
  snapshot = null,
  basePath = "",
}) {
  const deploymentRoot = deploymentOutputRoot(outDir, basePath);
  const dataDir = join(deploymentRoot, "snowflake/data");
  const dataset = snapshot ? buildPublicDataset(snapshot) : reviewRequiredDataset();
  await resetDirectory(dataDir);
  for (const [path, value] of dataset.generated) {
    assertSafeRelativePath(path, "generated public path");
    await writeFileEnsured(join(dataDir, path), value);
  }
  await injectNoscriptIndex(deploymentRoot, dataset);
  return {
    state: snapshot ? "ready" : "review-required",
    records: dataset.records.length,
    files: dataset.generated.size,
    deploymentRoot,
  };
}

export async function loadImportedSnapshot(repoRoot, { allowMissing = false } = {}) {
  const root = join(repoRoot, SNAPSHOT_ROOT);
  const catalogPath = join(root, "catalog.json");
  const ledgerPath = join(root, "import.json");
  if (!(await pathExists(catalogPath)) || !(await pathExists(ledgerPath))) {
    if (allowMissing) return null;
    throw new SnowflakeError(
      "SNOWFLAKE_UNINITIALIZED",
      "Initial Snowflake import review is required before validation can pass",
    );
  }
  let catalog;
  let ledger;
  try {
    catalog = JSON.parse(await readFile(catalogPath, "utf8"));
    ledger = JSON.parse(await readFile(ledgerPath, "utf8"));
  } catch (error) {
    throw new SnowflakeError(
      "IMPORT_SNAPSHOT_INVALID",
      `Could not parse imported Snowflake metadata: ${error.message}`,
    );
  }
  if (catalog.schema !== CONTRACT_VERSION || ledger.schema !== IMPORT_SCHEMA) {
    throw new SnowflakeError(
      "IMPORT_SNAPSHOT_INVALID",
      "Imported catalog or ledger has an unsupported schema",
    );
  }
  if (
    ledger.contractVersion !== CONTRACT_VERSION ||
    ledger.importerVersion !== IMPORTER_VERSION ||
    !/^[0-9a-f]{40}$/.test(ledger.source?.commit ?? "") ||
    typeof ledger.source?.repository !== "string" ||
    !Array.isArray(catalog.documents) ||
    !Array.isArray(catalog.retiredDocuments) ||
    !Array.isArray(ledger.documents) ||
    !Array.isArray(ledger.retiredDocuments) ||
    !Array.isArray(ledger.generatedTargets)
  ) {
    throw new SnowflakeError(
      "IMPORT_LEDGER_INVALID",
      "Imported Snowflake ledger is incomplete or uses an unsupported importer",
    );
  }
  const catalogBuffer = await readFile(catalogPath);
  if (ledger.catalogHash !== sha256(catalogBuffer)) {
    throw new SnowflakeError(
      "IMPORT_CATALOG_DRIFT",
      "Imported catalog differs from the catalog hash recorded by the importer",
    );
  }
  const config = await loadProjectionConfig(repoRoot);
  if (ledger.projectionConfigHash !== sha256(stableJson(config))) {
    throw new SnowflakeError(
      "PROJECTION_CONFIG_DRIFT",
      "Snowflake projection mappings changed after the recorded import",
    );
  }
  if (!isDeepStrictEqual(ledger.retiredDocuments, catalog.retiredDocuments)) {
    throw new SnowflakeError(
      "IMPORT_LEDGER_INVALID",
      "Imported retirement records do not match the exact source catalog",
    );
  }
  const ledgerById = new Map();
  for (const document of ledger.documents) {
    if (ledgerById.has(document.id)) {
      throw new SnowflakeError(
        "IMPORT_LEDGER_INVALID",
        `Import ledger duplicates document ${document.id}`,
      );
    }
    ledgerById.set(document.id, document);
  }
  if (ledgerById.size !== catalog.documents.length) {
    throw new SnowflakeError(
      "IMPORT_LEDGER_INVALID",
      "Import ledger document set does not match the catalog",
    );
  }
  const configuredTargets = new Set(projectionTargets(config));
  const targetByPath = new Map();
  for (const target of ledger.generatedTargets) {
    assertSafeRelativePath(target.path, "generated target");
    if (
      targetByPath.has(target.path) ||
      !configuredTargets.has(target.path) ||
      !/^[0-9a-f]{64}$/.test(target.hash ?? "") ||
      !Array.isArray(target.sourceIds)
    ) {
      throw new SnowflakeError(
        "IMPORT_LEDGER_INVALID",
        `Generated target record is invalid for ${target.path}`,
      );
    }
    targetByPath.set(target.path, target);
  }
  if (
    targetByPath.size !== configuredTargets.size ||
    [...configuredTargets].some((path) => !targetByPath.has(path))
  ) {
    throw new SnowflakeError(
      "IMPORT_LEDGER_INVALID",
      "Generated target set does not match the projection config",
    );
  }
  const documents = [];
  const ids = new Set();
  const paths = new Set();
  for (const entry of catalog.documents) {
    assertSafeRelativePath(entry.path, `catalog path for ${entry.id}`);
    if (ids.has(entry.id) || paths.has(entry.path)) {
      throw new SnowflakeError(
        "IMPORT_SNAPSHOT_INVALID",
        `Imported catalog duplicates ${entry.id} or ${entry.path}`,
      );
    }
    ids.add(entry.id);
    paths.add(entry.path);
    const sourcePath = join(root, "source", entry.path);
    if (!(await pathExists(sourcePath))) {
      throw new SnowflakeError(
        "IMPORT_SOURCE_MISSING",
        `Imported source is missing ${entry.path}`,
      );
    }
    const content = await readFile(sourcePath);
    const recorded = ledgerById.get(entry.id);
    if (
      !recorded ||
      recorded.path !== entry.path ||
      recorded.sourceHash !== sha256(content)
    ) {
      throw new SnowflakeError(
        "IMPORT_SOURCE_DRIFT",
        `Imported source hash does not match ledger for ${entry.id}`,
      );
    }
    if (
      ![
        "added",
        "unchanged",
        "modified",
        "renamed",
        "excluded",
        "conflicting",
      ].includes(recorded.result) ||
      !Array.isArray(recorded.projectionTargets)
    ) {
      throw new SnowflakeError(
        "IMPORT_LEDGER_INVALID",
        `Import result or projection targets are invalid for ${entry.id}`,
      );
    }
    const text = content.toString("utf8");
    const status = documentStatus(entry, text);
    if (recorded.status !== status || recorded.visibility !== entry.visibility) {
      throw new SnowflakeError(
        "IMPORT_SOURCE_DRIFT",
        `Imported status or visibility drifted for ${entry.id}`,
      );
    }
    if (
      entry.visibility === "public" &&
      (publicSourceDomain(entry.path) !== entry.domain ||
        /(?:^|\/)(?:research|archive|legacy|prompts?|handoffs?)(?:\/|$)/i.test(
          entry.path,
        ))
    ) {
      throw new SnowflakeError(
        "PUBLIC_PATH_FORBIDDEN",
        `${entry.id} exposes forbidden source material`,
      );
    }
    documents.push({
      ...entry,
      content,
      sourceHash: recorded.sourceHash,
      status,
      title: markdownTitle(text, entry.id),
      excerpt: markdownExcerpt(text),
    });
  }
  for (const id of ledgerById.keys()) {
    if (!ids.has(id)) {
      throw new SnowflakeError(
        "IMPORT_LEDGER_INVALID",
        `Import ledger contains document outside the catalog: ${id}`,
      );
    }
  }
  for (const [path, target] of targetByPath) {
    const expectedSources = target.sourceIds.slice().sort();
    if (
      new Set(expectedSources).size !== expectedSources.length ||
      expectedSources.some((id) => !ids.has(id))
    ) {
      throw new SnowflakeError(
        "IMPORT_LEDGER_INVALID",
        `Generated target ${path} contains invalid source IDs`,
      );
    }
  }
  for (const [id, recorded] of ledgerById) {
    const expectedTargets = [...targetByPath]
      .filter(([, target]) => target.sourceIds.includes(id))
      .map(([path]) => path)
      .sort();
    if (
      JSON.stringify(recorded.projectionTargets.slice().sort()) !==
      JSON.stringify(expectedTargets)
    ) {
      throw new SnowflakeError(
        "IMPORT_LEDGER_INVALID",
        `Projection target ledger is inconsistent for ${id}`,
      );
    }
  }

  const importedFiles = await listFilesRecursive(join(root, "source"));
  const expectedFiles = [...paths].sort();
  if (JSON.stringify(importedFiles) !== JSON.stringify(expectedFiles)) {
    throw new SnowflakeError(
      "IMPORT_SOURCE_LEAK",
      "Imported source tree contains a file outside the catalog allowlist",
    );
  }
  for (const target of ledger.generatedTargets) {
    const path = resolveInside(repoRoot, target.path, "generated target");
    if (!(await pathExists(path)) || (await fileHash(path)) !== target.hash) {
      throw new SnowflakeError(
        "GENERATED_TARGET_DRIFT",
        `${target.path} differs from its recorded generated hash`,
      );
    }
  }
  if (await pathExists(join(repoRoot, "public/snowflake/data"))) {
    throw new SnowflakeError(
      "PUBLIC_DATA_COMMITTED",
      "Generated Snowflake data must not be committed under public/",
    );
  }
  return {
    catalog,
    catalogBuffer,
    ledger,
    config,
    documents,
    byId: new Map(documents.map((document) => [document.id, document])),
    byPath: new Map(documents.map((document) => [document.path, document])),
    repository: ledger.source.repository,
    commit: ledger.source.commit,
  };
}

export async function validateImportedSnapshot(repoRoot) {
  const snapshot = await loadImportedSnapshot(repoRoot);
  return {
    documents: snapshot.documents.length,
    public: snapshot.documents.filter(
      (document) => document.visibility === "public",
    ).length,
    internal: snapshot.documents.filter(
      (document) => document.visibility === "internal",
    ).length,
    commit: snapshot.commit,
  };
}
