# Remotion project

Brand and campaign videos built with [Remotion](https://www.remotion.dev):
React components rendered to MP4. Everything in this folder is source; the
rendered clips live in the dated folders at the repo root.

Format: 1080 x 1920 (9:16), 30fps, H.264. Renders are silent; music and
sound effects are added in an editor or the posting app.

## Commands

Run from `remotion/`:

```sh
npm install
npm run studio          # live preview with a scrubbable timeline
npm run render:crown    # writes out/crown-race.mp4
```

`out/` is git-ignored. When a render is final, copy it into a dated folder at
the repo root (for example `2026-11-09-crown-race/`) with a `captions.md`
beside it, following the folders already there.

## Videos

| Id | File | Rendered as | What it is |
|---|---|---|---|
| `CrownRace` | `src/CrownRace.tsx` | `2026-11-09-crown-race/heisty-crown-race.mp4` | 20s. A friend-group board fills, you miss the crown by 4 seconds, you take it the next day. |

Add a video by writing a component and registering a `<Composition>` in
`src/Root.tsx`, then add a render script to `package.json`.

## Rules these videos follow

- Colors and fonts mirror the app's `cine` theme (`src/theme.ts` is a copy of
  the tokens, since the app's theme file cannot be bundled here). If the app's
  theme changes, update `src/theme.ts` to match.
- Fonts are the app's Chakra Petch and Archivo, in `public/fonts`, under the
  SIL Open Font License (license files are alongside them).
- Numbers are illustrative but honest: cuts use the game's real payout formula,
  market values sit in the real daily range, heist numbers follow the real
  puzzle epoch.
- Plain copy first, heist flavor only at payoff moments. Second person,
  present tense. No em dashes. Money is green; Gold is `#d8ab4c`; never
  red/green for win and loss.
- Keep content inside the safe area: platform interface covers roughly the
  top 220px and bottom 420px of a 9:16 frame.
- The end card uses the shipped app icon and the in-app text wordmark. Swap in
  the final brand assets when they exist.

## License note

Remotion is free for individuals and for companies of up to three people.
Larger companies need a paid license. See remotion.dev/license.
