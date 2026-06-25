# 📏 Miru — Reglas de Desarrollo Backend

> Estas reglas son **obligatorias** para todos los que trabajen en el backend.
> Cualquier PR que no las respete será rechazado.

---

## 🚫 PROHIBICIONES ABSOLUTAS

```
❌ Prohibido usar `any` en cualquier parte del código
❌ Prohibido hardcodear credenciales, URLs o claves
❌ Prohibido hacer lógica de negocio dentro de los controllers
❌ Prohibido acceder a la base de datos desde los controllers (solo services)
❌ Prohibido usar console.log en producción (usar el logger)
❌ Prohibido subir archivos .env al repositorio
❌ Prohibido ignorar errores con try/catch vacíos
❌ Prohibido crear endpoints sin middleware de autenticación (salvo rutas públicas explícitas)
❌ Prohibido devolver la contraseña o el refresh token en ninguna respuesta
❌ Prohibido usar callbacks, siempre async/await
```

---

## 📁 ESTRUCTURA Y CARPETAS

- Cada archivo tiene **una sola responsabilidad**
- Los controllers solo reciben la request y llaman al service correspondiente
- Los services contienen toda la lógica de negocio
- Los modelos solo definen el esquema de Mongoose
- Las interfaces y tipos van **únicamente** en `shared/types/`
- Los schemas de validación Zod van en `src/schemas/`
- Los helpers reutilizables van en `src/utils/`
- Los scripts de mantenimiento van en `src/scripts/`

```
✅ controller → llama al service
✅ service    → lógica de negocio, llama al model
✅ model      → solo esquema y tipos de Mongoose
✅ schema     → validación de entrada con Zod
✅ utils      → funciones puras reutilizables
```

---

## 🏷️ TIPADO

- Todo el código debe estar **completamente tipado**
- Prohibido usar `any`, usar `unknown` si el tipo es incierto y luego narrowing
- Todas las interfaces van en `shared/types/` con el sufijo `.types.ts`
- Usar `type` para uniones simples e `interface` para objetos
- Los parámetros de funciones siempre tipados
- El retorno de funciones async siempre tipado como `Promise<TipoRetorno>`

```typescript
// ✅ Correcto
async function obtenerUsuario(id: string): Promise<IUser | null> { ... }

// ❌ Incorrecto
async function obtenerUsuario(id: any) { ... }
```

---

## 📝 COMMITS

Los commits deben seguir este formato en **español**:

```
tipo: descripción corta en presente

Tipos permitidos:
feat     → nueva funcionalidad
fix      → corrección de bug
refactor → refactorización sin cambio de comportamiento
docs     → cambios en documentación
test     → agregar o modificar tests
chore    → configuración, dependencias, scripts
style    → formato, espacios (sin cambio de lógica)
perf     → mejora de rendimiento
```

**Ejemplos:**
```
feat: agregar endpoint de refinanciación de deuda
fix: corregir validación de token expirado en middleware
refactor: mover lógica de cálculo de cuotas al servicio de deudas
docs: actualizar README con instrucciones de deploy
chore: actualizar dependencias a versiones estables
test: agregar tests unitarios al servicio de ingresos
```

---

## 🔐 SEGURIDAD

- Todas las rutas protegidas deben usar `authMiddleware` antes de cualquier otro middleware
- Los roles deben validarse siempre en el backend, nunca confiar solo en el frontend
- Los tokens JWT de acceso duran máximo **15 minutos**
- Los refresh tokens duran máximo **7 días** y se invalidan al hacer logout
- Usar `helmet` en todas las respuestas HTTP
- Usar `express-rate-limit` en rutas de auth (máximo 10 intentos por IP cada 15 minutos)
- Google OAuth: verificar el token con `google-auth-library` usando `GOOGLE_CLIENT_ID` del entorno
- Usuarios Google tienen `password` autogenerado — no pueden usar login con email y contraseña
- Si un usuario email/password ya existe y usa Google con el mismo email, se vincula la cuenta (se actualiza `googleId`)
- Nunca exponer stack traces en producción
- Sanitizar todos los inputs antes de guardar en la base de datos

---

## 🗂️ NOMENCLATURA

| Elemento | Convención | Ejemplo |
|---|---|---|
| Archivos | kebab-case | `auth.service.ts` |
| Clases | PascalCase | `AuthService` |
| Interfaces | PascalCase con I | `IUser`, `IDebt` |
| Types | PascalCase | `PlatformRole` |
| DTOs request | PascalCase + `DTO` | `CrearIngresoDTO` |
| DTOs response | PascalCase + `Response` | `UsuarioResponse` |
| Funciones | camelCase | `obtenerUsuarioPorId` |
| Variables | camelCase | `usuarioActual` |
| Constantes globales | UPPER_SNAKE_CASE | `JWT_EXPIRATION` |
| Rutas de API | kebab-case | `/api/family-members` |
| Colecciones Mongo | camelCase plural | `users`, `familyMembers` |

---

## 🔄 MANEJO DE ERRORES

- Usar siempre try/catch en funciones async
- Nunca dejar un catch vacío
- Usar el middleware global de errores para respuestas consistentes
- Crear clases de error personalizadas para cada tipo

```typescript
// src/utils/errors.ts
export class NotFoundError extends Error {
  statusCode = 404
  constructor(mensaje: string) {
    super(mensaje)
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends Error {
  statusCode = 401
  constructor(mensaje: string) {
    super(mensaje)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends Error {
  statusCode = 403
  constructor(mensaje: string) {
    super(mensaje)
    this.name = 'ForbiddenError'
  }
}
```

