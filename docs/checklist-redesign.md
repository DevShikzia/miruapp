# Miru — Rediseño de Checklist a Sistema de Tareas

> Sistema de tareas estilo Google Tasks. Reemplaza el checklist mensual por listas de tareas persistentes con subtareas.

---

## Resumen del cambio

| Antes | Ahora |
|-------|-------|
| Un documento por mes | Tareas persistentes (sin reset mensual) |
| Items simples con label | Tareas + subtareas tipo checklist |
| Solo marcar completado | Quién creó, a quién se asignó, quién completó |
| Sin categorías | 8 categorías fijas + prioridades |
| Sin filtros | Filtros por categoría, prioridad, miembro |

---

## 1. Modelos de Base de Datos

### Task (nueva colección)

```typescript
// shared/types/task.types.ts

export type TaskCategory =
  | 'finanzas'
  | 'hogar'
  | 'supermercado'
  | 'salud'
  | 'familia'
  | 'personal'
  | 'trabajo'
  | 'otros'

export type TaskPriority = 'high' | 'medium' | 'low'

export interface TaskSubtask {
  id: string           // nanoid
  label: string        // nombre del producto/item
  completed: boolean
  completedBy: string | null
  completedAt: string | null
}

export interface Task {
  _id: string
  familyId: string
  createdBy: string    // userId de quien la creó
  assignedTo: string | null  // userId de a quién se asignó (null = sin asignar)
  title: string
  description: string | null
  category: TaskCategory
  priority: TaskPriority
  dueDate: string | null  // YYYY-MM-DD (TODO: notificaciones pendientes)
  subtasks: TaskSubtask[]
  isCompleted: boolean
  completedBy: string | null
  completedAt: string | null
  sortOrder: number    // para ordenamiento manual si se requiere en el futuro
  createdAt: string
  updatedAt: string
}
```

### Response DTOs

```typescript
export interface TaskData {
  _id: string
  familyId: string
  createdBy: IUserPublic
  assignedTo: IUserPublic | null
  title: string
  description: string | null
  category: TaskCategory
  priority: TaskPriority
  dueDate: string | null
  subtasks: TaskSubtask[]
  isCompleted: boolean
  completedBy: IUserPublic | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateTaskRequest {
  title: string
  description?: string
  category: TaskCategory
  priority: TaskPriority
  dueDate?: string
  assignedTo?: string
  subtasks?: { label: string }[]
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  category?: TaskCategory
  priority?: TaskPriority
  dueDate?: string | null
  assignedTo?: string | null
}

export interface ToggleSubtaskRequest {
  subtaskId: string
}
```

---

## 2. API Endpoints

