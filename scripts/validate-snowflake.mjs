#!/usr/bin/env node

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SnowflakeError } from "./lib/snowflake-common.mjs";
import {
  loadImportedSnapshot,
  validateImportedSnapshot,
} from "./lib/snowflake-site.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

async function main() {
  const args = process.argv.slice(2);
  const allowUninitialized =
    args.length === 1 && args[0] === "--allow-uninitialized";
  if (args.length > (allowUninitialized ? 1 : 0)) {
    throw new SnowflakeError(
      "USAGE",
      "Usage: npm run validate:snowflake [-- --allow-uninitialized]",
    );
  }
  if (allowUninitialized) {
    const snapshot = await loadImportedSnapshot(repoRoot, {
      allowMissing: true,
    });
    if (!snapshot) {
      console.log(
        "Snowflake import is uninitialized; initial reconciliation review remains required.",
      );
      return;
    }
  }
  const result = await validateImportedSnapshot(repoRoot);
  console.log(
    `Snowflake import valid: ${result.documents} documents ` +
      `(${result.public} public, ${result.internal} internal) at ${result.commit}.`,
  );
}

main().catch((error) => {
  console.error(
    `Snowflake validation failed [${error.code ?? "UNEXPECTED"}]: ${error.message}`,
  );
  for (const detail of error.details ?? []) console.error(`- ${detail}`);
  process.exitCode = 1;
});
