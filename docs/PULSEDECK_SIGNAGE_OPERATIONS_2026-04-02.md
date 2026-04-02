# PulseDeck Signage Operations

Date: 2026-04-02

## Scope

This note captures the current operational state of the MOTU digital signage work in `motu-digital-signage`, focused on the active `nui/` PulseDeck UI.

## Active endpoints

- GitHub Pages default: `https://labmotu-jss1.github.io/motu-digital-signage/nui/`
- Forced mobile: `https://labmotu-jss1.github.io/motu-digital-signage/nui/?view=mobile`
- Forced desktop: `https://labmotu-jss1.github.io/motu-digital-signage/nui/?view=desktop`
- Cloud catalog feed: `https://40-160-254-60.sslip.io/motu-lib/catalogs.json`

## Current UX model

- Default mode is `Cube`
- Secondary mode is `Carousel`
- `Fan` mode is removed from the active PulseDeck UI
- `Home` resets state without a page reload
- The UI is pinned to the viewport so the page does not require vertical scrolling

## Cube behavior

- Cube remains the primary entry state
- Video faces can play silent live previews directly on cube faces
- Clicking a cube face transitions into the carousel/item flow
- Historic speech clips open with audio when expanded

## Carousel behavior

- Carousel is a continuous 3D orbital renderer, not a frame-swapping list
- Wheel input rotates the orbit
- Dragging a card rotates the orbit in the direction of the drag
- Vertical drag while holding a card changes orbit tilt
- Side and rear cards remain visible during rotation
- Carousel video cards render live silent video previews on-card
- Clicking or releasing on a card without dragging activates that card

## Catalog notes

### Dice

- `Dice` is now synthetic and frontend-owned
- It no longer depends on legacy `dice-white`, `dice-red`, or `dice-black` VM folders
- Mixed face coloring rotates across white, red, and black

### Historic Speeches

- VM-backed catalog using short direct-hosted clips
- Intended for silent motion previews on cube/carousel cards
- Expanded playback uses the VM-hosted file with audio

## Relevant files

- `nui/index.html`
- `nui/script.js`
- `nui/styles.css`
- `scripts/cloud-vm-motu-lib-server.js`

## Verification notes

Recent work was validated locally with Playwright for:

- cube default behavior
- carousel orbital motion
- drag control
- tilt control
- viewport locking
- dock accessibility
- synthetic dice presence

GitHub Pages propagation can lag behind pushed commits, so local verification was used before handoff where possible.

## NOC sync intent

This document is intended to be mirrored to the NOC VM so the operator environment has an updated description of the signage system and recent UX changes.
