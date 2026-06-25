# 🎭 Miru — Roles, Permisos e Implementación

---

## 📊 NIVELES DE ROL

El sistema tiene **dos capas de roles** bien diferenciadas:

### Capa 1 — Plataforma (global)
Roles que operan sobre toda la aplicación, sin importar la familia.

### Capa 2 — Familia (scoped)
Roles que operan dentro de una familia específica.

---

## 🌐 CAPA 1 — ROLES DE PLATAFORMA

### `superadmin`
- Es el dueño/operador de la plataforma Miru
- Se crea manualmente en la base de datos en el primer deploy (seed)
- **Nunca** se puede crear desde el registro público
- Tiene acceso a un panel de administración separado

**Puede:**
- Ver todas las familias registradas
- Ver estadísticas globales (usuarios activos, familias, ingresos registrados, etc.)
- Cambiar el rol de cualquier usuario a cualquier nivel
- Activar o desactivar cuentas
- Eliminar familias o usuarios
- Ver y gestionar tickets de los agentes
- Acceder a logs del sistema

### `agent`
- Personal de soporte de la plataforma
- Lo crea el `superadmin` desde el panel de administración
- No puede crear familias ni acceder a datos financieros reales
- Tiene su propio panel de soporte

**Puede:**
- Ver tickets de errores reportados por usuarios
- Responder y cerrar tickets
- Ver datos básicos de un usuario para dar soporte (nombre, email, familia)
- Escalar tickets al `superadmin`
- Ver logs de errores de la plataforma

**No puede:**
- Ver montos, deudas ni datos financieros de las familias
- Cambiar roles
- Eliminar usuarios o familias
- Acceder al panel de `superadmin`

---

## 👨‍👩‍👧 CAPA 2 — ROLES DE FAMILIA

### `family_admin`
- El primero en registrarse y crear la familia
- Se asigna automáticamente al crear la familia
- Puede haber más de uno (el `family_admin` puede promover a otro miembro)

**Puede:**
- Todo lo que puede un `member`
- Invitar nuevos miembros (código o link)
- Cambiar el rol de miembros (entre `member` y `readonly`)
- Eliminar miembros de la familia
- Editar y eliminar cualquier registro de la familia
- Ver la configuración de la familia
- Renombrar la familia

### `member`
- Miembro normal del grupo familiar
- Se une mediante código de invitación

**Puede:**
- Ver todos los datos de la familia
- Agregar ingresos, gastos, pagos, aportes al ahorro
- Editar y eliminar únicamente sus propios registros
- Marcar ítems del checklist como pagados

**No puede:**
- Invitar miembros
- Cambiar roles
- Eliminar registros de otros miembros
- Ver configuración de la familia

### `readonly`
- Rol de solo lectura dentro de la familia
- Útil para mostrarle el estado a alguien sin que pueda modificar nada

**Puede:**
- Ver todos los datos de la familia

**No puede:**
- Agregar, editar ni eliminar nada

---

## 📋 TABLA DE PERMISOS COMPLETA

| Acción | superadmin | agent | family_admin | member | readonly |
|---|:---:|:---:|:---:|:---:|:---:|
| Panel de plataforma | ✅ | ❌ | ❌ | ❌ | ❌ |
| Panel de soporte/tickets | ✅ | ✅ | ❌ | ❌ | ❌ |
| Ver todas las familias | ✅ | ❌ | ❌ | ❌ | ❌ |
| Estadísticas globales | ✅ | ❌ | ❌ | ❌ | ❌ |
| Cambiar rol de cualquier usuario | ✅ | ❌ | ❌ | ❌ | ❌ |
| Desactivar cuentas | ✅ | ❌ | ❌ | ❌ | ❌ |
| Ver datos financieros | ✅ | ❌ | ✅ | ✅ | ✅ |
| Agregar registros | ✅ | ❌ | ✅ | ✅ | ❌ |
| Editar cualquier registro | ✅ | ❌ | ✅ | Solo propios | ❌ |
| Eliminar cualquier registro | ✅ | ❌ | ✅ | Solo propios | ❌ |
| Invitar miembros | ✅ | ❌ | ✅ | ❌ | ❌ |
| Cambiar roles dentro de familia | ✅ | ❌ | ✅ | ❌ | ❌ |
| Eliminar miembros de familia | ✅ | ❌ | ✅ | ❌ | ❌ |
| Reportar ticket de error | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 👑 CÓMO SE CREA EL PRIMER SUPERADMIN

