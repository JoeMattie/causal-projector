import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rename,
  rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative, resolve } from "node:path";
import {
  SNAPSHOT_ROOT,
  SnowflakeError,
  fileHash,
  loadSourceSnapshot,
  pathExists,
  resolveInside,
  runCommand,
  writeFileEnsured,
} from "./snowflake-common.mjs";
import {
  buildImportPlan,
  detectTargetConflicts,
  planIsNoop,
  refreshPlanDocuments,
  snapshotFilesForPlan,
} from "./snowflake-projections.mjs";
import {
  loadImportedSnapshot,
  validateImportedSnapshot,
  writePublicDataset,
} from "./snowflake-site.mjs";

function setCheck(plan, name, status, detail = "") {
  const check = plan.checks.find((entry) => entry.name === name);
  if (check) {
    check.status = status;
    check.detail = detail;
  }
}

async function copyDownstreamRepository(repoRoot, target) {
  const excluded = new Set([".git", "node_modules", "_site"]);
  await cp(repoRoot, target, {
    recursive: true,
    dereference: false,
    filter(source) {
      const path = relative(repoRoot, source).split("\\").join("/");
      if (!path) return true;
      const first = path.split("/", 1)[0];
      return (
        !excluded.has(first) &&
        !first.startsWith(".snowflake-transaction-")
      );
    },
  });
}

async function writeSnapshotDirectory(root, plan) {
  await rm(root, { recursive: true, force: true });
  await mkdir(root, { recursive: true });
  for (const [path, content] of snapshotFilesForPlan(plan)) {
    await writeFileEnsured(join(root, path), content);
  }
}

async function overlayPlan(repoRoot, plan) {
  await writeSnapshotDirectory(join(repoRoot, SNAPSHOT_ROOT), plan);
  for (const projection of plan.projections) {
    await writeFileEnsured(
      resolveInside(repoRoot, projection.path, "projection target"),
      projection.content,
    );
  }
}

async function rewriteStagedMetadata(stagedRepo, plan) {
  refreshPlanDocuments(plan);
  const root = join(stagedRepo, SNAPSHOT_ROOT);
  const files = snapshotFilesForPlan(plan);
  await writeFileEnsured(join(root, "import.json"), files.get("import.json"));
  await writeFileEnsured(
    join(root, "reconciliation.md"),
    files.get("reconciliation.md"),
  );
}

function cliPath(repoRoot) {
  return join(repoRoot, "node_modules/.bin/authorbot");
}

async function runAuthorbotChecks({
  repoRoot,
  stagedRepo,
  siteOut,
  basePath,
  plan,
}) {
  const authorbot = cliPath(repoRoot);
  if (!(await pathExists(authorbot))) {
    throw new SnowflakeError(
      "AUTHORBOT_NOT_INSTALLED",
      "Run npm ci before ingesting a Snowflake snapshot",
    );
  }
  try {
    const validation = await runCommand(process.execPath, [
      authorbot,
      "validate",
      stagedRepo,
    ]);
    setCheck(
      plan,
      "Authorbot validation",
      "passed",
      validation.stdout.trim() || "repository valid",
    );
  } catch (error) {
    setCheck(plan, "Authorbot validation", "failed", error.message);
    throw error;
  }

  const buildArgs = ["build", stagedRepo, "--out", siteOut];
  if (basePath) buildArgs.push("--base-url", basePath);
  try {
    const build = await runCommand(process.execPath, [authorbot, ...buildArgs]);
    setCheck(
      plan,
      "Full site build",
      "passed",
      build.stdout.trim() || "site built",
    );
  } catch (error) {
    setCheck(plan, "Full site build", "failed", error.message);
    throw error;
  }
}

async function validatePublicOutput({
  stagedRepo,
  siteOut,
  basePath,
  plan,
}) {
  try {
    const snapshot = await loadImportedSnapshot(stagedRepo);
    const result = await writePublicDataset({
      outDir: siteOut,
      snapshot,
      basePath,
    });
    setCheck(
      plan,
      "Public data leakage scan",
      "passed",
      `${result.records} public records, ${result.files} generated data files`,
    );
  } catch (error) {
    setCheck(plan, "Public data leakage scan", "failed", error.message);
    throw error;
  }
}

export async function stageAndValidateImport({
  repoRoot,
  plan,
  basePath = "",
}) {
  const stagingRoot = await mkdtemp(join(tmpdir(), "snowflake-import-"));
  const stagedRepo = join(stagingRoot, "repository");
  const siteOut = join(stagingRoot, "site");
  await copyDownstreamRepository(repoRoot, stagedRepo);
  await overlayPlan(stagedRepo, plan);

  let failure;
  try {
    await validateImportedSnapshot(stagedRepo);
    await runAuthorbotChecks({
      repoRoot,
      stagedRepo,
      siteOut,
      basePath,
      plan,
    });
    await validatePublicOutput({ stagedRepo, siteOut, basePath, plan });
  } catch (error) {
    failure = error;
  }
  await rewriteStagedMetadata(stagedRepo, plan);
  const reportPath = join(stagedRepo, SNAPSHOT_ROOT, "reconciliation.md");
  if (failure) {
    failure.reportPath = reportPath;
    failure.stagingRoot = stagingRoot;
    throw failure;
  }
  await validateImportedSnapshot(stagedRepo);
  return { stagingRoot, stagedRepo, siteOut, reportPath };
}

