# 📏 Miru — Reglas de Desarrollo Frontend

> Estas reglas son **obligatorias** para todos los que trabajen en el frontend.
> Cualquier PR que no las respete será rechazado.

---

## 🚫 PROHIBICIONES ABSOLUTAS

```
❌ Prohibido usar `any` en cualquier parte del código
❌ Prohibido hacer llamadas HTTP directamente desde un componente (solo services)
❌ Prohibido guardar tokens o datos sensibles en localStorage (usar sessionStorage o memoria)
❌ Prohibido hardcodear URLs de la API (usar environment.ts)
❌ Prohibido usar console.log en producción
❌ Prohibido tener lógica de negocio en los templates HTML
❌ Prohibido usar estilos inline en los templates
❌ Prohibido crear componentes que hagan más de una cosa
❌ Prohibido bypassear guards de rutas con condiciones en el componente
❌ Prohibido usar id de CSS para estilos (solo clases Tailwind)
❌ Prohibido hacer mutación directa de signals o estado sin pasar por el service
```

---

## 📁 ESTRUCTURA Y CARPETAS

- Cada componente tiene su propia carpeta con sus archivos
- Los servicios van en `core/services/` si son globales o en la carpeta del módulo si son locales
- Las interfaces y tipos van **únicamente** en `shared/types/` con sufijo `.types.ts`
- Las directivas van en `shared/directives/`
- Los pipes van en `shared/pipes/`
- Los componentes reutilizables van en `shared/components/`
- Los guards van en `core/guards/`
- Los interceptors van en `core/interceptors/`
- Las constantes van en `shared/constants/` con sufijo `.constants.ts`

### 📄 Documentación de componentes

- Cada componente nuevo debe generar un archivo `<nombre>.component.md` en `docs/components/`
- Usar el template definido en `docs/components/TEMPLATE.md`
- La documentación debe incluir: propósito, Inputs/Outputs, estados visuales, dependencias, mock data
- Actualizar el registro en `docs/ui/views/20-registro-pantallas.md` cuando un componente pase de "pendiente" a "completado"

```
✅ componente  → solo presentación y eventos del usuario
✅ service     → lógica, HTTP, estado
✅ guard       → protección de rutas
✅ interceptor → transformar requests/responses globalmente
✅ pipe        → transformar datos en el template
✅ directiva   → modificar comportamiento del DOM
```

---

## 🏷️ TIPADO

- Todo el código completamente tipado, prohibido `any`
- Usar `unknown` si el tipo es incierto y luego hacer type narrowing
- Las respuestas de la API deben tener un tipo definido en `shared/types/`
- Los signals deben estar tipados explícitamente

```typescript
// ✅ Correcto
const ingresos = signal<IIngreso[]>([])
const cargando = signal<boolean>(false)

// ❌ Incorrecto
const ingresos = signal([])
const cargando = signal(false as any)
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
feat: agregar componente de barra de progreso para deudas
fix: corregir redirección al expirar el token en interceptor
refactor: separar lógica del dashboard en servicio dedicado
style: ajustar espaciado del checklist en mobile
chore: actualizar angular a versión 17.3
test: agregar tests al pipe de moneda argentina
```

---

## 🧩 COMPONENTES

- Un componente = una responsabilidad
- Los componentes no hacen llamadas HTTP, delegan al service
- Usar `OnPush` como estrategia de detección de cambios siempre que sea posible
- Los componentes son `standalone: true`
- Nombrar componentes en kebab-case con prefijo `app-`

```typescript
// ✅ Correcto
@Component({
  selector: 'app-tarjeta-deuda',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  ...
})
export class TarjetaDeudaComponent {
  @Input({ required: true }) deuda!: IDeuda
  @Output() pagar = new EventEmitter<string>()
}
```

---

## 🌐 SERVICIOS Y HTTP

- Toda llamada HTTP va en un service, nunca en un componente
- Usar `HttpClient` con tipado genérico
- Los servicios retornan `Observable<T>` o `Promise<T>`, nunca `any`
- Manejar errores en el service con `catchError`
- Usar las interfaces de `shared/types/` (documentadas en `docs/api/shared-types.md`) para tipar todas las respuestas
- Las respuestas de la API envuelven los datos en `{ ok, data, mensaje }` — el servicio debe extraer `data`

### 📐 Patrón estándar de servicio

