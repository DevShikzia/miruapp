# Miru App — API Schemas

> Documentación completa de todos los endpoints de la API REST.
> Formato de respuesta estándar definido en `shared/types/response.types.ts`.
> Todas las fechas en ISO 8601 (YYYY-MM-DD) a menos que se especifique lo contrario.

---

## Formato de respuesta estándar

### Éxito con datos — `200` / `201`
```json
{
  "ok": true,
  "data": {},
  "mensaje": "Operación exitosa"
}
```

### Éxito paginado — `200`
```json
{
  "ok": true,
  "data": [],
  "total": 42,
  "mensaje": "Lista obtenida correctamente"
}
```

### Éxito sin datos — `200`
```json
{
  "ok": true,
  "mensaje": "Recurso eliminado"
}
```

### Error de validación — `400`
```json
{
  "ok": false,
  "error": "Error de validación",
  "detalles": [
    { "campo": "email", "mensaje": "El email no es válido" }
  ]
}
```

### Error de autenticación — `401`
```json
{
  "ok": false,
  "error": "Token inválido o expirado"
}
```

### Error de autorización — `403`
```json
{
  "ok": false,
  "error": "No tenés permiso para realizar esta acción"
}
```

### Error de recurso no encontrado — `404`
```json
{
  "ok": false,
  "error": "Recurso no encontrado"
}
```

### Error de conflicto — `409`
```json
{
  "ok": false,
  "error": "El email ya está registrado"
}
```

### Error de servidor — `500`
```json
{
  "ok": false,
  "error": "Error interno del servidor"
}
```

---

## Endpoints

---

### 1. Auth

---

#### `POST /api/auth/register`

Registra un nuevo usuario en la plataforma. No requiere autenticación.

**Rate limit:** 10 solicitudes por IP cada 15 minutos

**Request body:**
| Campo | Tipo | Obligatorio | Validación |
|-------|------|:-----------:|------------|
| `name` | `string` | ✅ | 2-50 caracteres, solo letras y espacios |
| `email` | `string` | ✅ | Email válido, único en el sistema |
| `password` | `string` | ✅ | Mínimo 8 caracteres, al menos 1 letra y 1 número |

**Response `201` — Success:**
```json
{
  "ok": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "María García",
      "email": "maria@email.com",
      "platformRole": "user",
      "familyId": null,
      "familyRole": null,
      "isActive": true,
      "createdAt": "2026-06-25T14:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "mensaje": "Cuenta creada correctamente"
}
```

**Response `409` — Conflict (email existente):**
```json
{
  "ok": false,
  "error": "El email ya está registrado"
}
```

---

#### `POST /api/auth/login`

Inicia sesión con email y contraseña.

**Rate limit:** 10 solicitudes por IP cada 15 minutos

**Request body:**
| Campo | Tipo | Obligatorio | Validación |
|-------|------|:-----------:|------------|
| `email` | `string` | ✅ | Email válido |
| `password` | `string` | ✅ | No vacío |

**Response `200` — Success:**
```json
{
  "ok": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "María García",
      "email": "maria@email.com",
      "platformRole": "user",
      "familyId": "507f1f77bcf86cd799439012",
      "familyRole": "family_admin",
      "isActive": true,
      "createdAt": "2026-06-25T14:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "mensaje": "Inicio de sesión exitoso"
}
```

**Response `401` — Unauthorized:**
```json
{
  "ok": false,
  "error": "Email o contraseña incorrectos"
}
```

---

#### `POST /api/auth/refresh`

Renueva el access token usando el refresh token.

**Rate limit:** 10 solicitudes por IP cada 15 minutos

**Request body:**
| Campo | Tipo | Obligatorio |
|-------|------|:-----------:|
| `refreshToken` | `string` | ✅ |

**Response `200` — Success:**
```json
{
  "ok": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "mensaje": "Token renovado correctamente"
}
```

**Response `401` — Refresh token inválido:**
```json
{
  "ok": false,
  "error": "Refresh token inválido o expirado"
}
```

---

#### `POST /api/auth/logout`

