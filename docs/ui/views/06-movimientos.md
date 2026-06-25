# Miru App — Movimientos

---

## Descripción general

Lista completa de todos los ingresos y gastos del grupo familiar. Filtrable por mes, categoría y tipo. Es el historial financiero de la familia. Prioriza la escaneabilidad: cada item debe comunicar tipo, categoría, monto y fecha de un vistazo.

---

## Layout

- **Fondo:** `#0C0F14`
- **Padding horizontal:** 20px
- **Scroll vertical:** sí, con bounce nativo
- **Bottom navigation:** presente, tab "Movimientos" activa
- **Safe area top:** 56px

---

## Bottom Navigation

Misma barra que Dashboard. Tab activa: **Movimientos** — ícono `arrow-up-down`, `#E4B3E9`.

---

## Estructura visual (de arriba hacia abajo)

---

### 1. Header
Padding top 56px.

```
← Volver               Movimientos                [+]
```

- **Izquierda:** flecha `chevron-left` de Lucide, 22px, `#F0F2F5` (navega al Dashboard)
- **Centro:** *"Movimientos"* — Inter 700, 20px, `#F0F2F5`
- **Derecha:** ícono `plus` Lucide, 22px, `#E4B3E9` (acceso rápido a crear movimiento)

---

### 2. Filtros rápidos
Margin top: 20px. Scroll horizontal (oculto el scrollbar).

Chips seleccionables en fila:

| Chip | Comportamiento |
|---|---|
| "Este mes" | Selector de mes desplegable (año + mes) |
| "Todos" | Muestra ingresos y gastos |
| "Ingresos" | Filtra solo ingresos |
| "Gastos" | Filtra solo gastos |
| "Categoría" | Abre modal de selección de categoría |

**Estilo de chips:**
- No seleccionado: fondo `#1E2530`, texto Inter 500, 13px, `#8A95A8`, radio 999px, padding 10px 16px
- Seleccionado: fondo `rgba(228,179,233,0.15)`, texto Inter 600, 13px, `#E4B3E9`
- Gap entre chips: 8px

---

### 3. Resumen del período
Margin top: 16px.

Dos mini-cards lado a lado, gap 12px:

**Card Ingresos:**
- Fondo: `#161B24`, radio 16px, padding 12px
- Ícono: `arrow-down-left` Lucide, 16px, `#15C48C`
- Label: *"Ingresos"* — Inter 400, 11px, `#8A95A8`
- Monto: Inter 700, 16px, `#15C48C`

**Card Gastos:**
- Mismo estilo, ícono `arrow-up-right`, color `#E05252`
- Monto: Inter 700, 16px, `#E05252`

---

### 4. Lista de movimientos
Margin top: 16px.

Agrupados por fecha con separadores.

#### Separador de fecha
- *"Hoy"*, *"Ayer"*, *"15 jun 2026"* — Inter 500, 12px, `#697586`
- Padding vertical: 12px 0 8px 0
- Línea delgada debajo: `rgba(255,255,255,0.04)` 1px

#### Item de movimiento (altura total 56px)
```
[icono]   Nombre del movimiento         $ 12.500
          Categoría · 10:30             #E05252
```

- Padding: 10px 0
- Borde inferior: `rgba(255,255,255,0.04)`, 1px
- **Ícono izquierdo:** círculo de 36px:
  - Ingreso: fondo `rgba(21,196,140,0.15)`, ícono `arrow-down-left` de 16px, `#15C48C`
  - Gasto: fondo `rgba(224,82,82,0.15)`, ícono `arrow-up-right` de 16px, `#E05252`
  - Transferencia: fondo `rgba(91,141,239,0.15)`, ícono `arrow-left-right` de 16px, `#5B8DEF`
- **Nombre:** Inter 500, 14px, `#F0F2F5`. Máximo 1 línea, truncado con ellipsis
- **Categoría + hora:** Inter 400, 12px, `#697586`. Ej: *"Comidas · 10:30"*
- **Monto derecha:** Inter 600, 14px
  - Ingreso: `#15C48C` con prefijo `+`
  - Gasto: `#E05252` con prefijo `-`
- Al tocar: navega a detalle del movimiento (vista futura)

---

### 5. Estado vacío
Cuando no hay movimientos en el período seleccionado:

Centrado verticalmente en el espacio disponible:
- Ícono: `file-x` Lucide, 48px, `#697586`, opacidad 0.5
- Texto: *"No hay movimientos en este período"* — Inter 500, 14px, `#8A95A8`
- Subtexto: *"Agregá tu primer movimiento con el botón +"* — Inter 400, 12px, `#697586`
- Botón: *"Agregar movimiento"* — Primary Button, fondo `#E4B3E9`, texto `#0C0F14`, 44px, radio 999px

---

## Estados

| Estado | Descripción |
|---|---|
| Cargando | Skeleton list: 5 filas de 56px con fondo `#1E2530` y shimmer |
| Vacío | Estado vacío descrito arriba |
| Error | Banner: *"No pudimos cargar los movimientos"* con botón "Reintentar" |
| Filtrado activo | Chips muestran el filtro activo. Si el filtro da 0 resultados, empty state dice *"No hay ingresos en este período"* |

---

## Comportamiento

- Scroll infinito (carga 20 items, luego más al llegar al final)
- Pull-to-refresh recarga la lista
- Al tocar un chip de filtro, la lista se actualiza con transición suave
- Al tocar "+" en header o FAB fuera del bottom nav: navega a selector "Crear ingreso" o "Crear gasto"
- Al tocar un item: navega a vista de detalle del movimiento (no incluida en este alcance)

---

## Notas de diseño

- Los montos deben estar alineados a la derecha para poder compararlos visualmente
- El scroll horizontal de chips no debe tener scrollbar visible pero sí indicador de que se puede deslizar (sutil fade en bordes)
- Los gestos swipe left/right pueden ser añadidos en v2 para acciones rápidas (editar, eliminar)
- Mantener el resumen del período siempre visible arriba incluso al hacer scroll (sticky)
- Los items con montos muy grandes ($ 1.234.567) no deben romper el layout

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
| GET | `/api/finance/incomes` | Listar ingresos del grupo |
| GET | `/api/finance/expenses` | Listar gastos del grupo |

## Dependencias del backend

| Archivo | Ruta | Propósito |
|---|---|---|
| Controller | `controllers/finance.controller.ts` | Lógica de ingresos/gastos |
| Service | `services/income.service.ts` | Reglas de negocio de ingresos |
| Service | `services/expense.service.ts` | Reglas de negocio de gastos |
| Model | `models/Income.model.ts` | Schema de ingresos |
| Model | `models/Expense.model.ts` | Schema de gastos |