El `superadmin` **nunca** se registra desde la UI pública.
Se crea mediante un script de seed en el primer deploy:

```typescript
// backend/src/scripts/seed.ts
import { UserModel } from '../models/User.model'
import { hashPassword } from '../utils/bcrypt'

async function seedSuperAdmin() {
  const existe = await UserModel.findOne({ platformRole: 'superadmin' })
  if (existe) {
    console.log('Superadmin ya existe, omitiendo seed')
    return
  }

  await UserModel.create({
    name: 'Admin Principal',
    email: process.env.SUPERADMIN_EMAIL,
    password: await hashPassword(process.env.SUPERADMIN_PASSWORD),
    platformRole: 'superadmin',
    familyId: null,
    familyRole: null,
    isActive: true,
  })

  console.log('Superadmin creado correctamente')
}
```

Se ejecuta con:
```bash
npx ts-node src/scripts/seed.ts
```

Y las credenciales van en el `.env`:
```env
SUPERADMIN_EMAIL=admin@Miru.com
SUPERADMIN_PASSWORD=clave_muy_segura_aqui
```

---

## 🗄️ MODELO DE USUARIO CON ROLES DUALES

```typescript
// shared/types/auth.types.ts

export type PlatformRole = 'superadmin' | 'agent' | 'user'
export type FamilyRole = 'family_admin' | 'member' | 'readonly'

export interface IUser {
  _id: string
  name: string
  email: string
  password: string
  platformRole: PlatformRole
  familyId: string | null
  familyRole: FamilyRole | null
  isActive: boolean
  pushSubscription: object | null
  createdAt: Date
}
```

---

## 🔐 IMPLEMENTACIÓN EN EL BACKEND

### Middlewares de protección

```typescript
// backend/src/middlewares/role.middleware.ts

import { Request, Response, NextFunction } from 'express'
import { PlatformRole, FamilyRole } from '../../shared/types/auth.types'

export const requirePlatformRole = (...roles: PlatformRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user
    if (!user || !roles.includes(user.platformRole)) {
      return res.status(403).json({ message: 'Acceso denegado' })
    }
    next()
  }
}

export const requireFamilyRole = (...roles: FamilyRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user
    if (!user || !user.familyRole || !roles.includes(user.familyRole)) {
      return res.status(403).json({ message: 'Acceso denegado dentro de la familia' })
    }
    next()
  }
}
```

### Uso en rutas

```typescript
// backend/src/routes/family.routes.ts (ejemplos reales)

router.post('/',                   authMiddleware, validate(createFamilySchema), familyController.create)
router.post('/join',               authMiddleware, validate(joinFamilySchema), familyController.join)
router.get('/my',                  authMiddleware, familyController.getMyFamily)
router.post('/invite',             authMiddleware, requireFamilyRole('family_admin'), validate(inviteMemberSchema), familyController.invite)
router.delete('/:familyId/members/:userId', authMiddleware, requireFamilyRole('family_admin'), familyController.removeMember)

// backend/src/routes/finance.routes.ts

router.post('/incomes',            authMiddleware, requireFamilyRole('family_admin', 'member'), validate(createIncomeSchema), financeController.createIncome)
router.get('/incomes',             authMiddleware, requireFamilyRole('family_admin', 'member', 'readonly'), financeController.getAllIncomes)
// ... mismo patrón para expenses, recurring-bills
```

---

## 🎨 IMPLEMENTACIÓN EN EL FRONTEND (Angular)

### Servicio de roles

```typescript
// frontend/src/app/core/services/role.service.ts

import { Injectable } from '@angular/core'
import { AuthService } from './auth.service'
import { PlatformRole, FamilyRole } from '../../../../shared/types/auth.types'

@Injectable({ providedIn: 'root' })
export class RoleService {

  constructor(private authService: AuthService) {}

  get currentUser() {
    return this.authService.currentUser()
  }

  esSuperAdmin(): boolean {
    return this.currentUser?.platformRole === 'superadmin'
  }

  esAgent(): boolean {
    return this.currentUser?.platformRole === 'agent'
  }

  tienePlatformRole(...roles: PlatformRole[]): boolean {
    return roles.includes(this.currentUser?.platformRole)
  }

  esFamilyAdmin(): boolean {
    return this.currentUser?.familyRole === 'family_admin'
  }

  tieneFamilyRole(...roles: FamilyRole[]): boolean {
    return roles.includes(this.currentUser?.familyRole)
  }

  puedeEditar(autorId: string): boolean {
    if (this.esSuperAdmin() || this.esFamilyAdmin()) return true
    return this.currentUser?._id === autorId
  }
}
```