Invalida el refresh token del usuario.

**Auth:** ✅ Requiere Bearer token
**Rate limit:** 10 solicitudes por IP cada 15 minutos

**Request body:**
| Campo | Tipo | Obligatorio |
|-------|------|:-----------:|
| `refreshToken` | `string` | ✅ |

**Response `200` — Success:**
```json
{
  "ok": true,
  "mensaje": "Sesión cerrada correctamente"
}
```

---

#### `POST /api/auth/google`

Inicia sesión o registra un usuario mediante Google OAuth.

**Rate limit:** 10 solicitudes por IP cada 15 minutos

**Request body:**
| Campo | Tipo | Obligatorio | Validación |
|-------|------|:-----------:|------------|
| `credential` | `string` | ✅ | JWT firmado por Google, verificado con `google-auth-library` |

**Flujo backend:**
1. Verificar el token con `OAuth2Client.verifyIdToken()` usando `GOOGLE_CLIENT_ID`
2. Extraer `email`, `name`, `sub` (googleId) del payload verificado
3. Buscar usuario por `googleId` o `email`:
   - Si existe → login (genera accessToken + refreshToken)
   - Si no existe → crear con `name`, `email`, `googleId` + password aleatorio, rol `user`
4. Devolver misma response que login normal

**Response `200` — Success (misma forma que login):**
```json
{
  "ok": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "María García",
      "email": "maria@gmail.com",
      "platformRole": "user",
      "familyId": null,
      "familyRole": null,
      "isActive": true,
      "createdAt": "2026-06-25T14:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "mensaje": "Inicio de sesión exitoso"
}
```

**Response `400` — Token inválido:**
```json
{
  "ok": false,
  "error": "Token de Google inválido"
}
```

---

### 2. Familia

> Todos los endpoints de Familia requieren autenticación.

---

#### `POST /api/family`

Crea un grupo familiar. El usuario que crea pasa a ser `family_admin`.

**Auth:** ✅ Requiere Bearer token

**Request body:**
| Campo | Tipo | Obligatorio | Validación |
|-------|------|:-----------:|------------|
| `name` | `string` | ✅ | 2-50 caracteres |

**Response `201` — Success:**
```json
{
  "ok": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Familia García",
    "inviteCode": "aB3kF9zW",
    "members": [
      {
        "userId": "507f1f77bcf86cd799439011",
        "role": "family_admin",
        "invitedAt": "2026-06-25T14:30:00.000Z",
        "acceptedAt": "2026-06-25T14:30:00.000Z"
      }
    ],
    "createdAt": "2026-06-25T14:30:00.000Z"
  },
  "mensaje": "Familia creada correctamente"
}
```

**Response `409` — El usuario ya pertenece a una familia:**
```json
{
  "ok": false,
  "error": "Ya pertenecés a una familia"
}
```

---

#### `POST /api/family/join`

Se une a una familia existente mediante código de invitación.

**Auth:** ✅ Requiere Bearer token

**Request body:**
| Campo | Tipo | Obligatorio | Validación |
|-------|------|:-----------:|------------|
| `inviteCode` | `string` | ✅ | Código de 8 caracteres alfanumérico |

**Response `200` — Success:**
```json
{
  "ok": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Familia García",
    "inviteCode": "aB3kF9zW",
    "members": [
      { "userId": "507f1f77bcf86cd799439011", "role": "family_admin", "invitedAt": "...", "acceptedAt": "..." },
      { "userId": "507f1f77bcf86cd799439013", "role": "member", "invitedAt": "...", "acceptedAt": "..." }
    ],
    "createdAt": "2026-06-25T14:30:00.000Z"
  },
  "mensaje": "Te uniste a la familia correctamente"
}
```

**Response `404` — Código inválido:**
```json
{
  "ok": false,
  "error": "Código de invitación inválido"
}
```

---

#### `GET /api/family/my`

Obtiene la familia del usuario autenticado con sus miembros.

**Auth:** ✅ Requiere Bearer token

