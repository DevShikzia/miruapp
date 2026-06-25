# Miru App — Familia

---

## Descripción general

Pantalla principal del grupo familiar. Muestra los miembros, el balance grupal y las acciones compartidas. Es el centro de la experiencia colaborativa de Miru. Aquí se ve quién está en el grupo, cuánto aporta cada uno y cómo van las finanzas compartidas.

---

## Layout

- **Fondo:** `#0C0F14`
- **Padding horizontal:** 20px
- **Scroll vertical:** sí
- **Bottom navigation:** presente, tab "Familia" activa
- **Safe area top:** 56px

---

## Bottom Navigation

Misma barra que Dashboard. Tab activa: **Familia** — ícono `users`, `#E4B3E9`.

---

## Estructura visual (de arriba hacia abajo)

---

### 1. Header
Padding top 56px.

```
← Volver                Familia               [···]
```

- **Izquierda:** `chevron-left` Lucide, 22px, `#F0F2F5`
- **Centro:** *"Familia"* — Inter 700, 20px, `#F0F2F5`
- **Derecha:** `more-vertical` Lucide, 22px, `#8A95A8` (menú: Editar grupo / Salir del grupo / Invitar)

---

### 2. Card del grupo
Margin top: 16px.

Card con fondo `#161B24`, radio 24px, borde `rgba(255,255,255,0.06)`, padding 20px.

**Avatar grupal** (iniciales o ícono):
- Círculo de 56×56px, fondo `rgba(228,179,233,0.15)`
- Icono `users` Lucide, 28px, `#E4B3E9`

**Nombre del grupo:**
- Inter 700, 22px, `#F0F2F5` — ej: *"Familia García"*
- Miembros: *"4 miembros"* — Inter 400, 13px, `#8A95A8`
- **Badge de plan:** *"Plan Familiar"* — fondo `rgba(228,179,233,0.15)`, texto Inter 500, 11px, `#E4B3E9`, radio 6px, margin-top 8px

---

### 3. Avatares de miembros
Margin top: 16px.

**Fila horizontal de avatares** con solapamiento:

```
[👤A][👤B][👤C][👤D]  [+ Invitar]
```

- Cada avatar: 40×40px, radio 999px, borde 2px `#0C0F14` (para efecto de solapamiento)
- Al tocar avatar: navega a perfil del miembro
- Si no tiene foto: iniciales en círculo con color asignado aleatorio de la paleta `#E4B3E9`, `#5B8DEF`, `#15C48C`, `#C99A0A`
- **Botón "+ Invitar":** fondo `#1E2530`, borde dashed `rgba(255,255,255,0.1)`, ícono `user-plus` Lucide, 16px, `#8A95A8`, texto Inter 500, 13px, `#8A95A8`, radio 999px

---

### 4. Balance del grupo
Margin top: 20px.

- **Header:** *"Balance del grupo"* — Inter 600, 16px, `#F0F2F5`

Card con fondo `#161B24`, radio 20px, borde `rgba(255,255,255,0.06)`, padding 16px.

**Tres stats en fila:**

| Stat | Valor |
|---|---|
| Total ingresado | *"$ 380.000"* — `#15C48C` |
| Total gastado | *"$ 255.500"* — `#E05252` |
| Diferencia | *"$ 124.500"* — `#F0F2F5` |

Cada stat: label Inter 400, 11px, `#8A95A8` | monto Inter 700, 16px, color según semántica

---

### 5. Aportes por miembro
Margin top: 20px.

- **Header:** *"Aportes del mes"* — Inter 600, 16px, `#F0F2F5`

Lista de miembros con su contribución mensual:

```
[👤]  María           Ingresó: $ 200.000   Gastó: $ 120.000
                          #15C48C              #E05252
[👤]  Carlos          Ingresó: $ 100.000   Gastó: $ 90.000
[👤]  Lucía           Ingresó: $ 80.000    Gastó: $ 45.500
```

**Item de miembro:**
- Padding: 12px 0
- Borde inferior: `rgba(255,255,255,0.04)`, 1px
- Avatar 32×32px a la izquierda
- Nombre: Inter 500, 14px, `#F0F2F5`
- Dos montos: Inter 600, 14px, colores semánticos
- **Barra de aporte individual:** delgada (4px), radio 999px, fondo `#1E2530`, relleno
  - Verde `#15C48C` proporcional a ingresos
  - Rojo `#E05252` proporcional a gastos

---

### 6. Actividad reciente del grupo
Margin top: 20px.

- **Header:** *"Actividad reciente"* — Inter 600, 16px, `#F0F2F5`

Items de actividad:
```
[Lucía] agregó un gasto de $ 3.500 en Comidas · hace 2h
[Carlos] marcó la deuda "Banco" como pagada · hace 5h
[María] creó la meta "Viaje a la costa" · ayer
```

- Cada item: Inter 400, 13px, `#8A95A8`. Nombre del miembro en Inter 500, `#F0F2F5`
- Acción en texto plano, timestamp en Inter 400, 11px, `#697586`

---

### 7. Estado vacío (sin grupo)
Si el usuario no pertenece a ningún grupo familiar:

Centrado verticalmente:
- Ícono: `users` Lucide, 48px, `#697586`, opacidad 0.5
- Texto: *"Todavía no forms parte de un grupo familiar"* — Inter 500, 16px, `#8A95A8`
- Subtexto: *"Creá un grupo e invitá a tu familia a usar Miru juntos."* — Inter 400, 13px, `#697586`
- Dos botones:
  - *"Crear grupo"* — Primary, fondo `#E4B3E9`
  - *"Unirme a un grupo"* — Secondary, borde `#E4B3E9`, texto `#E4B3E9`

---

## Estados

| Estado | Descripción |
|---|---|
| Cargando | Skeleton de cards grupales |
| Sin grupo | Estado vacío con dos CTAs |
| Grupo activo | Miembros, balance, actividad visibles |
| Invitación pendiente | Badge en el header: *"Tenés 1 invitación pendiente"* — fondo `rgba(91,141,239,0.15)`, texto `#5B8DEF`, con botón "Ver" |
| Error | *"No pudimos cargar la información del grupo"* |

---

## Comportamiento

- Al tocar un avatar: navega a perfil del miembro
- Al tocar "+ Invitar": abre modal para compartir link de invitación (por WhatsApp, SMS, etc.)
- Al tocar "Ver actividad": navega a feed completo de actividad (vista futura)
- Pull-to-refresh recarga datos del grupo
- El creador del grupo puede eliminar miembros desde el menú "···"

---

## Notas de diseño

- La card del grupo debe sentirse como la "portada" de la familia — personalizada y cálida
- El balance del grupo es información sensible — mostrarlo con claridad pero sin juicios
- Los aportes individuales fomentan la transparencia sin competencia
- La actividad reciente mantiene a todos informados sin necesidad de preguntar
- El estado "sin grupo" debe motivating, no solitario
- En v2: chat grupal integrado, asignación de tareas por miembro, votación de gastos grandes

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
| GET | `/api/family/my` | Obtener grupo del usuario |
| POST | `/api/family` | Crear grupo familiar |

## Dependencias del backend

| Archivo | Ruta | Propósito |
|---|---|---|
| Controller | `controllers/family.controller.ts` | Gestión del grupo familiar |
| Service | `services/family.service.ts` | Reglas de negocio de familia |
| Model | `models/Family.model.ts` | Schema de MongoDB |
