# User Profile Object (fundamentos JS)

Práctica **Clase 1**: un objeto `user` con propiedades, acceso `.` / `[]`, array de hobbies y funciones que actualizan el perfil.

## Abrir

```bash
cd apps/js-user-profile
npx --yes serve . -p 5181
```

O abrí `index.html` en el navegador.

## Qué hace

- Editar nombre, edad, email, ciudad, rol y estado activo
- Agregar / quitar hobbies (`user.hobbies` es un array)
- Ver tarjeta de perfil + JSON del objeto en vivo
- Validación simple antes de aplicar cambios

## Mapa a la clase

| Concepto | En el código |
|---|---|
| Objeto | `user = { name, age, email, ... }` |
| Propiedades | `user.name`, `user["email"]` |
| Array | `user.hobbies` + `push` / `splice` |
| Funciones | `applyProfileFields`, `addHobby`, `renderCard` |
| Tipos | string, number, boolean, array, object |
| Ternario | texto Activo/Inactivo |

## Extra para practicar

1. Agregar propiedad `country`.
2. Limitar hobbies a máximo 5.
3. Mostrar `user.age >= 18 ? "Mayor" : "Menor"` en la tarjeta.