Cada servicio debe manejar tres capas: **response wrapper**, **tipado**, **errores**.

```typescript
// shared/types/response.types.ts (tipos de respuesta genéricos)
export interface ApiSuccessResponse<T> {
  ok: true
  data: T
  mensaje: string
}

export interface ApiPaginatedResponse<T> {
  ok: true
  data: T[]
  total: number
  page: number
  limit: number
  mensaje: string
}

export interface ApiErrorResponse {
  ok: false
  error: string
  detalles?: { campo: string; mensaje: string }[]
}
```

```typescript
// ✅ Correcto — servicio tipado con response wrapper
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, catchError, throwError, map } from 'rxjs'
import { IDebt, ICreateDebtRequest } from '../../shared/types/debt.types'
import { ApiSuccessResponse } from '../../shared/types/response.types'
import { environment } from '../../../environments/environment'

@Injectable({ providedIn: 'root' })
export class DeudasService {
  private apiUrl = `${environment.apiUrl}/debts`

  constructor(private http: HttpClient) {}

  obtenerDeudas(): Observable<IDebt[]> {
    return this.http.get<ApiSuccessResponse<IDebt[]>>(this.apiUrl).pipe(
      map(res => res.data),
      catchError((error) => {
        this.manejarError(error)
        return throwError(() => error)
      })
    )
  }

  crearDeuda(dto: ICreateDebtRequest): Observable<IDebt> {
    return this.http.post<ApiSuccessResponse<IDebt>>(this.apiUrl, dto).pipe(
      map(res => res.data),
      catchError((error) => this.manejarError(error))
    )
  }

  private manejarError(error: HttpErrorResponse): Observable<never> {
    const mensaje = error.error?.error || 'Ocurrió un error inesperado'
    // Mostrar notificación al usuario o loguear
    console.error('[DeudasService]', mensaje)
    return throwError(() => new Error(mensaje))
  }
}

// ❌ Incorrecto — HTTP en el componente, sin tipos
ngOnInit() {
  this.http.get('/api/debts').subscribe((data: any) => {
    this.deudas = data
  })
}
```

### 📋 Referencia rápida de DTOs

| Endpoint | Request DTO | Response DTO | Archivo de tipos |
|----------|-------------|--------------|------------------|
| `POST /api/incomes` | `ICreateIncomeRequest` | `IIncome` | `income.types.ts` |
| `POST /api/expenses` | `ICreateExpenseRequest` | `IExpense` | `expense.types.ts` |
| `POST /api/debts` | `ICreateDebtRequest` | `IDebt` | `debt.types.ts` |
| `POST /api/savings` | `ICreateSavingRequest` | `ISaving` | `saving.types.ts` |

Ver la documentación completa de todos los endpoints en `docs/api/api-schemas.md`.

---

## 🗂️ NOMENCLATURA

| Elemento | Convención | Ejemplo |
|---|---|---|
| Archivos de componente | kebab-case | `tarjeta-deuda.component.ts` |
| Archivos de servicio | kebab-case | `deudas.service.ts` |
| Archivos de tipos | kebab-case | `deuda.types.ts` |
| Clases | PascalCase | `TarjetaDeudaComponent` |
| Interfaces | PascalCase con I | `IDeuda`, `IIngreso` |
| Types | PascalCase | `EstadoDeuda` |
| Métodos | camelCase en español | `obtenerDeudas`, `marcarComoPagado` |
| Signals | camelCase | `deudaSeleccionada`, `cargando` |
| Constantes | UPPER_SNAKE_CASE | `MONEDA_SIMBOLO` |
| Selectores CSS | `app-` prefix | `app-tarjeta-deuda` |

---

## 🎨 ESTILOS Y TAILWIND

- Solo usar clases de Tailwind, sin CSS custom salvo casos excepcionales
- No usar estilos inline en el HTML
- Los colores personalizados se definen en `tailwind.config.js`, no hardcodeados
- Diseño mobile-first: siempre empezar desde la vista más pequeña

```html
<!-- ✅ Correcto: mobile first -->
<div class="flex flex-col gap-2 p-4 md:flex-row md:gap-6 md:p-8">

<!-- ❌ Incorrecto: estilos inline -->
<div style="display: flex; padding: 16px;">
```

---

## 🔐 SEGURIDAD EN EL FRONTEND

