# CSS Gradient Study (portfolio)

Gradiente a pantalla completa con pan animado. El estudio canonico es `index.html` + `styles.css`. Labs opcionales para previsualizar y customizar sin romper el canon.

## Abrir el estudio

Tiene que ser **http** (no abrir labs con doble clic / `file:`). Bajo `file:` el browser trata cada archivo como origen opaco y bloquea `fetch` + acceso al DOM del iframe.

```bash
cd apps/css-gradient-study
npx --yes serve . -p 5185
```

| URL | Que es |
|---|---|
| `http://localhost:5185/` | Estudio (`index.html` + `styles.css`) |
| `http://localhost:5185/lab.html` | Lab v1: editores de texto HTML/CSS + preview |
| `http://localhost:5185/labv2.html` | Lab v2: controles + codigo (fondo full-bleed) |
| `http://localhost:5185/lab-frames.html` | Lab frames: mismos controles; degrade en barras/dialogs/chips |

## Lab frames

Mismos controles que lab v2. El preview es `frames.html`: el gradiente se **enmascara** dentro de frames de distinto tamaño/forma (progress thin/thick/pill/vertical, dialog, card, chips, ring).

| Archivo | Rol |
|---|---|
| `frames.html` + `frames.css` | Galeria de ejemplos (`[data-grad]`) |
| `lab-frames.html` + `lab-frames.js` | Controles + codigo (chrome UI = `labv2.css`) |

El codigo generado exporta un ejemplo de **progress thin** listo para copiar. `styles.css` ahora soporta `.grad-surface` como componente (no solo `body`).

## Lab v2

UI de controles sobre el estudio **sin escribir** `index.html` ni `styles.css`.

| Pieza | Rol |
|---|---|
| Preview | iframe de `index.html`; se muta en memoria (clases + tokens + `--c*`) |
| Controles | tipo, tema, colores, pan, estado, velocidad, angulo, origen |
| Paleta hex | al elegir tema carga preset indigo/silver; editable con picker o texto |
| Reset preset | vuelve a los hex canonicos del tema |
| Codigo generado | textarea editable: se sincroniza con controles y al editar a mano actualiza el preview |

Archivos: `labv2.html` + `labv2.css` + `labv2.js` (comentarios de decision/modulos en el JS).

## Decision de implementacion (estudio)

**Objetivo:** un fondo en gradiente que se mueva (pan), con atributos tocables: direccion del movimiento, cuantos colores entran al degrade, velocidad, y ademas tipo/tema.

**Como se llego a esta forma:** meter cada variante en un solo bloque reventaba el CSS. Se partio en ejes que se ensamblan en el `body`:

| Eje | Que controla |
|---|---|
| Tipo | Geometria: linear / radial / conic |
| Tema | Paleta indigo u silver (`--c1`...`--c8`) |
| Colores | Cuantos tonos de la paleta usan el degrade (`--colores-2`...`--colores-8`) |
| Pan | Direccion del desplazamiento |
| Estado | `is-running` / `is-stopped` (click alterna); stopped usa `animation-play-state: paused` para frenar el pan sin resetearlo |
| Velocidad | `--grad-speed` 0-100 -> duracion |

Mas colores = fundido mas fino. Los slots vacios de `--tone-*` repiten el ultimo tono (no `transparent`), asi no aparece un tramo negro al final.

`animation: none` reiniciaba el pan al frame 0; por eso stopped comparte la misma animacion y solo pone `paused`.

## Archivos

| Archivo | Rol |
|---|---|
| `index.html` | Canvas del estudio + click running/stopped |
| `styles.css` | Sistema de gradiente |
| `lab.html` + `lab.css` + `app.js` | Lab v1: textareas + preview |
| `labv2.html` + `labv2.css` + `labv2.js` | Lab v2: controles + paleta hex + codigo generado |
| `frames.html` + `frames.css` | Galeria de frames enmascarados |
| `lab-frames.html` + `lab-frames.js` | Lab frames (controles = v2, preview = frames) |
| `README.md` | Esta guia |

## Definiciones

| Token / clase | Para que esta |
|---|---|
| `grad-surface` | Cascara del canvas; defaults y layout |
| `--c1`...`--c8` | Paleta del tema (en lab v2 tambien override por `style`) |
| `--tone-1`...`--tone-8` | Colores activos que come el gradient() |
| `--colores-2`...`--colores-8` | Cuantos tonos distintos entran |
| `--grad-angle` / `--grad-origin-*` | Angulo y origen del degrade |
| `--pan-from-*` / `--pan-to-*` | Extremos del pan |
| `--grad-speed` / `--grad-duration` | Ritmo (0 lento ... 100 rapido) |
| `is-running` / `is-stopped` | Play o pause del pan (`animation-play-state`) |
| `.config` | Labels de la config activa abajo |

## Ejemplo de combinacion

```html
<body
  class="grad-surface grad-surface--linear grad-surface--indigo grad-surface--colores-5 grad-surface--pan-diag is-running"
  style="--grad-speed: 50; --c1: #3f29ae; --c2: #cc2fda; /* ... */"
>
```