**Response `200` — Success:**
```json
{
  "ok": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Familia García",
    "inviteCode": "aB3kF9zW",
    "members": [
      {
        "userId": "507f1f77bcf86cd799439011",
        "role": "family_admin",
        "invitedAt": "2026-06-25T14:30:00.000Z",
        "acceptedAt": "2026-06-25T14:30:00.000Z"
      }
    ],
    "createdAt": "2026-06-25T14:30:00.000Z"
  },
  "mensaje": "Operación exitosa"
}
```

---

#### `POST /api/family/invite`

Invita a un usuario por email a unirse a la familia.

**Auth:** ✅ Requiere Bearer token
**Roles:** `family_admin`

**Request body:**
| Campo | Tipo | Obligatorio | Validación |
|-------|------|:-----------:|------------|
| `email` | `string` | ✅ | Email del usuario a invitar |
| `role` | `string` | ✅ | `member` o `readonly` |

**Response `200` — Success:**
```json
{
  "ok": true,
  "data": { /* FamilyData */ },
  "mensaje": "Invitación enviada correctamente"
}
```

**Response `404` — Usuario no encontrado:**
```json
{
  "ok": false,
  "error": "Usuario no encontrado"
}
```

---

#### `POST /api/family/respond-invite`

Acepta o rechaza una invitación pendiente.

**Auth:** ✅ Requiere Bearer token

**Request body:**
| Campo | Tipo | Obligatorio | Validación |
|-------|------|:-----------:|------------|
| `inviteId` | `string` | ✅ | ID de la invitación |
| `accept` | `boolean` | ✅ | true = aceptar, false = rechazar |

**Response `200` — Success:**
```json
{
  "ok": true,
  "data": { /* FamilyData */ },
  "mensaje": "Invitación aceptada"
}
```

---

#### `DELETE /api/family/:familyId/members/:userId`

Elimina un miembro de la familia.

**Auth:** ✅ Requiere Bearer token
**Roles:** `family_admin`

**Response `200` — Success:**
```json
{
  "ok": true,
  "mensaje": "Miembro eliminado correctamente"
}
```

---

### 3. Ingresos (`/api/finance/incomes`)

> Todos los endpoints de Ingresos requieren autenticación y membresía familiar.

---

#### `GET /api/finance/incomes`

Obtiene los ingresos del grupo familiar, con opción de filtrado.

**Auth:** ✅ Requiere Bearer token
**Roles:** `family_admin`, `member`, `readonly`

**Query params:**
| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|:-----------:|-------------|
| `startDate` | `string` | ❌ | YYYY-MM-DD, filtrar desde |
| `endDate` | `string` | ❌ | YYYY-MM-DD, filtrar hasta |

**Response `200` — Success:**
```json
{
  "ok": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "familyId": "507f1f77bcf86cd799439012",
      "amount": 380000,
      "category": "salary",
      "description": "Sueldo de junio",
      "date": "2026-06-05",
      "isRecurring": false,
      "createdBy": "507f1f77bcf86cd799439011",
      "createdAt": "2026-06-05T10:30:00.000Z"
    }
  ],
  "total": 1,
  "mensaje": "Operación exitosa"
}
```

---

#### `POST /api/finance/incomes`

Crea un nuevo ingreso.

**Auth:** ✅ Requiere Bearer token
**Roles:** `family_admin`, `member`

**Request body:**
| Campo | Tipo | Obligatorio | Validación |
|-------|------|:-----------:|------------|
| `amount` | `number` | ✅ | > 0 |
| `category` | `string` | ✅ | Ver tipos en shared-types |
| `description` | `string` | ❌ | Máximo 200 caracteres |
| `date` | `string` | ❌ | YYYY-MM-DD, default: hoy |
| `isRecurring` | `boolean` | ❌ | Default: false |

**Response `201` — Success:**
```json
{
  "ok": true,
  "data": { /* IncomeData */ },
  "mensaje": "Ingreso registrado correctamente"
}
```

---

#### `PUT /api/finance/incomes/:id`
#### `DELETE /api/finance/incomes/:id`

Mismas reglas que POST. `family_admin` puede editar/eliminar cualquier ingreso, `member` solo los propios.

