# Miru App — Editar Tarjeta de Crédito

---

## Descripción general

Formulario de edición de una tarjeta de crédito existente. Mismos campos que la creación, pero precargados con los datos actuales de la tarjeta. Permite modificar cualquier campo, incluyendo día de cierre y vencimiento.

---

## Layout

- **Fondo:** `#0C0F14`
- **Padding horizontal:** 24px
- **Scroll vertical:** sí
- **Bottom navigation:** oculta
- **Safe area top:** 56px
- **Ruta:** `/tarjetas/:id/editar`

---

## Estructura visual

---

### 1. Header
Padding top 56px.

```
← Volver          Editar tarjeta             [✓]
```

- **Izquierda:** `x` (cerrar) Lucide, 22px, `#8A95A8`
- **Centro:** *"Editar tarjeta"* — Inter 700, 20px, `#F0F2F5`
- **Derecha:** "Guardar" — Inter 600, 14px, `#5B8DEF`. Se habilita si hay cambios

---

### 2. Campos del formulario

Mismos campos que `23-crear-tarjeta.md` pero con valores iniciales cargados desde la API.

| Campo | Precarga |
|-------|----------|
| Nombre | Valor actual de `name` |
| Marca | Marca actual seleccionada |
| Últimos 4 dígitos | Valor actual de `lastFourDigits` |
| Banco | Valor actual de `bankName` |
| Límite de crédito | Valor actual de `creditLimit` |
| Día de cierre | Valor actual de `closingDay` |
| Día de vencimiento | Valor actual de `dueDay` |
| Color | Color actual seleccionado |
| Notas | Valor actual de `notes` |

---

### 3. Botón de eliminar

Margin top: 32px. Separador visual con línea `rgba(255,255,255,0.06)` de 1px arriba.

**"Eliminar tarjeta"**
- Fondo transparente, texto `#E05252`, Inter 500, 13px
- Sin borde, sin radio
- Al tocar: muestra confirmación

**Modal de confirmación:**
```
┌────────────────────────────────┐
│  ⚠️  ¿Eliminar tarjeta?       │
│                                │
│  Se eliminará "Visa Platino".  │
│  Los gastos asociados no se    │
│  eliminarán.                   │
│                                │
│  [Cancelar]    [Eliminar]      │
└────────────────────────────────┘
```

- Fondo del modal: `#1E2530`, radio 20px, padding 24px
- Botón "Eliminar": fondo `#E05252`, texto `#F0F2F5`
- Botón "Cancelar": fondo `#1E2530`, texto `#8A95A8`

---

### 4. Botón guardar

Mismo estilo que creación: fondo `#5B8DEF`, altura 44px, radio 999px.

Deshabilitado hasta que se modifique al menos un campo.

---

## Estados

| Estado | Descripción |
|---|---|
| Cargando | Skeleton del formulario mientras se obtienen los datos |
| Default | Formulario precargado. Botón deshabilitado |
| Modificado | Algún campo cambió. Botón habilitado |
| Guardando | Botón con spiner |
| Error carga | *"No pudimos cargar los datos de la tarjeta"* + botón reintentar |
| Error guardado | *"No pudimos guardar los cambios"* |
| Éxito | Redirección a detalle de tarjeta |

---

## Comportamiento

- Si no hay cambios, el botón "Guardar" permanece deshabilitado
- Al eliminar, redirige a la lista de tarjetas
- No se puede cambiar el `familyId` ni `createdBy`

---

## Endpoints relacionados

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/credit-cards/:id` | Obtener datos actuales |
| PUT | `/api/credit-cards/:id` | Actualizar tarjeta |
| DELETE | `/api/credit-cards/:id` | Eliminar tarjeta |

---

## Dependencias del backend

| Archivo | Ruta | Propósito |
|---|---|---|
| Controller | `controllers/creditCard.controller.ts` | CRUD |
| Service | `services/creditCard.service.ts` | Reglas de negocio |
| Schema | `schemas/credit-card.schema.ts` | Validación Zod |
