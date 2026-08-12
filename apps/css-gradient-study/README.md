# CSS Gradient Study (portfolio)

Full-bleed animated gradient with pan. The canonical study is `index.html` + `styles.css`. Optional labs preview and customize without breaking that canon.

## Open the study

Must be served over **http** (do not open labs via double-click / `file:`). Under `file:`, the browser treats each file as an opaque origin and blocks `fetch` plus iframe DOM access.

```bash
cd apps/css-gradient-study
npx --yes serve . -p 5185
```

| URL | What it is |
|---|---|
| `http://localhost:5185/` | Study (`index.html` + `styles.css`) |
| `http://localhost:5185/lab.html` | Lab v1: HTML/CSS text editors + preview |
| `http://localhost:5185/labv2.html` | Lab v2: controls + code (full-bleed surface) |
| `http://localhost:5185/lab-frames.html` | Lab frames: same controls; gradient masked in bars/dialogs/chips |

## Lab frames

Same controls as lab v2. Preview is `frames.html`: the gradient is **masked** inside frames of different sizes/shapes (progress thin/thick/pill/vertical, dialog, card, chips, ring).

| File | Role |
|---|---|
| `frames.html` + `frames.css` | Example gallery (`[data-grad]`) |
| `lab-frames.html` + `lab-frames.js` | Controls + code (chrome UI = `labv2.css`) |

Generated code exports a **progress thin** sample ready to copy. `styles.css` supports `.grad-surface` as a component (not only on `body`).

## Lab v2

Control UI over the study **without writing** `index.html` or `styles.css`.

| Piece | Role |
|---|---|
| Preview | `index.html` iframe; mutated in memory (classes + tokens + `--c*`) |
| Controls | type, theme, color count, pan, motion, speed, angle, origin |
| Hex palette | choosing a theme loads indigo/silver presets; editable via picker or text |
| Reset preset | restores canonical hex values for the theme |
| Generated code | editable textarea: syncs with controls; hand-edits update the preview |

Files: `labv2.html` + `labv2.css` + `labv2.js` (decision/module comments in the JS).

## Implementation decision (study)

**Goal:** a moving gradient background (pan) with controllable motion direction, how many colors enter the blend, speed, plus type/theme.

**How we got here:** packing every variant into one CSS block would explode. The problem was split into axes composed on `body`:

| Axis | Controls |
|---|---|
| Type | Geometry: linear / radial / conic |
| Theme | Indigo or silver palette (`--c1`...`--c8`) |
| Colors | How many palette tones enter the blend (`--colores-2`...`--colores-8`) |
| Pan | Travel direction |
| Motion | `is-running` / `is-stopped` (click toggles); stopped uses `animation-play-state: paused` to freeze pan without resetting |
| Speed | `--grad-speed` 0-100 → duration |

More colors = finer blend. Unused `--tone-*` slots repeat the last tone (not `transparent`), so no black gap at the end.

`animation: none` reset the pan to frame 0; that is why stopped keeps the same animation and only sets `paused`.

## Files

| File | Role |
|---|---|
| `index.html` | Study canvas + click running/stopped |
| `styles.css` | Gradient system |
| `lab.html` + `lab.css` + `app.js` | Lab v1: textareas + preview |
| `labv2.html` + `labv2.css` + `labv2.js` | Lab v2: controls + hex palette + generated code |
| `frames.html` + `frames.css` | Masked frames gallery |
| `lab-frames.html` + `lab-frames.js` | Lab frames (controls = v2, preview = frames) |
| `README.md` | This guide |

## Definitions

| Token / class | Purpose |
|---|---|
| `grad-surface` | Surface shell; defaults and layout |
| `--c1`...`--c8` | Theme palette (lab v2/frames can override via `style`) |
| `--tone-1`...`--tone-8` | Active colors consumed by `gradient()` |
| `--colores-2`...`--colores-8` | How many distinct tones enter |
| `--grad-angle` / `--grad-origin-*` | Angle and origin of the gradient |
| `--pan-from-*` / `--pan-to-*` | Pan endpoints |
| `--grad-speed` / `--grad-duration` | Pace (0 slow … 100 fast) |
| `is-running` / `is-stopped` | Play or pause pan (`animation-play-state`) |
| `.config` | Bottom labels for the active config |

## Combination example

```html
<body
  class="grad-surface grad-surface--linear grad-surface--indigo grad-surface--colores-5 grad-surface--pan-diag is-running"
  style="--grad-speed: 50; --c1: #3f29ae; --c2: #cc2fda; /* ... */"
>
```