---

### 4. Gastos (`/api/finance/expenses`)

---

#### `GET /api/finance/expenses`

Obtiene los gastos del grupo familiar.

**Auth:** ✅ Requiere Bearer token
**Roles:** `family_admin`, `member`, `readonly`

**Query params:** Mismos que ingresos (`startDate`, `endDate`).

**Response `200` — Success:**
```json
{
  "ok": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439030",
      "familyId": "507f1f77bcf86cd799439012",
      "amount": 12500,
      "category": "food",
      "description": "Supermercado",
      "date": "2026-06-15",
      "paymentType": "debit_card",
      "isEssential": true,
      "createdBy": "507f1f77bcf86cd799439011",
      "createdAt": "2026-06-15T10:30:00.000Z"
    }
  ],
  "total": 1,
  "mensaje": "Operación exitosa"
}
```

---

#### `POST /api/finance/expenses`

Crea un nuevo gasto.

**Auth:** ✅ Requiere Bearer token
**Roles:** `family_admin`, `member`

**Request body:**
| Campo | Tipo | Obligatorio | Validación |
|-------|------|:-----------:|------------|
| `amount` | `number` | ✅ | > 0 |
| `category` | `string` | ✅ | Ver tipos en shared-types |
| `description` | `string` | ❌ | Máximo 200 caracteres |
| `date` | `string` | ❌ | YYYY-MM-DD, default: hoy |
| `paymentType` | `string` | ❌ | `cash`, `credit_card`, `debit_card`, `transfer`. Default: `cash` |
| `isEssential` | `boolean` | ❌ | Default: false |

**Response `201` — Success:** Misma estructura que GET.

---

#### `PUT /api/finance/expenses/:id`
#### `DELETE /api/finance/expenses/:id`

Mismas reglas que Ingresos.

---

### 5. Gastos Fijos / Recurrentes (`/api/finance/recurring-bills`)

---

#### `GET /api/finance/recurring-bills`

Obtiene los gastos recurrentes de la familia.

**Auth:** ✅ Requiere Bearer token
**Roles:** `family_admin`, `member`, `readonly`

**Response `200` — Success:**
```json
{
  "ok": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439040",
      "familyId": "507f1f77bcf86cd799439012",
      "name": "Alquiler",
      "amount": 45000,
      "category": "rent",
      "frequency": "monthly",
      "nextDueDate": "2026-07-01",
      "isActive": true,
      "createdBy": "507f1f77bcf86cd799439011",
      "createdAt": "2026-01-01T10:00:00.000Z"
    }
  ],
  "total": 1,
  "mensaje": "Operación exitosa"
}
```

---

#### `POST /api/finance/recurring-bills`

Crea un nuevo gasto recurrente.

**Auth:** ✅ Requiere Bearer token
**Roles:** `family_admin`, `member`

**Request body:**
| Campo | Tipo | Obligatorio | Validación |
|-------|------|:-----------:|------------|
| `name` | `string` | ✅ | 2-100 caracteres |
| `amount` | `number` | ✅ | > 0 |
| `category` | `string` | ✅ | Ver tipos en shared-types |
| `frequency` | `string` | ✅ | `weekly`, `biweekly`, `monthly`, `quarterly`, `yearly` |
| `nextDueDate` | `string` | ✅ | YYYY-MM-DD |

---

#### `PATCH /api/finance/recurring-bills/:id/toggle`

Activa o desactiva un gasto recurrente (alterna `isActive`).

**Auth:** ✅ Requiere Bearer token
**Roles:** `family_admin`, `member`

**Response `200` — Success:**
```json
{
  "ok": true,
  "data": { /* RecurringBillData actualizado */ },
  "mensaje": "Estado actualizado correctamente"
}
```

---

#### `PUT /api/finance/recurring-bills/:id`
#### `DELETE /api/finance/recurring-bills/:id`

Actualiza o elimina un gasto recurrente.

---

### 6. Deudas (`/api/debts`)

---

#### `GET /api/debts`

Obtiene las deudas del grupo familiar.