Base path: `/api/tasks`

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/api/tasks` | Lista de tareas activas | family_admin, member, readonly |
| GET | `/api/tasks/completed` | Lista de tareas completadas | family_admin, member, readonly |
| GET | `/api/tasks/:id` | Detalle de una tarea | family_admin, member, readonly |
| POST | `/api/tasks` | Crear tarea | family_admin, member |
| PUT | `/api/tasks/:id` | Actualizar tarea | family_admin, member (solo propios o admin) |
| DELETE | `/api/tasks/:id` | Eliminar tarea | family_admin, member (solo propios o admin) |
| PATCH | `/api/tasks/:id/toggle` | Marcar/desmarcar como completada | family_admin, member |
| POST | `/api/tasks/:id/subtasks` | Agregar subtarea | family_admin, member (solo propios o admin) |
| DELETE | `/api/tasks/:id/subtasks/:subtaskId` | Eliminar subtarea | family_admin, member (solo propios o admin) |
| PATCH | `/api/tasks/:id/subtasks/:subtaskId/toggle` | Toggle subtarea | family_admin, member |

### Filtros GET /api/tasks

| Query Param | Tipo | Descripción |
|-------------|------|-------------|
| `category` | `TaskCategory` | Filtrar por categoría |
| `priority` | `TaskPriority` | Filtrar por prioridad |
| `assignedTo` | `string` (userId) | Filtrar por asignado a |
| `createdBy` | `string` (userId) | Filtrar por creador |

### Filtros GET /api/tasks/completed

| Query Param | Tipo | Descripción |
|-------------|------|-------------|
| `category` | `TaskCategory` | Filtrar por categoría |
| `completedBy` | `string` (userId) | Filtrar por quien completó |
| `startDate` | `string` (YYYY-MM-DD) | Fecha desde |
| `endDate` | `string` (YYYY-MM-DD) | Fecha hasta |

### Formato de respuesta

```json
// GET /api/tasks — 200
{
  "ok": true,
  "data": [
    {
      "_id": "...",
      "familyId": "...",
      "createdBy": { "_id": "...", "name": "María", "email": "..." },
      "assignedTo": { "_id": "...", "name": "Carlos", "email": "..." },
      "title": "Ir al super",
      "description": "Comprar para la semana",
      "category": "supermercado",
      "priority": "high",
      "dueDate": "2026-07-05",
      "subtasks": [
        { "id": "abc123", "label": "Manzanas", "completed": false, "completedBy": null, "completedAt": null },
        { "id": "def456", "label": "Naranjas", "completed": true, "completedBy": "...", "completedAt": "2026-06-29T..." }
      ],
      "isCompleted": false,
      "completedBy": null,
      "completedAt": null,
      "createdAt": "2026-06-29T...",
      "updatedAt": "2026-06-29T..."
    }
  ],
  "total": 1,
  "mensaje": "Tareas obtenidas correctamente"
}

// POST /api/tasks — 201
{
  "ok": true,
  "data": { /* TaskData */ },
  "mensaje": "Tarea creada correctamente"
}

