#!/usr/bin/env node

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SnowflakeError } from "./lib/snowflake-common.mjs";
import { executeImport } from "./lib/snowflake-ingest-core.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function usage() {
  return [
    "Usage:",
    "  npm run ingest:snowflake -- --source <repository> --ref <full-commit-sha> [--apply] [--base-path <path>]",
    "",
    "Dry-run is the default. --apply is required to change this repository.",
  ].join("\n");
}

function parseArguments(argv) {
  const options = {
    source: null,
    ref: null,
    apply: false,
    basePath: "",
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--source" && argv[index + 1]) {
      options.source = resolve(argv[++index]);
    } else if (argument === "--ref" && argv[index + 1]) {
      options.ref = argv[++index];
    } else if (argument === "--base-path" && argv[index + 1]) {
      options.basePath = argv[++index];
    } else if (argument === "--apply") {
      options.apply = true;
    } else if (argument === "--help" || argument === "-h") {
      console.log(usage());
      process.exit(0);
    } else {
      throw new SnowflakeError(
        "USAGE",
        `Unknown or incomplete argument: ${argument ?? "(missing)"}`,
      );
    }
  }
  if (!options.source || !options.ref) {
    throw new SnowflakeError(
      "USAGE",
      "--source and --ref are required",
    );
  }
  return options;
}

function summarizeClassifications(classifications) {
  const counts = new Map();
  for (const entry of classifications) {
    counts.set(entry.result, (counts.get(entry.result) ?? 0) + 1);
  }
  return [...counts]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([result, count]) => `${result}=${count}`)
    .join(", ");
}

function printError(error) {
  const code = error instanceof SnowflakeError ? error.code : "UNEXPECTED";
  console.error(`Snowflake import failed [${code}]: ${error.message}`);
  for (const detail of error.details ?? []) {
    console.error(`- ${detail}`);
  }
  if (error.reportPath) {
    console.error(`Reconciliation report: ${error.reportPath}`);
  }
  if (error.stagingRoot) {
    console.error(`Preserved staging transaction: ${error.stagingRoot}`);
  }
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const result = await executeImport({ repoRoot, ...options });
  console.log(`Snowflake import mode: ${result.mode}`);
  console.log(
    `Documents: ${summarizeClassifications(result.plan.classifications)}`,
  );
  console.log(`Review-only items: ${result.plan.reviewItems.length}`);
  console.log(`Reconciliation report: ${result.reportPath}`);
  if (result.mode === "dry-run") {
    console.log(`Preserved staging transaction: ${result.stagingRoot}`);
    console.log(
      "No downstream files changed. Review reconciliation.md before rerunning with --apply.",
    );
  } else if (result.mode === "noop") {
    console.log("The exact source snapshot is already imported; no files changed.");
  } else {
    console.log("The validated transaction was applied atomically.");
  }
}

main().catch((error) => {
  printError(error);
  if (error?.code === "USAGE") console.error(`\n${usage()}`);
  process.exitCode = 1;
});
