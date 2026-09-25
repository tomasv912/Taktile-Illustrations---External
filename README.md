# Taktile illustration motion

Hover-animation prototypes for Taktile's isometric illustrations (external version).

- The side panel only holds what every animation shares: Motion, BG Blur, Preview.
- Each card's own settings live in a collapsed **Customize parameters** dropdown inside that card.
- Loops (03, 05) always return to rest when the pointer leaves.

## Font

The page is set in Söhne (Klim Type Foundry), a licensed font that isn't bundled here. It is used when installed locally, or when the licensed webfonts are placed in `fonts/` next to `index.html`:
`soehne-buch.woff2`, `soehne-kraftig.woff2`, `soehne-mono-buch.woff2`, `soehne-mono-kraftig.woff2`. Without them the system sans is used.

## Files

- `index.html` — the built page (published as the artifact). Don't edit by hand.
- `src/template.html` — page source: styles, markup and all animation code.
- `src/build.mjs` — injects the Figma SVG exports into the template and writes `index.html`.
- `src/i*.svg` — raw SVG exports of the Figma frames. `i7.svg` (07, Figma node 7732:27118) is rebuilt from that frame's geometry, with the outlines already as plain strokes.
- `serve.mjs` — local preview server (wraps the page the way the artifact host does).

## Build and preview

```bash
node src/build.mjs
node serve.mjs
```

Then open http://localhost:5173 (set `PORT` to use another port).
