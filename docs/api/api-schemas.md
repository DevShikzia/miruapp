# Miru App — API Schemas

> Documentación completa de todos los endpoints de la API REST.
> Formato de respuesta estándar definido en `shared/types/response.types.ts`.
> Todas las fechas en ISO 8601 a menos que se especifique lo contrario.

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
  "page": 1,
  "limit": 20,
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

**Auth:** Requiere Bearer token

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

Inicia sesión o registra un usuario mediante Google OAuth. Recibe el credential token de Google Identity Services.

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

#### `POST /api/family/create`

Crea un grupo familiar. El usuario que crea pasa a ser `family_admin`.

**Auth:** ✅ Requiere Bearer token

**Request body:**
| Campo | Tipo | Obligatorio | Validación |
|-------|------|:-----------:|------------|
| `name` | `string` | ✅ | 2-30 caracteres |

**Response `201` — Success:**
```json
{
  "ok": true,
  "data": {
    "family": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Familia García",
      "adminId": "507f1f77bcf86cd799439011",
      "members": ["507f1f77bcf86cd799439011"],
      "inviteCode": "aB3kF9zW",
      "createdAt": "2026-06-25T14:30:00.000Z"
    }
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
    "family": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Familia García",
      "adminId": "507f1f77bcf86cd799439011",
      "members": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439013"],
      "inviteCode": "aB3kF9zW"
    }
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

#### `GET /api/family/members`

Obtiene la lista de miembros de la familia del usuario autenticado.

**Auth:** ✅ Requiere Bearer token
**Roles:** `family_admin`, `member`, `readonly`

**Response `200` — Success:**
```json
{
  "ok": true,
  "data": {
    "family": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Familia García"
    },
    "members": [
      {
        "userId": {
          "_id": "507f1f77bcf86cd799439011",
          "name": "María García",
          "email": "maria@email.com"
        },
        "role": "family_admin",
        "joinedAt": "2026-06-25T14:30:00.000Z"
      },
      {
        "userId": {
          "_id": "507f1f77bcf86cd799439013",
          "name": "Carlos García",
          "email": "carlos@email.com"
        },
        "role": "member",
        "joinedAt": "2026-06-25T15:00:00.000Z"
      }
    ],
    "balance": {
      "totalIncome": 380000,
      "totalExpense": 255500,
      "netBalance": 124500
    }
  },
  "mensaje": "Miembros obtenidos correctamente"
}
```

---

#### `DELETE /api/family/member/:id`

Elimina un miembro de la familia.

**Auth:** ✅ Requiere Bearer token
**Roles:** `family_admin`

**Path params:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | `string` | ObjectId del miembro a eliminar |

**Response `200` — Success:**
```json
{
  "ok": true,
  "mensaje": "Miembro eliminado de la familia"
}
```

**Response `403` — No autorizado:**
```json
{
  "ok": false,
  "error": "Solo el administrador puede eliminar miembros"
}
```

---

### 3. Ingresos

> Todos los endpoints de Ingresos requieren autenticación y membresía familiar.

---

#### `GET /api/incomes`

Obtiene los ingresos del grupo familiar, con opción de filtrado.

**Auth:** ✅ Requiere Bearer token
**Roles:** `family_admin`, `member`, `readonly`

**Query params:**
| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|:-----------:|-------------|
| `page` | `number` | ❌ | Default: 1 |
| `limit` | `number` | ❌ | Default: 20, máximo: 100 |
| `startDate` | `string` | ❌ | ISO 8601, filtrar desde |
| `endDate` | `string` | ❌ | ISO 8601, filtrar hasta |
| `category` | `IncomeCategory` | ❌ | Filtrar por categoría |
| `userId` | `string` | ❌ | Filtrar por miembro |

**Response `200` — Success:**
```json
{
  "ok": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "familyId": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439011",
      "description": "Sueldo de junio",
      "amount": 380000,
      "category": "salary",
      "date": "2026-06-05T00:00:00.000Z",
      "createdAt": "2026-06-05T10:30:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20,
  "mensaje": "Ingresos obtenidos correctamente"
}
```

---

#### `POST /api/incomes`

Crea un nuevo ingreso.

**Auth:** ✅ Requiere Bearer token
**Roles:** `family_admin`, `member`

**Request body:**
| Campo | Tipo | Obligatorio | Validación |
|-------|------|:-----------:|------------|
| `amount` | `number` | ✅ | > 0, máximo 10 dígitos |
| `category` | `IncomeCategory` | ✅ | Ver tipos en shared-types |
| `description` | `string` | ❌ | Máximo 100 caracteres |
| `date` | `string` | ❌ | ISO 8601, default: now |
| `userId` | `string` | ❌ | Default: current user (solo family_admin puede asignar a otro) |

**Response `201` — Success:**
```json
{
  "ok": true,
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "familyId": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "description": "Sueldo de junio",
    "amount": 380000,
    "category": "salary",
    "date": "2026-06-05T00:00:00.000Z",
    "createdAt": "2026-06-05T10:30:00.000Z"
  },
  "mensaje": "Ingreso registrado correctamente"
}
```

**Response `400` — Validation error:**
```json
{
  "ok": false,
  "error": "Error de validación",
  "detalles": [
    { "campo": "amount", "mensaje": "El monto debe ser mayor a 0" }
  ]
}
```

---

#### `PUT /api/incomes/:id`

Actualiza un ingreso existente.

**Auth:** ✅ Requiere Bearer token
**Roles:** `family_admin` (cualquiera) o `member` (solo propios)

**Request body:** Mismos campos que `POST /api/incomes`, todos opcionales.

**Response `200` — Success:**
```json
{
  "ok": true,
  "data": { /* IIncome actualizado */ },
  "mensaje": "Ingreso actualizado correctamente"
}
```

**Response `403` — No autorizado (member editando de otro):**
```json
{
  "ok": false,
  "error": "No podés editar un ingreso que no registraste"
}
```

---

#### `DELETE /api/incomes/:id`

Elimina un ingreso.

**Auth:** ✅ Requiere Bearer token
**Roles:** `family_admin` (cualquiera) o `member` (solo propios)

**Response `200` — Success:**
```json
{
  "ok": true,
  "mensaje": "Ingreso eliminado correctamente"
}
```

---

### 4. Gastos

---

#### `GET /api/expenses`

Obtiene los gastos del grupo familiar.

**Auth:** ✅ Requiere Bearer token
**Roles:** `family_admin`, `member`, `readonly`

**Query params:** Mismos que ingresos (`page`, `limit`, `startDate`, `endDate`, `category`, `userId`).

**Response `200` — Success:**
```json
{
  "ok": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439030",
      "familyId": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439011",
      "description": "Supermercado",
      "amount": 12500,
      "category": "food",
      "date": "2026-06-15T00:00:00.000Z",
      "createdAt": "2026-06-15T10:30:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20,
  "mensaje": "Gastos obtenidos correctamente"
}
```

---

#### `POST /api/expenses`

Crea un nuevo gasto.

**Auth:** ✅ Requiere Bearer token
**Roles:** `family_admin`, `member`

**Request body:**
| Campo | Tipo | Obligatorio | Validación |
|-------|------|:-----------:|------------|
| `amount` | `number` | ✅ | > 0 |
| `category` | `ExpenseCategory` | ✅ | Ver tipos en shared-types |
| `paymentType` | `string` | ✅ | `cash` / `credit_card` / `debit_card` / `transfer` |
| `description` | `string` | ❌ | Máximo 100 caracteres |
| `date` | `string` | ❌ | ISO 8601, default: now |

**Response `201` — Success:**
```json
{
  "ok": true,
  "data": { /* IExpense */ },
  "mensaje": "Gasto registrado correctamente"
}
```

---

#### `PUT /api/expenses/:id`
#### `DELETE /api/expenses/:id`

Mismas reglas que Ingresos: `family_admin` puede editar/eliminar cualquier gasto, `member` solo los propios.

---

### 5. Gastos Fijos (RecurringBills)

---

#### `GET /api/recurring-bills`

Obtiene los gastos fijos del mes actual.

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
      "dueDay": 5,
      "category": "rent",
      "isPaid": false,
      "paidAt": null,
      "paidBy": null,
      "recurring": true,
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ],
  "mensaje": "Gastos fijos obtenidos correctamente"
}
```

