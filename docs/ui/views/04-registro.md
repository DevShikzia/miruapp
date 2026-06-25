# Miru App — Registro

---

## Descripción general

Pantalla de creación de cuenta. Sigue la misma línea visual que el Login pero con más campos. Diseñada para que el registro no se sienta tedioso. Agrupa los campos en una sola vista sin scroll vertical — todo entra en 390×844px.

---

## Layout

- **Fondo:** `#0C0F14`
- **Padding horizontal:** 24px
- **Scroll:** no necesario, todo entra en viewport 390×844px
- **Teclado:** al enfocar un input, la pantalla sube suavemente para mantener el campo visible

---

## Estructura visual (de arriba hacia abajo)

---

### 1. Header superior
Espacio desde el top: 64px (safe area incluida).

**Logo horizontal** centrado:
- Asset: `miru-logo-horizontal.svg`, 40px de alto
- Isotipo con gradiente `#F2C8F6` → `#B98AEF`
- Wordmark "Miru" en `#F0F2F5`, caption "APP" en `#8A95A8`

---

### 2. Texto de bienvenida
Margin top: 32px. Alineado a la izquierda.

- **Título:** *"Creá tu cuenta"*
  Inter 700, 28px, `#F0F2F5`
- **Subtítulo:** *"Empezá a organizar tus finanzas con tu familia."*
  Inter 400, 14px, `#8A95A8`, margin-top 8px

---

### 3. Formulario
Margin top: 28px. Stack vertical con gap de 14px entre campos.

#### Campo: Nombre
- Label: "Nombre" — Inter 500, 12px, `#8A95A8`, margin-bottom 6px
- Input: fondo `#1E2530`, borde transparente, radio 16px, altura 48px, padding horizontal 16px
- Placeholder: *"Tu nombre"* — color `#697586`
- Ícono izquierdo: `user` de Lucide, 18px, stroke 1.75, color `#697586`
- Al enfocarse: borde 1px `#E4B3E9`, transición 150ms ease-in-out

#### Campo: Email
- Label: "Email" — misma tipografía
- Input: mismo estilo
- Placeholder: *"tu@email.com"*
- Ícono izquierdo: `mail` de Lucide
- Tipo: `email`

#### Campo: Contraseña
- Label: "Contraseña"
- Input: mismo estilo
- Placeholder: *"Mínimo 8 caracteres"*
- Ícono izquierdo: `lock` de Lucide
- Ícono derecho: `eye` / `eye-off` de Lucide, 18px, `#697586`
- Tipo: `password`

#### Campo: Confirmar contraseña
- Label: "Confirmar contraseña"
- Input: mismo estilo
- Placeholder: *"Repetí tu contraseña"*
- Ícono izquierdo: `lock` de Lucide
- Tipo: `password`

---

### 4. Checkbox de términos
Margin top: 16px.

```
[⬜] Acepto los Términos y Condiciones y la Política de Privacidad
```

- Checkbox cuadrado de 18×18px, radio 4px, borde 1.5px `#697586`
- Estado seleccionado: fondo `#E4B3E9`, ícono check `#0C0F14`
- Texto: Inter 400, 12px, `#8A95A8`
- Links "Términos y Condiciones" y "Política de Privacidad": Inter 500, 12px, `#E4B3E9`

---

### 5. Botón principal
Margin top: 20px.

**"Crear cuenta"**
- Fondo: `#E4B3E9`
- Texto: `#0C0F14`, Inter 700, 14px
- Altura: 44px
- Radio: 999px
- Ancho: 100%
- Deshabilitado hasta que todos los campos estén completos y el checkbox aceptado
- Estado hover/pressed: fondo `#D89BDF`, transición 150ms

**Estado cargando:**
- El texto se reemplaza por un `miru-icon.svg` animado (rotación suave 360° en 2s)
- Botón deshabilitado durante la carga

---

### 6. Separador
Margin top: 20px.

```
─────────  o registrate con  ─────────
```
- Líneas: `rgba(255,255,255,0.06)`, 1px
- Texto: Inter 400, 12px, `#697586`, padding horizontal 12px

---

### 7. Botón Google
Margin top: 14px.

- Fondo: `#161B24`
- Borde: 1px `rgba(255,255,255,0.06)`
- Radio: 999px
- Altura: 44px
- Ícono Google a la izquierda (SVG oficial), 18px
- Texto: *"Continuar con Google"* — Inter 500, 14px, `#F0F2F5`

---

### 8. Link de login
Margin top: 28px. Centrado.

*"¿Ya tenés cuenta?"* — Inter 400, 14px, `#8A95A8`
`" Iniciá sesión"` — Inter 600, 14px, `#E4B3E9`, inline

---

## Estados del formulario

| Estado | Descripción |
|---|---|
| Default | Todos los inputs con borde transparente. Botón deshabilitado (opacidad 0.4) |
| Completando | Inputs se van llenando. Botón se habilita cuando todo es válido |
| Error campo | Borde `#F87171` en el campo inválido. Mensaje debajo del campo: Inter 400, 11px, `#F87171`. Ej: *"Las contraseñas no coinciden"* |
| Error general | Mensaje debajo del botón: *"No pudimos crear tu cuenta. Intentá de nuevo."* con ícono `alert-circle` Lucide, 14px, `#F87171` |
| Cargando | Botón con icono animado, inputs deshabilitados |
| Éxito | Redirección a Dashboard con fade-out de 300ms |

---

## Requisitos de validación

| Campo | Regla |
|---|---|
| Nombre | Mínimo 2 caracteres, máximo 50. Solo letras y espacios |
| Email | Formato email válido |
| Contraseña | Mínimo 8 caracteres, al menos 1 letra y 1 número |
| Confirmar | Debe ser idéntica a Contraseña |
| Términos | Debe estar marcado |

---

## Notas de diseño

- El formulario no debe tener scroll — si falta espacio, reducir gaps antes de reducir inputs
- Los mensajes de error deben aparecer campo por campo, no todos a la vez
- El checkbox de términos debe ser fácil de tocar (área táctil mínima 44×44px)
- El botón deshabilitado debe verse claramente inactivo pero no oculto
- La transición de carga a éxito debe ser suave, nunca abrupta
