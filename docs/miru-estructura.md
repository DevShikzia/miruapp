# 🗂️ Miru — Estructura del Proyecto

## Organización general (Monorepo)

```
Miru/
├── backend/
├── frontend/
├── shared/
├── .gitignore
├── README.md
└── package.json          → scripts globales del monorepo
```

---

## ⚙️ BACKEND — Node.js + TypeScript + Express

```
backend/
├── src/
│   │
│   ├── config/
│   │   ├── db.ts                → conexión a MongoDB
│   │   ├── env.ts               → variables de entorno tipadas
│   │   └── socket.ts            → configuración de Socket.io
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── family.controller.ts
│   │   ├── income.controller.ts
│   │   ├── expense.controller.ts
│   │   ├── debt.controller.ts
│   │   ├── payment.controller.ts
│   │   ├── saving.controller.ts
│   │   └── notification.controller.ts
│   │
│   ├── models/
│   │   ├── User.model.ts
│   │   ├── Family.model.ts
│   │   ├── Income.model.ts
│   │   ├── Expense.model.ts
│   │   ├── Debt.model.ts
│   │   ├── Payment.model.ts
│   │   ├── Saving.model.ts
│   │   └── Notification.model.ts
│   │
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── family.routes.ts
│   │   ├── income.routes.ts
│   │   ├── expense.routes.ts
│   │   ├── debt.routes.ts
│   │   ├── payment.routes.ts
│   │   ├── saving.routes.ts
│   │   └── notification.routes.ts
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.ts       → verificar JWT
│   │   ├── role.middleware.ts       → admin vs miembro
│   │   ├── rateLimit.middleware.ts  → limitar peticiones
│   │   ├── validate.middleware.ts   → validar body con Zod
│   │   └── error.middleware.ts      → manejo global de errores
│   │
│   ├── services/
│   │   ├── auth.service.ts          → lógica de login/registro
│   │   ├── token.service.ts         → generar y validar JWT
│   │   ├── family.service.ts
│   │   ├── income.service.ts
│   │   ├── expense.service.ts
│   │   ├── debt.service.ts
│   │   ├── saving.service.ts
│   │   └── push.service.ts          → enviar notificaciones push
│   │
│   ├── cron/
│   │   ├── index.ts                 → registrar todas las tareas
│   │   ├── paymentReminder.cron.ts  → aviso día antes del vencimiento
│   │   ├── weeklySummary.cron.ts    → resumen semanal
│   │   └── monthlyReset.cron.ts     → reiniciar checklist mensual
│   │
│   ├── sockets/
│   │   ├── index.ts                 → inicializar eventos
│   │   ├── income.socket.ts         → emitir nuevo ingreso
│   │   ├── expense.socket.ts        → emitir nuevo gasto
│   │   └── payment.socket.ts        → emitir pago realizado
│   │
│   ├── schemas/                     → validaciones Zod
│   │   ├── auth.schema.ts
│   │   ├── income.schema.ts
│   │   ├── expense.schema.ts
│   │   └── debt.schema.ts
│   │
│   └── utils/
│       ├── bcrypt.ts
│       ├── response.ts              → formato estándar de respuesta
│       └── date.ts                  → helpers de fechas
│
├── .env
├── .env.example
├── tsconfig.json
└── package.json
```

---

## 🗄️ MODELOS DE BASE DE DATOS

### User
```typescript
{
  _id, name, email, password,
  platformRole: 'superadmin' | 'agent' | 'user',
  familyId: string | null,
  familyRole: 'family_admin' | 'member' | 'readonly' | null,
  isActive: boolean,
  pushSubscription: object | null,
  createdAt: Date
}
```

### Family
```typescript
{
  _id, name, adminId,
  members: [userId],
  inviteCode, createdAt
}
```

### Income
```typescript
{
  _id, familyId, userId,
  description, amount,
  category, date, createdAt
}
```

### Expense (gasto del día a día)
```typescript
{
  _id, familyId, userId,
  description, amount,
  category, date, createdAt
}
```

### RecurringBill (gasto fijo mensual)
```typescript
{
  _id, familyId, name,
  amount, dueDay, category,
  isPaid, paidAt, paidBy,
  recurring: true, createdAt
}
```

### Debt
```typescript
{
  _id, familyId, name,
  totalAmount, remainingAmount,
  installments, installmentAmount,
  dueDay, payments: [paymentId]
}
```

### Saving
```typescript
{
  _id, familyId, name,
  targetAmount, currentAmount,
  deadline, contributions: [{
    amount: number,
    userId: ObjectId,
    date: Date
  }]
}
```

---

## 🎨 FRONTEND — Angular + TailwindCSS

