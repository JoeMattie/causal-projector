import { createHash, randomUUID } from "node:crypto";
import {
  access,
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { dirname, isAbsolute, join, posix, relative, resolve } from "node:path";
import { spawn } from "node:child_process";
import Ajv2020 from "ajv/dist/2020.js";
import { parse as parseYaml } from "yaml";

export const CONTRACT_VERSION = "causal-projector.snowflake-export/v1";
export const IMPORT_SCHEMA = "causal-projector.snowflake-import/v1";
export const PUBLIC_SCHEMA = "causal-projector.snowflake-public/v1";
export const IMPORTER_VERSION = "1.1.0";
export const CATALOG_SOURCE_PATH = "exports/authorbot.json";
export const CONTRACT_SOURCE_PATH =
  "contracts/snowflake-export.schema.json";
export const SNAPSHOT_ROOT = "story/methods/snowflake";

const FULL_COMMIT = /^[0-9a-f]{40}$/i;
const NUMBERED_DELIVERABLE =
  /^canon\/(?:story|characters\/[^/]+|entities\/[^/]+)\/(0[1-9]|10)-[^/]+\.md$/;
const QUESTION_PATH =
  /^(?:work\/open-questions\/[^/]+|canon\/characters\/[^/]+\/open-questions)\.md$/;
const CONDENSED_TOURNAMENT_DRAFT =
  /^drafts\/condensed-tournament\/[a-z0-9]+(?:-[a-z0-9]+)*(?:\.dead)?\.md$/;
const AUTHORBOT_NODE_ID =
  /^(?:premise|arc|part|chapter|scene|beat|event|character|location|concept|rule|theme|motif|development):[a-z0-9][a-z0-9-]*$/;
const UUID_V7 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const VALID_NODE_TYPES = new Set([
  "premise",
  "arc",
  "part",
  "chapter",
  "scene",
  "beat",
  "character",
  "concept",
  "rule",
  "theme",
  "motif",
  "development",
]);
const GRAPH_COMMON_FIELDS = [
  "id",
  "type",
  "title",
  "summary",
  "parent",
  "order",
  "tags",
];
const GRAPH_STORY_FIELDS = new Set([
  ...GRAPH_COMMON_FIELDS,
  "goal",
  "conflict",
  "outcome",
]);
const GRAPH_CHAPTER_FIELDS = new Set([
  ...GRAPH_COMMON_FIELDS,
  "chapter_id",
  "status",
]);
const CHAPTER_STATUSES = new Set([
  "draft",
  "proposed",
  "published",
  "archived",
]);
const REQUIRED_EXCLUDED_ROOTS = new Set([
  ".agents/",
  ".claude/",
  ".codex/",
  ".github/",
  ".idea/",
  ".vscode/",
  "archive/",
  "legacy/",
  "prompts/",
  "work/research/",
]);

export class SnowflakeError extends Error {
  constructor(code, message, details = []) {
    super(message);
    this.name = "SnowflakeError";
    this.code = code;
    this.details = details;
  }
}

export const sha256 = (value) =>
  createHash("sha256").update(value).digest("hex");

export const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;

export const transactionId = () => randomUUID();

export async function pathExists(path) {
  try {
    await access(path, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export function assertSafeRelativePath(path, label = "path") {
  if (
    typeof path !== "string" ||
    path.length === 0 ||
    isAbsolute(path) ||
    path.includes("\\") ||
    path.includes("\0") ||
    path.split("/").includes("..") ||
    posix.normalize(path) !== path ||
    path.startsWith("./") ||
    path.includes("//")
  ) {
    throw new SnowflakeError(
      "UNSAFE_PATH",
      `${label} must be a normalized repository-relative path: ${String(path)}`,
    );
  }
  return path;
}

export function resolveInside(root, path, label = "path") {
  assertSafeRelativePath(path, label);
  const absoluteRoot = resolve(root);
  const absolute = resolve(absoluteRoot, path);
  if (!absolute.startsWith(`${absoluteRoot}/`)) {
    throw new SnowflakeError("UNSAFE_PATH", `${label} escapes ${absoluteRoot}`);
  }
  return absolute;
}

export function publicSourceDomain(path) {
  if (CONDENSED_TOURNAMENT_DRAFT.test(path)) return "story";
  const match =
    /^canon\/(story|science|characters|entities)\//.exec(path);
  if (!match) return null;
  return {
    story: "story",
    science: "science",
    characters: "character",
    entities: "entity",
  }[match[1]];
}

export function publicDocumentPathAllowed(document) {
  if (publicSourceDomain(document.path) !== document.domain) return false;
  if (CONDENSED_TOURNAMENT_DRAFT.test(document.path)) {
    return (
      document.role === "derived-draft" &&
      document.family === "condensed-tournament" &&
      document.visibility === "public" &&
      document.step === undefined &&
      document.subject === undefined
    );
  }
  return document.role !== "derived-draft";
}

export async function readJson(path) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (error) {
    throw new SnowflakeError(
      "INVALID_JSON",
      `Could not read JSON at ${path}: ${error.message}`,
    );
  }
}

export async function writeFileEnsured(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, value);
}

export async function runCommand(
  command,
  args,
  { cwd, input, env, allowFailure = false } = {},
) {
  return await new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd,
      env: env ? { ...process.env, ...env } : process.env,
      stdio: ["pipe", "pipe", "pipe"],
    });
    const stdout = [];
    const stderr = [];
    child.stdout.on("data", (chunk) => stdout.push(chunk));
    child.stderr.on("data", (chunk) => stderr.push(chunk));
    child.on("error", rejectPromise);
    child.on("close", (status, signal) => {
      const result = {
        status: status ?? 1,
        signal,
        stdout: Buffer.concat(stdout).toString("utf8"),
        stderr: Buffer.concat(stderr).toString("utf8"),
      };
      if (!allowFailure && result.status !== 0) {
        rejectPromise(
          new SnowflakeError(
            "COMMAND_FAILED",
            `${command} ${args.join(" ")} failed (${result.status}): ` +
              `${result.stderr.trim() || result.stdout.trim()}`,
          ),
        );
      } else {
        resolvePromise(result);
      }
    });
    if (input !== undefined) child.stdin.end(input);
    else child.stdin.end();
  });
}

