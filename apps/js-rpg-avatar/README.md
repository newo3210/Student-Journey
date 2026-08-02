# RPG Avatar Creator (fundamentos JS)

Proyecto de práctica **Clase 1**: objeto `avatar`, arrays (rasgos/poderes), funciones y operadores `+` / `-` para repartir puntos.

## Abrir

```bash
cd apps/js-rpg-avatar
npx --yes serve . -p 5180
```

O abrí `index.html` en el navegador.

## Mecánica

- Editar **nombre**
- Elegir **clase** (Guerrero / Mago / Pícaro / Explorador)
- Activar **rasgos** (array)
- Elegir hasta **2 poderes** de la clase (array)
- Repartir **10 puntos** entre fuerza, agilidad, inteligencia, carisma (`addPoint` / `removePoint`)
- Ver la **ficha** en vivo + reset

## Mapa a la clase

| Concepto | En el código |
|---|---|
| `let` / `const` | estado, catálogos, presupuesto |
| Objeto | `avatar` |
| Arrays | `traits`, `powers`, `CLASSES`, `ALL_TRAITS` |
| Funciones | `addPoint`, `removePoint`, `toggleTrait`, `renderAll`… |
| Operadores | suma/resta de stats, comparaciones, ternario en nombre vacío |

## Extras para practicar

1. Agregar un 5º atributo (`suerte`).
2. Limitar rasgos a máximo 3.
3. Guardar la ficha en `localStorage` (cuando lo vean en el curso).
