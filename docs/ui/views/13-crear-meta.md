# Miru App — Crear Meta

---

## Descripción general

Formulario para crear una nueva meta de ahorro. La experiencia debe sentirse inspiradora — el usuario está definiendo un objetivo positivo. Diseñado para completarse en menos de 20 segundos.

---

## Layout

- **Fondo:** `#0C0F14`
- **Padding horizontal:** 24px
- **Scroll vertical:** sí (puede exceder viewport)
- **Bottom navigation:** oculta
- **Safe area top:** 56px

---

## Estructura visual (de arriba hacia abajo)

---

### 1. Header
Padding top 56px.

```
← Volver              Nueva meta               [✓]
```

- **Izquierda:** `x` (cerrar) Lucide, 22px, `#8A95A8`
- **Centro:** *"Nueva meta"* — Inter 700, 20px, `#F0F2F5`
- **Derecha:** "Guardar" — Inter 600, 14px, `#C99A0A`. Deshabilitado hasta formulario válido

---

### 2. Selector de emoji / ícono
Margin top: 24px. Centrado.

- **Label:** *"Elegí un ícono para tu meta"* — Inter 500, 12px, `#8A95A8`, centrado, margin-bottom 12px
- **Grid de 4×4:** 16 emojis predefinidos para elegir:

```
🏖️ 🏠 🚗 ✈️
🎓 💍 🎮 💻
🏥 🐕 🎸 🌴
🏋️ 📚 🎂 💼
```

- Cada emoji: 44×44px, fondo `#1E2530`, radio 12px, centrado, font-size 22px
- Estado seleccionado: fondo `rgba(201,154,10,0.15)`, borde 1.5px `#C99A0A`, scale 1.05
- Sin selección por defecto

---

### 3. Campo: Nombre de la meta
Margin top: 20px.

- Label: *"¿Qué querés ahorrar?"* — Inter 500, 12px, `#8A95A8`, margin-bottom 8px
- Input: fondo `#1E2530`, radio 16px, altura 48px, padding horizontal 16px
- Placeholder: *"Ej: Viaje a la costa"* — `#697586`
- Ícono izquierdo: `edit-3` Lucide, 18px, `#697586`
- Máximo 40 caracteres. Contador visible: *"12/40"* — Inter 400, 11px, `#697586`, alineado a la derecha debajo del input

---

### 4. Campo: Monto objetivo
Margin top: 16px.

- Label: *"¿Cuánto necesitás?"* — Inter 500, 12px, `#8A95A8`, margin-bottom 8px
- Input: fondo `#1E2530`, radio 16px, altura 48px, padding horizontal 16px
- Placeholder: *"$ 0"*
- Ícono izquierdo: `dollar-sign` Lucide, 18px, `#697586`
- Tipo: `number`, teclado numérico

---

### 5. Selector de fecha límite (opcional)
Margin top: 16px.

- Label: *"Fecha límite (opcional)"* — Inter 500, 12px, `#8A95A8`, margin-bottom 8px
- Input: fondo `#1E2530`, radio 16px, altura 48px
- Placeholder: *"Sin fecha límite"* — `#697586`
- Ícono izquierdo: `calendar` Lucide, 18px, `#697586`
- Al tocar: abre date picker nativo

**Si se selecciona una fecha límite**, debajo aparece un cálculo automático:
- *"Te faltan 6 meses · Ahorro sugerido: $ 12.500/mes"* — Inter 500, 13px, `#C99A0A`
- *"$ 75.000 / 6 meses = $ 12.500 por mes"* — Inter 400, 11px, `#697586`

---

### 6. Selector de color (opcional)
Margin top: 16px.

- Label: *"Color de la meta (opcional)"* — Inter 500, 12px, `#8A95A8`, margin-bottom 8px
- **Fila de círculos de color:** 6 opciones:

```
🟡 🟢 🔵 🟣 🔴 🟠
```

- Cada círculo: 28×28px, radio 999px
- Colores: `#C99A0A`, `#15C48C`, `#5B8DEF`, `#9B6EF3`, `#E05252`, `#E4B3E9`
- Seleccionado: anillo exterior de 4px `#F0F2F5`
- Por defecto: `#C99A0A` (dorado de ahorros)

---

### 7. Toggle "Ahorro automático"
Margin top: 20px.

```
[🤖] Ahorro automático            [⬜──]
```

- **Label:** *"Ahorro automático"* — Inter 500, 14px, `#F0F2F5`
- **Subtexto:** *"Apartá una cantidad automáticamente cada mes"* — Inter 400, 11px, `#697586`
- **Toggle switch:** 44×24px

**Al activar, aparecen:**
- Input: *"Monto mensual"* — placeholder *"$ 0"*, tipo number
- Selector: *"Día del mes"* — input numérico, placeholder *"1"**, valor entre 1 y 28

---

### 8. Botón guardar
Margin top: 24px.

**"Crear meta"**
- Fondo: `#C99A0A` (dorado de ahorros)
- Texto: `#0C0F14`, Inter 700, 14px
- Altura: 44px
- Radio: 999px
- Deshabilitado hasta: nombre completado y monto > 0

---

## Estados

| Estado | Descripción |
|---|---|
| Default | Sin emoji, nombre vacío, monto 0. Botón deshabilitado |
| Completando | Emoji seleccionado, nombre + monto completados. Cálculo de ahorro mensual visible si hay fecha |
| Cargando | Botón con `miru-icon.svg` animado |
| Error | *"No pudimos crear la meta"* — `#F87171` |
| Éxito | Redirección a Ahorros con la nueva meta en la lista, animación de entrada (slide up + fade) |

---

## Comportamiento

- Al seleccionar emoji, el grid marca la opción elegida
- El cálculo de ahorro mensual se actualiza en tiempo real al cambiar monto o fecha
- El ahorro automático muestra campos adicionales con animación expand
- El color por defecto es dorado pero el usuario puede personalizarlo
- Al guardar exitosamente, la meta aparece al inicio de la lista en Ahorros

---

## Notas de diseño

- La experiencia debe ser aspiracional y positiva — la meta es un objetivo emocionante, no una tarea
- El selector de emoji debe ser divertido de usar — amplio, colorido, táctil
- El cálculo de ahorro mensual ayuda al usuario a definir metas realistas
- El ahorro automático es una feature clave para cumplir metas — debe ser visible pero no obligatorio
- El dorado `#C99A0A` como color principal refuerza la psicología positiva del ahorro
- En v2: fotos personalizadas como ícono de meta, compartir meta con familia
