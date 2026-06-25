# Miru App — Notificaciones

---

## Descripción general

Centro de notificaciones de la app. Agrupa eventos importantes del grupo familiar: nuevos movimientos, pagos de deudas, metas alcanzadas, invitaciones, recordatorios. Diseñada para ser escaneada rápidamente — cada notificación comunica el evento, la persona y el tiempo transcurrido.

---

## Layout

- **Fondo:** `#0C0F14`
- **Padding horizontal:** 20px
- **Scroll vertical:** sí
- **Bottom navigation:** oculta (se accede desde el ícono de campana en el Dashboard header)
- **Safe area top:** 56px

---

## Estructura visual (de arriba hacia abajo)

---

### 1. Header
Padding top 56px.

```
← Volver            Notificaciones              [✓]
```

- **Izquierda:** `chevron-left` Lucide, 22px, `#F0F2F5`
- **Centro:** *"Notificaciones"* — Inter 700, 20px, `#F0F2F5`
- **Derecha:** `check-check` Lucide, 20px, `#8A95A8` ("Marcar todas como leídas")

---

### 2. Filtros de notificaciones
Margin top: 16px.

Dos chips lado a lado:
- *"Todas"* — seleccionado por defecto
- *"No leídas"* — muestra solo las no leídas

---

### 3. Lista de notificaciones
Margin top: 12px.

Cada notificación es un item con altura variable según el contenido:

```
[Hoy]                         [·]
┌─────────────────────────────────────┐
│  [💰]  María agregó un gasto       │
│        $ 3.500 en Comidas          │
│        hace 2h                     │
└─────────────────────────────────────┘
```

**Item:**
- Padding: 12px 16px
- Fondo si no leída: `rgba(228,179,233,0.04)` (lavanda muy sutil)
- Fondo si leída: transparente
- Borde inferior: `rgba(255,255,255,0.04)`, 1px

**Elementos:**
- **Separador de fecha:** *"Hoy"*, *"Ayer"*, *"15 jun 2026"* — Inter 500, 12px, `#697586`, padding 8px 0, con línea delgada debajo
- **Indicador de no leído:** círculo de 6px, `#E4B3E9`, alineado a la derecha del header de fecha
- **Ícono izquierdo:** 36×36px, según tipo:

| Tipo | Ícono | Fondo | Color |
|---|---|---|---|
| Gasto nuevo | `arrow-up-right` | `rgba(224,82,82,0.15)` | `#E05252` |
| Ingreso nuevo | `arrow-down-left` | `rgba(21,196,140,0.15)` | `#15C48C` |
| Pago de deuda | `hand-coins` | `rgba(21,196,140,0.15)` | `#15C48C` |
| Meta alcanzada | `trophy` | `rgba(201,154,10,0.15)` | `#C99A0A` |
| Invitación | `user-plus` | `rgba(91,141,239,0.15)` | `#5B8DEF` |
| Recordatorio | `bell` | `rgba(201,154,10,0.15)` | `#C99A0A` |
| Checklist | `check-square` | `rgba(228,179,233,0.15)` | `#E4B3E9` |
| Miembro nuevo | `user-check` | `rgba(21,196,140,0.15)` | `#15C48C` |

- **Título:** Inter 500, 14px, `#F0F2F5`. *"María agregó un gasto"*
- **Cuerpo:** Inter 400, 13px, `#8A95A8`. *"$ 3.500 en Comidas"*
- **Timestamp:** Inter 400, 11px, `#697586`. *"hace 2h"*
- **Punto de no leído** (si corresponde): círculo de 8px, `#E4B3E9`, alineado a la derecha, invisible si ya fue leída

---

### 4. Estado vacío
Centrado verticalmente:

- Ícono: `bell-off` Lucide, 48px, `#697586`, opacidad 0.5
- Texto: *"No hay notificaciones"* — Inter 500, 16px, `#8A95A8`
- Subtexto: *"Las novedades de tu grupo aparecen acá."* — Inter 400, 13px, `#697586`

---

### 5. Estado "Todo leído"
Cuando todas las notificaciones están leídas:

- Misma estructura que la lista
- Todos los items con fondo transparente (sin indicador lavanda)
- Sin puntos de no leído
- Texto informativo al final: *"No hay notificaciones nuevas"* en Inter 400, 13px, `#697586`

---

## Estados

| Estado | Descripción |
|---|---|
| Cargando | Skeleton de 5 items con shimmer |
| Vacío | Estado sin notificaciones |
| No leídas | Items con fondo lavanda y punto indicador |
| Todas leídas | Items sin fondo, sin puntos |
| Error | *"No pudimos cargar las notificaciones"* |

---

## Comportamiento

- Al tocar una notificación: navega a la pantalla relacionada (Dashboard, Deudas, Familia, etc.)
- Al tocar "Marcar todas como leídas": todas las notificaciones cambian a estado leído con animación (desaparecen los puntos)
- Una notificación se marca como leída automáticamente al navegar a ella
- Pull-to-refresh actualiza la lista
- Las notificaciones no leídas se muestran al inicio, ordenadas por fecha descendente
- El badge del Dashboard se actualiza en tiempo real cuando llega una nueva notificación

---

## Notas de diseño

- El fondo lavanda de las no leídas debe ser muy sutil — no debe distraer
- Los íconos por tipo ayudan a identificar el contenido sin leer el texto
- El timestamp relativo ("hace 2h") es más amigable que la fecha exacta
- No usar sonidos ni vibraciones excesivas para notificaciones
- Agrupar notificaciones del mismo tipo (ej. varios gastos seguidos) para no saturar
- En v2: preferencias de notificación por tipo, resumen semanal
