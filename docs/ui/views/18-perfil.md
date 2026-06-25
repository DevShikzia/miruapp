# Miru App — Perfil

---

## Descripción general

Pantalla de perfil del usuario. Muestra la información personal, estadísticas individuales y acceso a configuración. Funciona como un "centro personal" dentro de la app familiar.

---

## Layout

- **Fondo:** `#0C0F14`
- **Padding horizontal:** 20px
- **Scroll vertical:** sí
- **Bottom navigation:** oculta (se accede desde el ícono de avatar en Dashboard header)
- **Safe area top:** 56px

---

## Estructura visual (de arriba hacia abajo)

---

### 1. Header
Padding top 56px.

```
← Volver               Mi perfil               [⚙️]
```

- **Izquierda:** `chevron-left` Lucide, 22px, `#F0F2F5`
- **Centro:** *"Mi perfil"* — Inter 700, 20px, `#F0F2F5`
- **Derecha:** `settings` Lucide, 22px, `#8A95A8` (navega a Configuración)

---

### 2. Card de perfil
Margin top: 16px.

Card centrada visualmente, fondo `#161B24`, radio 24px, borde `rgba(255,255,255,0.06)`, padding 24px. Contenido centrado.

**Foto de perfil:**
- Círculo de 80×80px, radio 999px
- Si tiene foto: imagen con object-fit cover, borde 3px `rgba(228,179,233,0.3)`
- Si no tiene foto: iniciales en Inter 700, 32px, `#F0F2F5`, fondo `rgba(228,179,233,0.2)`
- Editable: ícono `camera` Lucide, 18px, superpuesto en la esquina inferior derecha del círculo, fondo `#1E2530`, radio 999px, borde 2px `#0C0F14`

**Nombre:** *"María García"* — Inter 700, 24px, `#F0F2F5`, margin-top 12px
**Email:** *"maria@email.com"* — Inter 400, 14px, `#8A95A8`
**Rol en el grupo:** *"Administradora"* — Inter 500, 13px, `#E4B3E9`, fondo `rgba(228,179,233,0.1)`, radio 6px, padding 4px 12px, margin-top 8px

---

### 3. Stats personales
Margin top: 20px.

Card con fondo `#161B24`, radio 20px, borde `rgba(255,255,255,0.06)`, padding 16px.

**Grid de 3 columnas:**

| Columna | Ejemplo |
|---|---|
| *"Miembro desde"* | *"Ene 2026"* |
| *"Movimientos"* | *"47"* |
| *"Racha"* | *"4 meses"* |

Cada columna: label Inter 400, 11px, `#697586` | valor Inter 700, 18px, `#F0F2F5`

---

### 4. Resumen financiero personal
Margin top: 20px.

- **Header:** *"Mis finanzas"* — Inter 600, 16px, `#F0F2F5`

**Dos cards lado a lado:**

**Card Ingresos:**
- Fondo: `#161B24`, radio 16px, padding 14px
- Ícono: `arrow-down-left` Lucide, 20px, `#15C48C`
- Label: *"Ingresos"* — Inter 400, 11px, `#8A95A8`
- Monto: Inter 700, 20px, `#15C48C`

**Card Gastos:**
- Mismo estilo, ícono `arrow-up-right`, color `#E05252`
- Monto: Inter 700, 20px, `#E05252`

---

### 5. Acciones rápidas
Margin top: 20px.

Lista de acciones estilo menú:

| Ícono | Label | Badge | Navegación |
|---|---|---|---|
| `bell` | Notificaciones | *"3"* (no leídas) | `/notificaciones` |
| `check-square` | Checklist mensual | *"5/8"* | `/checklist` |
| `download` | Exportar datos | — | Modal de exportación |
| `user-x` | Salir del grupo | — | Modal de confirmación |

Cada item:
- Padding: 14px 0
- Borde inferior: `rgba(255,255,255,0.04)`, 1px
- Ícono: 20px, `#8A95A8`
- Label: Inter 500, 14px, `#F0F2F5`
- Badge (si aplica): fondo `rgba(228,179,233,0.15)`, texto Inter 500, 11px, `#E4B3E9`, radio 6px, padding 2px 6px
- Flecha `chevron-right` a la derecha, 16px, `#697586`
- Al tocar: navega a la pantalla correspondiente

---

### 6. Botón de cierre de sesión
Margin top: 32px. Centrado.

**"Cerrar sesión"**
- Danger Button: fondo `rgba(224,82,82,0.1)`, borde `rgba(224,82,82,0.2)`, texto `#E05252`, Inter 600, 14px
- Altura: 44px
- Radio: 999px
- Al tocar: modal de confirmación *"¿Estás seguro de cerrar sesión?"* con botones "Cancelar" y "Cerrar sesión"

---

## Estados

| Estado | Descripción |
|---|---|
| Cargando | Skeleton circular + rectángulos |
| Completo | Todos los datos del perfil visibles |
| Editando | Modo edición de nombre/foto (modal) |
| Error | *"No pudimos cargar tu perfil"* |

---

## Comportamiento

- Al tocar la foto de perfil: abre action sheet nativo (Camera / Galería / Ver foto)
- Al tocar "Exportar datos": modal con opciones (PDF / CSV / Excel) y período a exportar
- Al tocar "Salir del grupo": modal de confirmación con advertencia (si es admin, debe transferir el rol)
- Al cerrar sesión: redirección a Login, limpieza de datos locales

---

## Notas de diseño

- El perfil debe sentirse personal y cálido — los stats no deben ser fríos
- La foto de perfil grande y centrada es el ancla visual de la pantalla
- Las acciones rápidas son atajos a pantallas de uso frecuente
- Exportar datos debe ser fácil de encontrar pero no estar en primer plano
- El cierre de sesión debe tener doble confirmación para evitar accidentes
- En v2: tema visual personalizado, estadísticas anuales, logros

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
| POST | `/api/auth/logout` | Cerrar sesión |

## Dependencias del backend

| Archivo | Ruta | Propósito |
|---|---|---|
| Controller | `controllers/auth.controller.ts` | Manejo de sesión |
| Service | `services/auth.service.ts` | Lógica de autenticación |
| Middleware | `middlewares/auth.middleware.ts` | Verificación de JWT |
| Model | `models/User.model.ts` | Schema de usuario |
