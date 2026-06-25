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
| 08 | `08-crear-gasto.md` | Crear gasto | ✅ | 🚧 | Tipo de pago + toggle recurrente. Falta división de gasto entre miembros (v2) |

---

## Pantallas de Deudas

| # | Archivo | Pantalla | Estado Docs | Estado Código | Notas |
|---|---------|----------|:-----------:|:-------------:|-------|
| 09 | `09-deudas.md` | Deudas | ✅ | 🚧 | Lista con barra de progreso. Tags de urgencia. Falta ordenamiento avanzado |
| 10 | `10-crear-deuda.md` | Crear deuda | ✅ | 🚧 | Soporte para crédito con interés. Falta compartir deuda entre miembros (v2) |
| 11 | `11-detalle-deuda.md` | Detalle deuda | ✅ | 🚧 | Historial de pagos + registrar pago. Falta editar cuotas |

---

## Pantallas de Ahorros

| # | Archivo | Pantalla | Estado Docs | Estado Código | Notas |
|---|---------|----------|:-----------:|:-------------:|-------|
| 12 | `12-ahorros.md` | Ahorros | ✅ | 🚧 | Metas visuales con emoji. Falta gráfico de crecimiento (v2) |
| 13 | `13-crear-meta.md` | Crear meta | ✅ | 🚧 | Selector de emoji + ahorro automático. Falta foto personalizada (v2) |

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
| Total de pantallas | 20 |
| Documentadas (✅) | 20 |
| En revisión (🔄) | 0 |
| Pendientes de doc (⬜) | 0 |
| Pendientes de código (🚧) | 20 |
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