**Auth:** ✅ Requiere Bearer token
**Roles:** `family_admin`, `member`, `readonly`

**Query params:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `isPaid` | `string` | `"true"` o `"false"`. Filtra por estado |

**Response `200` — Success:**
```json
{
  "ok": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439050",
      "familyId": "507f1f77bcf86cd799439012",
      "type": "debtor",
      "personName": "Carlos",
      "totalAmount": 85000,
      "description": "Préstamo personal",
      "dueDate": "2026-12-31",
      "isPaid": false,
      "paidAmount": 46000,
      "progress": 54,
      "payments": [
        { "id": "0", "amount": 10000, "date": "2026-01-15", "description": "Pago 1" },
        { "id": "1", "amount": 36000, "date": "2026-06-15", "description": "Pago 2" }
      ],
      "createdBy": "507f1f77bcf86cd799439011",
      "createdAt": "2026-01-01T10:00:00.000Z"
    }
  ],
  "total": 1,
  "mensaje": "Operación exitosa"
}
```

---

#### `POST /api/debts`

Crea una nueva deuda.

**Auth:** ✅ Requiere Bearer token
**Roles:** `family_admin`, `member`

**Request body:**
| Campo | Tipo | Obligatorio | Validación |
|-------|------|:-----------:|------------|
| `type` | `string` | ✅ | `creditor` (me deben) o `debtor` (debo) |
| `personName` | `string` | ✅ | 2-100 caracteres |
| `totalAmount` | `number` | ✅ | > 0 |
| `description` | `string` | ❌ | Máximo 200 caracteres |
| `dueDate` | `string` | ❌ | YYYY-MM-DD |

---

#### `POST /api/debts/:id/payments`

Registra un pago a una deuda.

**Auth:** ✅ Requiere Bearer token
**Roles:** `family_admin`, `member`

**Request body:**
| Campo | Tipo | Obligatorio | Validación |
|-------|------|:-----------:|------------|
| `amount` | `number` | ✅ | > 0 |
| `date` | `string` | ✅ | YYYY-MM-DD |
| `description` | `string` | ❌ | Máximo 200 caracteres |

**Response `200` — Success:**
```json
{
  "ok": true,
  "data": { /* DebtData actualizada con progreso */ },
  "mensaje": "Pago registrado correctamente"
}
```

---

#### `PUT /api/debts/:id`
#### `PUT /api/debts/:id/payments/:paymentIndex`
#### `DELETE /api/debts/:id`
#### `DELETE /api/debts/:id/payments/:paymentIndex`

Actualiza/elimina deudas y pagos embebidos.

---

### 7. Ahorros (`/api/savings`)

---

#### `GET /api/savings`

Obtiene las metas de ahorro del grupo familiar.

**Auth:** ✅ Requiere Bearer token
**Roles:** `family_admin`, `member`, `readonly`

**Response `200` — Success:**
```json
{
  "ok": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439060",
      "familyId": "507f1f77bcf86cd799439012",
      "name": "Viaje a la costa",
      "targetAmount": 120000,
      "currentAmount": 45000,
      "deadline": "2026-12-31",
      "description": "Ahorro para vacaciones",
      "progress": 37,
      "contributions": [
        { "id": "0", "amount": 5000, "date": "2026-06-01" }
      ],
      "createdBy": "507f1f77bcf86cd799439011",
      "createdAt": "2026-01-01T10:00:00.000Z"
    }
  ],
  "total": 1,
  "mensaje": "Operación exitosa"
}
```

---

#### `POST /api/savings`

Crea una nueva meta de ahorro.

**Auth:** ✅ Requiere Bearer token
**Roles:** `family_admin`, `member`

**Request body:**
| Campo | Tipo | Obligatorio | Validación |
|-------|------|:-----------:|------------|
| `name` | `string` | ✅ | 2-100 caracteres |
| `targetAmount` | `number` | ✅ | > 0 |
| `deadline` | `string` | ✅ | YYYY-MM-DD |
| `description` | `string` | ❌ | Máximo 200 caracteres |

---

