# 💰 Miru — Descripción del Proyecto

## ¿Qué es Miru?

Miru es una aplicación web progresiva (PWA) de gestión económica familiar,
diseñada para que una o más personas dentro de un mismo hogar puedan registrar,
visualizar y controlar sus ingresos, gastos, deudas y metas de ahorro en tiempo real
y desde cualquier dispositivo móvil.

---

## ❗ Problema que resuelve

Muchas familias manejan sus finanzas de manera desorganizada:
- Cada miembro gasta sin saber cuánto hay disponible
- Las deudas se pierden de vista y generan intereses innecesarios
- No hay registro claro de cuándo vencen los pagos
- Es difícil ahorrar sin un sistema que lo haga visible
- No existe un lugar compartido donde todos vean el mismo estado financiero

Miru resuelve todo esto en un solo lugar, accesible como app desde el celular.

---

## 🎯 Objetivos

- Centralizar todos los ingresos y egresos del hogar
- Hacer visible el estado financiero en tiempo real para todos los miembros
- Evitar el olvido de pagos con recordatorios automáticos
- Reducir deudas con seguimiento claro de pagos y saldos
- Fomentar el ahorro mediante metas visuales y progresivas
- Ser simple de usar para personas sin conocimientos financieros

---

## 👨‍👩‍👧 A quién está dirigida

- Familias con más de un ingreso
- Hogares con deudas activas (préstamos, tarjetas, financiación)
- Personas que quieren aprender a organizar su economía
- Cualquier grupo que comparta gastos (pareja, compañeros de casa, etc.)

---

## ✨ Funcionalidades

### 🏠 Dashboard principal
- Resumen del mes: ingresos vs gastos
- Semáforo financiero (verde / amarillo / rojo)
- Próximo pago que vence
- Disponible actual estimado
- Acceso rápido a todas las secciones

### 👥 Sistema de familias y miembros
- Crear un grupo familiar con nombre propio
- Invitar miembros por código o link
- Roles: Administrador y Miembro
- Cada miembro puede agregar ingresos y gastos
- El administrador puede editar y eliminar cualquier registro

### 💵 Ingresos
- Registrar ingresos de cualquier fuente (sueldo, freelance, reparto, etc.)
- Asignar el ingreso a un miembro del grupo
- Ver historial de ingresos por mes
- Total acumulado del mes en tiempo real

### 📋 Gastos recurrentes (Recurring Bills)
- Lista de gastos recurrentes con monto y frecuencia (semanal, quincenal, mensual, etc.)
- Activar o desactivar con un toque
- Ver cuáles están activos y cuáles pausados
- Agregar, editar o eliminar gastos fácilmente

### 💳 Deudas
- Registrar cada deuda con monto total, persona y fecha de vencimiento
- Tipo: deuda a pagar (debtor) o cobrar (creditor)
- Barra de progreso visual de cuánto se pagó y cuánto falta
- Historial de pagos realizados por deuda
- Alerta cuando un vencimiento está próximo

### ✅ Checklist mensual
- Lista de todo lo que hay que pagar en el mes
- Fecha límite por ítem
- Asignado a un miembro específico
- Se reinicia automáticamente cada mes

### 🐷 Ahorro y metas
- Crear metas con nombre y monto objetivo
- Registrar aportes parciales
- Barra de progreso visual
- Fecha estimada de cumplimiento

### 🔔 Recordatorios automáticos
- Notificación el día anterior a cada vencimiento
- Recordatorio semanal con resumen de pagos pendientes
- Aviso cuando se registra un nuevo ingreso
- Notificación push en el celular (sin abrir la app)

---

## 🔐 Seguridad

- Registro con email y contraseña
- Contraseñas encriptadas con bcrypt
- Autenticación con JWT (tokens de corta duración)
- Refresh tokens para mantener la sesión activa de forma segura
- Rutas protegidas: solo usuarios autenticados acceden a los datos
- Cada familia solo ve sus propios datos
- Rate limiting para prevenir ataques de fuerza bruta

---

## 📱 Experiencia mobile

- Diseño mobile-first (pensado para celular)
- Instalable en la pantalla de inicio como app nativa (PWA)
- Funciona sin conexión para ver los últimos datos cargados
- Notificaciones push nativas en Android e iOS
- Interfaz oscura, moderna y de alto contraste

---

## ⚡ Tiempo real

- Cuando un miembro registra un pago, todos lo ven al instante
- Sin necesidad de recargar la página
- Indicador de quién está conectado

---

## 🚀 Stack tecnológico

| Capa | Tecnología |
|---|---|
| Backend | Node.js + TypeScript + Express |
| Base de datos | MongoDB + Mongoose |
| Frontend | Angular + TailwindCSS |
| PWA | Angular Service Worker |
| Autenticación | JWT + Refresh Tokens + bcrypt |
| Tiempo real | Socket.io |
| Recordatorios | node-cron + Web Push |
| Deploy | Railway + MongoDB Atlas + Vercel |

---

## 📌 Versión 1.0 — Alcance inicial

- [x] Sistema de registro y login
- [x] Crear y unirse a familia
- [x] Gestión de ingresos
- [x] Gestión de gastos recurrentes
- [x] Seguimiento de deudas
- [x] Checklist mensual de pagos
- [x] Metas de ahorro
- [x] Recordatorios automáticos
- [x] Notificaciones push
- [x] Tiempo real entre miembros
- [x] PWA instalable en celular

---

## 🔮 Versión 2.0 — Ideas futuras

- Exportar resumen mensual en PDF
- Gráficos de evolución mensual y anual
- Categorías de gastos personalizables
- Integración con homebanking (solo lectura)
- Soporte multi-moneda
- App nativa en React Native
