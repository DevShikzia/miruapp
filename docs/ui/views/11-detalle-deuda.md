# Miru App — Detalle Deuda

---

## Descripción general

Vista detallada de una deuda específica. Muestra el historial de pagos, el progreso, la información original y permite registrar nuevos pagos. Es la pantalla más funcional del módulo de deudas.

---

## Layout

- **Fondo:** `#0C0F14`
- **Padding horizontal:** 20px
- **Scroll vertical:** sí
- **Bottom navigation:** oculta
- **Safe area top:** 56px

---

## Estructura visual (de arriba hacia abajo)

---

### 1. Header
Padding top 56px.

```
← Deudas        [Nombre de la deuda]      [···]
```

- **Izquierda:** `chevron-left` Lucide, 22px, `#F0F2F5` (vuelve a lista de Deudas)
- **Centro:** Nombre de la deuda — Inter 700, 18px, `#F0F2F5`, 1 línea truncado
- **Derecha:** `more-vertical` Lucide, 22px, `#8A95A8` (menú: Editar / Eliminar / Marcar como pagada)

---

### 2. Card de estado principal
Margin top: 16px.

Fondo: `#161B24`, radio 24px, borde `rgba(255,255,255,0.06)`, padding 20px.

**Tag de tipo:** arriba a la izquierda:
- Si es "Le debo a": fondo `rgba(224,82,82,0.15)`, texto Inter 500, 11px, `#E05252`, radio 6px, padding 4px 8px
- Si es "Me deben": fondo `rgba(91,141,239,0.15)`, texto Inter 500, 11px, `#5B8DEF`

**Monto total:** Inter 800, 36px, `#F0F2F5` — ej: *"$ 85.000"*

**Barra de progreso grande:** margin-top 16px.
- Fondo: `#1E2530`, altura 10px, radio 999px
- Relleno: gradiente `#E05252` → `#15C48C`
- Labels a los lados:
  - Izquierda: *"Pagado: $ 46.000"* — Inter 500, 13px, `#15C48C`
  - Derecha: *"54%"* — Inter 700, 13px, `#F0F2F5`

**Grid de 3 stats** debajo de la barra, margin-top 16px:

| Stat | Valor |
|---|---|
| Cuotas | *"6 / 12"* |
| Próximo vencimiento | *"15/07/2026"* |
| Tasa | *"3.5% mensual"* (solo si aplica) |

Cada stat: label Inter 400, 11px, `#8A95A8` | valor Inter 600, 14px, `#F0F2F5`

---

### 3. Sección: Registrar pago
Margin top: 20px.

Card con fondo `#161B24`, radio 20px, padding 16px.

```
Encabezado: "Registrar pago" — Inter 600, 14px, #F0F2F5
```

**Input de monto:** altura 48px, mismo estilo estándar, ancho flexible
- Placeholder: *"$ Monto"*

**Dos botones de acción rápida:** *"Pago la cuota"* ($ 7.083) y *"Otro monto"*
- Botones: fondo `#1E2530`, texto Inter 500, 13px, `#F0F2F5`, radio 999px, padding 8px 16px

**Botón "Marcar como pagado"** (si el pago completa la deuda):
- Fondo: `#15C48C`, texto `#041710`, Inter 600, 13px, radio 999px

---

### 4. Historial de pagos
Margin top: 20px.

- **Header:** *"Historial de pagos"* — Inter 600, 14px, `#F0F2F5`

Lista vertical de pagos previos:

```
[15/06/2026]  Pago de cuota 5/12      $ 7.083
             Pagado por: Vos         #15C48C
```

**Item de pago:**
- Padding: 12px 0
- Borde inferior: `rgba(255,255,255,0.04)`, 1px
- **Fecha:** Inter 500, 13px, `#8A95A8`
- **Descripción:** Inter 500, 14px, `#F0F2F5` — ej: *"Pago de cuota 5/12"*
- **Quién pagó:** Inter 400, 12px, `#697586` — ej: *"Pagado por: Vos"*
- **Monto a la derecha:** Inter 600, 14px, `#15C48C` (verde, porque reduce la deuda)

**Estado vacío del historial:**
- Ícono: `file-x` Lucide, 24px, `#697586`, opacidad 0.5
- Texto: *"Todavía no registraste pagos"* — Inter 400, 13px, `#8A95A8`

---

### 5. Información original
Margin top: 20px.

Card plegable (collapsible):

```
▼ Información original
```

- Fondo: `#161B24`, radio 16px, padding 16px
- Al tocar el header, expande/colapsa con animación de altura

Contenido expandido:
- **Fecha de creación:** *"10/01/2026"*
- **Tipo:** *"Crédito personal"*
- **Tasa de interés:** *"3.5% mensual"*
- **Valor de cuota:** *"$ 7.083"*
- **Notas:** *"Préstamo para el auto"*
- **Creado por:** *"María"*

Cada campo: label Inter 400, 12px, `#697586` | valor Inter 500, 14px, `#F0F2F5`, en fila.

---

## Estados

| Estado | Descripción |
|---|---|
| Cargando | Skeleton de la card principal |
| Sin pagos | Card de estado + sección de historial vacía |
| En progreso | Varios pagos registrados, barra parcialmente llena |
| Pagada completa | Card con borde `#15C48C`, badge "Pagada" verde, barra al 100%. Botón "Eliminar deuda" o "Archivar" |
| Error | Banner: *"No pudimos cargar el detalle"* |

---

## Comportamiento

- Al registrar un pago, la barra de progreso se actualiza con animación de 300ms
- Si el pago completa la deuda (100%), la card cambia a estado "Pagada" automáticamente
- El menú (···) permite: Editar / Eliminar / Archivar / Compartir
- Pull-to-refresh actualiza el detalle
- Si la deuda está pagada, el formulario de registro de pago desaparece y se muestra un mensaje: *"Deuda saldada"*

---

## Notas de diseño

- La barra de progreso grande es el elemento central — domina visualmente la card
- El botón de registrar pago debe estar siempre accesible (arriba del historial)
- El historial debe ordenarse del más reciente al más antiguo
- Para deudas largas (12+ cuotas), la vista debe mantenerse clara y no abrumar
- La información original colapsada mantiene la pantalla limpia
- Al archivar una deuda, ésta desaparece de la lista activa pero queda en "Pagadas"

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
| GET | `/api/debts/:id` | Detalle de deuda |
| POST | `/api/debts/:id/payments` | Agregar pago a deuda |
| PUT | `/api/debts/:id/payments/:paymentIndex` | Editar un pago |
| DELETE | `/api/debts/:id/payments/:paymentIndex` | Eliminar un pago |

## Dependencias del backend

| Archivo | Ruta | Propósito |
|---|---|---|
| Controller | `controllers/debt.controller.ts` | CRUD de deudas y pagos |
| Service | `services/debt.service.ts` | Reglas de negocio de deudas |
| Model | `models/Debt.model.ts` | Schema de MongoDB |