#### `POST /api/savings/:id/contributions`

Aporta dinero a una meta de ahorro.

**Auth:** ✅ Requiere Bearer token
**Roles:** `family_admin`, `member`

**Request body:**
| Campo | Tipo | Obligatorio | Validación |
|-------|------|:-----------:|------------|
| `amount` | `number` | ✅ | > 0 |
| `date` | `string` | ✅ | YYYY-MM-DD |

---

#### `PUT /api/savings/:id`
#### `DELETE /api/savings/:id`
#### `DELETE /api/savings/:id/contributions/:contributionIndex`

---

### 8. Dashboard (`/api/dashboard`)

#### `GET /api/dashboard`

Obtiene el resumen financiero del mes actual para la familia.

**Auth:** ✅ Requiere Bearer token

**Response `200` — Success:**
```json
{
  "ok": true,
  "data": {
    "totalIncomes": 380000,
    "totalExpenses": 255500,
    "balance": 124500,
    "semaforo": "verde",
    "pendingDebts": 2,
    "activeSavings": 1,
    "recurringBills": 3,
    "recentIncomes": [],
    "recentExpenses": []
  },
  "mensaje": "Operación exitosa"
}
```

`semaforo` indica salud financiera: `verde` (balance > 20% ingresos), `amarillo`, `rojo` (balance negativo).

---

### 9. Checklist (`/api/checklist`)

#### `GET /api/checklist`

Obtiene el checklist del mes. Si no existe, se crea con items por defecto.

**Auth:** ✅ Requiere Bearer token
**Roles:** `family_admin`, `member`, `readonly`

**Query params:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `month` | `string` | Formato `YYYY-MM`. Default: mes actual |

**Response `200` — Success:**
```json
{
  "ok": true,
  "data": {
    "_id": "507f1f77bcf86cd799439070",
    "familyId": "507f1f77bcf86cd799439012",
    "month": "2026-06",
    "items": [
      { "_id": "...", "label": "Pagar todas las deudas del mes", "completed": false, "completedBy": null, "completedAt": null },
      { "_id": "...", "label": "Actualizar ingresos del mes", "completed": true, "completedBy": "userId", "completedAt": "2026-06-15T10:00:00.000Z" }
    ],
    "createdAt": "...",
    "updatedAt": "..."
  },
  "mensaje": "Operación exitosa"
}
```

Items por defecto: Pagar deudas, Actualizar ingresos, Revisar gastos recurrentes, Actualizar ahorros, Cerrar resumen mensual.

---

#### `PATCH /api/checklist/:month/items/:itemId`

Marca o desmarca un item del checklist.

**Auth:** ✅ Requiere Bearer token
**Roles:** `family_admin`, `member`

**Response `200` — Success:**
```json
{
  "ok": true,
  "data": { /* IChecklistDocument actualizado */ },
  "mensaje": "Item actualizado correctamente"
}
```

---

### 10. Notificaciones (`/api/notifications`)

#### `GET /api/notifications`

Obtiene las notificaciones del usuario autenticado.

**Auth:** ✅ Requiere Bearer token

**Response `200` — Success:**
```json
{
  "ok": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439080",
      "userId": "507f1f77bcf86cd799439011",
      "type": "reminder",
      "title": "Vence hoy",
      "body": "Hoy vence Alquiler — $45000",
      "data": { "billId": "507f1f77bcf86cd799439040", "amount": 45000 },
      "isRead": false,
      "createdAt": "2026-06-15T08:00:00.000Z"
    }
  ],
  "total": 1,
  "mensaje": "Operación exitosa"
}
```

**Tipos de notificación:** `new_expense`, `new_income`, `debt_paid`, `goal_reached`, `invitation`, `reminder`, `checklist`, `new_member`

---

#### `GET /api/notifications/unread-count`

Obtiene la cantidad de notificaciones no leídas.

**Auth:** ✅ Requiere Bearer token

**Response `200`:**
```json
{
  "ok": true,
  "data": { "count": 3 },
  "mensaje": "Operación exitosa"
}
```

---

