# Miru App — Editar Deuda

---

## Descripción general

Formulario de edición de una deuda existente. Permite modificar nombre, monto total, tipo, fecha de vencimiento y descripción. No permite editar pagos individuales (se gestionan desde el detalle de deuda).

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
← Deuda           Editar deuda                 [✓]
```

- **Izquierda:** `chevron-left` Lucide, 22px, `#8A95A8`
- **Centro:** *"Editar deuda"* — Inter 700, 20px, `#F0F2F5`
- **Derecha:** "Guardar" — Inter 600, 14px, `#E4B3E9`. Habilitado si hay cambios

---

### 2. Campo: Nombre
Margin top: 24px.

Nombre actual pre-cargado.

---

### 3. Toggle "Me deben a mí"
Mismo toggle que en creación, con el valor actual pre-seleccionado.

---

### 4. Campo: Monto total
Monto actual pre-cargado.

---

### 5. Tipo de deuda
Chips con tipo pre-seleccionado (información, no editable si ya tiene pagos).

---

### 6. Campo: Fecha de vencimiento
Fecha actual pre-cargada.

---

### 7. Campo: Descripción (opcional)
Descripción actual pre-cargada.

---

### 8. Botón guardar
**"Guardar cambios"**
- Fondo: `#E05252`, texto `#F0F2F5`, Inter 700, 14px

---

## Estados

| Estado | Descripción |
|---|---|
| Default | Campos pre-cargados |
| Cargando | Botón animado |
| Error | *"No pudimos guardar los cambios"* |
| Éxito | Redirección a detalle de deuda |

---

## Comportamiento

- Si la deuda ya tiene pagos registrados, el tipo y monto total son de solo lectura
- Al descartar cambios sin guardar: modal de confirmación

---

## Notas de diseño

- El monto total no debe poder reducirse por debajo del total ya pagado
- Los campos de solo lectura se muestran con opacidad reducida

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
| PUT | `/api/debts/:id` | Actualizar deuda |

## Dependencias del backend

| Archivo | Ruta | Propósito |
|---|---|---|
| Controller | `controllers/debt.controller.ts` | Actualización de deudas |
| Service | `services/debt.service.ts` | Reglas de negocio de deudas |
| Schema | `schemas/debt.schema.ts` | Validación Zod de actualización |
| Model | `models/Debt.model.ts` | Schema de MongoDB |
