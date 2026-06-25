# Miru — Estructura del Proyecto

## Organización general (Monorepo)

```
Miru/
├── backend/
├── frontend/
├── shared/
├── .gitignore
├── README.md
├── package.json          → scripts globales del monorepo
└── AGENTS.md             → contexto para asistentes IA
```

---

## BACKEND — Node.js + TypeScript + Express

```
backend/
├── src/
│   │
│   ├── config/
│   │   ├── db.ts                → conexión a MongoDB
│   │   └── env.ts               → variables de entorno tipadas
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── family.controller.ts
│   │   ├── finance.controller.ts  → incomes, expenses, recurring-bills
│   │   ├── debt.controller.ts
│   │   ├── saving.controller.ts
│   │   └── extra.controller.ts    → dashboard, checklist, notifications
│   │
│   ├── models/
│   │   ├── User.model.ts
│   │   ├── Family.model.ts
│   │   ├── Income.model.ts
│   │   ├── Expense.model.ts
│   │   ├── RecurringBill.model.ts
│   │   ├── Debt.model.ts
│   │   ├── Saving.model.ts
│   │   ├── Checklist.model.ts
│   │   └── Notification.model.ts
│   │
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── family.routes.ts
│   │   ├── finance.routes.ts      → incomes, expenses, recurring-bills
│   │   ├── debt.routes.ts
│   │   ├── saving.routes.ts
│   │   └── extra.routes.ts        → dashboard, checklist, notifications
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
│   │   ├── family.service.ts
│   │   ├── income.service.ts
│   │   ├── expense.service.ts
│   │   ├── recurringBill.service.ts
│   │   ├── debt.service.ts
│   │   ├── saving.service.ts
│   │   ├── checklist.service.ts
│   │   ├── notification.service.ts
│   │   ├── dashboard.service.ts
│   │   ├── cron.service.ts          → tareas programadas (node-cron)
│   │   └── socket.service.ts        → inicializar eventos Socket.io
│   │
│   ├── schemas/                     → validaciones Zod
│   │   ├── auth.schema.ts
│   │   ├── family.schema.ts
│   │   ├── finance.schema.ts        → incomes, expenses, recurring-bills
│   │   ├── debt.schema.ts
│   │   ├── saving.schema.ts
│   │   └── extra.schema.ts          → checklist, notifications
│   │
│   ├── utils/
│   │   ├── bcrypt.ts
│   │   ├── jwt.ts
│   │   ├── response.ts              → formato estándar de respuesta
│   │   ├── errors.ts                → clases de error personalizadas
│   │   ├── date.ts                  → helpers de fechas
│   │   └── logger.ts                → logging estructurado
│   │
│   └── scripts/
│       └── seed.ts                  → datos de prueba
│
├── .env
├── .env.example
├── tsconfig.json
└── package.json
```

---

## MODELOS DE BASE DE DATOS

### User
```typescript
{
  _id, name, email, password, googleId,
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
  _id, name,
  inviteCode: string,
  members: [{
    userId, role: 'family_admin' | 'member' | 'readonly',
    invitedAt: Date, acceptedAt: Date | null
  }],
  createdAt, updatedAt
}
```

### Income
```typescript
{
  _id, familyId, createdBy,
  amount, category, description, date,
  isRecurring: boolean,
  createdAt
}
```

### Expense
```typescript
{
  _id, familyId, createdBy,
  amount, category, description, date,
  paymentType: 'cash' | 'credit_card' | 'debit_card' | 'transfer',
  isEssential: boolean,
  createdAt
}
```

### RecurringBill
```typescript
{
  _id, familyId, createdBy,
  name, amount, category,
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly',
  nextDueDate: string,
  isActive: boolean,
  createdAt
}
```

### Debt
```typescript
{
  _id, familyId, createdBy,
  type: 'creditor' | 'debtor',
  personName, totalAmount, description, dueDate, isPaid,
  payments: [{ amount, date, description }],
  createdAt
}
```

### Saving
```typescript
{
  _id, familyId, createdBy,
  name, targetAmount, currentAmount, deadline, description,
  contributions: [{ amount, date }],
  createdAt
}
```

### Checklist
```typescript
{
  _id, familyId, month,
  items: [{
    label, completed, completedBy, completedAt
  }],
  createdAt, updatedAt
}
```