#### `PATCH /api/notifications/:id/read`

Marca una notificación específica como leída.

**Auth:** ✅ Requiere Bearer token

**Response `200`:**
```json
{
  "ok": true,
  "mensaje": "Notificación marcada como leída"
}
```

---

#### `PATCH /api/notifications/read-all`

Marca todas las notificaciones como leídas.

**Auth:** ✅ Requiere Bearer token

**Response `200`:**
```json
{
  "ok": true,
  "mensaje": "Todas las notificaciones marcadas como leídas"
}
```

---

### 11. Tarjetas de Crédito (`/api/credit-cards`)

> Todos los endpoints de Tarjetas requieren autenticación y membresía familiar.
> Roles de familia: `family_admin` y `member` pueden crear/editar/eliminar. `readonly` solo puede ver.

---

#### `GET /api/credit-cards`

Obtiene las tarjetas de crédito registradas en la familia.

**Auth:** ✅ Requiere Bearer token
**Roles:** `family_admin`, `member`, `readonly`

**Response `200` — Success:**
```json
{
  "ok": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439090",
      "familyId": "507f1f77bcf86cd799439012",
      "createdBy": "507f1f77bcf86cd799439011",
      "name": "Visa Platino",
      "lastFourDigits": "4523",
      "brand": "visa",
      "closingDay": 15,
      "dueDay": 5,
      "creditLimit": 500000,
      "bankName": "Banco Nación",
      "color": "#5B8DEF",
      "notes": "Usar solo para emergencias",
      "isActive": true,
      "createdAt": "2026-06-01T10:00:00.000Z"
    }
  ],
  "total": 1,
  "mensaje": "Operación exitosa"
}
```

---

#### `POST /api/credit-cards`

Registra una nueva tarjeta de crédito en la familia.

**Auth:** ✅ Requiere Bearer token
**Roles:** `family_admin`, `member`

**Request body:**
| Campo | Tipo | Obligatorio | Validación |
|-------|------|:-----------:|------------|
| `name` | `string` | ✅ | 2-50 caracteres |
| `brand` | `string` | ✅ | `visa`, `mastercard`, `amex`, `other` |
| `closingDay` | `number` | ✅ | 1-28 |
| `dueDay` | `number` | ✅ | 1-28 |
| `lastFourDigits` | `string` | ❌ | 4 dígitos numéricos |
| `creditLimit` | `number` | ❌ | > 0 |
| `bankName` | `string` | ❌ | Máximo 50 caracteres |
| `color` | `string` | ❌ | Hex color (`#RRGGBB`) |
| `notes` | `string` | ❌ | Máximo 200 caracteres |

**Response `201` — Success:**
```json
{
  "ok": true,
  "data": {
    "_id": "507f1f77bcf86cd799439090",
    "familyId": "507f1f77bcf86cd799439012",
    "createdBy": "507f1f77bcf86cd799439011",
    "name": "Visa Platino",
    "brand": "visa",
    "closingDay": 15,
    "dueDay": 5,
    "creditLimit": 500000,
    "bankName": "Banco Nación",
    "color": "#5B8DEF",
    "isActive": true,
    "createdAt": "2026-06-01T10:00:00.000Z"
  },
  "mensaje": "Tarjeta registrada correctamente"
}
```

**Response `400` — Error de validación:**
```json
{
  "ok": false,
  "error": "Error de validación",
  "detalles": [
    { "campo": "closingDay", "mensaje": "El día de cierre debe ser entre 1 y 28" },
    { "campo": "dueDay", "mensaje": "El día de vencimiento debe ser entre 1 y 28" }
  ]
}
```

---

#### `GET /api/credit-cards/:id`

Obtiene el detalle de una tarjeta específica.

**Auth:** ✅ Requiere Bearer token
**Roles:** `family_admin`, `member`, `readonly`

**Response `200` — Success:** Misma estructura que `GET /api/credit-cards` para un solo item.

**Response `404`:**
```json
{
  "ok": false,
  "error": "Tarjeta no encontrada"
}
```

---

#### `PUT /api/credit-cards/:id`