// PATCH /api/tasks/:id/toggle — 200
{
  "ok": true,
  "data": { /* TaskData actualizada */ },
  "mensaje": "Tarea marcada como completada"
}
```

---

## 3. Reglas de Negocio

### Permisos de edición

| Acción | family_admin | member |
|--------|--------------|--------|
| Crear tarea | ✅ | ✅ |
| Editar cualquier tarea | ✅ | ❌ |
| Editar solo tareas propias | ❌ | ✅ |
| Eliminar cualquier tarea | ✅ | ❌ |
| Eliminar solo tareas propias | ❌ | ✅ |
| Marcar/desmarcar cualquier tarea | ✅ | ❌ |
| Marcar/desmarcar solo tareas propias | ❌ | ✅ |
| Agregar/quitar subtareas de cualquier tarea | ✅ | ❌ |
| Agregar/quitar subtareas de tareas propias | ❌ | ✅ |

### Lógica de completado

1. **Tarea simple (sin subtareas):**
   - Al togglear → `isCompleted = true`, `completedBy = userId`, `completedAt = now`

2. **Tarea con subtareas:**
   - Tildar subtarea → `subtask.completed = true`, `subtask.completedBy = userId`, `subtask.completedAt = now`
   - Tildar la tarea completa → NO tildea las subtareas automáticamente
   - Desmarcar tarea completa → NO desmarca las subtareas

### Subtareas

- Se crean con `POST /subtasks` o al crear la tarea
- Cada subtarea tiene: `id` (nanoid), `label`, `completed`, `completedBy`, `completedAt`
- Al eliminar una tarea, se eliminan todas sus subtareas

### Ordenamiento

Las tareas se retornan ordenadas por:
1. `priority`: high → medium → low
2. `dueDate`: ASC (las más cercanas primero, null al final)
3. `createdAt`: ASC

### Categorías (fijas, no editables)

```typescript
const TASK_CATEGORIES = {
  finanzas: { label: 'Finanzas', icon: '💰' },
  hogar: { label: 'Hogar', icon: '🏠' },
  supermercado: { label: 'Supermercado', icon: '🛒' },
  salud: { label: 'Salud', icon: '💊' },
  familia: { label: 'Familia', icon: '👨‍👩‍👧' },
  personal: { label: 'Personal', icon: '👤' },
  trabajo: { label: 'Trabajo', icon: '💼' },
  otros: { label: 'Otros', icon: '📌' }
} as const
```

### Prioridades

```typescript
const TASK_PRIORITIES = {
  high: { label: 'Alta', color: '#E05252' },    // rojo
  medium: { label: 'Media', color: '#C99A0A' }, // amarillo
  low: { label: 'Baja', color: '#15C48C' }      // verde
} as const
```

---

## 4. Frontend — Vistas

### Acceso

- **No tiene nav propio** — no aparece en bottom navigation
- Se accede desde el **Dashboard** (widget o link "Ver todas las tareas")
- El **FAB del Dashboard** tiene opción "Crear tarea" que abre el formulario directamente (sin necesidad de entrar a la lista)

### 4.1 Lista de Tareas Activas

**Estructura visual:**
- Header: título "Tareas" + botón flotante "Nueva tarea" (FAB)
- Filtros: barra horizontal scrolleable con chips (categoría, prioridad)
- Lista agrupada por categoría, collapsible
- Cada categoría muestra cantidad de tareas pendientes

**Card de tarea:**
```
┌─────────────────────────────────────────┐
│ ● Alta    Ir al super                   │
│           Comprar para la semana        │
│           🛒 Supermercado   📅 05/07    │
│                                         │
│           ┌─ Manzanas ✓                 │
│           ├─ Naranjas                   │
│           └─ Pan                        │
│                                         │
│           Creado por: María             │
│           Asignado a: Carlos            │
└─────────────────────────────────────────┘
```

**Estados de tarea:**
- Normal: borde sutil, fondo surface
- Vencida: borde rojo (sin notificación, solo visual)
- Con subtareas completadas: muestra progreso "2/5"

**Card de categoría colapsable:**
```
┌─────────────────────────────────────────┐
│ 🛒 Supermercado                    (3) ▼│
├─────────────────────────────────────────┤
│ ... tareas dentro ...                   │
└─────────────────────────────────────────┘
```

### 4.2 Completadas (`/tareas/completadas`)

**Filtros:**
- Categoría (dropdown)
- Completada por (dropdown de miembros)
- Rango de fechas (date picker)
- Botón "Limpiar filtros"

**Card de tarea completada:**
```
┌─────────────────────────────────────────┐
│ ✓ Ir al super                           │
│   Supermercado · Completada por Carlos  │
│   29 jun 2026                           │
└─────────────────────────────────────────┘
```

### 4.3 Formulario Nueva/Editar Tarea

**Campos:**
| Campo | Tipo | Obligatorio | Validación |
|-------|------|:-----------:|------------|
| Título | text | ✅ | 2-100 chars |
| Descripción | textarea | ❌ | máx 500 chars |
| Categoría | select | ✅ | una de las 8 fijas |
| Prioridad | select | ✅ | high/medium/low |
| Fecha vencimiento | date | ❌ | YYYY-MM-DD |
| Asignado a | select (miembros) | ❌ | null = sin asignar |
| Subtareas | dynamic list | ❌ | agregar/quitar items |

**Subtareas input:**
- Input de texto + botón "Agregar"
- Lista de chips con × para eliminar
- Ejemplo: [Manzanas ×] [Naranjas ×] [Pan ×]

### 4.4 Servicio Angular

```typescript
// tareas.service.ts
@Injectable({ providedIn: 'root' })
export class TareasService {
  private apiUrl = `${environment.apiUrl}/tasks`

