# Miru App — Detalle de Tarjeta de Crédito

---

## Descripción general

Pantalla de detalle de una tarjeta de crédito específica. Muestra la información de la tarjeta, el progreso del límite usado, el ciclo de facturación actual con todos los gastos asociados, y el próximo pago estimado. Es la vista principal para entender cuánto se gastó en la tarjeta y cuándo hay que pagarla.

---

## Layout

- **Fondo:** `#0C0F14`
- **Padding horizontal:** 20px
- **Scroll vertical:** sí
- **Bottom navigation:** oculta
- **Safe area top:** 56px
- **Ruta:** `/tarjetas/:id`

---

## Estructura visual (de arriba hacia abajo)

---

### 1. Header
Padding top 56px.

```
← Volver        [🟦] Visa Platino           [✎]
```

- **Izquierda:** `arrow-left` Lucide, 22px, `#8A95A8`. Vuelve a lista de tarjetas
- **Centro:** Indicador de color (círculo 12px) + nombre de tarjeta — Inter 700, 20px, `#F0F2F5`
- **Derecha:** `pencil` Lucide, 20px, `#8A95A8`. Navega a edición. Solo visible para `family_admin` y `member`

---

### 2. Card de información de la tarjeta

Margin top: 16px.

Card con fondo `#161B24`, radio 16px, padding 16px.

```
┌─────────────────────────────────────┐
│  Visa Platino                       │  ← Inter 700, 18px, #F0F2F5
│  •••• 4523    Banco Nación          │  ← Inter 400, 12px, #697586
│                                     │
│  ┌────────────┐  ┌────────────┐    │
│  │ Cierre      │  │ Vence      │    │
│  │ día 15      │  │ día 5      │    │
│  └────────────┘  └────────────┘    │
│                                     │
│  Límite: $500.000                   │  ← Inter 400, 12px, #8A95A8
│                                     │
│  Activa  [Toggle]                   │  ← toggle para activar/desactivar
└─────────────────────────────────────┘
```

**Detalles:**

| Elemento | Estilo |
|----------|--------|
| Indicador de color | Círculo 12px del color de la tarjeta |
| Nombre | Inter 700, 18px, `#F0F2F5` |
| Dígitos + banco | Inter 400, 12px, `#697586` |
| Badge cierre | Fondo `rgba(91,141,239,0.12)`, texto `#5B8DEF`, Inter 500, 11px, radio 8px, padding 6px 12px |
| Badge vence | Fondo `rgba(201,154,10,0.12)`, texto `#C99A0A`, Inter 500, 11px, radio 8px, padding 6px 12px |
| Toggle activo | 44×24px, radio 999px. ON: fondo `#22C55E`. OFF: fondo `#1E2530` |

---

### 3. Barra de uso del límite

Margin top: 16px.

```
┌─────────────────────────────────────┐
│  Gasto actual                Límite │
│  $142.500                  $500.000 │
│                                     │
│  ██████████████░░░░░░░░░  28%       │
│                                     │
│  Disponible: $357.500               │
└─────────────────────────────────────┘
```

- **Gasto actual:** Inter 700, 24px, `#F0F2F5`
- **Límite:** Inter 400, 12px, `#8A95A8`
- **Barra de progreso:** Alto 8px, radio 999px, fondo `#1E2530`
  - Color relleno: `#5B8DEF` (< 70%), `#C99A0A` (70-90%), `#E05252` (> 90%)
  - Animación de ancho al cargar
- **Disponible:** Inter 500, 12px, `#22C55E` (verde) si > 20%, `#C99A0A` si < 20%

---

### 4. Próximo pago

Margin top: 16px.

Card con fondo `#161B24`, radio 16px, padding 16px.

```
┌─────────────────────────────────────┐
│  📅  Próximo pago                   │
│                                     │
│  $142.500                           │  ← Inter 700, 22px, #F0F2F5
│                                     │
│  Vence el 5 de agosto de 2026       │  ← Inter 400, 13px, #8A95A8
│                                     │
│  Faltan 39 días                     │  ← Inter 500, 12px, #22C55E
│                                     │
│  [Recordatorio]                     │  ← botón para configurar alerta
└─────────────────────────────────────┘
```

- Si la tarjeta no tiene gastos en el ciclo: mostrar *"Sin gastos en este ciclo"` en lugar del monto
- Si el vencimiento está a menos de 7 días: el texto de días cambia a `#C99A0A` (amarillo)
- Si está vencido: texto rojo `#E05252` *"Vencido hace X días"*

---

### 5. Gastos del ciclo actual

Margin top: 20px.

**Header de sección:**
```
Gastos del ciclo                     $142.500
16 jun → 15 jul
```

- **Label:** *"Gastos del ciclo"* — Inter 600, 16px, `#F0F2F5`
- **Período:** Inter 400, 11px, `#697586`
- **Total a la derecha:** Inter 700, 16px, `#F0F2F5`

**Lista de gastos (cada item):**

```
┌─────────────────────────────────────┐
│  🍔  Cena familiar                  │
│      20 jun                   85.000│
│      Tarjeta crédito                │
└─────────────────────────────────────┘
```

Cada item es un row con radio 12px, fondo `#161B24`, padding 12px 16px, margin bottom 8px.

| Elemento | Estilo |
|----------|--------|
| Emoji/ícono de categoría | Lucide, 16px, color de la categoría |
| Descripción | Inter 500, 14px, `#F0F2F5` |
| Fecha | Inter 400, 11px, `#697586` |
| Monto | Inter 700, 14px, `#F0F2F5`, alineado a la derecha |
| Tipo de pago | Inter 400, 10px, `#697586` |

- Si no hay gastos en el ciclo: empty state *"No hay gastos en este ciclo"*

---

## Estados

| Estado | Descripción |
|---|---|
| Cargando | Skeleton de la card de información + barra de progreso |
| Default | Todos los datos cargados |
| Sin gastos | Tarjeta sin gastos en el ciclo actual |
| Error | *"No pudimos cargar el detalle de la tarjeta"* + reintentar |

---

## Comportamiento

- Pull-to-refresh recarga el detalle y los gastos del ciclo
- Al tocar un gasto de la lista, navega al detalle/edición del gasto
- El toggle de activar/desactivar persiste el cambio al instante
- Si se desactiva la tarjeta, los gastos asociados no se modifican

---

## Endpoints relacionados

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/credit-cards/:id` | Detalle de tarjeta |
| GET | `/api/credit-cards/:id/statement` | Gastos del ciclo actual |
| PUT | `/api/credit-cards/:id` | Actualizar tarjeta (toggle active) |

---

## Dependencias del backend

| Archivo | Ruta | Propósito |
|---|---|---|
| Controller | `controllers/creditCard.controller.ts` | CRUD + statement |
| Service | `services/creditCard.service.ts` | Cálculo de ciclo + gastos |
| Model | `models/CreditCard.model.ts` | Schema de MongoDB |
| Model | `models/Expense.model.ts` | Consulta de gastos asociados |
