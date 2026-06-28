# Miru App — Dashboard

---

## Descripción general

Pantalla principal de la app. Es lo primero que ve el usuario después del login. Muestra un resumen visual del estado financiero del grupo familiar. La información más importante (saldo neto) debe entenderse en menos de 3 segundos. No tiene scroll vertical más allá del contenido — todo debe ser escaneable de un vistazo.

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

**Tab activa:** Inicio — ícono `#E4B3E9`, texto Inter 500, 10px, `#E4B3E9`
**Tabs inactivas:** Ícono `#697586`, texto Inter 500, 10px, `#697586`
Cada tab tiene área táctil de 44px de alto mínimo.

---

## Estructura visual (de arriba hacia abajo)

---

### 1. Header
Padding top 56px (safe area). 44px de alto.

```
[miru-logo-horizontal.svg]               [🔔] [👤]
```

- **Izquierda:** `miru-logo-horizontal.svg`, 32px de alto. Alineado a la izquierda.
- **Derecha:** dos íconos en fila, gap 16px:
  - `bell` de Lucide, 22px, stroke 1.5, color `#8A95A8`. Con badge de notificaciones no leídas (círculo `#E05252` de 8px, posicionado en top-right del ícono)
  - `circle-user` de Lucide, 22px, stroke 1.5, color `#8A95A8`

---

### 2. Saldo neto mensual
Margin top: 8px. Padding: 20px 0.

- **Label:** *"Saldo neto del mes"* — Inter 500, 12px, `#8A95A8`
- **Monto:** Inter 800, 36px, `#F0F2F5`
  - Prefijo "$" en Inter 600, 24px, `#8A95A8`
  - Ej: *"$ 124.500"*
- **Variación:** debajo del monto, margin-top 4px:
  - Si es positivo: ícono `trending-up` Lucide, 14px, `#15C48C` + texto *"+15% vs mes anterior"*, Inter 500, 12px, `#15C48C`
  - Si es negativo: ícono `trending-down` Lucide, 14px, `#E05252` + texto *"-8% vs mes anterior"*, Inter 500, 12px, `#E05252`
  - Si es cero: ícono `minus` Lucide, 14px, `#8A95A8` + texto *"Sin cambios"*, Inter 500, 12px, `#8A95A8`

---

### 3. Resumen ingresos / gastos
Dos cards lado a lado, gap 12px.

**Card Ingresos** (flex 1):
- Fondo: `#161B24`, radio 20px, borde `rgba(255,255,255,0.06)`, 1px
- Padding: 16px
- Ícono: `arrow-down-circle` Lucide (flecha hacia adentro), 20px, `#15C48C`
- Label: *"Ingresos"* — Inter 500, 12px, `#8A95A8`
- Monto: Inter 700, 18px, `#15C48C` — ej: *"$ 380.000"*

**Card Gastos** (flex 1):
- Mismo estilo
- Ícono: `arrow-up-circle` Lucide (flecha hacia afuera), 20px, `#E05252`
- Label: *"Gastos"*
- Monto: Inter 700, 18px, `#E05252` — ej: *"$ 255.500"*

---

### 4. Semáforo financiero
Margin top: 16px. Indicador visual del estado financiero del mes.

Card compacta con fondo `#161B24`, radio 20px, borde `rgba(255,255,255,0.06)`, 1px, padding 14px. Layout horizontal con ícono + texto + monto a la derecha.

**Tres estados posibles:**

🟢 **Verde — "Vas bien"**
- Fondo de card: `rgba(21,196,140,0.08)`
- Círculo de 12×12px, fondo `#15C48C`, radio 999px, margen derecho 10px
- Texto: *"Vas bien"* — Inter 600, 14px, `#15C48C`
- Subtítulo: *"Gastaste menos del 60% de tus ingresos"* — Inter 400, 11px, `#8A95A8`
- Monto disponible a la derecha: *"+$ 124.500"* — Inter 700, 16px, `#15C48C`

🟡 **Amarillo — "Cuidado"**
- Fondo: `rgba(201,154,10,0.08)`
- Círculo: `#C99A0A`
- Texto: *"Cuidado"* — `#C99A0A`
- Subtítulo: *"Ya gastaste más del 60%. Revisá tus gastos."*
- Monto: *"Restan $ 45.000"* — `#C99A0A`

🔴 **Rojo — "Alerta"**
- Fondo: `rgba(224,82,82,0.08)`
- Círculo: `#E05252`
- Texto: *"Alerta"* — `#E05252`
- Subtítulo: *"Gastaste más del 85%. Estás al límite este mes."*
- Monto: *"-$ 15.000"* — `#E05252`

El color del semáforo se calcula automáticamente: verde si gastos < 60% de ingresos, amarillo si están entre 60% y 85%, rojo si superan el 85%.

---

### 5. Barra de progreso mensual
Margin top: 16px.

Barra horizontal que muestra qué porcentaje del mes ha transcurrido y cómo va el presupuesto.

- **Fondo de barra:** `#1E2530`, altura 6px, radio 999px
- **Relleno:** gradiente lineal de izquierda a derecha, color dinámico:
  - Si lleva < 60% del presupuesto: `#15C48C`
  - Si lleva 60-85%: `#C99A0A`
  - Si lleva > 85%: `#E05252`
- **Ancho del relleno:** proporcional al gasto/ingreso
- **Labels debajo de la barra:** dos textos en extremos opuestos
  - Izquierda: *"Gastado: $ 255.500"* — Inter 400, 11px, `#8A95A8`
  - Derecha: *"Disponible: $ 124.500"* — Inter 400, 11px, `#697586`

---

### 6. Últimos movimientos
Margin top: 24px.

