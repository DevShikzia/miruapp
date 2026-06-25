# Miru App — Crear Ingreso

---

## Descripción general

Formulario para registrar un nuevo ingreso. Pantalla minimalista que pone el foco en el monto y la categoría. Diseñada para completarse en menos de 15 segundos. Sin scroll vertical — todo entra en una sola vista.

---

## Layout

- **Fondo:** `#0C0F14`
- **Padding horizontal:** 24px
- **Scroll vertical:** no necesario
- **Bottom navigation:** oculta durante el formulario
- **Safe area top:** 56px
- **Teclado numérico:** se abre automáticamente al entrar

---

## Estructura visual (de arriba hacia abajo)

---

### 1. Header
Padding top 56px.

```
← Volucer          Nuevo ingreso               [✓]
```

- **Izquierda:** `x` (cerrar) o `chevron-left` Lucide, 22px, `#8A95A8` — descarta y vuelve
- **Centro:** *"Nuevo ingreso"* — Inter 700, 20px, `#F0F2F5`
- **Derecha:** check "Guardar" — Inter 600, 14px, `#E4B3E9`. Deshabilitado (opacidad 0.4) hasta que el formulario sea válido

---

### 2. Selector de monto
Margin top: 32px. Centrado horizontalmente.

- **Label:** *"¿Cuánto recibiste?"* — Inter 500, 12px, `#8A95A8`, centrado
- **Input de monto:**
  - Fondo transparente, sin borde
  - Altura: 72px
  - Texto: Inter 800, 48px, `#F0F2F5`, centrado
  - Prefijo "$" fijo a la izquierda del número, Inter 600, 32px, `#8A95A8`
  - Placeholder: *"0"* — color `#697586`, opacidad 0.5
  - Cursor: línea vertical `#E4B3E9` de 2px
  - Tipo: `number` con teclado numérico
  - Sin decimales al inicio (los centavos se agregan si el usuario toca ",")

---

### 3. Selector de categoría
Margin top: 28px.

- **Label:** *"Categoría"* — Inter 500, 12px, `#8A95A8`
- **Grid de 4 columnas:** 8 categorías predefinidas, cada una:

**Card de categoría:**
- 80×80px, fondo `#161B24`, radio 16px, borde `rgba(255,255,255,0.06)`
- Padding: 12px
- Alineación centrada vertical y horizontal
- **Ícono:** Lucide, 24px, color según categoría
- **Label:** Inter 400, 11px, `#F0F2F5`, centrado, 1 línea
- **Estado seleccionado:** borde 1.5px `#E4B3E9`, fondo `rgba(228,179,233,0.08)`

| Categoría | Ícono Lucide | Color |
|---|---|---|
| Sueldo | `briefcase` | `#15C48C` |
| Freelance | `laptop` | `#5B8DEF` |
| inversión | `trending-up` | `#9B6EF3` |
| Venta | `shopping-bag` | `#C99A0A` |
| Familiar | `heart` | `#E05252` |
| Préstamo | `hand-coins` | `#E4B3E9` |
| Devolución | `rotate-ccw` | `#15C48C` |
| Otro | `ellipsis` | `#8A95A8` |

---

### 4. Campo opcional: descripción
Margin top: 20px.

- Label: *"Descripción (opcional)"* — Inter 500, 12px, `#8A95A8`, margin-bottom 8px
- Input: fondo `#1E2530`, borde transparente, radio 16px, altura 48px, padding horizontal 16px
- Placeholder: *"Ej: Sueldo de junio"* — `#697586`
- Sin ícono

---

### 5. Selector de quién recibe (si aplica membresía familiar)
Margin top: 16px.

- Label: *"¿Quién recibió?"* — Inter 500, 12px, `#8A95A8`, margin-bottom 8px
- **Avatares horizontales seleccionables:**
  - Fila de círculos de 32×32px con borde de 2px
  - Avatar seleccionado: borde `#E4B3E9`
  - Avatar no seleccionado: borde transparente
  - Opción "+" para agregar si falta alguien
  - Incluye opción "Todos" como primer avatar

---

### 6. Botón guardar
Margin top: 28px.

**"Guardar ingreso"**
- Fondo: `#15C48C` (verde — semántica de ingreso)
- Texto: `#041710`, Inter 700, 14px
- Altura: 44px
- Radio: 999px
- Ancho: 100%
- Deshabilitado hasta que monto > 0 y categoría seleccionada

---

## Estados

| Estado | Descripción |
|---|---|
| Default | Monto en 0, sin categoría. Botón deshabilitado |
| Ingresando monto | Números aparecen con animación de conteo. Selector de categoría intacto |
| Categoría seleccionada | Card con borde `#E4B3E9`. Botón se habilita |
| Cargando | Botón muestra `miru-icon.svg` animado (rotación). Inputs deshabilitados |
| Error | Mensaje debajo del botón: *"No pudimos guardar el ingreso"* — `#F87171` |
| Éxito | Fade-out 200ms + redirección a Dashboard o Movimientos con el nuevo item visible |

---

## Comportamiento

- Al tocar el input de monto, el teclado numérico se abre con el foco
- El monto se formatea automáticamente con separadores de miles (ej. 15000 → $ 15.000)
- Los centavos aparecen solo si el usuario escribe "," seguido de 2 dígitos
- Al seleccionar categoría, la card se marca con un sutil scale (1.02) que vuelve a 1.0
- Al guardar exitosamente, el nuevo ingreso aparece en la lista de movimientos sin recargar la app
- El formulario se limpia después de guardar exitosamente

---

## Notas de diseño

- El input de monto debe ser gigante para que el usuario vea el número sin esfuerzo
- Las categorías deben ser reconocibles al instante — priorizar íconos sobre texto
- El verde `#15C48C` en el botón refuerza la semántica positiva del ingreso
- Evitar animaciones innecesarias en el monto al escribir (solo formateo limpio)
- El selector de quién recibe solo aparece si el usuario pertenece a un grupo familiar con más de 1 miembro
- Considerar agregar un toggle "Ingreso recurrente" en v2

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
| POST | `/api/finance/incomes` | Crear nuevo ingreso |

## Dependencias del backend

| Archivo | Ruta | Propósito |
|---|---|---|
| Controller | `controllers/finance.controller.ts` | Creación de ingresos |
| Service | `services/income.service.ts` | Reglas de negocio de ingresos |
| Schema | `schemas/finance.schema.ts` | Validación Zod de ingreso |
| Model | `models/Income.model.ts` | Schema de MongoDB |
