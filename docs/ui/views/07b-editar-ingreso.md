# Miru App — Editar Ingreso

---

## Descripción general

Formulario de edición de un ingreso existente. Misma estructura que "Crear ingreso" pero con los campos pre-cargados con los datos actuales. Diseñado para correcciones rápidas (monto, categoría, descripción).

---

## Layout

- **Fondo:** `#0C0F14`
- **Padding horizontal:** 24px
- **Scroll vertical:** no necesario
- **Bottom navigation:** oculta
- **Safe area top:** 56px
- **Teclado numérico:** se abre automáticamente al entrar

---

## Estructura visual (de arriba hacia abajo)

---

### 1. Header
Padding top 56px.

```
← Volver           Editar ingreso               [✓]
```

- **Izquierda:** `chevron-left` Lucide, 22px, `#8A95A8` — descarta cambios con confirmación
- **Centro:** *"Editar ingreso"* — Inter 700, 20px, `#F0F2F5`
- **Derecha:** "Guardar" — Inter 600, 14px, `#E4B3E9`. Habilitado si hay cambios

---

### 2. Selector de monto
Margin top: 32px. Centrado horizontalmente.

- **Label:** *"¿Cuánto recibiste?"* — Inter 500, 12px, `#8A95A8`
- **Input de monto:** monto actual pre-cargado, Inter 800, 48px, `#F0F2F5`

---

### 3. Selector de categoría
Margin top: 28px.

Mismo grid de 4 columnas que en creación. Categoría actual pre-seleccionada con borde `#E4B3E9`.

---

### 4. Campo opcional: descripción
Margin top: 20px.

Descripción actual pre-cargada si existe.

---

### 5. Selector de quién recibió
Margin top: 16px (solo si membresía familiar).

---

### 6. Botón guardar
Margin top: 28px.

**"Guardar cambios"**
- Fondo: `#15C48C`, texto `#041710`, Inter 700, 14px
- Altura: 44px, Radio: 999px, Ancho: 100%

---

## Estados

| Estado | Descripción |
|---|---|
| Default | Campos pre-cargados. Botón habilitado solo si hay cambios |
| Cargando | Botón con `miru-icon.svg` animado |
| Error | *"No pudimos guardar los cambios"* — `#F87171` |
| Éxito | Fade-out + redirección a Movimientos/Dashboard |

---

## Comportamiento

- Al descartar (flecha atrás) si hay cambios sin guardar: modal *"¿Descartar cambios?"*
- Guardado exitoso: el item se actualiza en la lista sin recargar

---

## Notas de diseño

- Los campos pre-cargados ayudan al usuario a ver qué va a modificar
- El botón de guardar solo se habilita si detecta cambios (dirty state)
- La experiencia debe ser idéntica a la creación para no confundir al usuario

---

## Documentación relacionada

| Documento | Descripción |
|---|---|
| [`docs/miru-estructura.md`](../miru-estructura.md) | Estructura del proyecto, rutas, modelos y endpoints |
| [`docs/miru-reglas-frontend.md`](../miru-reglas-frontend.md) | Reglas de desarrollo frontend |
| [`docs/ui/design-system.md`](design-system.md) | Sistema de diseño (colores, tipografía, componentes) |
| [`docs/api/api-schemas.md`](../api/api-schemas.md) | Schemas de validación y DTOs de la API |
| [`docs/api/shared-types.md`](../api/shared-types.md) | Tipos compartidos entre frontend y backend |
| [`docs/api/miru-roles.md`](../api/miru-roles.md) | Roles y permisos del sistema |
| [`docs/components/TEMPLATE.md`](../components/TEMPLATE.md) | Template para documentar componentes |

## Endpoints relacionados

| Método | Endpoint | Descripción |
|---|---|---|
| PUT | `/api/finance/incomes/:id` | Actualizar ingreso |

## Dependencias del backend

| Archivo | Ruta | Propósito |
|---|---|---|
| Controller | `controllers/finance.controller.ts` | Actualización de ingresos |
| Service | `services/income.service.ts` | Reglas de negocio de ingresos |
| Schema | `schemas/finance.schema.ts` | Validación Zod de actualización |
| Model | `models/Income.model.ts` | Schema de MongoDB |