```
frontend/
├── src/
│   ├── app/
│   │   │
│   │   ├── core/
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts          → redirige si no hay token
│   │   │   │   └── role.guard.ts          → solo admin
│   │   │   ├── interceptors/
│   │   │   │   ├── token.interceptor.ts   → adjunta JWT a cada request
│   │   │   │   └── refresh.interceptor.ts → renueva token si expiró
│   │   │   └── services/
│   │   │       ├── auth.service.ts
│   │   │       ├── socket.service.ts
│   │   │       └── push.service.ts
│   │   │
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   ├── login.component.ts
│   │   │   │   └── login.component.html
│   │   │   ├── register/
│   │   │   └── invite/                    → unirse a familia con código
│   │   │
│   │   ├── dashboard/
│   │   │   ├── dashboard.component.ts
│   │   │   ├── dashboard.component.html
│   │   │   └── widgets/
│   │   │       ├── balance-card/
│   │   │       ├── semaforo/
│   │   │       └── next-payment/
│   │   │
│   │   ├── ingresos/
│   │   │   ├── lista-ingresos/
│   │   │   ├── form-ingreso/
│   │   │   └── ingresos.service.ts
│   │   │
│   │   ├── gastos/
│   │   │   ├── lista-gastos/
│   │   │   ├── form-gasto/
│   │   │   └── gastos.service.ts
│   │   │
│   │   ├── deudas/
│   │   │   ├── lista-deudas/
│   │   │   ├── detalle-deuda/
│   │   │   ├── form-deuda/
│   │   │   └── deudas.service.ts
│   │   │
│   │   ├── checklist/
│   │   │   ├── checklist.component.ts
│   │   │   └── checklist.service.ts
│   │   │
│   │   ├── ahorro/
│   │   │   ├── lista-metas/
│   │   │   ├── form-meta/
│   │   │   └── ahorro.service.ts
│   │   │
│   │   ├── familia/
│   │   │   ├── miembros/
│   │   │   └── configuracion/
│   │   │
│   │   └── shared/
│   │       ├── components/
│   │       │   ├── progress-bar/
│   │       │   ├── badge/
│   │       │   ├── modal/
│   │       │   └── empty-state/
│   │       └── pipes/
│   │           ├── currency-ar.pipe.ts    → formatear $1.000.000
│   │           └── relative-date.pipe.ts  → "hace 2 días", "mañana"
│   │
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   │
│   ├── manifest.webmanifest             → configuración PWA
│   ├── ngsw-config.json                 → service worker (offline)
│   └── styles.css                       → TailwindCSS base
│
├── tailwind.config.js
├── angular.json
└── package.json
```

---

## 🔗 API ENDPOINTS

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/google
```

### Familia
```
POST   /api/family/create
POST   /api/family/join
GET    /api/family/members
DELETE /api/family/member/:id
```

### Ingresos
```
GET    /api/incomes
POST   /api/incomes
PUT    /api/incomes/:id
DELETE /api/incomes/:id
```

### Gastos (Expenses)
```
GET    /api/expenses
POST   /api/expenses
PUT    /api/expenses/:id
DELETE /api/expenses/:id
```

### Deudas
```
GET    /api/debts
POST   /api/debts
PUT    /api/debts/:id
POST   /api/debts/:id/payment
GET    /api/debts/:id/history
```

### Ahorro
```
GET    /api/savings
POST   /api/savings
POST   /api/savings/:id/contribute
DELETE /api/savings/:id
```

### Gastos fijos (RecurringBills)
```
GET    /api/recurring-bills
POST   /api/recurring-bills
PUT    /api/recurring-bills/:id
PATCH  /api/recurring-bills/:id/pay
DELETE /api/recurring-bills/:id
```

### Checklist mensual
```
GET    /api/checklist            → checklist del mes actual
POST   /api/checklist            → agregar tarea personalizada
PATCH  /api/checklist/:id/toggle → marcar/desmarcar tarea
DELETE /api/checklist/:id
```

### Notificaciones
```
GET    /api/notifications         → notificaciones del usuario
PATCH  /api/notifications/read    → marcar todas como leídas
PATCH  /api/notifications/:id/read → marcar una como leída
```

---

## 🚀 DEPLOY

```
Miru/
├── backend/   → Railway (auto-deploy desde GitHub)
├── frontend/  → Vercel  (auto-deploy desde GitHub)
└── DB         → MongoDB Atlas (free tier)
```

### Variables de entorno (.env)
```env
PORT=3000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=clave_secreta_larga
JWT_REFRESH_SECRET=otra_clave_secreta
CLIENT_URL=https://Miru.vercel.app
VAPID_PUBLIC_KEY=...    → notificaciones push
VAPID_PRIVATE_KEY=...
```

---

## 📦 DEPENDENCIAS PRINCIPALES

### Backend
```json
{
  "express": "^4.21",
  "mongoose": "^8.9",
  "jsonwebtoken": "^9.0",
  "bcryptjs": "^2.4",
  "zod": "^3.22",
  "socket.io": "^4.6",
  "node-cron": "^3.0",
  "web-push": "^3.6",
  "helmet": "^7.0",
  "express-rate-limit": "^7.0",
  "cors": "^2.8"
}
```

### Frontend
```json
{
  "@angular/core": "^17.3",
  "@angular/pwa": "^17.3",
  "socket.io-client": "^4.6",
  "tailwindcss": "^3.4",
  "chart.js": "^4.4",
  "ng2-charts": "^5.0"
}
```