- **Header de sección:**
  - Label: *"Últimos movimientos"* — Inter 600, 16px, `#F0F2F5`
  - Link a la derecha: *"Ver todos"* — Inter 500, 12px, `#E4B3E9`

Lista vertical con máximo 5 movimientos. Cada item:

```
[ícono]   Nombre                $ 45.000
          Categoría · Hoy        #15C48C
```

- Padding: 12px 0
- Borde inferior: `rgba(255,255,255,0.04)`, 1px
- **Ícono izquierdo:** círculo de 36px, fondo semitransparente:
  - Ingreso: fondo `rgba(21,196,140,0.15)`, ícono `arrow-down-left` Lucide, 16px, `#15C48C`
  - Gasto: fondo `rgba(224,82,82,0.15)`, ícono `arrow-up-right` Lucide, 16px, `#E05252`
- **Nombre:** Inter 500, 14px, `#F0F2F5`
- **Categoría + fecha:** Inter 400, 12px, `#697586`
- **Monto a la derecha:** Inter 600, 14px
  - Ingreso: `#15C48C`
  - Gasto: `#E05252`

---

### 7. Resumen de deudas
Margin top: 20px.

- **Header:** *"Deudas activas"* — Inter 600, 16px, `#F0F2F5`
- Link: *"Ver todas"* — Inter 500, 12px, `#E4B3E9`

Card compacta:
- Fondo: `#161B24`, radio 20px, borde `rgba(255,255,255,0.06)`, 1px
- Padding: 16px
- **Icono:** `hand-coins` Lucide, 20px, `#E05252`
- **Texto:** *"Tenés 3 deudas activas"* — Inter 500, 14px, `#F0F2F5`
- **Monto total:** Inter 700, 20px, `#E05252` — ej: *"$ 85.000"*
- **Progreso:** barra delgada de 4px, radio 999px, fondo `#1E2530`, relleno `#E05252` al % pagado
- **Label de progreso:** *"42% pagado"* — Inter 400, 11px, `#8A95A8`

---

### 8. Meta de ahorro rápida
Margin top: 20px.

Card compacta (solo si hay una meta activa):
- Fondo: `#161B24`, radio 20px, borde `rgba(255,255,255,0.06)`, 1px
- Padding: 16px
- **Icono:** `piggy-bank` Lucide, 20px, `#C99A0A`
- **Nombre de meta:** Inter 600, 14px, `#F0F2F5` — ej: *"Viaje a la costa"*
- **Progreso:** barra de 6px, radio 999px, fondo `#1E2530`, relleno `#C99A0A`
- **Monto:** *"$ 45.000 / $ 120.000"* — Inter 500, 13px, `#8A95A8`
- **Porcentaje:** *"37%"* — Inter 600, 13px, `#C99A0A`

---

### 9. FAB (Floating Action Button)
Posicionado en la parte inferior derecha, a 80px del bottom nav y 20px del borde derecho.

- Círculo de 56×56px, fondo `#E4B3E9`, sombra `rgba(228,179,233,0.3)` de 0 4px 16px
- Ícono: `plus` Lucide, 24px, stroke 2.5, color `#0C0F14`
- Al tocar: expande un mini menú con dos opciones:
  - **"Ingreso"** — fondo `rgba(21,196,140,0.15)`, texto `#15C48C`
  - **"Gasto"** — fondo `rgba(224,82,82,0.15)`, texto `#E05252`

---

## Estados

| Estado | Descripción |
|---|---|
| Cargando | Skeleton screens: rectángulos grises `#1E2530` con shimmer animation (gradiente móvil), reemplazando cada card |
| Vacío (sin datos) | Solo el saldo neto en $0. Cards con opacidad reducida. *"Todavía no hay movimientos. Agregá tu primer ingreso o gasto."* con botón CTA |
| Error | Banner superior: fondo `rgba(224,82,82,0.15)`, texto `#E05252`. *"No pudimos cargar tus datos. Deslizá para reintentar."* con acción de pull-to-refresh |

---

## Comportamiento

- Pull-to-refresh: al deslizar hacia abajo, ícono `miru-icon.svg` animado (rotación), luego recarga los datos
- Al tocar un movimiento: navega a detalle (vista futura)
- Al tocar "Ver todos" en movimientos: navega a `/movimientos`
- Al tocar FAB: expande menú de crear ingreso o gasto
- Al tocar notificación badge: navega a `/notificaciones`
- Al tocar avatar: navega a `/perfil`

---

## Notas de diseño

- El dashboard debe cargar rápido — priorizar datos del mes actual
- Las cards de resumen deben ser legibles incluso con valores grandes (ej. $ 1.234.567)
- La barra de progreso mensual es el elemento más informativo — no debe pasarse por alto
- Evitar poner más de 7 elementos en la pantalla — la atención del usuario se diluye
- Los skeletons deben verse ligeros, no frustrantes
- El FAB no debe superponerse al contenido importante

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
| GET | `/api/dashboard` | Resumen del dashboard |
| GET | `/api/finance/incomes` | Ingresos del mes |
| GET | `/api/finance/expenses` | Gastos del mes |
| GET | `/api/debts` | Deudas activas |
| GET | `/api/savings` | Metas de ahorro |

## Dependencias del backend

| Archivo | Ruta | Propósito |
|---|---|---|
| Controller | `controllers/extra.controller.ts` | Dashboard endpoint |
| Service | `services/dashboard.service.ts` | Reglas de negocio del resumen |
| Controller | `controllers/finance.controller.ts` | Datos de ingresos/gastos |
| Controller | `controllers/debt.controller.ts` | Deudas activas |
| Controller | `controllers/saving.controller.ts` | Metas de ahorro |