Actualiza los datos de una tarjeta de crédito. Todos los campos son opcionales en la actualización.

**Auth:** ✅ Requiere Bearer token
**Roles:** `family_admin`, `member`

**Request body:** Mismos campos que `POST /api/credit-cards`, todos opcionales.

**Response `200` — Success:**
```json
{
  "ok": true,
  "data": { /* CreditCardData actualizado */ },
  "mensaje": "Tarjeta actualizada correctamente"
}
```

---

#### `DELETE /api/credit-cards/:id`

Elimina una tarjeta de crédito. Los gastos asociados a esta tarjeta conservan el `creditCardId` pero quedan huérfanos (no se eliminan).

**Auth:** ✅ Requiere Bearer token
**Roles:** `family_admin`, `member`

**Response `200` — Success:**
```json
{
  "ok": true,
  "mensaje": "Tarjeta eliminada correctamente"
}
```

---

#### `GET /api/credit-cards/:id/statement`

Obtiene el resumen del ciclo actual de facturación de la tarjeta. El ciclo se calcula automáticamente según el día de cierre de la tarjeta.

**Auth:** ✅ Requiere Bearer token
**Roles:** `family_admin`, `member`, `readonly`

**Query params:**
| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|:-----------:|-------------|
| `month` | `string` | ❌ | Formato `YYYY-MM`. Default: mes actual |

**Response `200` — Success:**
```json
{
  "ok": true,
  "data": {
    "cardId": "507f1f77bcf86cd799439090",
    "cardName": "Visa Platino",
    "periodStart": "2026-06-16",
    "periodEnd": "2026-07-15",
    "dueDate": "2026-08-05",
    "totalAmount": 142500,
    "expenses": [
      {
        "_id": "507f1f77bcf86cd799439091",
        "amount": 85000,
        "category": "food",
        "description": "Cena familiar",
        "date": "2026-06-20",
        "createdBy": "507f1f77bcf86cd799439011"
      },
      {
        "_id": "507f1f77bcf86cd799439092",
        "amount": 57500,
        "category": "entertainment",
        "description": "Streaming anual",
        "date": "2026-07-01",
        "createdBy": "507f1f77bcf86cd799439013"
      }
    ]
  },
  "mensaje": "Operación exitosa"
}
```

---

### 12. Gastos — Campo `creditCardId`

Cuando se crea o actualiza un gasto con `paymentType: 'credit_card'`, se puede especificar opcionalmente a qué tarjeta está asociado mediante el campo `creditCardId`.

**Modificación en `POST /api/finance/expenses`:**
| Campo | Tipo | Obligatorio | Validación |
|-------|------|:-----------:|------------|
| `creditCardId` | `string` | ❌ | Solo válido si `paymentType === 'credit_card'`. Debe ser un ObjectId válido de una tarjeta existente en la familia |

**Response `201` — Success (con tarjeta asociada):**
```json
{
  "ok": true,
  "data": {
    "_id": "507f1f77bcf86cd799439091",
    "familyId": "507f1f77bcf86cd799439012",
    "amount": 85000,
    "category": "food",
    "description": "Cena familiar",
    "date": "2026-06-20",
    "paymentType": "credit_card",
    "creditCardId": "507f1f77bcf86cd799439090",
    "isEssential": false,
    "createdBy": "507f1f77bcf86cd799439011",
    "createdAt": "2026-06-20T22:30:00.000Z"
  },
  "mensaje": "Gasto registrado correctamente"
}
```

---

## Resumen de middlewares

| Middleware | Descripción | Se aplica en |
|-----------|-------------|-------------|
| `authRateLimit` | 10 req/15 min por IP | Todas las rutas de auth |
| `authMiddleware` | Verifica JWT Bearer token | Todas las rutas protegidas |
| `validate(schema)` | Valida body con Zod | Todos los POST/PUT/PATCH |
| `requireFamilyRole(...)` | Verifica rol dentro de la familia | Rutas que requieren membresía (mutaciones) |
| `errorMiddleware` | Manejo global de errores | Todas las rutas |
