# Miru App — Registro de Pantallas (UI Views)

---

> Archivo de tracking de todas las vistas de la aplicación.
> Cada pantalla tiene un estado que indica si está documentada, en revisión o pendiente de desarrollar.

---

## Leyenda

| Símbolo | Estado |
|---------|--------|
| ✅ | Completada y documentada |
| 🔄 | En revisión / requiere ajustes |
| ⬜ | Pendiente de documentar |
| 🚧 | Pendiente de desarrollar (código) |

---

## Pantallas de Autenticación

| # | Archivo | Pantalla | Estado Docs | Estado Código | Notas |
|---|---------|----------|:-----------:|:-------------:|-------|
| 01 | `01-splash.md` | Splash | ✅ | 🚧 | Animaciones detalladas. Falta definir assets de logo exactos |
| 02 | `02-onboarding.md` | Onboarding | ✅ | 🚧 | 3 slides. Ilustraciones pendientes de diseñar |
| 03 | `03-login.md` | Login | ✅ | ✅ | Formulario completo + botón "Continuar con Google" |
| 04 | `04-registro.md` | Registro | ✅ | ✅ | Validaciones definidas + botón "Continuar con Google" |

---

## Pantallas de Finanzas

| # | Archivo | Pantalla | Estado Docs | Estado Código | Notas |
|---|---------|----------|:-----------:|:-------------:|-------|
| 05 | `05-dashboard.md` | Dashboard | ✅ | 🚧 | Bottom nav completa. FAB con mini menú. Falta definir widgets configurables |
| 06 | `06-movimientos.md` | Movimientos | ✅ | 🚧 | Filtros por mes/categoría/tipo. Scroll infinito. Falta vista de detalle de movimiento |
| 07 | `07-crear-ingreso.md` | Crear ingreso | ✅ | 🚧 | 8 categorías. Faltan categorías personalizadas (v2) |
| 07b | `07b-editar-ingreso.md` | Editar ingreso | ✅ | 🚧 | PUT `/api/finance/incomes/:id`. Misma UI que creación con campos pre-cargados |
| 08 | `08-crear-gasto.md` | Crear gasto | ✅ | 🚧 | Tipo de pago + toggle recurrente. Falta división de gasto entre miembros (v2) |
| 08b | `08b-editar-gasto.md` | Editar gasto | ✅ | 🚧 | PUT `/api/finance/expenses/:id`. Misma UI que creación con campos pre-cargados |

---

## Pantallas de Gastos Recurrentes

| # | Archivo | Pantalla | Estado Docs | Estado Código | Notas |
|---|---------|----------|:-----------:|:-------------:|-------|
| 21 | `21-recurring-bills.md` | Gastos recurrentes | ✅ | 🚧 | Lista con toggles. CRUD completo en `/api/finance/recurring-bills` |

---

## Pantallas de Tarjetas de Crédito

| # | Archivo | Pantalla | Estado Docs | Estado Código | Notas |
|---|---------|----------|:-----------:|:-------------:|-------|
| 22 | `22-tarjetas.md` | Tarjetas de crédito | ✅ | 🚧 | Lista con resumen de deuda total. Barra de uso vs límite. Nuevo tab en bottom nav |
| 23 | `23-crear-tarjeta.md` | Crear tarjeta | ✅ | 🚧 | Formulario completo. Marca, cierre, vencimiento, color. Campos opcionales |
| 24 | `24-editar-tarjeta.md` | Editar tarjeta | ✅ | 🚧 | PUT `/api/credit-cards/:id`. Precarga + opción de eliminar |
| 25 | `25-detalle-tarjeta.md` | Detalle tarjeta | ✅ | 🚧 | Info + barra de límite + ciclo actual + gastos asociados + próximo pago |

---

## Pantallas de Deudas

| # | Archivo | Pantalla | Estado Docs | Estado Código | Notas |
|---|---------|----------|:-----------:|:-------------:|-------|
| 09 | `09-deudas.md` | Deudas | ✅ | 🚧 | Lista con barra de progreso. Tags de urgencia. Falta ordenamiento avanzado |
| 10 | `10-crear-deuda.md` | Crear deuda | ✅ | 🚧 | Soporte para crédito con interés. Falta compartir deuda entre miembros (v2) |
| 10b | `10b-editar-deuda.md` | Editar deuda | ✅ | 🚧 | PUT `/api/debts/:id`. Monto bloqueado si ya hay pagos |
| 11 | `11-detalle-deuda.md` | Detalle deuda | ✅ | 🚧 | Historial de pagos + registrar pago. Editar/eliminar pagos individuales |

