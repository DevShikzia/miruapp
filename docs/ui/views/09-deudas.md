# Miru App — Deudas

---

## Descripción general

Lista de todas las deudas activas y pagadas del grupo familiar. Visualiza el total adeudado, el progreso de pago y el detalle por deuda. El diseño busca hacer visible la deuda sin generar ansiedad — los montos se muestran con claridad pero con un tono visual calmado.

---

## Layout

- **Fondo:** `#0C0F14`
- **Padding horizontal:** 20px
- **Scroll vertical:** sí
- **Bottom navigation:** presente, tab "Deudas" activa
- **Safe area top:** 56px

---

## Bottom Navigation

Misma barra que Dashboard. Tab activa: **Deudas** — ícono `hand-coins`, `#E4B3E9`.

---

## Estructura visual (de arriba hacia abajo)

---

### 1. Header
Padding top 56px.

```
← Volver                Deudas                 [+]
```

- **Izquierda:** `chevron-left` Lucide, 22px, `#F0F2F5` (navega a Dashboard)
- **Centro:** *"Deudas"* — Inter 700, 20px, `#F0F2F5`
- **Derecha:** `plus` Lucide, 22px, `#E4B3E9` (navega a Crear deuda)

---

### 2. Resumen de deudas
Margin top: 16px.

Card grande con fondo `#161B24`, radio 24px, borde `rgba(255,255,255,0.06)`, padding 20px.

**Dos columnas:**

| Columna izquierda | Columna derecha |
|---|---|
| Label: *"Total adeudado"* — Inter 500, 12px, `#8A95A8` | Label: *"Pagado"* — Inter 500, 12px, `#8A95A8` |
| Monto: Inter 700, 28px, `#E05252` | Monto: Inter 700, 28px, `#15C48C` |
| Ej: *"$ 85.000"* | Ej: *"$ 62.000"* |

**Barra de progreso general** debajo de las dos columnas, margin-top 16px:
- Fondo: `#1E2530`, altura 8px, radio 999px
- Relleno: `#15C48C` con ancho = (% pagado)
- Label debajo: *"42% pagado · 3 deudas activas"* — Inter 400, 12px, `#8A95A8`

---

### 3. Filtros de estado
Margin top: 20px.

Dos chips lado a lado:
- *"Activas"* — seleccionado por defecto
- *"Pagadas"* — muestra historial de deudas saldadas

Mismo estilo que chips de Movimientos.

---

### 4. Lista de deudas
Margin top: 16px.

Cada deuda es una **card vertical** (no tabla):

```
┌─────────────────────────────────────────┐
│  [hand-coins]  Nombre de la deuda    →  │
│               $ 85.000 · Restan $ 23.000 │
│  ════════════════════════════════════    │
│               ▓▓▓▓▓▓░░░░░  54%          │
└─────────────────────────────────────────┘
```

**Card:**
- Fondo: `#161B24`, radio 20px, borde `rgba(255,255,255,0.06)`, 1px
- Padding: 16px
- Margin bottom: 12px
- Al tocar: navega a Detalle deuda

**Elementos internos:**
- **Fila superior:**
  - Ícono izquierdo: `hand-coins` Lucide, 18px, `#E05252`
  - Nombre: Inter 600, 14px, `#F0F2F5`
  - Flecha `chevron-right` a la derecha, 16px, `#697586`
- **Fila media:**
  - Label de monto total: *"$ 85.000"* — Inter 700, 18px, `#E05252`
  - Label "Restan": *"$ 23.000"* — Inter 400, 12px, `#8A95A8`
- **Barra de progreso individual:** margin-top 12px
  - Fondo: `#1E2530`, altura 6px, radio 999px
  - Relleno: gradiente lineal de `#E05252` a `#15C48C` según avance
  - Label derecha: *"54%"* — Inter 600, 12px, `#F0F2F5`
  - Label izquierda: *"Pagado: $ 46.000"* — Inter 400, 11px, `#8A95A8`

**Tag de urgencia** (opcional, si la deuda está próxima a vencer):
- Tag pequeño: *"Vence en 5 días"* — fondo `rgba(201,154,10,0.15)`, texto Inter 500, 11px, `#C99A0A`, radio 6px, padding 4px 8px
- Si está vencida: fondo `rgba(224,82,82,0.15)`, texto `#E05252`, *"Vencida"*

---

### 5. Estado vacío
Centrado verticalmente:
- Ícono: `hand-coins` Lucide, 48px, `#697586`, opacidad 0.5
- Texto: *"No tenés deudas registradas"* — Inter 500, 16px, `#8A95A8`
- Subtexto: *"Registrá las deudas que tengas para llevar el control."* — Inter 400, 13px, `#697586`
- Botón: *"Registrar deuda"* — Primary Button, fondo `#E4B3E9`

---

## Estados

| Estado | Descripción |
|---|---|
| Cargando | Skeleton: 3 cards rectangulares con shimmer |
| Vacío | Estado vacío descrito arriba |
| Solo activas | Lista de deudas activas normales |
| Con pagadas | Al filtrar "Pagadas", se ven las cards con opacidad 0.7 y badge "Pagada" en verde |
| Error | Banner: *"No pudimos cargar tus deudas"* con botón "Reintentar" |

---

## Comportamiento

- Al tocar una card: navega a `/deudas/:id` (Detalle deuda)
- Al tocar "+": navega a `/deudas/crear`
- Al alternar entre "Activas" / "Pagadas", la lista se actualiza con transición
- Pull-to-refresh recarga la lista
- Si hay deudas vencidas, aparecen primero en la lista (ordenadas por fecha de vencimiento ascendente)

---

## Notas de diseño

- El total adeudado debe verse sin rodeos — la deuda no se oculta ni se suaviza
- Pero el progreso de pago (barra verde) da una sensación de avance y control
- Las cards de deuda son más grandes que los items de movimientos para permitir la barra de progreso
- Las deudas pagadas deben seguir siendo accesibles para consulta histórica
- El tag de urgencia debe ser sutil pero visible — no debe generar pánico visual
- En v2: ordenar por "Más próxima a vencer" como default

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
| GET | `/api/debts` | Listar deudas |

## Dependencias del backend

| Archivo | Ruta | Propósito |
|---|---|---|
| Controller | `controllers/debt.controller.ts` | Lógica de deudas |
| Service | `services/debt.service.ts` | Reglas de negocio de deudas |
| Model | `models/Debt.model.ts` | Schema de MongoDB |