### Guards de rutas

```typescript
// frontend/src/app/core/guards/platform-role.guard.ts

import { inject } from '@angular/core'
import { CanActivateFn, Router } from '@angular/router'
import { RoleService } from '../services/role.service'
import { PlatformRole, FamilyRole } from '../../../../shared/types/auth.types'

export const platformRoleGuard = (...roles: PlatformRole[]): CanActivateFn => {
  return () => {
    const roleService = inject(RoleService)
    const router = inject(Router)
    if (roleService.tienePlatformRole(...roles)) return true
    router.navigate(['/no-autorizado'])
    return false
  }
}

export const familyRoleGuard = (...roles: FamilyRole[]): CanActivateFn => {
  return () => {
    const roleService = inject(RoleService)
    const router = inject(Router)
    if (roleService.tieneFamilyRole(...roles)) return true
    router.navigate(['/no-autorizado'])
    return false
  }
}
```

### Directiva para mostrar/ocultar elementos

```typescript
// frontend/src/app/shared/directives/has-role.directive.ts

import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core'
import { RoleService } from '../../core/services/role.service'
import { PlatformRole, FamilyRole } from '../../../../shared/types/auth.types'

@Directive({ selector: '[appHasPlatformRole]', standalone: true })
export class HasPlatformRoleDirective implements OnInit {
  @Input() appHasPlatformRole: PlatformRole[] = []

  constructor(
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef,
    private roleService: RoleService
  ) {}

  ngOnInit() {
    if (this.roleService.tienePlatformRole(...this.appHasPlatformRole)) {
      this.viewContainer.createEmbeddedView(this.templateRef)
    } else {
      this.viewContainer.clear()
    }
  }
}
```

### Uso en templates HTML

```html
<!-- Solo superadmin -->
<button *appHasPlatformRole="['superadmin']" (click)="eliminarFamilia()">
  Eliminar familia
</button>

<!-- Solo family_admin -->
<button *appHasFamilyRole="['family_admin']" (click)="invitar()">
  Invitar miembro
</button>

<!-- Editar solo si es el autor o tiene permisos -->
<button *ngIf="roleService.puedeEditar(gasto.autorId)" (click)="editar()">
  Editar
</button>
```

---

## 🗺️ RUTAS POR ROL — RESUMEN VISUAL

```
POST   /api/auth/register        → público
POST   /api/auth/login           → público
POST   /api/auth/google          → público
POST   /api/auth/refresh         → público (rate-limited)
POST   /api/auth/logout          → auth

GET    /api/health               → público

POST   /api/family               → auth (crea familia, se asigna family_admin)
POST   /api/family/join          → auth (se une por código)
GET    /api/family/my            → auth
POST   /api/family/invite        → auth + family_admin
POST   /api/family/respond-invite→ auth
DELETE /api/family/:id/members/:uid → auth + family_admin

GET    /api/finance/incomes      → auth + member|admin|readonly
POST   /api/finance/incomes      → auth + member|admin
GET    /api/finance/expenses     → auth + member|admin|readonly
POST   /api/finance/expenses     → auth + member|admin
GET    /api/finance/recurring-bills → auth + member|admin|readonly
POST   /api/finance/recurring-bills → auth + member|admin

GET    /api/debts                → auth + member|admin|readonly
POST   /api/debts                → auth + member|admin
POST   /api/debts/:id/payments   → auth + member|admin

GET    /api/savings              → auth + member|admin|readonly
POST   /api/savings              → auth + member|admin
POST   /api/savings/:id/contributions → auth + member|admin

GET    /api/dashboard            → auth
GET    /api/checklist            → auth + member|admin|readonly
PATCH  /api/checklist/:month/items/:itemId → auth + member|admin

GET    /api/notifications        → auth
PATCH  /api/notifications/:id/read → auth
PATCH  /api/notifications/read-all  → auth
```
