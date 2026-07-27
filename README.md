# The Causal Projector

Evan Hale builds a superconducting flux pump in his garage and finds a timing
fault that makes independent sensors agree when they shouldn't. The same fault
gives him an impossible stretch of clear thinking. Each run removes possible
histories, including versions of the people around him.

The previous chapters have been removed. The repository now holds the current
story graph and cast while the book restarts from planning.

Written by @JoeMattie.

## What's here

```text
book.yml                       the book identity and publication settings
chapters/                      future chapter drafts
story/development-brief.md     the earlier converted development dossier
story/outline.yml              the current Authorbot story graph
story/timeline.yml             provisional event sequence
story/characters/              the current six-character cast
.authorbot/                    collaboration records managed by Authorbot
archive/legacy-authorbot/      collaboration history for the removed chapters
wrangler.jsonc                 the Cloudflare Worker that serves the site
```

## Canon and planning

There is no current chapter prose. The story graph and character records hold
the restart's active direction. The timeline and development brief predate that
restart and remain supporting material until they are reconciled against the
current canon.

## Local commands

```sh
npm run validate
npm run build
```

`npm run build` writes the local site to `_site/`. Publishing is handled by CI.

## License

The book is licensed under CC-BY-NC-4.0, as declared in `book.yml`.