- Los tokens JWT se guardan en memoria (signal o servicio), nunca en localStorage
- El refresh token se maneja con una cookie `httpOnly` (la setea el backend)
- No mostrar datos sensibles en la URL
- Las rutas protegidas siempre usan guards, nunca condiciones dentro del componente
- No confiar en el rol que viene en el token para decisiones críticas, confirmar con el backend
- Google OAuth: usar `@abacritt/angularx-social-login` para el flujo frontend; el token de Google se envía al backend para verificación
- `loginWithGoogle()` reusa el mismo `setSession()` que el login con email — el resto de la app no distingue el método de autenticación

```typescript
// ✅ Correcto — token en memoria
@Injectable({ providedIn: 'root' })
export class AuthService {
  private accessToken = signal<string | null>(null)

  guardarToken(token: string): void {
    this.accessToken.set(token)
  }
}

// ❌ Incorrecto — token en localStorage
localStorage.setItem('token', token)
```

---

## 🔄 MANEJO DE ERRORES

- Todo `subscribe` debe tener un handler de error
- Mostrar siempre feedback al usuario cuando falla algo
- Los errores 401 son manejados globalmente por el interceptor de refresh
- Los errores 403 redirigen a `/no-autorizado`
- Los errores 500 muestran un mensaje genérico sin exponer detalles

```typescript
// ✅ Correcto
this.deudasService.obtenerDeudas().subscribe({
  next: (deudas) => this.deudas.set(deudas),
  error: () => this.mostrarError('No se pudieron cargar las deudas')
})

// ❌ Incorrecto
this.deudasService.obtenerDeudas().subscribe((deudas: any) => {
  this.deudas = deudas
})
```

---

## ♻️ REUTILIZACIÓN

- Antes de crear un componente, revisar si ya existe uno similar en `shared/components/`
- Los pipes de formato se usan en todos los templates, no formatear en el componente
- Las constantes de texto reutilizable van en `shared/constants/`

```typescript
// shared/constants/mensajes.constants.ts
export const MENSAJES = {
  ERROR_GENERICO: 'Ocurrió un error. Intentá de nuevo.',
  CARGANDO: 'Cargando...',
  SIN_RESULTADOS: 'No hay datos para mostrar.',
} as const
```

---

## 🧪 TESTING

- Todo service debe tener tests unitarios
- Los componentes críticos deben tener tests de integración
- Nombrar los tests en español describiendo el comportamiento esperado
- Mínimo de cobertura: **60%**

```typescript
describe('DeudasService', () => {
  it('debe retornar lista vacía si no hay deudas', () => { ... })
  it('debe calcular correctamente el porcentaje pagado', () => { ... })
})

describe('CurrencyArPipe', () => {
  it('debe formatear 1000000 como $1.000.000', () => { ... })
  it('debe retornar vacío si el valor es null', () => { ... })
})
```

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
- Comentar el **por qué**, no el **qué**
- Los componentes y services complejos deben tener JSDoc

```typescript
/**
 * Intercepta todas las requests y adjunta el token de acceso.
 * Si el token expiró (401), intenta renovarlo automáticamente
 * antes de reintentar la request original.
 */
@Injectable()
export class TokenInterceptor implements HttpInterceptor { ... }

// ❌ Incorrecto — comentar lo obvio
// Obtiene las deudas
const deudas = await this.deudasService.obtenerDeudas()
```

---

## 📱 PWA Y PERFORMANCE

- Las imágenes deben tener `loading="lazy"` por defecto
- Usar `trackBy` en todos los `*ngFor` para mejorar el rendimiento
- Las rutas se cargan con lazy loading (`loadComponent`)
- El service worker cachea los assets estáticos automáticamente
- No bloquear el hilo principal con operaciones pesadas

```typescript
// ✅ Correcto — lazy loading de rutas
{
  path: 'deudas',
  loadComponent: () => import('./deudas/deudas.component')
}

// ✅ Correcto — trackBy en listas
<div *ngFor="let deuda of deudas(); trackBy: trackPorId">
```

---

## ♿ ACCESIBILIDAD

- Todos los botones deben tener texto descriptivo o `aria-label`
- Las imágenes deben tener `alt`
- Los formularios deben tener `label` asociado a cada input
- El contraste de colores debe cumplir WCAG AA mínimo