async function git(source, args, options = {}) {
  return await runCommand("git", ["-C", source, ...args], options);
}

export async function resolveSourceCommit(source, ref) {
  if (!FULL_COMMIT.test(ref ?? "")) {
    throw new SnowflakeError(
      "FULL_COMMIT_REQUIRED",
      "--ref must be an exact 40-character commit SHA",
    );
  }
  const normalized = ref.toLowerCase();
  const type = await git(
    source,
    ["cat-file", "-t", normalized],
    { allowFailure: true },
  );
  if (type.status !== 0 || type.stdout.trim() !== "commit") {
    throw new SnowflakeError(
      "SOURCE_COMMIT_MISSING",
      `${normalized} is not a commit in ${source}`,
    );
  }
  const resolved = (
    await git(source, ["rev-parse", "--verify", `${normalized}^{commit}`])
  ).stdout.trim();
  if (resolved !== normalized) {
    throw new SnowflakeError(
      "FULL_COMMIT_REQUIRED",
      `--ref must resolve exactly to ${normalized}`,
    );
  }
  return normalized;
}

export async function sourceRepositoryName(source) {
  const remote = await git(
    source,
    ["config", "--get", "remote.origin.url"],
    { allowFailure: true },
  );
  return remote.status === 0 && remote.stdout.trim()
    ? remote.stdout.trim()
    : `local:${resolve(source)}`;
}

export async function gitListFiles(source, ref) {
  const result = await git(source, [
    "ls-tree",
    "-r",
    "--name-only",
    "-z",
    ref,
  ]);
  return result.stdout
    .split("\0")
    .filter(Boolean)
    .map((path) => assertSafeRelativePath(path, "Git path"))
    .sort();
}

export async function gitReadBuffer(source, ref, path) {
  assertSafeRelativePath(path, "source path");
  const result = await runCommand(
    "git",
    ["-C", source, "show", `${ref}:${path}`],
  );
  return Buffer.from(result.stdout, "utf8");
}

