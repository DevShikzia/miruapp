# Miru App — Crear Deuda

---

## Descripción general

Formulario para registrar una nueva deuda (plata que debés o que te deben). Incluye campos para el monto total, la persona/entidad, la fecha de vencimiento y el número de cuotas. Diseñado para completarse en menos de 30 segundos.

---

## Layout

- **Fondo:** `#0C0F14`
- **Padding horizontal:** 24px
- **Scroll vertical:** sí (puede exceder 390×844 si hay muchas cuotas)
- **Bottom navigation:** oculta
- **Safe area top:** 56px

---

## Estructura visual (de arriba hacia abajo)

---

### 1. Header
Padding top 56px.

```
← Volver              Nueva deuda               [✓]
```

- **Izquierda:** `x` (cerrar) Lucide, 22px, `#8A95A8`
- **Centro:** *"Nueva deuda"* — Inter 700, 20px, `#F0F2F5`
- **Derecha:** "Guardar" — Inter 600, 14px, `#E4B3E9`. Deshabilitado hasta formulario válido

---

### 2. Campo: Nombre
Margin top: 24px.

- Label: *"¿A quién le debés?"* — Inter 500, 12px, `#8A95A8`, margin-bottom 8px
- Input: fondo `#1E2530`, radio 16px, altura 48px, padding horizontal 16px
- Placeholder: *"Ej: Banco Galicia"* — `#697586`
- Ícono izquierdo: `building` Lucide, 18px, `#697586`

### 2b. Toggle "Me deben a mí"
Switch inline:
- *"Me deben a mí"* — Inter 500, 13px, `#F0F2F5`
- Al activar: el label del campo cambia a *"¿Quién te debe?"* y el placeholder a *"Ej: Juan Pérez"*
- El color semántico de la deuda cambia de `#E05252` a `#5B8DEF` (azul informativo)

---

### 3. Campo: Monto total
Margin top: 16px.

- Label: *"Monto total"* — Inter 500, 12px, `#8A95A8`
- Input: mismo estilo, altura 52px
- Placeholder: *"$ 0"*
- Ícono izquierdo: `dollar-sign` Lucide, 18px, `#697586`
- Tipo: `number`, teclado numérico

---

### 4. Selector: Tipo de deuda
Margin top: 16px.

- Label: *"Tipo"* — Inter 500, 12px, `#8A95A8`, margin-bottom 8px
- Dos chips:
  - *"Cuota fija"* — pago único o monto fijo
  - *"Crédito"* — con intereses, permite agregar tasa

---

### 5. Campo: Número de cuotas (solo si aplica)
Margin top: 12px.

- Label: *"Cuotas"* — Inter 500, 12px, `#8A95A8`
- Input: mismo estilo, altura 48px, ancho 80px
- Placeholder: *"1"*
- Mínimo 1, máximo 36
- Al cambiar, se calcula automáticamente el valor por cuota y se muestra debajo:
  - *"12 cuotas de $ 7.083"* — Inter 500, 13px, `#8A95A8`

---

### 6. Campo: Fecha de vencimiento
Margin top: 16px.

- Label: *"Próximo vencimiento"* — Inter 500, 12px, `#8A95A8`
- Input: mismo estilo, altura 48px
- Placeholder: *"Seleccionar fecha"*
- Ícono izquierdo: `calendar` Lucide, 18px, `#697586`
- Al tocar: abre date picker nativo del sistema con formato DD/MM/AAAA
- Por defecto: primer día del próximo mes

---

### 7. Campo: Tasa de interés (solo si tipo "Crédito")
Margin top: 12px.

- Label: *"Tasa de interés mensual"* — Inter 500, 12px, `#8A95A8`
- Input: mismo estilo, altura 48px, ancho 100px
- Placeholder: *"0%"*
- Sufijo "%" fijo a la derecha del input — Inter 500, 14px, `#8A95A8`
- Al ingresar, debajo se muestra: *"Interés total estimado: $ 12.500"* — Inter 400, 12px, `#C99A0A`

---

### 8. Campo: Descripción (opcional)
Margin top: 16px.

- Label: *"Notas (opcional)"* — Inter 500, 12px, `#8A95A8`
- Textarea: fondo `#1E2530`, radio 16px, altura 72px, padding 16px
- Placeholder: *"Ej: Préstamo para el auto"* — `#697586`
- Esquinas redondeadas 16px, resize: none

---

### 9. Botón guardar
Margin top: 24px.

**"Guardar deuda"**
- Fondo: `#E05252` (rojo semántico)
- Texto: `#F0F2F5`, Inter 700, 14px
- Altura: 44px
- Radio: 999px
- Deshabilitado hasta: nombre completo, monto > 0, fecha seleccionada

---

## Estados

| Estado | Descripción |
|---|---|
| Default | Todos los campos vacíos |
| Completando | Se llenan los campos. El cálculo de cuotas se actualiza en vivo |
| Cargando | Botón con `miru-icon.svg` animado |
| Error | *"No pudimos guardar la deuda"* — `#F87171` |
| Éxito | Fade-out + redirección a lista de Deudas con la nueva deuda al inicio |

---

## Comportamiento

- Al alternar "Me deben a mí", el color del header cambia sutilmente (borde inferior de `#E05252` a `#5B8DEF`)
- El cálculo de cuotas se actualiza en tiempo real al cambiar el monto o número de cuotas
- Si se selecciona "Crédito", la tasa de interés se vuelve obligatoria
- Al guardar exitosamente, la deuda aparece como primera en la lista de Deudas
- Si la deuda es "Me deben a mí", se muestra con borde azul en la lista

---

## Notas de diseño

- Diferenciar visualmente entre "Le debo a alguien" y "Me deben a mí" es crucial para evitar confusiones
- El rojo `#E05252` en el botón es consistente con la semántica de deuda
- La tasa de interés debe ser opcional pero visible para créditos reales
- El date picker debe ser cómodo para seleccionar días específicos (no solo fin de mes)
- El campo de notas ayuda a recordar detalles pero no debe ser obligatorio
- En v2: agregar opción para compartir la deuda entre miembros del grupo familiar
