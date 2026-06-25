# Miru — UI Design System

## Visual Style

Dark fintech interface inspired by Revolut, YNAB and Copilot Money.

---

## Colors

| Token | Color |
|---------|---------|
| Background | `#0C0F14` |
| Surface | `#161B24` |
| Surface Secondary | `#1E2530` |
| Text Primary | `#F0F2F5` |
| Text Secondary | `#8A95A8` |
| Income | `#15C48C` |
| Expense | `#E05252` |
| Savings | `#C99A0A` |
| Investment | `#9B6EF3` |
| Info | `#5B8DEF` |

---

## Border Radius

| Component | Radius |
|------------|---------|
| Cards | `24px` |
| Inputs | `16px` |
| Buttons | `999px` |

---

## Typography

| Style | Size | Weight |
|---------|---------|---------|
| Display | `56px` | `800` |
| Heading 1 | `28px` | `700` |
| Heading 2 | `20px` | `700` |
| Heading 3 | `16px` | `600` |
| Body | `14px` | `400` |
| Caption | `12px` | `500` |

---

## Rules

### General

- Always mobile first.
- Use dark theme only.
- Every page must fit on a **390px mobile viewport**.
- No horizontal scrolling.
- Use generous spacing and visual hierarchy.
- Prioritize readability over density.

### Colors

Use semantic colors consistently:

| Purpose | Color |
|----------|----------|
| Income | Green (`#15C48C`) |
| Expense | Red (`#E05252`) |
| Savings | Gold (`#C99A0A`) |
| Investment | Purple (`#9B6EF3`) |
| Information | Blue (`#5B8DEF`) |

### Layout

- Prefer cards over tables.
- Never use tables on mobile screens.
- Use bottom navigation as the primary navigation pattern.
- Keep primary actions easily reachable with one thumb.
- Use rounded surfaces and soft borders.

### Components

#### Cards

```css
background: #161B24;
border-radius: 24px;
border: 1px solid rgba(255,255,255,0.06);
```

#### Inputs

```css
background: #1E2530;
border-radius: 16px;
color: #F0F2F5;
```

#### Primary Button (Brand CTA)

```css
background: #E4B3E9;
color: #0C0F14;
border-radius: 999px;
font-weight: 600;
```

> **Nota:** El color primario de marca es `#E4B3E9`. El verde `#15C48C` se reserva como color semántico de **ingresos** y para botones de acciones de ingreso.

#### Secondary Button

```css
background: transparent;
border: 1px solid #E4B3E9;
color: #E4B3E9;
border-radius: 999px;
```

#### Danger Button

```css
background: rgba(224,82,82,.15);
border: 1px solid rgba(224,82,82,.3);
color: #E05252;
border-radius: 999px;
```

#### Warning Button

```css
background: rgba(201,154,10,.15);
border: 1px solid rgba(201,154,10,.3);
color: #C99A0A;
border-radius: 999px;
```

---

## Logos

Miru tiene dos versiones de logo para usar en diferentes contextos. Ambos deben ser exportados como SVG puro (sin rasterizar) para mantener la nitidez en cualquier resolución.

### Logo horizontal (`miru-logo-horizontal.svg`)

Uso principal en Splash, Login, Registro, headers del Dashboard y Perfil.

**Composición (izquierda a derecha, alineación horizontal centrada):**

| Elemento | Detalle |
|----------|---------|
| Isotipo | M con orejas de gato y bigotes. 40×40px. Gradiente vertical `#F2C8F6` → `#B98AEF`. Trazo redondeado de 1.75px |
| Espaciado | 10px entre isotipo y wordmark |
| Wordmark | "Miru" en Inter 700, 22px, color `#F0F2F5`. Primera letra M mayúscula, resto minúsculas |
| Caption | "APP" en Inter 500, 10px, color `#8A95A8`. Posicionado a la derecha del wordmark, alineado verticalmente al centro con un padding-left de 6px |

**Altura total del asset:** 40px
**Ancho total aproximado:** 180px (variable según el wordmark exacto)

### Logo icono (`miru-icon.svg`)

Uso en loading states, splash inicial, pull-to-refresh, bottom navigation, favicon, empty states y cualquier indicador de carga.

**Composición:**

- Solo el isotipo del gato (M con orejas y bigotes)
- Tamaño base: 40×40px (puede escalarse a 24px, 32px, 48px según contexto)
- Gradiente estándar `#F2C8F6` → `#B98AEF`

**Variantes:**

| Variante | Uso | Especificación |
|----------|-----|----------------|
| Color | Estados normales, activos, carga inicial | Gradiente `#F2C8F6` → `#B98AEF` |
| Monocromático | Estados inactivos, disabled, bottom nav tabs no seleccionados | Color sólido `#8A95A8`, sin gradiente |
| Animado | Pantallas de carga | Rotación suave 360° en 2s linear infinito, o respiración (scale 1.0 ↔ 1.08) en 1.5s ease-in-out infinito |

**Convención de nombres de assets:**

```
miru-logo-horizontal.svg    → Logo completo con texto
miru-icon.svg               → Solo isotipo
miru-icon-loading.svg       → Versión animada (SVG con CSS animation inline)
```

---

## Design Inspiration

- Revolut
- Copilot Money
- YNAB
- Monzo

Avoid visual styles inspired by:

- Traditional banking apps
- ERP systems
- Enterprise dashboards
- Data-heavy admin panels

---

## UX Principles

1. Financial information must be understandable in less than 3 seconds.
2. Most important number should always be visible first.
3. Actions should require the fewest taps possible.
4. Use visual feedback for every user action.
5. Prioritize clarity over customization.
6. Make saving money feel rewarding.
7. Make debt visibility obvious without creating anxiety.
8. Design for non-technical users.