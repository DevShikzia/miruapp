# Miru App — Tipos Compartidos (Shared Types)

> Documentación centralizada de todas las interfaces y tipos utilizados
> tanto en el backend como en el frontend.
> Archivo fuente: `shared/types/` (cada dominio en su propio archivo).
> La API devuelve tipos `*Data` (DTOs de respuesta). Los `I*` son interfaces conceptuales completas.

---

## Convenciones

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Interfaces | PascalCase con prefijo `I` | `IUser`, `IDebt` |
| Tipos (uniones) | PascalCase | `PlatformRole`, `FamilyRole` |
| DTOs de respuesta | PascalCase con sufijo `Data` | `IncomeData`, `FamilyData` |
| DTOs de request | PascalCase con sufijo `Request` | `CreateIncomeRequest` |
| Archivos | kebab-case con sufijo `.types.ts` | `auth.types.ts`, `debt.types.ts` |

---

## 1. Auth (`shared/types/auth.types.ts`)

```typescript
export type PlatformRole = 'superadmin' | 'agent' | 'user'
export type FamilyRole = 'family_admin' | 'member' | 'readonly'

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
  createdAt: string
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
  credential: string
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
  name: string                  // 2-50 caracteres
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
  joinedAt: string
}

// ─── DTOs de respuesta ──────────────────────────────

export interface FamilyMember {
  userId: string
  role: 'family_admin' | 'member' | 'readonly'
  invitedAt: string
  acceptedAt: string | null
}

export interface FamilyData {
  _id: string
  name: string
  inviteCode: string
  members: FamilyMember[]
  createdAt: string
}
```

---

## 3. Income (`shared/types/income.types.ts`)

```typescript
export type IncomeCategory =
  | 'salary' | 'freelance' | 'investment' | 'sale'
  | 'family' | 'loan' | 'refund' | 'other'

export interface IIncome {
  _id: string
  familyId: string
  userId: string
  description: string
  amount: number
  category: IncomeCategory
  date: string                  // "2026-06-15"
  createdAt: string
}

// ─── DTOs ───────────────────────────────────────────

export interface IncomeData {
  _id: string
  familyId: string
  amount: number
  category: string
  description: string
  date: string
  isRecurring: boolean
  createdBy: string
  createdAt: string
}

export type CreateIncomeRequest = Omit<IncomeData, '_id' | 'familyId' | 'createdBy' | 'createdAt'>
export type UpdateIncomeRequest = Partial<CreateIncomeRequest>
```

> Nota: `IIncome` usa `userId`, `IncomeData` usa `createdBy`. La API devuelve `IncomeData`.

---

## 4. Expense (`shared/types/expense.types.ts`)

```typescript
export type ExpenseCategory =
  | 'food' | 'transport' | 'utilities' | 'rent'
  | 'health' | 'education' | 'entertainment' | 'other'

export type PaymentType = 'cash' | 'credit_card' | 'debit_card' | 'transfer'

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

// ─── DTOs ───────────────────────────────────────────

export interface ExpenseData {
  _id: string
  familyId: string
  amount: number
  category: string
  description: string
  date: string
  paymentType: PaymentType
  isEssential: boolean
  createdBy: string
  createdAt: string
}

export type CreateExpenseRequest = Omit<ExpenseData, '_id' | 'familyId' | 'createdBy' | 'createdAt'>
export type UpdateExpenseRequest = Partial<CreateExpenseRequest>
```

---

## 5. RecurringBill (`shared/types/recurring-bill.types.ts`)

```typescript
export type RecurringBillCategory =
  | 'rent' | 'electricity' | 'water' | 'gas'
  | 'internet' | 'insurance' | 'subscription' | 'other'

export type BillFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'

export interface IRecurringBill {
  _id: string
  familyId: string
  name: string
  amount: number
  dueDay: number                // 1-28 (modelo conceptual)
  category: RecurringBillCategory
  isPaid: boolean
  paidAt: string | null
  paidBy: string | null
  recurring: true
  createdAt: string
}

// ─── DTOs (lo que realmente devuelve la API) ────────

export interface RecurringBillData {
  _id: string
  familyId: string
  name: string
  amount: number
  category: string
  frequency: BillFrequency       // weekly, biweekly, monthly, quarterly, yearly
  nextDueDate: string            // YYYY-MM-DD
  isActive: boolean              // true = activo, false = pausado
  createdBy: string
  createdAt: string
}

export type CreateRecurringBillRequest = Omit<RecurringBillData, '_id' | 'familyId' | 'createdBy' | 'createdAt'>
export type UpdateRecurringBillRequest = Partial<CreateRecurringBillRequest>
```

