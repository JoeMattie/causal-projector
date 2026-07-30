# The Causal Projector

Planning for this book lives in the separate private Snowflake repository. This
repository turns reviewed snapshots of that planning into Authorbot records and
the reading site. It doesn't restate the story premise, cast, or current work
because those would become a second copy of the canon.

The previous chapters have been removed. There is no current manuscript.

Written by @JoeMattie.

## What's here

```text
book.yml                       the book identity and publication settings
chapters/                      future chapter drafts
story/outline.yml              generated Authorbot projection of the story graph
story/timeline.yml             empty active timeline stub
story/characters/              generated accepted character projections
story/canon.md                 generated accepted story canon and constraints
story/decision-log.md          generated chronological accepted decisions
story/open-questions.md        generated unresolved Snowflake questions
story/methods/snowflake/       imported snapshot, ledger, and reconciliation after approval
config/snowflake-projections.json
                               downstream-owned projection mappings
scripts/                       validated Snowflake ingest and site-data tooling
.authorbot/                    collaboration records managed by Authorbot
archive/legacy-authorbot/      collaboration history for the removed chapters
archive/superseded-planning/   planning documents retained for reference only
public/outline-graph/          interactive Authorbot story graph
public/snowflake/              generated-data Snowflake planning library shell
wrangler.jsonc                 the Cloudflare Worker that serves the site
```

## Canon and planning

There is no current chapter prose or established event sequence. Planning prose
is authored in the separate private `causal-projector-snowflake` repository.
This repository owns publication metadata, imported snapshots, deterministic
Authorbot projections, future manuscript chapters, and presentation.

The active timeline remains an intentionally empty, schema-valid stub. Timeline
events, scene extraction, and chapters are review-only reconciliation work
until their mappings are explicitly approved.

## Snowflake ingestion

Imports are full-snapshot, one-way transactions from an exact committed source
revision. A dry run is the default:

```sh
npm run ingest:snowflake -- \
  --source ../causal-projector-snowflake \
  --ref <full-commit-sha>
```

The dry run validates the source contract, stages all deterministic
projections, checks for downstream edits, runs Authorbot validation and a site
build, and produces a reconciliation report for review. Add `--apply` only
after that report is approved. The importer never commits, pushes, merges, or
deploys.

Stable source document IDs make renames detectable. Removed documents require
upstream retirement records, accepted-to-provisional regressions are blocked,
and a generated target changed by hand is reported as a conflict instead of
being overwritten.

## Local commands

```sh
npm run validate
npm run test:snowflake
npm run build
```

`npm run build` writes the local site to `_site/`, including the public
Snowflake dataset when an imported snapshot is present. Publishing is handled
by CI. Before the first approved import, Snowflake validation intentionally
reports the uninitialized review gate so the publish workflow cannot treat an
empty placeholder as a completed import.

## License

The book is licensed under CC-BY-NC-4.0, as declared in `book.yml`.
