# Miru App — Crear Tarjeta de Crédito

---

## Descripción general

Formulario para registrar una nueva tarjeta de crédito en el grupo familiar. Captura los datos esenciales (nombre, marca, días de cierre y vencimiento) y varios campos opcionales. Diseñado para completarse en menos de 30 segundos.

---

## Layout

- **Fondo:** `#0C0F14`
- **Padding horizontal:** 24px
- **Scroll vertical:** sí (el formulario tiene varios campos)
- **Bottom navigation:** oculta
- **Safe area top:** 56px

---

## Estructura visual (de arriba hacia abajo)

---

### 1. Header
Padding top 56px.

```
← Volver          Nueva tarjeta              [✓]
```

- **Izquierda:** `x` (cerrar) Lucide, 22px, `#8A95A8`
- **Centro:** *"Nueva tarjeta"* — Inter 700, 20px, `#F0F2F5`
- **Derecha:** "Guardar" — Inter 600, 14px, `#5B8DEF`. Deshabilitado hasta formulario válido

---

### 2. Selector de marca y nombre

Margin top: 24px.

**Campo: Nombre de la tarjeta**
- Label: *"Nombre de la tarjeta"* — Inter 500, 12px, `#8A95A8`
- Input: fondo `#1E2530`, radio 16px, altura 48px, padding horizontal 16px
- Placeholder: *"Ej: Visa Platino"*
- Texto: Inter 500, 14px, `#F0F2F5`

**Selector de marca (debajo del nombre, margin top 12px):**
- Label: *"Marca"* — Inter 500, 12px, `#8A95A8`
- Chips horizontales, gap 8px:

| Chip | Descripción |
|---|---|
| Visa | Fondo `#1E2530`, texto Inter 500 13px `#F0F2F5`. Seleccionado: borde 1px `#5B8DEF` |
| Mastercard | Mismo estilo |
| Amex | Mismo estilo |
| Otra | Mismo estilo |

- Chip seleccionado: borde 1.5px `#5B8DEF`, fondo `rgba(91,141,239,0.08)`

---

### 3. Campos opcionales agrupados

Margin top: 20px.

**Grupo: "Datos de la tarjeta (opcional)"**

*Últimos 4 dígitos:*
- Label: *"Últimos 4 dígitos"*
- Input: fondo `#1E2530`, radio 16px, altura 48px, ancho 100px (fijo)
- Placeholder: *"••••"* — Inter 600, 18px
- Máximo 4 caracteres numéricos
- Texto enmascarado visualmente con `••••`

*Banco emisor:*
- Label: *"Banco"*
- Input: fondo `#1E2530`, radio 16px, altura 48px
- Placeholder: *"Ej: Banco Nación"*

*Límite de crédito:*
- Label: *"Límite de crédito"*
- Input: fondo `#1E2530`, radio 16px, altura 48px
- Placeholder: *"$ 0"*
- Prefijo "$" a la izquierda, Inter 500, 14px, `#8A95A8`
- Tipo: `number`

---

### 4. Fechas del ciclo

Margin top: 20px.

**Grupo: "Fechas del ciclo"**

Dos campos lado a lado en fila con gap 12px:

```
┌─────────────────┐  ┌─────────────────┐
│  Día de cierre   │  │  Día de vencim.  │
│     [ 15 ]       │  │     [ 5 ]        │
└─────────────────┘  └─────────────────┘
```

| Campo | Label | Input |
|-------|-------|-------|
| Día de cierre | *"Día de cierre"* — Inter 500, 12px, `#8A95A8` | Input numérico, 48px altura, fondo `#1E2530`, radio 16px, centrado. Min 1, max 28 |
| Día de vencimiento | *"Día de venc."* — Inter 500, 12px, `#8A95A8` | Mismo estilo |

- Ambos son obligatorios
- Validación: el día de vencimiento no puede ser igual al día de cierre (mostrar advertencia)

---

### 5. Selector de color (opcional)

Margin top: 16px.

- **Label:** *"Color (opcional)"* — Inter 500, 12px, `#8A95A8`
- **Paleta de colores predefinidos** en fila, gap 8px:

| Color | Hex |
|-------|-----|
| Azul | `#5B8DEF` |
| Verde | `#22C55E` |
| Rojo | `#E05252` |
| Amarillo | `#C99A0A` |
| Violeta | `#9B6EF3` |
| Rosa | `#E4B3E9` |
| Naranja | `#F97316` |
| Gris | `#8A95A8` |

- Cada opción es un círculo de 32×32px con borde 2px transparente
- Seleccionado: borde 2px `#F0F2F5`, escala 1.1

---

### 6. Campo de notas (opcional)

Margin top: 16px.

- Label: *"Notas (opcional)"* — Inter 500, 12px, `#8A95A8`
- Textarea: fondo `#1E2530`, radio 16px, altura 80px, padding 16px
- Placeholder: *"Ej: Usar solo para suscripciones"*

---

### 7. Botón guardar

Margin top: 24px.

**"Guardar tarjeta"**
- Fondo: `#5B8DEF`
- Texto: `#F0F2F5`, Inter 700, 14px
- Altura: 44px
- Radio: 999px
- Deshabilitado hasta: nombre completo + marca seleccionada + día de cierre + día de vencimiento

---

## Estados

| Estado | Descripción |
|---|---|
| Default | Campos vacíos. Botón deshabilitado |
| Completando | Nombre + marca + fechas completados. Botón se habilita |
| Cargando | Botón con spiner |
| Error | *"No pudimos guardar la tarjeta"* — `#F87171`, fade-in debajo del botón |
| Éxito | Fade-out + redirección a lista de tarjetas |

---

## Comportamiento

- Al cargar, el foco va al campo de nombre automáticamente
- El día de cierre y vencimiento usan un picker numérico simple (no calendario)
- Si el usuario ingresa un día > 28, se muestra error *"El día debe ser entre 1 y 28"*
- Al seleccionar color, los demás círculos vuelven a su estado normal
- Guardado exitoso redirige a `/tarjetas` con la nueva tarjeta visible

---

## Endpoints relacionados

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/credit-cards` | Crear tarjeta |

---

## Dependencias del backend

| Archivo | Ruta | Propósito |
|---|---|---|
| Controller | `controllers/creditCard.controller.ts` | Creación de tarjeta |
| Service | `services/creditCard.service.ts` | Reglas de negocio |
| Schema | `schemas/credit-card.schema.ts` | Validación Zod |
| Model | `models/CreditCard.model.ts` | Schema de MongoDB |
