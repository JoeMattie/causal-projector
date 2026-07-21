# The Causal Projector

An Authorbot book. The prose is Markdown, everything else is YAML, and it all
reads perfectly well without any tooling at all.

Written by @JoeMattie.

It has no chapters yet, and that is a normal state rather than a broken one:
it validates, it builds, and the published site says "No chapters published
yet." rather than rendering an empty index.

## Writing your first chapter

Once collaboration is switched on (`create-authorbot collaborate`), sign in on
your own site and press **New chapter**. You get a plain title-and-prose
composer; Authorbot generates the frontmatter, the chapter id, and the block
markers, so you never hand-write a UUID. Saving creates a draft, and
publishing it is a separate, deliberate action.

To do it by hand instead, copy a chapter from `examples/book-repo/chapters/`
in the Authorbot repository and replace every `id` with a fresh UUIDv7.

## Layout

```text
book.yml                  this book's identity and settings
chapters/                 one Markdown file per chapter
story/outline.yml         the story graph: premise, parts, scenes
story/timeline.yml        sortable events with human-readable labels
story/characters/         one Markdown file per character
.authorbot/               collaboration records, written by Authorbot
.github/workflows/        validate every change; publish from main
wrangler.jsonc            the Cloudflare Worker that serves the site
package.json              pins the Authorbot toolchain, and nothing else
```

## Everyday commands

```sh
npm run validate    # check the book against the Authorbot rules
npm run build       # render the site into _site/ (gitignored)
npm run upgrade     # move to a newer Authorbot, as a pull request
```

## Things worth knowing

- **IDs are permanent.** `book.id`, chapter ids, and block markers are
  lowercase UUIDv7. Generate them once; never edit or reuse one.
- **Changing `slug` or `chapter_url` breaks existing links** to chapters you
  have already published. Both are guarded in the Settings view.
- **No secrets in this repository.** Deployment credentials are GitHub
  repository secrets; the Worker's own secrets are set with
  `wrangler secret put`, which never writes them to disk.
- **Publishing is CI's job.** Pushing to `main` validates, builds, and deploys.
  A local `wrangler deploy` publishes whatever is in `_site` at the time,
  which may be older than what is live.
