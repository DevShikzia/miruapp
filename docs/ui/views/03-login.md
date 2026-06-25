# Miru App — Login

---

## Descripción general

Pantalla de inicio de sesión. Simple, directa y acogedora. No debe sentirse como un formulario de banco. El foco es en los inputs y el botón principal. Mínimo ruido visual.

---

## Layout

- **Fondo:** `#0C0F14`
- **Padding horizontal:** 24px
- **Scroll:** no necesario, todo entra en viewport 390×844px
- **Teclado:** al enfocar un input, la pantalla sube suavemente para que el input sea visible

---

## Estructura visual (de arriba hacia abajo)

---

### 1. Header superior
Espacio desde el top: 64px (safe area incluida)

**Logo mark + wordmark** centrados:
- Isotipo del gato: 40×40px, gradiente `#F2C8F6` → `#B98AEF`
- Al lado derecho del isotipo, "Miru" en Inter 700, 20px, `#F0F2F5`
- "APP" caption en Inter 500, 12px, `#8A95A8`

---

### 2. Texto de bienvenida
Margin top: 40px. Alineado a la izquierda.

- **Título:** *"Bienvenida/o de vuelta"*
  Inter 700, 28px, `#F0F2F5`
- **Subtítulo:** *"Ingresá a tu cuenta para ver cómo va todo."*
  Inter 400, 14px, `#8A95A8`, margin-top 8px

---

### 3. Formulario
Margin top: 32px. Stack vertical con gap de 16px entre campos.

#### Campo: Email
- Label: "Email" — Inter 500, 12px, `#8A95A8`, margin-bottom 8px
- Input: fondo `#1E2530`, borde transparente, radio 16px, altura 52px, padding horizontal 16px
- Placeholder: *"tu@email.com"* — color `#697586`
- Ícono izquierdo: `mail` de Lucide, 18px, stroke 1.75, color `#697586`
- Al enfocarse: borde 1px `#E4B3E9`, transición 150ms ease-in-out
- Tipo: `email`, teclado email en mobile

#### Campo: Contraseña
- Label: "Contraseña" — misma tipografía que email
- Input: mismo estilo
- Placeholder: *"Tu contraseña"*
- Ícono izquierdo: `lock` de Lucide
- Ícono derecho: `eye` / `eye-off` de Lucide, 18px, `#697586` — toca para ver/ocultar
- Tipo: `password`

#### Link "¿Olvidaste tu contraseña?"
Alineado a la derecha, debajo del campo de contraseña, margin-top 8px.
- Inter 500, 12px, color `#E4B3E9`
- Sin subrayado
- Lleva a pantalla de recuperación de contraseña (fuera del scope de este documento)

---

### 4. Botón principal
Margin top: 32px.

**"Ingresar"**
- Fondo: `#E4B3E9`
- Texto: `#0C0F14`, Inter 700, 14px
- Altura: 44px
- Radio: 999px
- Ancho: 100%
- Estado hover/pressed: fondo `#D89BDF`, transición 150ms

**Estado cargando:**
- El texto "Ingresar" se reemplaza por tres puntos animados (`···`) mientras se espera respuesta
- El botón permanece deshabilitado durante la carga

**Estado error:**
- Debajo del botón aparece un mensaje de error en fade-in:
  - Ícono `alert-circle` Lucide, 14px, color `#F87171`
  - Texto: *"Email o contraseña incorrectos."* — Inter 400, 12px, `#F87171`
  - Los dos inputs tienen borde 1px `#F87171`

---

### 5. Separador
Margin top: 24px. Centrado.

```
─────────  o continuá con  ─────────
```
- Líneas: `rgba(255,255,255,0.06)`, 1px
- Texto: Inter 400, 12px, `#697586`, padding horizontal 12px

---

### 6. Botón Google (opcional, v2)
Margin top: 16px.

- Fondo: `#161B24`
- Borde: 1px `rgba(255,255,255,0.06)`
- Radio: 999px
- Altura: 44px
- Ícono Google a la izquierda (SVG oficial), 18px
- Texto: *"Continuar con Google"* — Inter 500, 14px, `#F0F2F5`

---

### 7. Link de registro
Margin top: 32px. Centrado.

*"¿No tenés cuenta?"* — Inter 400, 14px, `#8A95A8`
`" Registrate"` — Inter 600, 14px, `#E4B3E9`, inline

---

## Estados del formulario

| Estado | Descripción |
|---|---|
| Default | Inputs con borde transparente |
| Focus | Borde `#E4B3E9`, 1px |
| Error | Borde `#F87171`, mensaje debajo |
| Cargando | Botón con puntos animados, inputs deshabilitados |
| Éxito | Fade-out + navegación a Dashboard |

---

## Notas de diseño

- No hay imagen de fondo ni patrón — el negro sólido es intencional
- El formulario no debe verse intimidante — los inputs con fondo `#1E2530` dan calidez
- El error no debe ser agresivo — el rojo `#F87171` es suave

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
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/google` | Login con Google OAuth |

## Dependencias del backend

| Archivo | Ruta | Propósito |
|---|---|---|
| Controller | `controllers/auth.controller.ts` | Manejo de autenticación |
| Service | `services/auth.service.ts` | Lógica de login/registro |
| Schema | `schemas/auth.schema.ts` | Validación Zod de credenciales |
| Middleware | `middlewares/rateLimit.middleware.ts` | Rate limiting en login |
- El copy "Bienvenida/o de vuelta" puede personalizarse si hay nombre guardado
