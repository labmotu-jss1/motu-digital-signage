# motu-digital-signage
Digital signage static site plus the active `nui/` PulseDeck experience.

## PulseDeck current state

The active signage UI lives under `nui/` and is published at:

- `https://labmotu-jss1.github.io/motu-digital-signage/nui/`
- `https://labmotu-jss1.github.io/motu-digital-signage/nui/?view=mobile`
- `https://labmotu-jss1.github.io/motu-digital-signage/nui/?view=desktop`

PulseDeck currently supports two primary presentation modes:

- `Cube`: the default mode on load/home
- `Carousel`: continuous 3D orbital carousel with wheel and drag control

Important current behavior:

- `Home` resets the active stage back to the default cube state without reloading the page
- the app is locked to the viewport instead of relying on page scroll
- the dock remains inside the viewport
- carousel cards support direct grab/drag rotation plus vertical tilt control while held
- carousel video cards use silent live previews
- fullscreen can be entered from the app and the UI attempts to stay maximized unless explicitly exited
- `Dice` is synthetic in the frontend and no longer depends on VM `dice-*` folders existing

The VM-backed historical video catalog currently in use is `Historic Speeches`, with short teaser clips on the cloud VM and audio available when expanded.

## Local development

Install dependencies:

```bash
npm install
npx playwright install chromium
```

Serve locally:

```bash
python3 -m http.server 4173
```

## End-to-end checks

Run the mobile/layout suite:

```bash
npm run test:e2e:mobile
```

The Playwright setup runs PulseDeck checks against:

- `iPhone 12`
- `Pixel 7`

The suite validates:

- top controls render and stay usable
- the dock loads
- the cube is visible on load
- dock selection works
- `Cube` and `Carousel` mode changes work
- the stage remains inside the mobile viewport

## Additional notes

- cloud catalog feed source: `https://40-160-254-60.sslip.io/motu-lib/catalogs.json`
- cloud catalog server helper: `scripts/cloud-vm-motu-lib-server.js`
- operational notes: `docs/PULSEDECK_SIGNAGE_OPERATIONS_2026-04-02.md`
