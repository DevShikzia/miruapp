# Miru App — Splash Screen

---

## Descripción general

Pantalla de entrada. Dura entre 1.8 y 2.5 segundos antes de redirigir al onboarding o al dashboard si el usuario ya tiene sesión activa. No tiene interacción. Su único objetivo es establecer la identidad de Miru desde el primer instante.

---

## Layout

**Fondo:** `#0C0F14` sólido, sin texturas ni gradientes de fondo.

**Distribución:** centrado absoluto vertical y horizontal. Todo el contenido vive en el eje central de la pantalla.

---

## Elementos visuales (de arriba hacia abajo)

### 1. Glow ambiental
Un círculo de luz difusa, muy sutil, color `#E4B3E9` con opacidad del 8%, de aproximadamente 280px de diámetro, centrado detrás del logo. No tiene bordes, es puro blur radial. Crea profundidad sin ser llamativo.

### 2. Logo mark (ícono del gato)
El isotipo de Miru — la M con las orejas de gato y los bigotes — centrado en la pantalla.
- Tamaño: 96×96px
- Gradiente aplicado de arriba hacia abajo: de `#F2C8F6` (arriba) a `#B98AEF` (abajo)
- Aparece con una animación de fade-in + scale desde 0.85 a 1.0 en 300ms, easing `ease-in-out`

### 3. Wordmark "Miru"
Debajo del isotipo, con un espacio de 16px.
- Tipografía: Inter 700, 28px
- Color: `#F0F2F5`
- La palabra "APP" a la derecha del wordmark, Inter 500, 12px, color `#8A95A8`
- Aparece con fade-in 150ms después del logo

### 4. Tagline
Debajo del wordmark, espacio de 8px.
- Texto: *"Tu familia, sus finanzas."*
- Tipografía: Inter 400, 14px
- Color: `#8A95A8`
- Fade-in 100ms después del wordmark

---

## Parte inferior

### Indicador de carga
En el extremo inferior de la pantalla, a 48px del borde, centrado horizontalmente.
- Una línea delgada de 48px de largo, 2px de alto, radio 999px
- Color de fondo: `rgba(255,255,255,0.06)`
- Línea de progreso animada de izquierda a derecha: color `#E4B3E9`, duración 1.8s lineal

### Copyright / versión
Justo debajo de la línea, 8px de espacio.
- Texto: *"v2.0.0"*
- Inter 400, 12px, color `#697586`

---

## Secuencia de animación

| Tiempo | Evento |
|---|---|
| 0ms | Fondo aparece instantáneo |
| 0ms | Glow hace fade-in en 400ms |
| 150ms | Logo entra con scale + fade |
| 350ms | Wordmark fade-in |
| 450ms | Tagline fade-in |
| 500ms | Barra de progreso comienza |
| 1800ms | Fade-out general en 300ms |
| 2100ms | Navegación al siguiente destino |

---

## Comportamiento de redirección

- Si no hay sesión activa → navega a **Onboarding** (primera vez) o **Login** (ya visto el onboarding)
- Si hay sesión activa y token válido → navega a **Dashboard** directamente
- Transición: fade-out de la pantalla completa en 300ms

---

## Notas de diseño

- No hay botones ni elementos interactivos
- No usar spinner, solo la barra de progreso lineal
- El glow debe ser muy sutil, evitar que parezca un efecto de neón
- En versión oscura pura, el negro del fondo debe ser exactamente `#0C0F14`, no negro puro
