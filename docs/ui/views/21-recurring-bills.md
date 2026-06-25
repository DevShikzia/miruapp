# Miru App — Gastos Recurrentes (Recurring Bills)

---

## Descripción general

Pantalla que lista todos los gastos recurrentes del grupo familiar. Muestra el nombre, monto, frecuencia y fecha del próximo vencimiento. Permite activar/desactivar cada gasto recurrente con un toque. Diseñado para que el usuario pueda ver de un vistazo cuáles son sus compromisos mensuales fijos.

---

## Layout

- **Fondo:** `#0C0F14`
- **Padding horizontal:** 20px
- **Scroll vertical:** sí
- **Bottom navigation:** oculta (se accede desde el menú de Movimientos o Dashboard)
- **Safe area top:** 56px

---

## Estructura visual (de arriba hacia abajo)

---

### 1. Header
Padding top 56px.

```
← Volver         Gastos recurrentes            [+]
```

- **Izquierda:** `chevron-left` Lucide, 22px, `#F0F2F5`
- **Centro:** *"Gastos recurrentes"* — Inter 700, 20px, `#F0F2F5`
- **Derecha:** `plus` Lucide, 22px, `#E05252` (navega a crear gasto recurrente)

---

### 2. Resumen del mes
Margin top: 16px.

Card con fondo `#161B24`, radio 24px, borde `rgba(255,255,255,0.06)`, padding 16px.

- **Label:** *"Gastos fijos del mes"* — Inter 500, 12px, `#8A95A8`
- **Monto total:** Inter 700, 28px, `#E05252` — ej: *"$ 45.000"*
- **Subtexto:** *"6 gastos activos · 2 pausados"* — Inter 400, 12px, `#697586`

---

### 3. Lista de gastos recurrentes
Margin top: 20px.

Cada gasto recurrente es un item tipo lista con toggle:

```
[💡]  Internet               $ 8.500         [⬜──]
      Próximo: 05/07 · Mensual               #E05252
```

**Item:**
- Padding: 14px 0
- Borde inferior: `rgba(255,255,255,0.04)`, 1px

**Elementos:**
- **Ícono izquierdo:** Lucide, 20px, color según categoría (`zap`, `home`, `car`, etc.)
- **Nombre:** Inter 500, 14px, `#F0F2F5`
- **Monto:** Inter 600, 14px, `#E05252`, alineado a la derecha
- **Detalle:** *"Próximo: 05/07 · Mensual"* — Inter 400, 11px, `#697586`
- **Toggle switch:** 44×24px, radio 999px
  - ON (activo): fondo `#E05252`, círculo `#F0F2F5`
  - OFF (pausado): fondo `#1E2530`, círculo `#697586`

**Estado pausado:**
- Nombre y monto con opacidad 0.5
- Tag *"Pausado"* — fondo `#1E2530`, texto Inter 400, 11px, `#8A95A8`

---

### 4. Botón "Agregar gasto recurrente"
Margin top: 16px.

- Fondo: transparente, borde 1px dashed `rgba(255,255,255,0.1)`, radio 16px
- Padding: 14px
- Ícono: `plus` Lucide, 18px, `#8A95A8`
- Texto: *"Agregar gasto recurrente"* — Inter 500, 14px, `#8A95A8`
- Al tocar: abre formulario de creación inline

---

### 5. Estado vacío
Centrado verticalmente:
- Ícono: `zap-off` Lucide, 48px, `#697586`, opacidad 0.5
- Texto: *"No tenés gastos recurrentes"* — Inter 500, 16px, `#8A95A8`
- Subtexto: *"Registrá tus gastos fijos para tener un mejor control mensual."* — Inter 400, 13px, `#697586`
- Botón: *"Agregar gasto recurrente"* — Primary Button, fondo `#E05252`

---

## Estados

| Estado | Descripción |
|---|---|
| Cargando | Skeleton list con 4 items |
| Vacío | Estado vacío con CTA |
| Con activos | Lista normal con toggles |
| Con pausados | Items con opacidad reducida y tag "Pausado" |
| Error | Banner: *"No pudimos cargar los gastos recurrentes"* |

---

## Comportamiento

- Al tocar un item: abre modal de edición (monto, frecuencia, nombre, categoría)
- Al tocar toggle: activa/desactiva el gasto recurrente (PATCH con toggle)
- Pull-to-refresh recarga la lista
- Los gastos activos se ordenan por próxima fecha de vencimiento ascendente

---

## Notas de diseño

- Los toggles deben tener un feedback háptico sutil al cambiar de estado
- Diferenciar visualmente entre activos y pausados para evitar confusiones
- El monto total del mes ayuda a presupuestar los gastos fijos
- La frecuencia se muestra como texto corto ("Mensual", "Semanal", etc.)

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
| GET | `/api/finance/recurring-bills` | Listar gastos recurrentes |
| POST | `/api/finance/recurring-bills` | Crear gasto recurrente |
| PATCH | `/api/finance/recurring-bills/:id/toggle` | Activar/desactivar |
| DELETE | `/api/finance/recurring-bills/:id` | Eliminar gasto recurrente |

## Dependencias del backend

| Archivo | Ruta | Propósito |
|---|---|---|
| Controller | `controllers/finance.controller.ts` | CRUD de gastos recurrentes |
| Service | `services/recurringBill.service.ts` | Reglas de negocio de recurrentes |
| Model | `models/RecurringBill.model.ts` | Schema de MongoDB |
| Schema | `schemas/finance.schema.ts` | Validación Zod de recurrente |