---

#### `POST /api/recurring-bills`

Crea un nuevo gasto fijo recurrente.

**Auth:** ✅ Requiere Bearer token
**Roles:** `family_admin`, `member`

**Request body:**
| Campo | Tipo | Obligatorio | Validación |
|-------|------|:-----------:|------------|
| `name` | `string` | ✅ | 2-50 caracteres |
| `amount` | `number` | ✅ | > 0 |
| `dueDay` | `number` | ✅ | 1-28 |
| `category` | `RecurringBillCategory` | ✅ | Ver tipos en shared-types |

---

#### `PATCH /api/recurring-bills/:id/pay`

Marca un gasto fijo como pagado.

**Auth:** ✅ Requiere Bearer token
**Roles:** `family_admin`, `member`

**Response `200` — Success:**
```json
{
  "ok": true,
  "data": {
    "_id": "507f1f77bcf86cd799439040",
    "isPaid": true,
    "paidAt": "2026-06-05T10:00:00.000Z",
    "paidBy": "507f1f77bcf86cd799439011"
  },
  "mensaje": "Gasto fijo marcado como pagado"
}
```

---

#### `PUT /api/recurring-bills/:id`
#### `DELETE /api/recurring-bills/:id`

Actualiza o elimina un gasto fijo.

---

### 6. Deudas

