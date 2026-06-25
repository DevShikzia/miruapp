# Miru App — Checklist Mensual

---

## Descripción general

Pantalla de tareas financieras recurrentes que el grupo familiar debe completar cada mes. Funciona como un recordatorio visual de las tareas doméstico-financieras: pagar servicios, revisar gastos, aportar a metas, etc. El tono es amigable y motivacional, no impositivo.

---

## Layout

- **Fondo:** `#0C0F14`
- **Padding horizontal:** 20px
- **Scroll vertical:** sí
- **Bottom navigation:** presente, tab "Inicio" activa (no tiene tab propia — se accede desde Dashboard o Perfil)
- **Safe area top:** 56px

---

## Estructura visual (de arriba hacia abajo)

---

### 1. Header
Padding top 56px.

```
← Volver           Checklist mensual           [···]
```

- **Izquierda:** `chevron-left` Lucide, 22px, `#F0F2F5`
- **Centro:** *"Checklist mensual"* — Inter 700, 20px, `#F0F2F5`
- **Derecha:** `more-vertical` Lucide, 22px, `#8A95A8` (menú: Personalizar checklist / Resetear mes)

---

### 2. Resumen del mes
Margin top: 16px.

Card con fondo `#161B24`, radio 24px, borde `rgba(255,255,255,0.06)`, padding 16px.

**Header de mes:** *"Junio 2026"* — Inter 700, 18px, `#F0F2F5`

**Progreso circular:** A la derecha del header o en el centro de la card:

- Círculo de progreso: 56×56px
- SVG circle: stroke `#1E2530` de 4px (fondo), stroke `#15C48C` de 4px (progreso)
- Centro: texto *"5/8"* — Inter 700, 14px, `#F0F2F5`
- Subtítulo debajo: *"tareas completadas"* — Inter 400, 11px, `#8A95A8`

**Barra de racha** (opcional, debajo del círculo):
- Ícono `flame` Lucide, 16px, `#E05252`
- Texto: *"Llevás 4 meses seguidos completando tu checklist"* — Inter 500, 12px, `#8A95A8`

---

### 3. Lista de tareas
Margin top: 20px.

Cada tarea es un item tipo checklist:

```
[□]   Pagar alquiler              $ 45.000     → Categoría
      Vence el 05/06                        [#E05252]
```

**Item:**
- Padding: 14px 0
- Borde inferior: `rgba(255,255,255,0.04)`, 1px

**Checkbox:**
- Sin marcar: círculo de 22×22px, borde 2px `#697586`, fondo transparente, radio 6px
- Marcado: fondo `#15C48C`, borde `#15C48C`, check blanco `#F0F2F5`, 14px, con animación de scale 0.8 → 1.0 en 150ms
- Área táctil: 44×44px (el checkbox visible es más chico pero el área de toque es más grande)

**Contenido:**
- **Nombre de tarea:** Inter 500, 14px, `#F0F2F5`
- **Monto asociado** (si aplica): *"$ 45.000"* — Inter 600, 14px, `#F0F2F5`, alineado a la derecha
- **Fecha de vencimiento o detalle:** *"Vence el 05/06"* — Inter 400, 12px, `#697586`
- **Tag de categoría** (si aplica): *"Servicios"* — Inter 400, 11px, `#C99A0A`, fondo `rgba(201,154,10,0.12)`, radio 4px, padding 2px 6px

**Estado completado:**
- Nombre: `#8A95A8` (atenuado), con ~~tachado~~ suave
- Fondo del item con opacidad reducida
- Aparece al final de la lista (no se mezcla con las pendientes)

---

### 4. Tareas personalizadas
Si el usuario agregó tareas propias, aparecen separadas con un header:

- **Header:** *"Tus tareas"* — Inter 500, 12px, `#8A95A8`, margin-top 16px
- Mismo formato de items

---

### 5. Botón "Agregar tarea"
Margin top: 16px (al final de la lista).

- Fondo: transparente, borde 1px dashed `rgba(255,255,255,0.1)`, radio 16px
- Padding: 14px
- Ícono: `plus` Lucide, 18px, `#8A95A8`
- Texto: *"Agregar tarea personalizada"* — Inter 500, 14px, `#8A95A8`
- Al tocar: abre modal inline para escribir nombre de tarea

---

### 6. Estado completado total
Cuando todas las tareas están marcadas:

- Animación: confeti sutil (círculos de colores cayendo, duración 1s)
- Texto: *"¡Completaste todo, ${nombre}!"* — Inter 700, 20px, `#15C48C`
- Subtexto: *"Mes de junio listo. Nos vemos el mes que viene."* — Inter 400, 14px, `#8A95A8`
- Botón: *"Ver resumen del mes"* — Primary Button, fondo `#15C48C`

---

## Estados

| Estado | Descripción |
|---|---|
| Cargando | Skeleton circular + 5 items rectangulares |
| Vacío (sin tareas) | *"Todavía no hay tareas para este mes. Agregá la primera."* con botón "Agregar tarea" |
| En progreso | Items con checkboxes disponibles. Algunos marcados |
| Todo completado | Estado celebratorio con confeti |
| Error | *"No pudimos cargar el checklist"* |

---

## Comportamiento

- Al marcar un checkbox, el item se mueve al final de la lista con animación (slide down + fade)
- Al desmarcar, vuelve a su posición original
- Las tareas se ordenan por fecha de vencimiento (más urgente primero)
- Al inicio del mes, todas las tareas se "resetear" automáticamente
- Las tareas recurrentes se crean automáticamente cada mes (alquiler, servicios, etc.)
- Pull-to-refresh recarga el checklist

---

## Notas de diseño

- El checklist debe sentirse como un aliado, no como una obligación
- El círculo de progreso da satisfacción visual al completar tareas
- Las tareas predefinidas (alquiler, servicios) se generan desde la configuración del hogar
- La racha mensual (streak) es un gran motivador — debe ser visible
- El tono "palomita" de la checklist debe ser suave y gratificante
- No más de 15 tareas por mes para no abrumar
- En v2: compartir checklist con familia, asignar tareas a miembros específicos
