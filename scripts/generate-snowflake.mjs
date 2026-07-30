#!/usr/bin/env node

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SnowflakeError } from "./lib/snowflake-common.mjs";
import {
  loadImportedSnapshot,
  writePublicDataset,
} from "./lib/snowflake-site.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function parseArguments(argv) {
  const options = { outDir: resolve(repoRoot, "_site"), basePath: "" };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--out" && argv[index + 1]) {
      options.outDir = resolve(argv[++index]);
    } else if (argument === "--base-path" && argv[index + 1]) {
      options.basePath = argv[++index];
    } else {
      throw new SnowflakeError(
        "USAGE",
        `Unknown or incomplete argument: ${argument ?? "(missing)"}`,
      );
    }
  }
  return options;
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const snapshot = await loadImportedSnapshot(repoRoot, {
    allowMissing: true,
  });
  const result = await writePublicDataset({
    outDir: options.outDir,
    snapshot,
    basePath: options.basePath,
  });
  console.log(
    `Snowflake data generated: ${result.state}, ${result.records} records, ${result.files} files` +
      (options.basePath ? ` (base path ${options.basePath})` : ""),
  );
}

main().catch((error) => {
  console.error(
    `Snowflake generation failed [${error.code ?? "UNEXPECTED"}]: ${error.message}`,
  );
  for (const detail of error.details ?? []) console.error(`- ${detail}`);
  process.exitCode = 1;
});