  obtenerTareas(filtros?: TaskFilters): Observable<TaskData[]>
  obtenerCompletadas(filtros?: CompletedFilters): Observable<TaskData[]>
  obtenerTarea(id: string): Observable<TaskData>
  crearTarea(dto: CreateTaskRequest): Observable<TaskData>
  actualizarTarea(id: string, dto: UpdateTaskRequest): Observable<TaskData>
  eliminarTarea(id: string): Observable<void>
  toggleTarea(id: string): Observable<TaskData>
  agregarSubtarea(tareaId: string, label: string): Observable<TaskData>
  eliminarSubtarea(tareaId: string, subtaskId: string): Observable<TaskData>
  toggleSubtarea(tareaId: string, subtaskId: string): Observable<TaskData>
}
```

---

## 5. Cambios en Backend Existentes

### Rutas a eliminar

- `GET /api/checklist` → eliminar
- `PATCH /api/checklist/:month/items/:itemId` → eliminar

### Middleware de permisos

```typescript
// task.middleware.ts

// Verifica que el usuario puede editar la tarea
export const canEditTask = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user
  const taskId = req.params.id

  if (user.familyRole === 'family_admin') return next()

  const task = await TaskModel.findById(taskId)
  if (!task) return res.status(404).json({ ok: false, error: 'Tarea no encontrada' })

  if (task.createdBy.toString() !== user._id.toString()) {
    return res.status(403).json({ ok: false, error: 'No tenés permiso para editar esta tarea' })
  }

  next()
}

// Verifica que el usuario puede completar la tarea
export const canCompleteTask = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user
  const taskId = req.params.id

  if (user.familyRole === 'family_admin') return next()

  const task = await TaskModel.findById(taskId)
  if (!task) return res.status(404).json({ ok: false, error: 'Tarea no encontrada' })

  // member solo puede completar tareas propias
  if (task.createdBy.toString() !== user._id.toString() && task.assignedTo?.toString() !== user._id.toString()) {
    return res.status(403).json({ ok: false, error: 'No tenés permiso para completar esta tarea' })
  }

  next()
}
```

---

## 6. ChecklistModel - Deprecación

El modelo `Checklist` existente queda en la base de datos pero sin uso. No se elimina para mantener datos existentes si se necesita rollback.

En una versión futura se puede crear un script de migración para llevar los datos del checklist antiguo a tareas.

---

## 7. Tiempo Real (Socket.io)

Eventos a emitir cuando:

| Evento | Payload | Dirigido a |
|--------|---------|------------|
| `task:created` | TaskData | Toda la familia |
| `task:updated` | TaskData | Toda la familia |
| `task:deleted` | taskId | Toda la familia |
| `task:completed` | TaskData | Toda la familia |
| `task:subtask:updated` | { taskId, subtask } | Toda la familia |

---

## 8. Tabla comparativa viejo vs nuevo

| Aspecto | Checklist (viejo) | Tasks (nuevo) |
|---------|-------------------|---------------|
| Estructura | Un doc por mes | Colección persistente |
| Items | Label simple | Título + descripción + subtareas |
| Categorías | No | 8 fijas |
| Prioridad | No | Alta/Media/Baja |
| Fecha vencimiento | No | Opcional |
| Asignación | No | Cualquier miembro |
| Subtareas | No | Sí, con productos |
| Quién creó | No | Sí |
| Quién completó | No | Sí |
| Filtros | No | Categoría, prioridad, miembro |
| Completadas | Se resetean mensual | Archivo permanente |

---

## 9. Orden de implementación sugerido

1. Crear modelo Task y DTOs en `shared/types/task.types.ts`
2. Crear schemas Zod en `backend/src/schemas/task.schema.ts`
3. Crear TaskService con toda la lógica
4. Crear TaskController
5. Crear rutas en `backend/src/routes/task.routes.ts`
6. Agregar middlewares `canEditTask`, `canCompleteTask`
7. Agregar eventos Socket.io
8. Crear TareasService en frontend
9. Crear vista de lista activa con filtros
10. Crear vista de completadas con filtros
11. Crear formulario nueva/editar tarea
12. Crear componente card de tarea
13. Probar tiempo real
14. Eliminar endpoints viejos de checklist (o mantener para backward compat)