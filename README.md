# The Causal Projector

Evan Hale builds a superconducting flux pump in his garage and finds a timing
fault that makes independent sensors agree when they shouldn't. The same fault
gives him an impossible stretch of clear thinking. Each run removes possible
histories, including versions of the people around him.

The repository currently contains the first 12 published chapters. The rest of
the story remains planning material. Future chapters will be written from that
plan, not copied from the older 24-chapter draft.

Written by @JoeMattie.

## What's here

```text
book.yml                       the book identity and publication settings
chapters/                      the 12 published chapters
story/development-brief.md     the converted development dossier
story/outline.yml              the five-part story graph
story/timeline.yml             established events plus planned future events
story/characters/              character records and continuity notes
.authorbot/                    collaboration records managed by Authorbot
wrangler.jsonc                 the Cloudflare Worker that serves the site
```

## Canon and planning

The published chapters are the source of truth for Chapters 1-12. Character
records and timeline entries summarize that established continuity. The later
outline is direction, not finished prose or locked continuity.

The development dossier fills gaps in the character and plot plans. It keeps
several choices open on purpose. When it conflicts with a published chapter,
the chapter wins.

## Local commands

```sh
npm run validate
npm run build
```

`npm run build` writes the local site to `_site/`. Publishing is handled by CI.

## License

The book is licensed under CC-BY-NC-4.0, as declared in `book.yml`.