function catalogPathIsExcluded(path, catalog) {
  if (catalog.excludedPaths.some((entry) => entry.path === path)) return true;
  return catalog.excludedRoots.some((entry) => {
    if (!path.startsWith(entry.path)) return false;
    return !(entry.except ?? []).includes(path);
  });
}

export function markdownMetadata(content) {
  const statuses = [
    ...content.matchAll(/^Status:\s*([a-z-]+)\s*$/gm),
  ].map((match) => match[1]);
  const steps = [
    ...content.matchAll(/^Snowflake step:\s*(0[1-9]|10)\s*$/gm),
  ].map((match) => match[1]);
  return { statuses, steps };
}

export function documentStatus(document, content) {
  if (!document.path.endsWith(".md")) return null;
  const metadata = markdownMetadata(content);
  if (document.role === "open-questions") {
    return metadata.statuses.length === 1 ? metadata.statuses[0] : null;
  }
  if (
    document.role === "deliverable" ||
    document.role === "supporting-planning" ||
    document.role === "stable-reference" ||
    document.role === "derived-draft"
  ) {
    return metadata.statuses.length === 1 ? metadata.statuses[0] : null;
  }
  return null;
}

export function markdownTitle(content, fallback) {
  const match = /^#\s+(.+?)\s*$/m.exec(content);
  return match?.[1]?.trim() || fallback;
}

export function oneSentenceDescription(content) {
  const match =
    /^## One-sentence description\s*\n+([\s\S]*?)(?=\n##\s|(?![\s\S]))/m.exec(
      content,
    );
  if (!match) return "";
  const paragraph = match[1]
    .split(/\n\s*\n/, 1)[0]
    .replace(/\s+/g, " ")
    .trim();
  return paragraph;
}