### Notification
```typescript
{
  _id, userId,
  type: 'new_expense' | 'new_income' | 'debt_paid' | 'goal_reached'
      | 'invitation' | 'reminder' | 'checklist' | 'new_member',
  title, body, data,
  isRead, createdAt
}
```

---

## FRONTEND — Angular + TailwindCSS

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
│   │   │       └── socket.service.ts
│   │   │
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── invite/                    → unirse a familia con código
│   │   │
│   │   ├── dashboard/
│   │   │   └── widgets/
│   │   │       ├── balance-card/
│   │   │       ├── semaforo/
│   │   │       └── next-payment/
│   │   │
│   │   ├── finanzas/
│   │   │   ├── movimientos/
│   │   │   ├── form-ingreso/
│   │   │   ├── form-gasto/
│   │   │   ├── recurrentes/
│   │   │   └── finanzas.service.ts
│   │   │
│   │   ├── deudas/
│   │   │   ├── lista-deudas/
│   │   │   ├── detalle-deuda/
│   │   │   ├── form-deuda/
│   │   │   └── deudas.service.ts
│   │   │
│   │   ├── ahorro/
│   │   │   ├── lista-metas/
│   │   │   ├── form-meta/
│   │   │   └── ahorro.service.ts
│   │   │
│   │   ├── checklist/
│   │   │   └── checklist.service.ts
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

## API ENDPOINTS

### Auth (`/api/auth`)
```
POST   /api/auth/register         → registrar usuario
POST   /api/auth/login            → iniciar sesión
POST   /api/auth/logout           → cerrar sesión (requiere auth)
POST   /api/auth/refresh          → renovar access token
POST   /api/auth/google           → login con Google OAuth
```

### Familia (`/api/family`)
```
GET    /api/family/my             → obtener grupo del usuario
POST   /api/family                → crear grupo familiar
POST   /api/family/join           → unirse con código de invitación
POST   /api/family/invite         → invitar miembro (admin)
POST   /api/family/respond-invite → aceptar/rechazar invitación
DELETE /api/family/:familyId/members/:userId  → eliminar miembro (admin)
```

### Finanzas (`/api/finance`)
```
POST   /api/finance/incomes       → crear ingreso
GET    /api/finance/incomes       → listar ingresos
GET    /api/finance/incomes/:id   → detalle de ingreso
PUT    /api/finance/incomes/:id   → actualizar ingreso
DELETE /api/finance/incomes/:id   → eliminar ingreso

POST   /api/finance/expenses      → crear gasto
GET    /api/finance/expenses      → listar gastos
PUT    /api/finance/expenses/:id  → actualizar gasto
DELETE /api/finance/expenses/:id  → eliminar gasto

POST   /api/finance/recurring-bills       → crear gasto recurrente
GET    /api/finance/recurring-bills       → listar recurrentes
PATCH  /api/finance/recurring-bills/:id/toggle  → activar/desactivar
DELETE /api/finance/recurring-bills/:id   → eliminar recurrente
```

### Deudas (`/api/debts`)
```
GET    /api/debts                 → listar deudas
GET    /api/debts/:id             → detalle de deuda
POST   /api/debts                 → crear deuda
PUT    /api/debts/:id             → actualizar deuda
DELETE /api/debts/:id             → eliminar deuda
POST   /api/debts/:id/payments    → agregar pago
PUT    /api/debts/:id/payments/:paymentIndex   → editar pago
DELETE /api/debts/:id/payments/:paymentIndex   → eliminar pago
```

### Ahorro (`/api/savings`)
```
GET    /api/savings               → listar metas
GET    /api/savings/:id           → detalle de meta
POST   /api/savings               → crear meta
PUT    /api/savings/:id           → actualizar meta
DELETE /api/savings/:id           → eliminar meta
POST   /api/savings/:id/contributions        → agregar aporte
DELETE /api/savings/:id/contributions/:index  → eliminar aporte
```

### Dashboard / Checklist / Notificaciones (`/api`)
```
GET    /api/dashboard                    → resumen del dashboard
GET    /api/checklist                    → checklist del mes actual
PATCH  /api/checklist/:month/items/:itemId  → marcar/desmarcar tarea
GET    /api/notifications                → notificaciones del usuario
GET    /api/notifications/unread-count   → cantidad no leídas
PATCH  /api/notifications/:id/read       → marcar una como leída
PATCH  /api/notifications/read-all       → marcar todas como leídas
```

### Health
```
GET    /api/health                → health check
```

---

## DEPLOY

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

## DEPENDENCIAS PRINCIPALES

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
