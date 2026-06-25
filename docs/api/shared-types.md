# Miru App — Tipos Compartidos (Shared Types)

> Documentación centralizada de todas las interfaces y tipos utilizados
> tanto en el backend como en el frontend.
> Archivo fuente: `shared/types/` (cada dominio en su propio archivo).

---

## Convenciones

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Interfaces | PascalCase con prefijo `I` | `IUser`, `IDebt` |
| Tipos (uniones) | PascalCase | `PlatformRole`, `FamilyRole` |
| DTOs de request | PascalCase con sufijo `Request` | `ICreateIncomeRequest` |
| DTOs de response | PascalCase con sufijo `Response` | `ILoginResponse` |
| Archivos | kebab-case con sufijo `.types.ts` | `user.types.ts`, `debt.types.ts` |

---

## 1. Auth (`shared/types/auth.types.ts`)

```typescript
// ─── Enums / Unions ────────────────────────────────

export type PlatformRole = 'superadmin' | 'agent' | 'user'
export type FamilyRole = 'family_admin' | 'member' | 'readonly'

// ─── Interfaces ────────────────────────────────────

export interface IUser {
  _id: string
  name: string
  email: string
  password: string              // solo en backend, nunca se devuelve
  googleId?: string             // solo para usuarios de Google OAuth
  platformRole: PlatformRole
  familyId: string | null
  familyRole: FamilyRole | null
  isActive: boolean
  pushSubscription: object | null
  createdAt: Date
}

export interface IUserPublic {
  _id: string
  name: string
  email: string
  platformRole: PlatformRole
  familyId: string | null
  familyRole: FamilyRole | null
  isActive: boolean
  createdAt: Date
}

// ─── Auth DTOs ──────────────────────────────────────

export interface IRegisterRequest {
  name: string                  // 2-50 caracteres, solo letras y espacios
  email: string                 // email válido
  password: string              // mínimo 8 chars, al menos 1 letra + 1 número
}

export interface IRegisterResponse {
  user: IUserPublic
  accessToken: string           // JWT, expira en 15 minutos
  refreshToken: string          // JWT, expira en 7 días
}

export interface ILoginRequest {
  email: string
  password: string
}

export interface ILoginResponse {
  user: IUserPublic
  accessToken: string
  refreshToken: string
}

export interface IGoogleLoginRequest {
  credential: string            // token de ID de Google (JWT firmado por Google)
}

export interface IRefreshTokenRequest {
  refreshToken: string
}

export interface IRefreshTokenResponse {
  accessToken: string
  refreshToken: string
}

export interface ILogoutRequest {
  refreshToken: string
}
```

---

## 2. Family (`shared/types/family.types.ts`)

```typescript
export interface IFamily {
  _id: string
  name: string
  adminId: string
  members: string[]             // array de ObjectIds de usuarios
  inviteCode: string
  createdAt: Date
}

export interface ICreateFamilyRequest {
  name: string                  // 2-30 caracteres
}

export interface ICreateFamilyResponse {
  family: IFamily
}

export interface IJoinFamilyRequest {
  inviteCode: string            // código de 8 caracteres
}

export interface IMember {
  userId: IUserPublic
  role: FamilyRole
  joinedAt: Date
}

export interface IFamilyDetail {
  family: IFamily
  members: IMember[]
  balance: {
    totalIncome: number
    totalExpense: number
    netBalance: number
  }
}
```

---

## 3. Income (`shared/types/income.types.ts`)

```typescript
export type IncomeCategory =
  | 'salary'
  | 'freelance'
  | 'investment'
  | 'sale'
  | 'family'
  | 'loan'
  | 'refund'
  | 'other'

export interface IIncome {
  _id: string
  familyId: string
  userId: string
  description: string
  amount: number                // siempre en enteros (centavos: $15000 = 15000)
  category: IncomeCategory
  date: string                  // ISO 8601: "2026-06-15T10:30:00.000Z"
  createdAt: string
}

export interface ICreateIncomeRequest {
  description?: string          // opcional, máximo 100 caracteres
  amount: number                // > 0
  category: IncomeCategory
  date?: string                 // opcional, default: now
  userId?: string               // opcional, default: current user (solo family_admin)
}

export interface IUpdateIncomeRequest {
  description?: string
  amount?: number
  category?: IncomeCategory
  date?: string
}
```

---

## 4. Expense (`shared/types/expense.types.ts`)

```typescript
export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'utilities'
  | 'rent'
  | 'health'
  | 'education'
  | 'entertainment'
  | 'other'

export interface IExpense {
  _id: string
  familyId: string
  userId: string
  description: string
  amount: number
  category: ExpenseCategory
  date: string
  createdAt: string
}

export interface ICreateExpenseRequest {
  description?: string
  amount: number                // > 0
  category: ExpenseCategory
  paymentType: 'cash' | 'credit_card' | 'debit_card' | 'transfer'
  date?: string
  userId?: string               // opcional, default: current user
}

export interface IUpdateExpenseRequest {
  description?: string
  amount?: number
  category?: ExpenseCategory
  paymentType?: 'cash' | 'credit_card' | 'debit_card' | 'transfer'
  date?: string
}
```

---

## 5. RecurringBill (`shared/types/recurring-bill.types.ts`)