export function markdownExcerpt(content) {
  const preferred = oneSentenceDescription(content);
  if (preferred) return preferred;
  const withoutMetadata = content
    .replace(/^---\n[\s\S]*?\n---\n/, "")
    .replace(/^#.*$/gm, "")
    .replace(/^(?:Status|Snowflake step):.*$/gm, "")
    .trim();
  const paragraph = withoutMetadata
    .split(/\n\s*\n/)
    .find((value) => value.trim() && !value.trim().startsWith("-"));
  return (paragraph ?? "")
    .replace(/[`*_>#\[\]]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 320);
}

export function parseFrontmatter(content, path = "document") {
  if (!content.startsWith("---\n")) {
    throw new SnowflakeError(
      "FRONTMATTER_REQUIRED",
      `${path} must start with YAML frontmatter`,
    );
  }
  const end = content.indexOf("\n---\n", 4);
  if (end === -1) {
    throw new SnowflakeError(
      "FRONTMATTER_INVALID",
      `${path} has unterminated YAML frontmatter`,
    );
  }
  try {
    return {
      data: parseYaml(content.slice(4, end)),
      body: content.slice(end + 5),
    };
  } catch (error) {
    throw new SnowflakeError(
      "FRONTMATTER_INVALID",
      `${path} has invalid YAML frontmatter: ${error.message}`,
    );
  }
}

export function validateGraph(content, errors) {
  let graph;
  try {
    graph = parseYaml(content);
  } catch (error) {
    errors.push(`graph mirror is invalid YAML: ${error.message}`);
    return;
  }
  if (graph?.schema !== "authorbot.story-graph/v1" || !Array.isArray(graph.nodes)) {
    errors.push("graph mirror must use authorbot.story-graph/v1");
    return;
  }
  for (const key of Object.keys(graph)) {
    if (!["schema", "nodes", "links"].includes(key)) {
      errors.push(`graph mirror has unknown top-level field ${key}`);
    }
  }
  const nodes = new Map();
  for (const [index, node] of graph.nodes.entries()) {
    if (!node || typeof node !== "object" || Array.isArray(node)) {
      errors.push(`graph node ${index} must be an object`);
      continue;
    }
    const allowedFields =
      node.type === "chapter" ? GRAPH_CHAPTER_FIELDS : GRAPH_STORY_FIELDS;
    for (const key of Object.keys(node)) {
      if (!allowedFields.has(key)) {
        errors.push(`${node.id ?? `node ${index}`} has unknown field ${key}`);
      }
    }
    if (!AUTHORBOT_NODE_ID.test(node.id ?? "")) {
      errors.push(`graph node ${index} has invalid ID ${node.id}`);
    }
    if (!node?.id || nodes.has(node.id)) {
      errors.push(`graph has a missing or duplicate node ID ${node?.id}`);
      continue;
    }
    if (!VALID_NODE_TYPES.has(node.type)) {
      errors.push(`${node.id} has nonsemantic graph type ${node.type}`);
    }
    if (node.id.split(":", 1)[0] !== node.type) {
      errors.push(`${node.id} does not match semantic type ${node.type}`);
    }
    if (typeof node.order !== "number" || !Number.isFinite(node.order)) {
      errors.push(`${node.id} has invalid order`);
    }
    if (
      node.type === "chapter" &&
      (!UUID_V7.test(node.chapter_id ?? "") ||
        (node.status !== undefined && !CHAPTER_STATUSES.has(node.status)))
    ) {
      errors.push(`${node.id} has invalid chapter_id or chapter status`);
    }
    nodes.set(node.id, node);
  }
  for (const node of graph.nodes) {
    if (!node || typeof node !== "object" || Array.isArray(node)) continue;
    if (node.parent && !nodes.has(node.parent)) {
      errors.push(`${node.id} has missing parent ${node.parent}`);
    }
  }
  for (const node of graph.nodes) {
    if (!node || typeof node !== "object" || Array.isArray(node)) continue;
    const seen = new Set([node.id]);
    let parent = node.parent;
    while (parent !== undefined) {
      if (seen.has(parent)) {
        errors.push(`${node.id} belongs to a graph parent cycle`);
        break;
      }
      seen.add(parent);
      parent = nodes.get(parent)?.parent;
    }
  }
  if (graph.links !== undefined && !Array.isArray(graph.links)) {
    errors.push("graph mirror links must be an array");
    return;
  }
  for (const [index, link] of (graph.links ?? []).entries()) {
    if (
      !link ||
      typeof link !== "object" ||
      Array.isArray(link) ||
      JSON.stringify(Object.keys(link).sort()) !==
        JSON.stringify(["from", "to", "type"])
    ) {
      errors.push(`graph link ${index} must contain only from, to, and type`);
      continue;
    }
    if (
      !AUTHORBOT_NODE_ID.test(link.from ?? "") ||
      !AUTHORBOT_NODE_ID.test(link.to ?? "")
    ) {
      errors.push(`graph link ${index} has an invalid endpoint ID`);
    }
    if (!nodes.has(link.from) || !nodes.has(link.to)) {
      errors.push(
        `graph link ${link.from ?? "?"} -> ${link.to ?? "?"} has a missing endpoint`,
      );
    }
    if (typeof link.type !== "string" || link.type.length === 0) {
      errors.push(`graph link ${index} has an invalid type`);
    }
  }
  for (const id of [
    "character:ruined-sovereign",
    "character:turning-knot",
  ]) {
    if (!nodes.has(id)) errors.push(`graph mirror is missing ${id}`);
  }
  if (
    nodes.has("entity:ruined-sovereign") ||
    nodes.has("entity:turning-knot")
  ) {
    errors.push("graph mirror still uses downstream-incompatible entity IDs");
  }
}

async function validateCatalog({
  catalog,
  schema,
  fileSet,
  contents,
  config,
}) {
  const errors = [];
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validate = ajv.compile(schema);
  if (!validate(catalog)) {
    for (const error of validate.errors ?? []) {
      errors.push(
        `catalog${error.instancePath || "/"} ${error.message ?? "is invalid"}`,
      );
    }
  }
  if (catalog.schema !== CONTRACT_VERSION) {
    errors.push(`unsupported source contract ${catalog.schema}`);
  }
  if (
    !Array.isArray(catalog.documents) ||
    !Array.isArray(catalog.retiredDocuments) ||
    !Array.isArray(catalog.excludedRoots) ||
    !Array.isArray(catalog.excludedPaths)
  ) {
    throw new SnowflakeError(
      "SOURCE_VALIDATION_FAILED",
      "Snowflake source catalog does not contain the required collections",
      errors,
    );
  }

  const excludedRoots = new Set();
  for (const entry of catalog.excludedRoots) {
    if (excludedRoots.has(entry.path)) {
      errors.push(`duplicate excluded root ${entry.path}`);
    }
    excludedRoots.add(entry.path);
    for (const exception of entry.except ?? []) {
      if (!exception.startsWith(entry.path)) {
        errors.push(`${exception} is not inside excluded root ${entry.path}`);
      }
    }
  }
  for (const required of REQUIRED_EXCLUDED_ROOTS) {
    if (!excludedRoots.has(required)) {
      errors.push(`${required} must be an explicit excluded root`);
    }
  }
  const archive = catalog.excludedRoots.find(
    (entry) => entry.path === "archive/",
  );
  if (
    !archive ||
    JSON.stringify(archive.except ?? []) !==
      JSON.stringify(["archive/decision-log.md"])
  ) {
    errors.push(
      "archive/ must exclude everything except archive/decision-log.md",
    );
  }
  const excludedPaths = new Set();
  for (const entry of catalog.excludedPaths) {
    if (excludedPaths.has(entry.path)) {
      errors.push(`duplicate excluded path ${entry.path}`);
    }
    excludedPaths.add(entry.path);
  }
  for (const required of ["AGENTS.md", "README.md"]) {
    if (!excludedPaths.has(required)) {
      errors.push(`${required} must be an explicit excluded path`);
    }
  }

  const byId = new Map();
  const byPath = new Map();
  for (const document of catalog.documents ?? []) {
    try {
      assertSafeRelativePath(document.path, `document ${document.id} path`);
    } catch (error) {
      errors.push(error.message);
      continue;
    }
    if (byId.has(document.id)) errors.push(`duplicate document ID ${document.id}`);
    if (byPath.has(document.path)) {
      errors.push(`duplicate document path ${document.path}`);
    }
    byId.set(document.id, document);
    byPath.set(document.path, document);
    if (!fileSet.has(document.path)) {
      errors.push(`${document.id} is missing at ${document.path}`);
      continue;
    }
    if (catalogPathIsExcluded(document.path, catalog)) {
      errors.push(`${document.id} registers excluded path ${document.path}`);
    }
    if (
      (document.path.startsWith("drafts/") &&
        document.role !== "derived-draft") ||
      (document.role === "derived-draft" &&
        (!CONDENSED_TOURNAMENT_DRAFT.test(document.path) ||
          document.domain !== "story" ||
          document.family !== "condensed-tournament" ||
          document.visibility !== "public" ||
          document.step !== undefined ||
          document.subject !== undefined))
    ) {
      errors.push(
        `${document.id} is not a public condensed-tournament derived draft`,
      );
    }
    if (
      document.visibility === "public" &&
      (!publicDocumentPathAllowed(document) ||
        /(?:^|\/)(?:research|archive|legacy|prompts?|handoffs?)(?:\/|$)/i.test(
          document.path,
        ) ||
        /(?:^|\/)(?:README|AGENTS)\.md$/.test(document.path))
    ) {
      errors.push(`${document.id} exposes forbidden path ${document.path}`);
    }

    const content = contents.get(document.path)?.toString("utf8") ?? "";
    const metadata = markdownMetadata(content);
    const numbered = NUMBERED_DELIVERABLE.exec(document.path);
    if (numbered) {
      if (
        metadata.statuses.length !== 1 ||
        !["accepted", "provisional"].includes(metadata.statuses[0])
      ) {
        errors.push(`${document.path} has invalid or duplicate Status metadata`);
      }
      if (metadata.steps.length !== 1 || metadata.steps[0] !== numbered[1]) {
        errors.push(`${document.path} has invalid Snowflake step metadata`);
      }
      if (document.step !== numbered[1]) {
        errors.push(`${document.id} catalog step does not match its filename`);
      }
      const expectedRole = document.path.endsWith("-supporting-planning.md")
        ? "supporting-planning"
        : "deliverable";
      if (document.role !== expectedRole) {
        errors.push(`${document.id} must use role ${expectedRole}`);
      }
      if (
        expectedRole === "deliverable" &&
        document.visibility !== "public"
      ) {
        errors.push(`${document.id} must be public with an explicit status`);
      }
    }
    const status = documentStatus(document, content);
    if (
      document.role === "stable-reference" &&
      (status !== "accepted" || document.visibility !== "public")
    ) {
      errors.push(`${document.id} must be an accepted public stable reference`);
    }
    if (
      document.role === "open-questions" &&
      (status !== "unresolved" || document.visibility !== "internal")
    ) {
      errors.push(`${document.id} must remain unresolved and internal`);
    }
    if (
      document.role === "supporting-planning" &&
      document.visibility === "public" &&
      status !== "accepted"
    ) {
      errors.push(`${document.id} exposes provisional supporting planning`);
    }
    if (
      document.role === "derived-draft" &&
      !["accepted", "provisional"].includes(status)
    ) {
      errors.push(`${document.id} has invalid derived-draft Status metadata`);
    }
  }

  for (const path of fileSet) {
    if (NUMBERED_DELIVERABLE.test(path) && !byPath.has(path)) {
      errors.push(`eligible numbered deliverable is unregistered: ${path}`);
    }
  }
  for (const path of fileSet) {
    if (
      path.startsWith("canon/") &&
      path.endsWith(".md") &&
      !NUMBERED_DELIVERABLE.test(path) &&
      !path.endsWith("/README.md") &&
      !path.endsWith("/open-questions.md")
    ) {
      const metadata = markdownMetadata(
        contents.get(path)?.toString("utf8") ?? "",
      );
      if (
        metadata.statuses.length === 1 &&
        metadata.statuses[0] === "accepted" &&
        byPath.get(path)?.role !== "stable-reference"
      ) {
        errors.push(
          `eligible accepted stable reference is unregistered: ${path}`,
        );
      }
    }
    if (
      QUESTION_PATH.test(path) &&
      (byPath.get(path)?.role !== "open-questions" ||
        byPath.get(path)?.visibility !== "internal")
    ) {
      errors.push(`question owner is not registered as internal: ${path}`);
    }
  }
  for (const [path, role] of new Map([
    [config.contract.workPointer.path, "supporting-planning"],
    ["archive/decision-log.md", "decision-log"],
    ["mirrors/authorbot/story-graph.yaml", "graph-mirror"],
  ])) {
    const document = byPath.get(path);
    if (document?.role !== role || document.visibility !== "internal") {
      errors.push(`${path} must be registered as internal ${role}`);
    }
  }

  const retiredById = new Map();
  const retiredByPath = new Map();
  for (const retired of catalog.retiredDocuments ?? []) {
    if (byId.has(retired.id) || retiredById.has(retired.id)) {
      errors.push(`retired ID is duplicated: ${retired.id}`);
    }
    retiredById.set(retired.id, retired);
    if (retiredByPath.has(retired.formerPath)) {
      errors.push(`retired former path is duplicated: ${retired.formerPath}`);
    }
    retiredByPath.set(retired.formerPath, retired);
    if (byPath.has(retired.formerPath)) {
      errors.push(`retired path remains active: ${retired.formerPath}`);
    }
    for (const replacement of retired.supersededBy) {
      if (!byId.has(replacement)) {
        errors.push(`${retired.id} names missing replacement ${replacement}`);
      }
    }
  }
  for (const document of catalog.documents ?? []) {
    for (const superseded of document.supersedes ?? []) {
      const retired = retiredById.get(superseded);
      if (!retired || !retired.supersededBy.includes(document.id)) {
        errors.push(
          `${document.id} has an invalid supersedes link to ${superseded}`,
        );
      }
    }
  }
  for (const retired of catalog.retiredDocuments ?? []) {
    for (const replacement of retired.supersededBy) {
      if (!byId.get(replacement)?.supersedes.includes(retired.id)) {
        errors.push(
          `${retired.id} and ${replacement} have asymmetric supersession`,
        );
      }
    }
  }

  const pointer = byId.get(config.contract.workPointer.id);
  if (
    !pointer ||
    pointer.path !== config.contract.workPointer.path ||
    pointer.visibility !== "internal" ||
    pointer.role !== "supporting-planning"
  ) {
    errors.push("catalog does not expose the configured internal work pointer");
  } else {
    const pointerContent = contents.get(pointer.path)?.toString("utf8") ?? "";
    try {
      const { data } = parseFrontmatter(pointerContent, pointer.path);
      const expectedKeys = [
        "activeStep",
        "currentDocumentId",
        "currentStatus",
        "schema",
        "supportingDocumentId",
      ];
      if (
        JSON.stringify(Object.keys(data ?? {}).sort()) !==
        JSON.stringify(expectedKeys)
      ) {
        errors.push(
          `${pointer.path} frontmatter must contain only ${expectedKeys.join(", ")}`,
        );
      }
      if (data?.schema !== "causal-projector.snowflake-work/v1") {
        errors.push(`${pointer.path} has an unsupported frontmatter schema`);
      }
      if (!/^(?:0[1-9]|10)$/.test(data?.activeStep ?? "")) {
        errors.push(`${pointer.path} has an invalid activeStep`);
      }
      if (!["accepted", "provisional"].includes(data?.currentStatus)) {
        errors.push(`${pointer.path} has an invalid currentStatus`);
      }
      const current = byId.get(data.currentDocumentId);
      const supporting = byId.get(data.supportingDocumentId);
      if (
        !current ||
        current.step !== data.activeStep ||
        current.role !== "deliverable" ||
        documentStatus(
          current,
          contents.get(current.path)?.toString("utf8") ?? "",
        ) !== data.currentStatus
      ) {
        errors.push("work pointer current document metadata is inconsistent");
      }
      if (
        !supporting ||
        supporting.step !== data.activeStep ||
        supporting.role !== "supporting-planning"
      ) {
        errors.push("work pointer supporting document metadata is inconsistent");
      }
      if (pointer.step !== data.activeStep) {
        errors.push("work pointer catalog step does not match activeStep");
      }
      if (current && !pointerContent.includes(`](../${current.path})`)) {
        errors.push(`work pointer must link to ${current.path}`);
      }
      if (
        supporting &&
        !pointerContent.includes(`](../${supporting.path})`)
      ) {
        errors.push(`work pointer must link to ${supporting.path}`);
      }
    } catch (error) {
      errors.push(error.message);
    }
  }

  const graphDocument = [...byId.values()].find(
    (document) => document.role === "graph-mirror",
  );
  if (!graphDocument) {
    errors.push("catalog is missing the internal graph mirror");
  } else {
    validateGraph(
      contents.get(graphDocument.path)?.toString("utf8") ?? "",
      errors,
    );
  }

  const conventionalNames = new Set(["README.md", "AGENTS.md"]);
  const ordinaryName =
    /^(?:[0-9]{2}-)?[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+(?:-[a-z0-9]+)*)*$/;
  const hiddenName = /^\.[a-z0-9]+(?:-[a-z0-9]+)*$/;
  for (const path of fileSet) {
    for (const component of path.split("/")) {
      if (
        !conventionalNames.has(component) &&
        !ordinaryName.test(component) &&
        !hiddenName.test(component)
      ) {
        errors.push(`${path} violates lowercase kebab-case path rules`);
        break;
      }
    }
  }

  if (errors.length > 0) {
    throw new SnowflakeError(
      "SOURCE_VALIDATION_FAILED",
      `Snowflake source validation failed with ${errors.length} issue(s)`,
      errors,
    );
  }
  return { byId, byPath };
}

export async function loadProjectionConfig(repoRoot) {
  const path = join(repoRoot, "config/snowflake-projections.json");
  const config = await readJson(path);
  if (config.schema !== "causal-projector.snowflake-projections/v1") {
    throw new SnowflakeError(
      "PROJECTION_CONFIG_INVALID",
      `Unsupported projection config schema ${config.schema}`,
    );
  }
  if (
    config.contract?.catalogPath !== CATALOG_SOURCE_PATH ||
    config.contract?.schemaPath !== CONTRACT_SOURCE_PATH ||
    config.contract?.version !== CONTRACT_VERSION
  ) {
    throw new SnowflakeError(
      "PROJECTION_CONFIG_INVALID",
      "Projection config does not name the v1 Snowflake source contract",
    );
  }
  for (const target of projectionTargets(config)) {
    assertSafeRelativePath(target, "projection target");
  }
  return config;
}

export function projectionTargets(config) {
  return [
    ...config.exactCopies.map((entry) => entry.target),
    config.openQuestions.target,
    config.synopsis.target,
    ...config.characters.map((entry) => entry.target),
    config.canon.target,
  ];
}

export async function loadSourceSnapshot({ repoRoot, source, ref }) {
  const config = await loadProjectionConfig(repoRoot);
  const commit = await resolveSourceCommit(source, ref);
  const repository = await sourceRepositoryName(source);
  const files = await gitListFiles(source, commit);
  const fileSet = new Set(files);
  for (const required of [CATALOG_SOURCE_PATH, CONTRACT_SOURCE_PATH]) {
    if (!fileSet.has(required)) {
      throw new SnowflakeError(
        "SOURCE_CONTRACT_MISSING",
        `${commit} does not contain ${required}`,
      );
    }
  }
  const catalogBuffer = await gitReadBuffer(
    source,
    commit,
    CATALOG_SOURCE_PATH,
  );
  const schemaBuffer = await gitReadBuffer(
    source,
    commit,
    CONTRACT_SOURCE_PATH,
  );
  let catalog;
  let schema;
  try {
    catalog = JSON.parse(catalogBuffer.toString("utf8"));
    schema = JSON.parse(schemaBuffer.toString("utf8"));
  } catch (error) {
    throw new SnowflakeError(
      "SOURCE_CONTRACT_INVALID",
      `Source catalog or schema is invalid JSON: ${error.message}`,
    );
  }
  const contents = new Map();
  for (const document of catalog.documents ?? []) {
    if (!contents.has(document.path) && fileSet.has(document.path)) {
      contents.set(
        document.path,
        await gitReadBuffer(source, commit, document.path),
      );
    }
  }
  for (const path of files) {
    if (
      (path.startsWith("canon/") && path.endsWith(".md")) ||
      QUESTION_PATH.test(path) ||
      path === config.contract.workPointer.path
    ) {
      if (!contents.has(path)) {
        contents.set(path, await gitReadBuffer(source, commit, path));
      }
    }
  }
  const indexes = await validateCatalog({
    catalog,
    schema,
    fileSet,
    contents,
    config,
  });
  const documents = catalog.documents.map((document) => {
    const buffer = contents.get(document.path);
    const content = buffer.toString("utf8");
    return {
      ...document,
      content: buffer,
      sourceHash: sha256(buffer),
      status: documentStatus(document, content),
      title: markdownTitle(content, document.id),
      excerpt: markdownExcerpt(content),
    };
  });
  return {
    catalog,
    catalogBuffer,
    schema,
    schemaBuffer,
    config,
    commit,
    repository,
    files,
    contents,
    documents,
    byId: new Map(documents.map((document) => [document.id, document])),
    byPath: indexes.byPath,
  };
}

export async function listFilesRecursive(root) {
  if (!(await pathExists(root))) return [];
  const files = [];
  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const absolute = join(directory, entry.name);
      if (entry.isDirectory()) await visit(absolute);
      else if (entry.isFile()) {
        files.push(relative(root, absolute).split("\\").join("/"));
      }
    }
  }
  await visit(root);
  return files.sort();
}

export async function resetDirectory(path) {
  await rm(path, { recursive: true, force: true });
  await mkdir(path, { recursive: true });
}

export async function fileHash(path) {
  return sha256(await readFile(path));
}

export async function directoryManifest(root) {
  const result = {};
  for (const path of await listFilesRecursive(root)) {
    result[path] = await fileHash(join(root, path));
  }
  return result;
}

export async function ensureRegularFile(path, label = path) {
  const information = await stat(path);
  if (!information.isFile()) {
    throw new SnowflakeError("FILE_REQUIRED", `${label} must be a regular file`);
  }
}
