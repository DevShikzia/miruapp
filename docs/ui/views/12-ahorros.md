# Miru App — Ahorros

---

## Descripción general

Pantalla que agrupa todas las metas de ahorro del grupo familiar. Visualiza el progreso de cada meta, el total ahorrado y motiva al usuario a seguir ahorrando. El diseño es aspiracional — las metas se ven alcanzables, no abrumadoras.

---

## Layout

- **Fondo:** `#0C0F14`
- **Padding horizontal:** 20px
- **Scroll vertical:** sí
- **Bottom navigation:** presente, tab "Ahorros" activa
- **Safe area top:** 56px

---

## Bottom Navigation

Misma barra que Dashboard. Tab activa: **Ahorros** — ícono `piggy-bank`, `#E4B3E9`.

---

## Estructura visual (de arriba hacia abajo)

---

### 1. Header
Padding top 56px.

```
← Volver                Ahorros                 [+]
```

- **Izquierda:** `chevron-left` Lucide, 22px, `#F0F2F5`
- **Centro:** *"Ahorros"* — Inter 700, 20px, `#F0F2F5`
- **Derecha:** `plus` Lucide, 22px, `#C99A0A` (navega a Crear meta)

---

### 2. Resumen de ahorro
Margin top: 16px.

Card grande con fondo `#161B24`, radio 24px, borde `rgba(255,255,255,0.06)`, padding 20px.

- **Label:** *"Total ahorrado"* — Inter 500, 12px, `#8A95A8`
- **Monto:** Inter 800, 36px, `#C99A0A` — ej: *"$ 45.000"*
- **Subtexto:** *"De $ 120.000 hacia tus metas"* — Inter 400, 13px, `#697586`

**Mini barra global** margin-top 12px:
- Fondo: `#1E2530`, altura 6px, radio 999px
- Relleno: `#C99A0A`, ancho = (% total ahorrado vs total de metas)

---

### 3. Lista de metas
Margin top: 20px.

Cada meta es una **card aspiracional** con imagen opcional.

```
┌─────────────────────────────────────────┐
│  [🏖️]        Viaje a la costa          │
│             $ 45.000 / $ 120.000       │
│  ▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░  37%         │
│  ┌─────────────────────────────────┐   │
│  │  + Agregar dinero              │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**Card:**
- Fondo: `#161B24`, radio 24px, borde `rgba(255,255,255,0.06)`, 1px
- Padding: 16px
- Margin bottom: 12px
- Al tocar la card (no el botón): navega a detalle de meta

**Elementos internos:**

- **Emoji / ícono:** 32px, redondeado, en la esquina superior izquierda. Puede ser un emoji o el `image` Lucide si el usuario subió una foto
- **Nombre de meta:** Inter 600, 16px, `#F0F2F5`
- **Progreso numérico:** *"$ 45.000 / $ 120.000"* — Inter 500, 13px, `#8A95A8`
- **Barra de progreso:** altura 8px, radio 999px, fondo `#1E2530`
  - Relleno: `#C99A0A`
  - Porcentaje a la derecha: *"37%"* — Inter 700, 13px, `#C99A0A`
- **Botón "Agregar dinero":** fondo `rgba(201,154,10,0.12)`, borde `rgba(201,154,10,0.2)`, texto `#C99A0A`, Inter 600, 13px, radio 999px, altura 36px, ancho 100%. Al tocar: abre modal rápido para agregar monto

---

### 3.5 Gestión de aportes

#### Modal "Agregar dinero"
Al tocar el botón dentro de una meta se abre un bottom sheet:

- **Input de monto:** Inter 700, 28px, `#F0F2F5`, centrado, placeholder *"$0"*
- **Selector de fecha:** opcional, pre-cargada con la fecha actual
- **Botón "Ahorrar":** fondo `#C99A0A`, texto `#0C0F14`, Inter 700, 14px, radio 999px, altura 44px
- **Acción:** POST `/api/savings/:id/contributions` — la barra se actualiza con animación
- **Estados:** cargando (botón animado), error (*"No pudimos registrar el aporte"*), éxito (cierra modal + actualiza progreso)