```typescript
// ✅ Correcto
async function obtenerFamilia(id: string): Promise<IFamily> {
  const familia = await FamilyModel.findById(id)
  if (!familia) throw new NotFoundError('Familia no encontrada')
  return familia
}

// ❌ Incorrecto
async function obtenerFamilia(id: string) {
  try {
    return await FamilyModel.findById(id)
  } catch (e) {}
}
```

---

## 📤 FORMATO DE RESPUESTAS

Todas las respuestas **deben** seguir el formato unificado documentado en `docs/api/api-schemas.md`.

### Reglas generales

1. **Toda respuesta** debe tener `ok: boolean`
2. **Respuestas exitosas con datos:** `ok: true`, `data: T`, `mensaje: string`
3. **Respuestas paginadas:** `ok: true`, `data: T[]`, `total: number`, `page: number`, `limit: number`, `mensaje: string`
4. **Respuestas exitosas sin datos (DELETE):** `ok: true`, `mensaje: string`
5. **Respuestas de error:** `ok: false`, `error: string`, `detalles?: [{ campo: string, mensaje: string }]`
6. **Errores de validación (400):** incluir array `detalles` con el campo y mensaje específico

```typescript
// ✅ Respuesta exitosa con datos (200/201)
res.status(200).json({
  ok: true,
  data: { ... },
  mensaje: 'Operación exitosa'
})

// ✅ Respuesta exitosa paginada (200)
res.status(200).json({
  ok: true,
  data: [...],
  total: 42,
  page: 1,
  limit: 20,
  mensaje: 'Lista obtenida correctamente'
})

// ✅ Respuesta exitosa sin datos (200)
res.status(200).json({
  ok: true,
  mensaje: 'Recurso eliminado'
})

// ✅ Respuesta de error (400/401/403/404/409/500)
res.status(404).json({
  ok: false,
  error: 'Familia no encontrada'
})

// ✅ Respuesta de error de validación (400)
res.status(400).json({
  ok: false,
  error: 'Error de validación',
  detalles: [
    { campo: 'email', mensaje: 'El email no es válido' }
  ]
})
```

### Códigos de estado HTTP

| Código | Uso |
|:------:|-----|
| `200` | Éxito (GET, PUT, PATCH, DELETE) |
| `201` | Recurso creado (POST) |
| `400` | Error de validación |
| `401` | Token inválido o expirado |
| `403` | Sin permisos suficientes |
| `404` | Recurso no encontrado |
| `409` | Conflicto (ej. email duplicado) |
| `500` | Error interno del servidor |

---

## ✅ VALIDACIONES

- Todo body de request debe validarse con un schema Zod antes de llegar al controller
- El middleware `validate` se aplica antes del controller en todas las rutas POST/PUT/PATCH
- Los IDs de MongoDB deben validarse como ObjectId válido
- Los schemas Zod deben reflejar exactamente los campos definidos en `docs/api/api-schemas.md`
- Usar el helper de respuesta unificada de `src/utils/response.ts` en lugar de `res.json()` directo

```typescript
// ✅ Correcto
router.post('/expenses',
  authMiddleware,
  requireFamilyRole('family_admin', 'member'),
  validate(crearGastoSchema),
  crearGasto
)
```

---

## 📋 DTOs (Data Transfer Objects)

- Nombrar los DTOs de request con sufijo `Request`: `CrearIngresoDTO`, `ActualizarGastoDTO`
- Nombrar los DTOs de response con sufijo `Response`: `UsuarioResponse`, `DeudaDetalleResponse`
- Los DTOs se definen en `src/schemas/` con Zod y en `shared/types/` como interfaces
- Todo DTO debe estar documentado en `docs/api/api-schemas.md`

```typescript
// ✅ Correcto — DTO de request con Zod
export const crearIngresoSchema = z.object({
  amount: z.number().positive().max(9999999999),
  category: z.nativeEnum(IncomeCategory),
  description: z.string().max(100).optional(),
  date: z.string().datetime().optional(),
  userId: z.string().optional(),
})

export type CrearIngresoDTO = z.infer<typeof crearIngresoSchema>
```

## 🧪 TESTING

- Todo service debe tener tests unitarios
- Los endpoints críticos deben tener tests de integración
- Nombrar los tests en español describiendo el comportamiento esperado
- Mínimo de cobertura: **70%**

```typescript
describe('ServicioDeDeudas', () => {
  it('debe lanzar error si la deuda no existe', async () => { ... })
  it('debe calcular correctamente el monto restante', async () => { ... })
  it('debe registrar el pago y actualizar el saldo', async () => { ... })
})
```

---

## 📦 DEPENDENCIAS

- No agregar dependencias sin discutirlo primero
- Preferir librerías con mantenimiento activo y amplia comunidad
- No instalar dos librerías que hagan lo mismo
- Revisar licencias antes de agregar dependencias de terceros

---

## 🌿 RAMAS DE GIT

```
main          → producción, solo merge con PR aprobado
develop       → rama de integración
feat/nombre   → nueva funcionalidad
fix/nombre    → corrección de bug
refactor/nombre → refactorización
```

---

## 💬 COMENTARIOS EN EL CÓDIGO

- Los comentarios van en **español**
- Comentar el **por qué**, no el **qué** (el código ya dice qué hace)
- Las funciones complejas deben tener JSDoc

```typescript
/**
 * Genera un código de invitación único para la familia.
 * Usa nanoid en lugar de uuid por ser más corto y URL-safe.
 */
function generarCodigoInvitacion(): string {
  return nanoid(8)
}

// ❌ Incorrecto — comentar lo obvio
// Busca el usuario por id
const usuario = await UserModel.findById(id)
```
