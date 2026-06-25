# Miru App — Editar Gasto

---

## Descripción general

Formulario de edición de un gasto existente. Misma estructura que "Crear gasto" pero con los campos pre-cargados. Permite corregir monto, categoría, tipo de pago y descripción.

---

## Layout

- **Fondo:** `#0C0F14`
- **Padding horizontal:** 24px
- **Scroll vertical:** mínimo
- **Bottom navigation:** oculta
- **Safe area top:** 56px

---

## Estructura visual (de arriba hacia abajo)

---

### 1. Header
Padding top 56px.

```
← Volver            Editar gasto                [✓]
```

- **Izquierda:** `chevron-left` Lucide, 22px, `#8A95A8`
- **Centro:** *"Editar gasto"* — Inter 700, 20px, `#F0F2F5`
- **Derecha:** "Guardar" — Inter 600, 14px, `#E4B3E9`. Habilitado si hay cambios

---

### 2. Selector de monto
Monto actual pre-cargado. Inter 800, 48px, `#F0F2F5`. Cursor `#E05252`.

---

### 3. Selector de categoría
Grid de 4 columnas con categoría actual pre-seleccionada.

---

### 4. Tipo de pago
Chips con el tipo actual pre-seleccionado.

---

### 5. Descripción (opcional)
Pre-cargada si existe.

---

### 6. Botón guardar
**"Guardar cambios"**
- Fondo: `#E05252`, texto `#F0F2F5`, Inter 700, 14px

---

## Estados

| Estado | Descripción |
|---|---|
| Default | Campos pre-cargados |
| Cargando | Botón animado |
| Error | *"No pudimos guardar los cambios"* |
| Éxito | Redirección a Movimientos/Dashboard |

---

## Comportamiento

- Al descartar con cambios sin guardar: modal de confirmación
- Guardado exitoso actualiza el item en la lista

---

## Notas de diseño

- Misma línea visual que el formulario de creación
- Los campos pre-cargados reducen la fricción de edición

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
| PUT | `/api/finance/expenses/:id` | Actualizar gasto |

## Dependencias del backend

| Archivo | Ruta | Propósito |
|---|---|---|
| Controller | `controllers/finance.controller.ts` | Actualización de gastos |
| Service | `services/expense.service.ts` | Reglas de negocio de gastos |
| Schema | `schemas/finance.schema.ts` | Validación Zod de actualización |
| Model | `models/Expense.model.ts` | Schema de MongoDB |