```typescript
export type RecurringBillCategory =
  | 'rent'
  | 'electricity'
  | 'water'
  | 'gas'
  | 'internet'
  | 'insurance'
  | 'subscription'
  | 'other'

export interface IRecurringBill {
  _id: string
  familyId: string
  name: string
  amount: number
  dueDay: number                // 1-28, día del mes
  category: RecurringBillCategory
  isPaid: boolean
  paidAt: string | null
  paidBy: string | null         // userId
  recurring: true
  createdAt: string
}

export interface ICreateRecurringBillRequest {
  name: string                  // 2-50 caracteres
  amount: number                // > 0
  dueDay: number                // 1-28
  category: RecurringBillCategory
}

export interface IUpdateRecurringBillRequest {
  name?: string
  amount?: number
  dueDay?: number
  category?: RecurringBillCategory
}
```

---

## 6. Debt (`shared/types/debt.types.ts`)

```typescript
export type DebtType = 'fixed' | 'credit'
export type DebtDirection = 'i_owe' | 'they_owe_me'

export interface IPayment {
  _id: string
  debtId: string
  userId: string
  amount: number
  date: string
  description: string
  createdAt: string
}

export interface IDebt {
  _id: string
  familyId: string
  name: string
  direction: DebtDirection
  type: DebtType
  totalAmount: number
  remainingAmount: number
  installments: number
  installmentAmount: number
  dueDay: number                // 1-28
  interestRate?: number         // solo si type = 'credit', porcentaje mensual
  description?: string
  payments: string[]            // array de ObjectIds de pagos
  createdAt: string
}

export interface ICreateDebtRequest {
  name: string
  direction: DebtDirection
  type: DebtType
  totalAmount: number
  installments: number          // 1-36
  dueDay: number                // 1-28
  interestRate?: number         // obligatorio si type = 'credit'
  description?: string
}

export interface IRegisterPaymentRequest {
  amount: number
  date?: string
  description?: string
}

export interface IDebtDetail {
  debt: IDebt
  payments: IPayment[]
  progress: number              // 0-100 (porcentaje pagado)
}
```

---

## 7. Saving (`shared/types/saving.types.ts`)

```typescript
export type SavingColor = '#C99A0A' | '#15C48C' | '#5B8DEF' | '#9B6EF3' | '#E05252' | '#E4B3E9'

export interface ISavingContribution {
  amount: number
  userId: string
  date: string
}

export interface ISaving {
  _id: string
  familyId: string
  name: string
  targetAmount: number
  currentAmount: number
  color: SavingColor
  emoji: string
  deadline: string | null
  autoSave: boolean
  autoSaveAmount: number | null
  autoSaveDay: number | null    // 1-28
  contributions: ISavingContribution[]
  createdAt: string
}

export interface ICreateSavingRequest {
  name: string
  targetAmount: number
  emoji?: string                // default: "🏖️"
  color?: SavingColor           // default: "#C99A0A"
  deadline?: string             // ISO 8601
  autoSave?: boolean
  autoSaveAmount?: number       // obligatorio si autoSave = true
  autoSaveDay?: number          // 1-28, obligatorio si autoSave = true
}

export interface IContributeRequest {
  amount: number
  date?: string
}
```

---

## 8. Checklist (`shared/types/checklist.types.ts`)

```typescript
export interface IChecklistItem {
  _id: string
  familyId: string
  name: string
  amount?: number
  dueDay: number                // 1-31
  category?: string
  assignedTo?: string           // userId
  isCompleted: boolean
  completedAt: string | null
  completedBy: string | null    // userId
  month: string                 // "2026-06" (YYYY-MM)
  isRecurring: boolean          // si es predefinido o creado por el usuario
  createdAt: string
}

export interface ICreateChecklistItemRequest {
  name: string
  amount?: number
  dueDay: number
  category?: string
  assignedTo?: string
}

export interface IChecklistSummary {
  total: number
  completed: number
  percentage: number
  month: string
  streak: number                // meses consecutivos completados
}
```

---

## 9. Notification (`shared/types/notification.types.ts`)

```typescript
export type NotificationType =
  | 'new_expense'
  | 'new_income'
  | 'debt_paid'
  | 'goal_reached'
  | 'invitation'
  | 'reminder'
  | 'checklist'
  | 'new_member'

export interface INotification {
  _id: string
  userId: string
  type: NotificationType
  title: string
  body: string
  data: Record<string, unknown>  // payload para navegación
  isRead: boolean
  createdAt: string
}
```

---

## 10. Responses genéricas (`shared/types/response.types.ts`)

```typescript
// ─── Respuesta exitosa con datos ───────────────────

export interface ApiSuccessResponse<T> {
  ok: true
  data: T
  mensaje: string
}

// ─── Respuesta exitosa sin datos (DELETE, etc.) ────

export interface ApiSuccessEmptyResponse {
  ok: true
  mensaje: string
}

// ─── Respuesta paginada ────────────────────────────

export interface ApiPaginatedResponse<T> {
  ok: true
  data: T[]
  total: number
  page: number
  limit: number
  mensaje: string
}

// ─── Respuesta de error ────────────────────────────

export interface ApiErrorResponse {
  ok: false
  error: string
  detalles?: ApiErrorDetail[]
}

export interface ApiErrorDetail {
  campo: string
  mensaje: string
}
```
