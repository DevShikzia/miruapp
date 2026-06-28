# Miru App — Tarjetas de Crédito

---

## Descripción general

Lista de todas las tarjetas de crédito registradas en el grupo familiar. Cada tarjeta se muestra como una card visual con su nombre, marca, últimos dígitos, límite usado, fecha de cierre y próximo vencimiento. Desde acá se accede al detalle de cada tarjeta y al formulario de creación.

---

## Layout

- **Fondo:** `#0C0F14`
- **Padding horizontal:** 20px
- **Scroll vertical:** sí, con bounce nativo
- **Bottom navigation:** presente, 64px de alto, fijo en la parte inferior
- **Safe area top:** 56px

---

## Bottom Navigation

Barra fija en la parte inferior, fondo `#161B24`, borde superior `rgba(255,255,255,0.06)` de 1px. Altura 64px.

6 tabs distribuidas equitativamente:

| Ícono (Lucide) | Label | Ruta |
|---|---|---|
| `layout-dashboard` | Inicio | `/dashboard` |
| `arrow-up-down` | Movimientos | `/movimientos` |
| `credit-card` | Tarjetas | `/tarjetas` |
| `hand-coins` | Deudas | `/deudas` |
| `piggy-bank` | Ahorros | `/ahorros` |
| `users` | Familia | `/familia` |

**Tab activa:** Tarjetas — ícono `#5B8DEF`, texto Inter 500, 10px, `#5B8DEF`
**Tabs inactivas:** Ícono `#697586`, texto Inter 500, 10px, `#697586`

---

## Estructura visual (de arriba hacia abajo)

---

### 1. Header
Padding top 56px (safe area). 44px de alto.

```
[ ← Volver ]          Tarjetas            [+]
```

- **Izquierda:** Flecha volver `arrow-left` Lucide, 22px, `#8A95A8`. Solo si viene de una sub-pantalla
- **Centro:** *"Tarjetas"* — Inter 700, 20px, `#F0F2F5`
- **Derecha:** Botón "+" para agregar tarjeta — Lucide `plus-circle`, 24px, `#5B8DEF`
  - Solo visible para `family_admin` y `member`

---

### 2. Resumen de deuda total de tarjetas

Margin top: 20px.

Card de resumen con fondo `#161B24`, radio 16px, padding 16px.

```
┌─────────────────────────────────────┐
│  💳 Deuda total en tarjetas         │
│                                     │
│  $ 285.000                          │  ← Inter 800, 32px, #F0F2F5
│                                     │
│  [████████████░░░░░░░░░░]  57%      │  ← barra de uso vs límite total
│                                     │
│  Límite total: $500.000             │  ← Inter 400, 12px, #697586
│  Próximo vencimiento: 5 jul         │  ← Inter 400, 12px, #C99A0A
└─────────────────────────────────────┘
```

- La barra de progreso es la suma de todas las tarjetas activas
- Si no hay tarjetas registradas, mostrar empty state (ver sección Estados)
- El próximo vencimiento es la fecha más próxima entre todas las tarjetas

---

### 3. Lista de tarjetas

Margin top: 20px.

Cada tarjeta es una card con radio 16px, fondo `#161B24`, padding 16px. Al tocarla navega a `/tarjetas/:id`.

```
┌─────────────────────────────────────┐
│  [🟦]  Visa Platino                 │
│        Banco Nación  •••• 4523      │
│                                     │
│  Gasto actual     Límite            │
│  $142.500         $500.000          │
│                                     │
│  ██████████████░░░░░░░░░  28%       │
│                                     │
│  Cierre: 15 jul    Vence: 5 ago     │
└─────────────────────────────────────┘
```

**Detalles de cada card:**

| Elemento | Estilo |
|----------|--------|
| Indicador color (`🟦`) | Círculo 12px del color de la tarjeta. Si no tiene color, usar `#5B8DEF` por defecto |
| Nombre tarjeta | Inter 600, 16px, `#F0F2F5` |
| Banco + dígitos | Inter 400, 12px, `#697586` |
| Gasto actual | Inter 700, 18px, `#F0F2F5` |
| Label "Gasto actual" | Inter 400, 10px, `#697586` |
| Label "Límite" | Inter 400, 10px, `#697586` |
| Barra de progreso | Alto 6px, radio 999px, fondo `#1E2530`. Relleno: `#5B8DEF` (azul) si < 70%, `#C99A0A` (amarillo) si 70-90%, `#E05252` (rojo) si > 90% |
| Cierre / Vence | Inter 400, 11px, `#8A95A8` |

- Las tarjetas inactivas se muestran al final con opacidad 0.5 y badge "Inactiva"
- Si no hay gastos en el ciclo actual, mostrar `$0` y barra de progreso vacía

---

### 4. FAB — Agregar tarjeta

Botón flotante en la esquina inferior derecha (arriba del bottom nav).

- **Ícono:** `plus` Lucide, 24px, `#0C0F14`
- **Fondo:** `#5B8DEF`, círculo de 56×56px
- **Sombra:** `0 4px 12px rgba(91,141,239,0.4)`
- **Posición:** bottom 80px (64px nav + 16px gap), right 20px
- Solo visible para `family_admin` y `member`

---

## Estados

| Estado | Descripción |
|---|---|
| Default | Lista de tarjetas cargada. Muestra resumen + cards |
| Vacío | No hay tarjetas registradas. Mostrar ilustración + *"No tenés tarjetas registradas"* + botón "Agregar primera tarjeta" |
| Cargando | Skeleton de 3 cards con shimmer |
| Error | *"No pudimos cargar tus tarjetas"* con botón de reintentar |

---

## Comportamiento

- Pull-to-refresh recarga la lista
- Al tocar una tarjeta navega a `/tarjetas/:id`
- El resumen de deuda total se actualiza al hacer scroll o pull-to-refresh
- Las tarjetas inactivas se pueden reactivar desde el detalle

---

## Endpoints relacionados

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/credit-cards` | Listar tarjetas |
| POST | `/api/credit-cards` | Crear tarjeta |

---

## Dependencias del backend

| Archivo | Ruta | Propósito |
|---|---|---|
| Controller | `controllers/creditCard.controller.ts` | CRUD de tarjetas |
| Service | `services/creditCard.service.ts` | Reglas de negocio |
| Schema | `schemas/credit-card.schema.ts` | Validación Zod |
| Model | `models/CreditCard.model.ts` | Schema de MongoDB |
| Types | `shared/types/credit-card.types.ts` | Tipos compartidos |
