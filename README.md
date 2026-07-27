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
story/outline.yml              the current Authorbot story graph
story/timeline.yml             empty active timeline stub
story/characters/              the current six-character cast
.authorbot/                    collaboration records managed by Authorbot
archive/legacy-authorbot/      collaboration history for the removed chapters
archive/superseded-planning/   planning documents retained for reference only
wrangler.jsonc                 the Cloudflare Worker that serves the site
```

## Canon and planning

There is no current chapter prose or established event sequence. The story
graph and character records hold the restart's active direction. The active
timeline is an empty schema-valid stub; the prior timeline and development
brief are archived as superseded planning.

## Local commands

```sh
npm run validate
npm run build
```

`npm run build` writes the local site to `_site/`. Publishing is handled by CI.

## License

The book is licensed under CC-BY-NC-4.0, as declared in `book.yml`.