async function prepareAtomicFiles(repoRoot, plan, transactionRoot) {
  const snapshot = join(transactionRoot, "new-snapshot");
  await writeSnapshotDirectory(snapshot, plan);
  const targets = [];
  for (const projection of plan.projections) {
    const staged = join(transactionRoot, "new-targets", projection.path);
    await writeFileEnsured(staged, projection.content);
    targets.push({
      path: projection.path,
      target: resolveInside(repoRoot, projection.path, "projection target"),
      staged,
      backup: join(transactionRoot, "backups", projection.path),
      hadOriginal: false,
      installed: false,
    });
  }
  targets.push({
    path: SNAPSHOT_ROOT,
    target: join(repoRoot, SNAPSHOT_ROOT),
    staged: snapshot,
    backup: join(transactionRoot, "backups", SNAPSHOT_ROOT),
    hadOriginal: false,
    installed: false,
  });
  return targets;
}

async function rollbackTargets(targets) {
  const failures = [];
  for (const entry of [...targets].reverse()) {
    try {
      if (entry.installed && (await pathExists(entry.target))) {
        await rm(entry.target, { recursive: true, force: true });
      }
      if (entry.hadOriginal && (await pathExists(entry.backup))) {
        await mkdir(dirname(entry.target), { recursive: true });
        await rename(entry.backup, entry.target);
      }
    } catch (error) {
      failures.push(`${entry.path}: ${error.message}`);
    }
  }
  return failures;
}

export async function applyImportPlan(repoRoot, plan) {
  if (plan.previousImport) {
    await loadImportedSnapshot(repoRoot, {
      allowProjectionConfigDrift: true,
      allowImporterVersionDrift: true,
    });
  }
  const currentConflicts = await detectTargetConflicts(
    repoRoot,
    plan.previousImport,
  );
  if (plan.conflicts.length > 0 || currentConflicts.length > 0) {
    const conflicts = [...plan.conflicts, ...currentConflicts];
    throw new SnowflakeError(
      "GENERATED_TARGET_CONFLICT",
      "Refusing to overwrite downstream edits to generated targets",
      [
        ...new Set(
          conflicts.map(
            (conflict) => `${conflict.path}: ${conflict.reason}`,
          ),
        ),
      ],
    );
  }
  const transactionRoot = await mkdtemp(
    join(repoRoot, ".snowflake-transaction-"),
  );
  const targets = await prepareAtomicFiles(repoRoot, plan, transactionRoot);
  try {
    for (const entry of targets) {
      const priorTarget = plan.previousImport?.generatedTargets?.find(
        (target) => target.path === entry.path,
      );
      if (priorTarget) {
        const actual = (await pathExists(entry.target))
          ? await fileHash(entry.target)
          : null;
        if (actual !== priorTarget.hash) {
          throw new SnowflakeError(
            "GENERATED_TARGET_CONFLICT",
            `Refusing to overwrite a concurrent edit to ${entry.path}`,
          );
        }
      }
      await mkdir(dirname(entry.target), { recursive: true });
      if (await pathExists(entry.target)) {
        await mkdir(dirname(entry.backup), { recursive: true });
        await rename(entry.target, entry.backup);
        entry.hadOriginal = true;
      }
      await rename(entry.staged, entry.target);
      entry.installed = true;
    }
    const result = await validateImportedSnapshot(repoRoot);
    await rm(transactionRoot, { recursive: true, force: true });
    return result;
  } catch (error) {
    const rollbackFailures = await rollbackTargets(targets);
    if (rollbackFailures.length === 0) {
      await rm(transactionRoot, { recursive: true, force: true });
    }
    throw new SnowflakeError(
      "ATOMIC_APPLY_FAILED",
      `Snowflake transaction could not be applied: ${error.message}`,
      rollbackFailures.length > 0
        ? [
            `Recovery directory: ${transactionRoot}`,
            ...rollbackFailures.map((failure) => `Rollback failed: ${failure}`),
          ]
        : ["Original files were restored successfully."],
    );
  }
}

export async function executeImport({
  repoRoot,
  source,
  ref,
  apply = false,
  basePath = "",
}) {
  const snapshot = await loadSourceSnapshot({ repoRoot, source, ref });
  const plan = await buildImportPlan({ repoRoot, snapshot });
  if (await planIsNoop(repoRoot, plan)) {
    return {
      mode: "noop",
      plan,
      reportPath: join(repoRoot, SNAPSHOT_ROOT, "reconciliation.md"),
      stagingRoot: null,
    };
  }

  let staged;
  try {
    staged = await stageAndValidateImport({ repoRoot, plan, basePath });
  } catch (error) {
    throw error;
  }
  if (plan.conflicts.length > 0) {
    const error = new SnowflakeError(
      "GENERATED_TARGET_CONFLICT",
      "Dry run found downstream edits to generated targets",
      plan.conflicts.map((conflict) => `${conflict.path}: ${conflict.reason}`),
    );
    error.reportPath = staged.reportPath;
    error.stagingRoot = staged.stagingRoot;
    throw error;
  }
  if (!apply) {
    return {
      mode: "dry-run",
      plan,
      ...staged,
    };
  }
  const applied = await applyImportPlan(repoRoot, plan);
  await rm(staged.stagingRoot, { recursive: true, force: true });
  return {
    mode: "applied",
    plan,
    applied,
    reportPath: join(repoRoot, SNAPSHOT_ROOT, "reconciliation.md"),
    stagingRoot: null,
  };
}