---

#### `GET /api/debts`

Obtiene las deudas del grupo familiar.

**Auth:** ✅ Requiere Bearer token
**Roles:** `family_admin`, `member`, `readonly`

**Query params:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `status` | `string` | `active` / `paid` / `all` (default: `active`) |
| `page` | `number` | Default: 1 |
| `limit` | `number` | Default: 20 |

**Response `200` — Success:**
```json
{
  "ok": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439050",
      "familyId": "507f1f77bcf86cd799439012",
      "name": "Préstamo banco",
      "direction": "i_owe",
      "type": "credit",
      "totalAmount": 85000,
      "remainingAmount": 39000,
      "installments": 12,
      "installmentAmount": 7083,
      "dueDay": 15,
      "interestRate": 3.5,
      "payments": ["507f1f77bcf86cd799439051"]
    }
  ],
  "mensaje": "Deudas obtenidas correctamente"
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
| `name` | `string` | ✅ | 2-50 caracteres |
| `direction` | `string` | ✅ | `i_owe` / `they_owe_me` |
| `type` | `string` | ✅ | `fixed` / `credit` |
| `totalAmount` | `number` | ✅ | > 0 |
| `installments` | `number` | ✅ | 1-36 |
| `dueDay` | `number` | ✅ | 1-28 |
| `interestRate` | `number` | ❌ | Obligatorio si type = `credit` |
| `description` | `string` | ❌ | Máximo 200 caracteres |

**Response `201` — Success:**
```json
{
  "ok": true,
  "data": { /* IDebt */ },
  "mensaje": "Deuda registrada correctamente"
}
```

---

#### `PUT /api/debts/:id`

Actualiza una deuda existente.

**Auth:** ✅ Requiere Bearer token
**Roles:** `family_admin` (cualquiera) o `member` (solo propias)

---

#### `POST /api/debts/:id/payment`

Registra un pago a una deuda.

**Auth:** ✅ Requiere Bearer token
**Roles:** `family_admin`, `member`

**Request body:**
| Campo | Tipo | Obligatorio | Validación |
|-------|------|:-----------:|------------|
| `amount` | `number` | ✅ | > 0, <= remainingAmount |
| `date` | `string` | ❌ | ISO 8601, default: now |
| `description` | `string` | ❌ | Ej: "Pago cuota 5/12" |

**Response `201` — Success:**
```json
{
  "ok": true,
  "data": {
    "payment": { /* IPayment */ },
    "remainingAmount": 31917,
    "progress": 62
  },
  "mensaje": "Pago registrado correctamente"
}
```

---

#### `GET /api/debts/:id/history`

Obtiene el detalle completo de una deuda con su historial de pagos.

**Auth:** ✅ Requiere Bearer token
**Roles:** `family_admin`, `member`, `readonly`

**Response `200` — Success:**
```json
{
  "ok": true,
  "data": {
    "debt": { /* IDebt */ },
    "payments": [ /* IPayment[] */ ],
    "progress": 54
  },
  "mensaje": "Detalle de deuda obtenido correctamente"
}
```

---

### 7. Ahorros

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
      "color": "#C99A0A",
      "emoji": "🏖️",
      "deadline": "2026-12-31T00:00:00.000Z",
      "autoSave": true,
      "autoSaveAmount": 5000,
      "autoSaveDay": 1,
      "contributions": [
        { "amount": 5000, "userId": "507f1f77bcf86cd799439011", "date": "2026-06-01T00:00:00.000Z" }
      ]
    }
  ],
  "mensaje": "Metas de ahorro obtenidas correctamente"
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
| `name` | `string` | ✅ | 2-40 caracteres |
| `targetAmount` | `number` | ✅ | > 0 |
| `emoji` | `string` | ❌ | Default: "🏖️" |
| `color` | `string` | ❌ | Default: "#C99A0A". Valores: `#C99A0A`, `#15C48C`, `#5B8DEF`, `#9B6EF3`, `#E05252`, `#E4B3E9` |
| `deadline` | `string` | ❌ | ISO 8601 |
| `autoSave` | `boolean` | ❌ | Default: false |
| `autoSaveAmount` | `number` | ❌ | Obligatorio si autoSave = true |
| `autoSaveDay` | `number` | ❌ | 1-28, obligatorio si autoSave = true |

---

#### `POST /api/savings/:id/contribute`

