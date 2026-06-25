# Miru App — Crear Gasto

---

## Descripción general

Formulario para registrar un nuevo gasto. Estructuralmente similar a "Crear ingreso" pero con algunos campos adicionales (tipo de pago, recurrencia). El foco está en el monto y la categoría. Diseñado para completarse en menos de 20 segundos.

---

## Layout

- **Fondo:** `#0C0F14`
- **Padding horizontal:** 24px
- **Scroll vertical:** mínimo (solo si hay muchos campos — debe evitarse)
- **Bottom navigation:** oculta
- **Safe area top:** 56px
- **Teclado numérico:** se abre automáticamente al entrar

---

## Estructura visual (de arriba hacia abajo)

---

### 1. Header
Padding top 56px.

```
← Volver            Nuevo gasto               [✓]
```

- **Izquierda:** `x` (cerrar) Lucide, 22px, `#8A95A8`
- **Centro:** *"Nuevo gasto"* — Inter 700, 20px, `#F0F2F5`
- **Derecha:** "Guardar" — Inter 600, 14px, `#E4B3E9`. Deshabilitado hasta formulario válido

---

### 2. Selector de monto
Margin top: 28px. Centrado horizontalmente.

- **Label:** *"¿Cuánto gastaste?"* — Inter 500, 12px, `#8A95A8`, centrado
- **Input de monto:**
  - Fondo transparente, sin borde
  - Altura: 72px
  - Texto: Inter 800, 48px, `#F0F2F5`, centrado
  - Prefijo "$" a la izquierda, Inter 600, 32px, `#8A95A8`
  - Placeholder: *"0"* — `#697586`, opacidad 0.5
  - Cursor: `#E05252` (rojo semántico de gasto)
  - Tipo: `number`

---

### 3. Selector de categoría
Margin top: 24px.

Mismo grid de 4 columnas que ingresos, pero con categorías de gasto:

| Categoría | Ícono Lucide | Color |
|---|---|---|
| Comidas | `utensils` | `#E05252` |
| Transporte | `car` | `#5B8DEF` |
| Servicios | `zap` | `#C99A0A` |
| Alquiler | `home` | `#E05252` |
| Salud | `heart-pulse` | `#E05252` |
| Educación | `book-open` | `#5B8DEF` |
| Entretenimiento | `gamepad-2` | `#9B6EF3` |
| Otro | `ellipsis` | `#8A95A8` |

**Card de categoría:** 80×80px, fondo `#161B24`, radio 16px, borde `rgba(255,255,255,0.06)`
- Estado seleccionado: borde 1.5px `#E05252`, fondo `rgba(224,82,82,0.08)`

---

### 4. Selector de tipo de pago
Margin top: 16px.

- **Label:** *"Tipo de pago"* — Inter 500, 12px, `#8A95A8`, margin-bottom 8px
- **Dos chips lado a lado:**

| Chip | Descripción |
|---|---|
| "Efectivo" | Fondo `#1E2530`, ícono `banknote` Lucide, 16px |
| "Tarjeta crédito" | Fondo `#1E2530`, ícono `credit-card` Lucide, 16px |
| "Tarjeta débito" | Fondo `#1E2530`, ícono `credit-card` Lucide, 16px |
| "Transferencia" | Fondo `#1E2530`, ícono `building` Lucide, 16px |

- Chip seleccionado: borde 1px `#E05252`, fondo `rgba(224,82,82,0.08)`
- Chips en fila con wrap, gap 8px

---

### 5. Campo opcional: descripción
Margin top: 16px.

- Label: *"Descripción (opcional)"* — Inter 500, 12px, `#8A95A8`
- Input: fondo `#1E2530`, radio 16px, altura 48px
- Placeholder: *"Ej: Supermercado del sábado"*

---

### 6. Selector "¿Quién pagó?"
Margin top: 12px (solo si aplica membresía familiar).

Mismos avatares horizontales que en Crear ingreso.

---

### 7. Toggle "Gasto recurrente"
Margin top: 16px.

Fila con toggle switch:
- **Label izquierda:** *"Gasto recurrente"* — Inter 500, 14px, `#F0F2F5`
- **Subtexto:** *"Se repite cada mes"* — Inter 400, 11px, `#697586`
- **Toggle switch:** 44×24px, radio 999px
  - OFF: fondo `#1E2530`, círculo 20px `#697586`
  - ON: fondo `#E05252`, círculo 20px `#F0F2F5`, animación 150ms
  - Al activar, aparece selector de día: *"Día del mes"* con input numérico de 2 dígitos

---

### 8. Botón guardar
Margin top: 24px.

**"Guardar gasto"**
- Fondo: `#E05252` (rojo — semántica de gasto)
- Texto: `#F0F2F5`, Inter 700, 14px
- Altura: 44px
- Radio: 999px
- Deshabilitado hasta: monto > 0, categoría seleccionada, tipo de pago seleccionado

---

## Estados

| Estado | Descripción |
|---|---|
| Default | Todo vacío. Botón deshabilitado |
| Completando | Monto + categoría + tipo de pago completados. Botón se habilita |
| Cargando | Botón con `miru-icon.svg` animado |
| Error | *"No pudimos guardar el gasto"* — `#F87171`, fade-in debajo del botón |
| Éxito | Fade-out + redirección a Dashboard/Movimientos |

---

## Comportamiento

- El monto usa formateo automático con separadores de miles
- El cursor rojo `#E05252` refuerza visualmente que es un gasto
- Al seleccionar categoría, la card escala 1.02 y vuelve a 1.0 en 150ms
- Al activar toggle recurrente, el selector de día aparece con slide down de 200ms
- Guardado exitoso limpia el formulario y redirige

---

## Notas de diseño

- El rojo `#E05252` en el botón es intencional — el usuario debe sentir que está registrando una salida de dinero
- Los gastos recurrentes son clave para la precisión del dashboard mensual
- El tipo de pago ayuda al usuario a conciliar cuentas después
- El toggle recurrente debe estar visualmente separado del resto para no confundir con campos obligatorios
- La experiencia debe sentirse rápida — minimizar transiciones entre pantallas
- En v2: soporte para dividir gasto entre miembros del grupo familiar