> La implementación real usa `frequency` + `nextDueDate` en lugar de `dueDay` + `isPaid`. El cron job avanza `nextDueDate` automáticamente según la frecuencia.

---

## 6. Debt (`shared/types/debt.types.ts`)

```typescript
export type DebtType = 'fixed' | 'credit'
export type DebtDirection = 'i_owe' | 'they_owe_me'

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
  dueDay: number
  interestRate?: number
  description?: string
  payments: string[]            // array de ObjectIds de pagos
  createdAt: string
}

// ─── DTOs (lo que realmente devuelve la API) ────────

export interface PaymentData {
  id: string
  amount: number
  date: string
  description: string
}

export interface DebtData {
  _id: string
  familyId: string
  type: 'creditor' | 'debtor'   // creditor = me deben, debtor = debo
  personName: string
  totalAmount: number
  description: string
  dueDate: string               // YYYY-MM-DD
  isPaid: boolean
  paidAmount: number
  progress: number              // 0-100 (porcentaje pagado)
  payments: PaymentData[]       // pagos embebidos
  createdBy: string
  createdAt: string
}

export interface CreateDebtRequest {
  type: 'creditor' | 'debtor'
  personName: string
  totalAmount: number
  description?: string
  dueDate?: string
}

export interface CreatePaymentRequest {
  amount: number
  date: string
  description?: string
}
```

> La implementación real simplifica el modelo de deuda: sin cuotas ni interés, con pagos embebidos. `IDebt` es el modelo conceptual completo.

---

## 7. Saving (`shared/types/saving.types.ts`)

```typescript
export type SavingColor =
  | '#C99A0A' | '#15C48C' | '#5B8DEF' | '#9B6EF3' | '#E05252' | '#E4B3E9'

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
  autoSaveDay: number | null
  contributions: ISavingContribution[]
  createdAt: string
}

// ─── DTOs (lo que realmente devuelve la API) ────────

export interface ContributionData {
  id: string
  amount: number
  date: string
}

export interface SavingData {
  _id: string
  familyId: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
  description: string
  progress: number              // 0-100
  contributions: ContributionData[]
  createdBy: string
  createdAt: string
}

export interface CreateSavingRequest {
  name: string
  targetAmount: number
  deadline: string
  description?: string
}

export interface AddContributionRequest {
  amount: number
  date: string
}
```

> La implementación real no incluye `color`, `emoji`, `autoSave` aún — están en el roadmap.

---

## 8. Checklist (`shared/types/checklist.types.ts`)

```typescript
export interface IChecklistItem {
  _id: string
  familyId: string
  name: string
  amount?: number
  dueDay: number
  category?: string
  assignedTo?: string
  isCompleted: boolean
  completedAt: string | null
  completedBy: string | null
  month: string
  isRecurring: boolean
  createdAt: string
}

export interface IChecklistSummary {
  total: number
  completed: number
  percentage: number
  month: string
  streak: number
}

export interface IChecklistResponse {
  items: IChecklistItem[]
  summary: IChecklistSummary
}
```

> La implementación actual es más simple: items agrupados por mes en un solo documento, con `label`/`completed`/`completedBy`/`completedAt`. El modelo `IChecklistItem` es para una futura versión con items individuales.

---

## 9. Notification (`shared/types/notification.types.ts`)

```typescript
export type NotificationType =
  | 'new_expense' | 'new_income' | 'debt_paid' | 'goal_reached'
  | 'invitation' | 'reminder' | 'checklist' | 'new_member'

export interface INotification {
  _id: string
  userId: string
  type: NotificationType
  title: string
  body: string                  // campo `body` en lugar de `message`
  data: Record<string, unknown>
  isRead: boolean
  createdAt: string
}
```

> La implementación real coincide con `INotification`. Disponibles 8 tipos de notificación.

---

## 10. Respuestas genéricas (`shared/types/response.types.ts`)

```typescript
export interface ApiSuccessResponse<T> {
  ok: true
  data: T
  mensaje: string
}

export interface ApiSuccessEmptyResponse {
  ok: true
  mensaje: string
}

export interface ApiPaginatedResponse<T> {
  ok: true
  data: T[]
  total: number
  mensaje: string
}

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
