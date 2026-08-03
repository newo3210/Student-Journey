# Shopping List (fundamentos JS)

Práctica de portfolio **Clase 1**: lista de compras con array de objetos, índices, `push`/`splice`, filtros y funciones.

## Abrir

```bash
cd apps/js-shopping-list
npx --yes serve . -p 5182
```

O abrí `index.html` en el navegador.

## Qué hace

- Agregar productos (nombre + cantidad)
- Marcar como comprado / pendiente
- Filtrar: todas / pendientes / compradas
- Borrar ítem, limpiar compradas, reset con datos de ejemplo

## Mapa a la clase

| Concepto | En el código |
|---|---|
| Array | `items` |
| Índices | `findIndexById`, `splice` |
| Objetos | `{ id, name, qty, done }` |
| Métodos básicos | `push`, recorrido con `for` |
| Funciones | `addItem`, `toggleDone`, `getVisibleItems` |
| Operadores | `===`, `!`, `+`, ternario en resumen |

## Extra para practicar

1. Evitar productos duplicados (mismo `name`).
2. Botón para sumar +1 a la cantidad de un ítem.
3. Guardar la lista en `localStorage` cuando lo vean en el curso.