#### Historial de aportes
Accesible desde el detalle de meta (al tocar la card):

- Lista cronológica de aportes con monto y fecha
- Cada item: fecha (Inter 400, 12px, `#697586`) + monto (Inter 600, 14px, `#C99A0A`)
- Swipe left sobre un aporte: permite eliminarlo (DELETE `/api/savings/:id/contributions/:index`)
- Modal de confirmación al eliminar: *"¿Eliminar este aporte?"*
- Estado vacío: *"Todavía no hiciste aportes a esta meta"*

---

### 4. Meta destacada (si hay una activa)
Si el usuario tiene una meta en progreso, puede mostrarse con un diseño especial (la más cercana a completarse).

- Borde: 1.5px `#C99A0A`
- Badge: *"¡Casi!"* — fondo `rgba(201,154,10,0.2)`, texto `#C99A0A`, Inter 500, 11px
- La barra de progreso es más gruesa (12px)

---

### 5. Estado vacío
Centrado verticalmente:
- Ícono: `piggy-bank` Lucide, 48px, `#697586`, opacidad 0.5
- Texto: *"Todavía no creaste metas de ahorro"* — Inter 500, 16px, `#8A95A8`
- Subtexto: *"Ahorrar es más fácil cuando tenés un objetivo claro."* — Inter 400, 13px, `#697586`
- Botón: *"Crear primera meta"* — Primary Button, fondo `#C99A0A`, texto `#0C0F14`

---

## Estados

| Estado | Descripción |
|---|---|
| Cargando | Skeleton cards con shimmer |
| Vacío | Estado vacío con CTA |
| Con metas activas | Lista de metas con sus progresos |
| Con meta completada | Badge "Completada" — fondo `rgba(21,196,140,0.15)`, texto `#15C48C`. Barra al 100% |
| Error | Banner: *"No pudimos cargar tus metas"* |

---

## Comportamiento

- Al tocar "Agregar dinero" en una meta: modal bottom sheet con input de monto y botón "Ahorrar". El monto se deduce del balance general
- Al tocar la card completa (no el botón): navega a detalle de meta (vista futura)
- La meta destacada debe ser la que tiene mayor % de progreso entre las activas
- Pull-to-refresh recarga las metas
- Al completar una meta, la card muestra animación de confeti sutil (opcional v2)

---

## Notas de diseño

- El dorado `#C99A0A` es el color semántico del ahorro — da sensación de valor y logro
- El botón "Agregar dinero" debe ser fácil de tocar — es la acción principal en esta pantalla
- Las metas visuales (con foto/ícono) son más motivantes que las listas de texto
- La meta destacada ayuda a enfocar al usuario en un objetivo prioritario
- Evitar mostrar montos negativos o deudas en esta pantalla — es un espacio positivo
- En v2: gráfico de crecimiento del ahorro en el tiempo

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
| GET | `/api/savings` | Listar metas de ahorro |
| GET | `/api/savings/:id` | Detalle de meta con historial |
| POST | `/api/savings` | Crear meta de ahorro |
| PUT | `/api/savings/:id` | Actualizar meta |
| DELETE | `/api/savings/:id` | Eliminar meta |
| POST | `/api/savings/:id/contributions` | Agregar aporte a meta |
| DELETE | `/api/savings/:id/contributions/:index` | Eliminar aporte |

## Dependencias del backend

| Archivo | Ruta | Propósito |
|---|---|---|
| Controller | `controllers/saving.controller.ts` | CRUD de metas |
| Service | `services/saving.service.ts` | Reglas de negocio de ahorro |
| Model | `models/Saving.model.ts` | Schema de MongoDB |
