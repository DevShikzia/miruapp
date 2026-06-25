# Miru App — Miembros

---

## Descripción general

Lista detallada de todos los miembros del grupo familiar. Muestra información de cada integrante, su rol dentro del grupo y su actividad financiera. Permite administrar miembros: ver perfiles, cambiar roles y eliminar integrantes (solo el administrador).

---

## Layout

- **Fondo:** `#0C0F14`
- **Padding horizontal:** 20px
- **Scroll vertical:** sí
- **Bottom navigation:** oculta (se accede desde Familia)
- **Safe area top:** 56px

---

## Estructura visual (de arriba hacia abajo)

---

### 1. Header
Padding top 56px.

```
← Familia               Miembros                [+]
```

- **Izquierda:** `chevron-left` Lucide, 22px, `#F0F2F5` (vuelve a Familia)
- **Centro:** *"Miembros"* — Inter 700, 20px, `#F0F2F5`
- **Derecha:** `user-plus` Lucide, 22px, `#E4B3E9` (invitar nuevo miembro)

---

### 2. Contador de miembros
Margin top: 8px.

- *"4 miembros · 1 administrador"* — Inter 400, 12px, `#697586`

---

### 3. Lista de miembros
Margin top: 16px.

Cada miembro se muestra como una **card horizontal**:

```
┌─────────────────────────────────────────────────┐
│  [  ]  Nombre                        Administrador│
│        Última actividad: Hoy · 10:30             │
│  ════════════════════════════════════════════════ │
│        Ingresó: $ 200.000    Gastó: $ 120.000    │
└─────────────────────────────────────────────────┘
```

**Card:**
- Fondo: `#161B24`, radio 20px, borde `rgba(255,255,255,0.06)`, 1px
- Padding: 16px
- Margin bottom: 12px
- Al tocar: navega al perfil del miembro

**Elementos:**
- **Avatar:** 40×40px, radio 999px. Iniciales si no hay foto, con color asignado del grupo
- **Nombre:** Inter 600, 16px, `#F0F2F5`
- **Rol badge:** *"Administrador"* — fondo `rgba(228,179,233,0.15)`, texto Inter 500, 11px, `#E4B3E9`, radio 6px, padding 2px 8px
  - *"Miembro"* — fondo `#1E2530`, texto `#8A95A8`
- **Última actividad:** Inter 400, 12px, `#697586`. Ej: *"Última actividad: Hoy · 10:30"* o *"Sin actividad aún"*
- **Fecha de ingreso:** *"Miembro desde jun 2026"* — Inter 400, 11px, `#697586`
- **Stats financieros:** dos montos en fila, Inter 600, 14px
  - Ingresos: `#15C48C`
  - Gastos: `#E05252`

---

### 4. Miembros pendientes (invitaciones)
Si hay invitaciones enviadas pero no aceptadas, aparecen en una sección separada.

- **Header:** *"Invitaciones pendientes"* — Inter 500, 12px, `#8A95A8`, margin-top 8px

Card especial para invitación:
- Fondo: `#1E2530`, radio 20px, borde dashed 1px `rgba(255,255,255,0.08)`, padding 16px
- Ícono: `clock` Lucide, 18px, `#C99A0A`
- Texto: *"Invitación enviada a maria@email.com"* — Inter 500, 14px, `#F0F2F5`
- Subtexto: *"Pendiente de aceptación · Enviada hace 2 días"* — Inter 400, 12px, `#697586`
- Botón: *"Reenviar"* — Secondary Button pequeño
- Botón: *"Cancelar"* — Danger Button pequeño

---

### 5. Acciones de administrador
Solo visible para el administrador del grupo, al final de la lista:

- **Botón "Salir del grupo":** Danger Button, fondo `rgba(224,82,82,0.15)`, texto `#E05252`, ancho 100%
- **Botón "Eliminar grupo"** (solo si es el único miembro): Danger Button

---

## Estados

| Estado | Descripción |
|---|---|
| Cargando | Skeleton cards |
| Con miembros | Lista normal con cards |
| Con invitaciones | Sección de pendientes visible |
| Solo un miembro | Card única. Texto: *"Invitá a tu familia para empezar a usar Miru juntos"* |
| Error | *"No pudimos cargar los miembros"* |

---

## Comportamiento

- Al tocar una card: navega al perfil público del miembro
- El administrador puede tocar el rol badge de un miembro para cambiarlo (modal de confirmación)
- El administrador puede swipiar a la izquierda sobre un miembro para mostrar opción "Eliminar del grupo"
- Al invitar (+), comparte link vía share sheet nativo
- Las invitaciones expiran después de 7 días

---

## Notas de diseño

- Diferenciar claramente al administrador del resto de miembros
- Las invitaciones pendientes deben ser visibles pero no intrusivas
- El swipe para eliminar debe tener confirmación (modal "¿Estás seguro?")
- El acceso a esta pantalla desde Familia debe ser intuitivo
- Los stats financieros por miembro fomentan transparencia
- En v2: permisos granulares por miembro (solo lectura, puede editar, administrador)