Aporta dinero a una meta de ahorro.

**Auth:** ✅ Requiere Bearer token
**Roles:** `family_admin`, `member`

**Request body:**
| Campo | Tipo | Obligatorio | Validación |
|-------|------|:-----------:|------------|
| `amount` | `number` | ✅ | > 0 |
| `date` | `string` | ❌ | ISO 8601, default: now |

**Response `200` — Success:**
```json
{
  "ok": true,
  "data": {
    "contribution": {
      "amount": 5000,
      "userId": "507f1f77bcf86cd799439011",
      "date": "2026-06-01T00:00:00.000Z"
    },
    "currentAmount": 50000,
    "progress": 42
  },
  "mensaje": "Aporte registrado correctamente"
}
```

---

#### `DELETE /api/savings/:id`

Elimina una meta de ahorro.

**Auth:** ✅ Requiere Bearer token
**Roles:** `family_admin` (cualquiera) o `member` (solo propias)

---

### 8. Checklist Mensual

---

#### `GET /api/checklist`

Obtiene el checklist del mes actual.

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
    "items": [ /* IChecklistItem[] */ ],
    "summary": {
      "total": 8,
      "completed": 5,
      "percentage": 62,
      "month": "2026-06",
      "streak": 4
    }
  },
  "mensaje": "Checklist obtenido correctamente"
}
```

---

#### `POST /api/checklist`

Agrega una tarea personalizada al checklist.

**Auth:** ✅ Requiere Bearer token
**Roles:** `family_admin`, `member`

**Request body:**
| Campo | Tipo | Obligatorio | Validación |
|-------|------|:-----------:|------------|
| `name` | `string` | ✅ | 2-60 caracteres |
| `dueDay` | `number` | ✅ | 1-31 |
| `amount` | `number` | ❌ | Monto asociado |
| `category` | `string` | ❌ | Máximo 30 caracteres |
| `assignedTo` | `string` | ❌ | userId |

---

#### `PATCH /api/checklist/:id/toggle`

Marca o desmarca una tarea del checklist.

**Auth:** ✅ Requiere Bearer token
**Roles:** `family_admin`, `member`

**Response `200` — Success:**
```json
{
  "ok": true,
  "data": {
    "_id": "507f1f77bcf86cd799439070",
    "isCompleted": true,
    "completedAt": "2026-06-15T10:00:00.000Z",
    "completedBy": "507f1f77bcf86cd799439011"
  },
  "mensaje": "Tarea actualizada"
}
```

---

#### `DELETE /api/checklist/:id`

Elimina una tarea personalizada (no las recurrentes del sistema).

**Auth:** ✅ Requiere Bearer token
**Roles:** `family_admin`, `member`

---

### 9. Notificaciones

---

#### `GET /api/notifications`

Obtiene las notificaciones del usuario autenticado.

**Auth:** ✅ Requiere Bearer token

**Query params:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `page` | `number` | Default: 1 |
| `limit` | `number` | Default: 20 |
| `unreadOnly` | `boolean` | Default: false |

**Response `200` — Success:**
```json
{
  "ok": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439080",
      "userId": "507f1f77bcf86cd799439011",
      "type": "new_expense",
      "title": "María agregó un gasto",
      "body": "$ 3.500 en Comidas",
      "data": { "expenseId": "507f1f77bcf86cd799439030" },
      "isRead": false,
      "createdAt": "2026-06-15T10:30:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20,
  "mensaje": "Notificaciones obtenidas correctamente"
}
```

---

#### `PATCH /api/notifications/read`

Marca todas las notificaciones como leídas.

**Auth:** ✅ Requiere Bearer token

**Response `200` — Success:**
```json
{
  "ok": true,
  "mensaje": "Todas las notificaciones marcadas como leídas"
}
```

---

#### `PATCH /api/notifications/:id/read`

Marca una notificación específica como leída.

**Auth:** ✅ Requiere Bearer token

**Response `200` — Success:**
```json
{
  "ok": true,
  "mensaje": "Notificación marcada como leída"
}
```

---

## Resumen de middlewares

| Middleware | Descripción | Se aplica en |
|-----------|-------------|-------------|
| `rateLimit` | 10 req/15 min por IP | Rutas de auth (register, login) |
| `authMiddleware` | Verifica JWT Bearer token | Todas las rutas protegidas |
| `validate(schema)` | Valida body con Zod | Todos los POST/PUT/PATCH |
| `requireFamilyRole(...)` | Verifica rol dentro de la familia | Rutas que requieren membresía |
| `requirePlatformRole(...)` | Verifica rol de plataforma | Rutas de admin/soporte |
| `errorMiddleware` | Manejo global de errores | Todas las rutas |
