# Miru App — Editar Meta de Ahorro

---

## Descripción general

Formulario de edición de una meta de ahorro existente. Permite modificar nombre, monto objetivo, fecha límite, color y descripción. No permite editar aportes individuales (se gestionan desde la pantalla de Ahorros).

---

## Layout

- **Fondo:** `#0C0F14`
- **Padding horizontal:** 24px
- **Scroll vertical:** sí
- **Bottom navigation:** oculta
- **Safe area top:** 56px

---

## Estructura visual (de arriba hacia abajo)

---

### 1. Header
Padding top 56px.

```
← Ahorros         Editar meta                  [✓]
```

- **Izquierda:** `chevron-left` Lucide, 22px, `#8A95A8`
- **Centro:** *"Editar meta"* — Inter 700, 20px, `#F0F2F5`
- **Derecha:** "Guardar" — Inter 600, 14px, `#C99A0A`. Habilitado si hay cambios

---

### 2. Selector de emoji
Emoji actual pre-seleccionado.

---

### 3. Campo: Nombre
Nombre actual pre-cargado.

---

### 4. Campo: Monto objetivo
Monto actual pre-cargado. No editable si ya hay aportes (solo puede aumentarse).

---

### 5. Selector de fecha límite
Fecha actual pre-cargada o "Sin fecha límite".

---

### 6. Selector de color
Color actual pre-seleccionado.

---

### 7. Botón guardar
**"Guardar cambios"**
- Fondo: `#C99A0A`, texto `#0C0F14`, Inter 700, 14px

---

## Estados

| Estado | Descripción |
|---|---|
| Default | Campos pre-cargados |
| Cargando | Botón animado |
| Error | *"No pudimos guardar los cambios"* |
| Éxito | Redirección a Ahorros |

---

## Comportamiento

- Si la meta ya tiene aportes, el monto objetivo solo puede incrementarse
- Al descartar cambios sin guardar: modal de confirmación

---

## Notas de diseño

- La edición debe mantener el tono aspiracional de la creación
- Los campos bloqueados por aportes existentes se muestran con un candado

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
| PUT | `/api/savings/:id` | Actualizar meta de ahorro |

## Dependencias del backend

| Archivo | Ruta | Propósito |
|---|---|---|
| Controller | `controllers/saving.controller.ts` | Actualización de metas |
| Service | `services/saving.service.ts` | Reglas de negocio de ahorro |
| Schema | `schemas/saving.schema.ts` | Validación Zod de actualización |
| Model | `models/Saving.model.ts` | Schema de MongoDB |