---

## Pantallas de Ahorros

| # | Archivo | Pantalla | Estado Docs | Estado Código | Notas |
|---|---------|----------|:-----------:|:-------------:|-------|
| 12 | `12-ahorros.md` | Ahorros | ✅ | 🚧 | Metas visuales con emoji. Falta gráfico de crecimiento (v2) |
| 13 | `13-crear-meta.md` | Crear meta | ✅ | 🚧 | Selector de emoji + ahorro automático. Falta foto personalizada (v2) |
| 13b | `13b-editar-meta.md` | Editar meta | ✅ | 🚧 | PUT `/api/savings/:id`. Monto objetivo bloqueado si ya hay aportes |

---

## Pantallas de Grupo

| # | Archivo | Pantalla | Estado Docs | Estado Código | Notas |
|---|---------|----------|:-----------:|:-------------:|-------|
| 14 | `14-checklist-mensual.md` | Checklist mensual | ✅ | 🚧 | Tareas recurrentes. Streak mensual. Falta asignar tareas a miembros (v2) |
| 15 | `15-familia.md` | Familia | ✅ | 🚧 | Balance grupal + actividad. Falta chat integrado (v2) |
| 16 | `16-miembros.md` | Miembros | ✅ | 🚧 | Roles e invitaciones. Falta permisos granulares (v2) |

---

## Pantallas de Sistema

| # | Archivo | Pantalla | Estado Docs | Estado Código | Notas |
|---|---------|----------|:-----------:|:-------------:|-------|
| 17 | `17-notificaciones.md` | Notificaciones | ✅ | 🚧 | Tipos de notificación. Falta preferencias de notificación (v2) |
| 18 | `18-perfil.md` | Perfil | ✅ | 🚧 | Stats personales. Falta exportar datos (pendiente definir formato) |
| 19 | `19-configuracion.md` | Configuración | ✅ | 🚧 | Secciones completas. Falta integración con API de preferencias |

---

## Resumen

| Métrica | Valor |
|---------|-------|
| Total de pantallas | 29 |
| Documentadas (✅) | 29 |
| En revisión (🔄) | 0 |
| Pendientes de doc (⬜) | 0 |
| Pendientes de código (🚧) | 29 |
| Features planificadas para v2 | 10 |

---

## Pantallas identificadas para futuras versiones (v2+)

| Pantalla | Prioridad | Descripción |
|----------|:---------:|-------------|
| Recuperación de contraseña | Alta | Flujo de olvido de contraseña (actualmente referenciado desde Login) |
| Detalle de movimiento | Alta | Vista individual de un ingreso/gasto con opciones de editar/eliminar |
| Onboarding de funciones | Media | Tour guiado después del registro para mostrar features clave |
| Resumen semanal/anual | Media | Reporte periódico de finanzas (notificación push + pantalla) |
| Chat grupal | Baja | Comunicación interna del grupo familiar |
| Centro de ayuda/FAQ | Baja | Preguntas frecuentes y soporte |
| Modo oscuro claro | Baja | Actualmente solo dark theme — evaluar demanda |
| Widgets de home screen | Baja | Widgets iOS/Android para ver saldo sin abrir la app |
| Integración bancaria | Baja | Conexión con APIs bancarias para movimientos automáticos |

---

## Assets pendientes

| Asset | Estado | Notas |
|-------|:------:|-------|
| `miru-logo-horizontal.svg` | ⬜ | Definir diseño exacto del isotipo + wordmark |
| `miru-icon.svg` | ⬜ | Isotipo standalone, versión color y monocromática |
| `miru-icon-loading.svg` | ⬜ | Icono animado para estados de carga |
| Ilustraciones Onboarding | ⬜ | 3 ilustraciones estilo flat para slides 1, 2 y 3 |
| Avatars por defecto | ⬜ | Conjunto de avatars generados por iniciales con colores de la paleta |
| Iconos de categorías | ⬜ | 16+ iconos Lucide categorizados para ingresos y gastos |

---

> **Nota:** Este archivo debe actualizarse cada vez que se complete una pantalla o se identifique una nueva.
