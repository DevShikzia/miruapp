import { Injectable, OnDestroy } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, throwError, map, catchError, Subject } from 'rxjs'
import { TaskData, CreateTaskRequest, UpdateTaskRequest } from '../../../../shared/types/task.types'
import { ApiSuccessResponse, ApiPaginatedResponse } from './api.service'
import { environment } from '../../environments/environment'
import { io, Socket } from 'socket.io-client'

export interface TareaEvent {
  type: 'task:created' | 'task:updated' | 'task:deleted' | 'task:completed' | 'task:subtask:updated'
  data: TaskData
  familyId: string
}

@Injectable({ providedIn: 'root' })
export class TareasService implements OnDestroy {
  private apiUrl = `${environment.apiUrl}/tasks`
  private socket: Socket | null = null
  private eventsSubject = new Subject<TareaEvent>()

  constructor(private http: HttpClient) {}

  ngOnDestroy(): void {
    this.disconnectSocket()
  }

  connectSocket(token: string): void {
    if (this.socket?.connected) return

    this.socket = io(environment.apiUrl.replace('/api', ''), {
      auth: { token },
      transports: ['websocket'],
    })

    this.socket.on('connect', () => {
      console.log('[TareasService] Socket connected')
    })

    this.socket.on('disconnect', () => {
      console.log('[TareasService] Socket disconnected')
    })

    this.socket.on('task:created', (data: TaskData, familyId: string) => {
      this.eventsSubject.next({ type: 'task:created', data, familyId })
    })

    this.socket.on('task:updated', (data: TaskData, familyId: string) => {
      this.eventsSubject.next({ type: 'task:updated', data, familyId })
    })

    this.socket.on('task:deleted', (data: TaskData, familyId: string) => {
      this.eventsSubject.next({ type: 'task:deleted', data, familyId })
    })

    this.socket.on('task:completed', (data: TaskData, familyId: string) => {
      this.eventsSubject.next({ type: 'task:completed', data, familyId })
    })

    this.socket.on('task:subtask:updated', (data: TaskData, familyId: string) => {
      this.eventsSubject.next({ type: 'task:subtask:updated', data, familyId })
    })
  }

  disconnectSocket(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  get events$(): Observable<TareaEvent> {
    return this.eventsSubject.asObservable()
  }

  private manejarError(error: { error?: { error?: string } }): Observable<never> {
    const mensaje = error.error?.error || 'Ocurrió un error inesperado'
    console.error('[TareasService]', mensaje)
    return throwError(() => new Error(mensaje))
  }

  obtenerTareas(filtros?: {
    category?: string
    priority?: string
    assignedTo?: string
    createdBy?: string
  }): Observable<TaskData[]> {
    const params: Record<string, string> = {}
    if (filtros) {
      if (filtros.category) params['category'] = filtros.category
      if (filtros.priority) params['priority'] = filtros.priority
      if (filtros.assignedTo) params['assignedTo'] = filtros.assignedTo
      if (filtros.createdBy) params['createdBy'] = filtros.createdBy
    }
    return this.http.get<ApiPaginatedResponse<TaskData>>(this.apiUrl, { params }).pipe(
      map(res => res.data),
      catchError(e => this.manejarError(e))
    )
  }

  obtenerCompletadas(filtros?: {
    category?: string
    completedBy?: string
    startDate?: string
    endDate?: string
  }): Observable<TaskData[]> {
    const params: Record<string, string> = {}
    if (filtros) {
      if (filtros.category) params['category'] = filtros.category
      if (filtros.completedBy) params['completedBy'] = filtros.completedBy
      if (filtros.startDate) params['startDate'] = filtros.startDate
      if (filtros.endDate) params['endDate'] = filtros.endDate
    }
    return this.http.get<ApiPaginatedResponse<TaskData>>(`${this.apiUrl}/completed`, { params }).pipe(
      map(res => res.data),
      catchError(e => this.manejarError(e))
    )
  }

  obtenerTarea(id: string): Observable<TaskData> {
    return this.http.get<ApiSuccessResponse<TaskData>>(`${this.apiUrl}/${id}`).pipe(
      map(res => res.data),
      catchError(e => this.manejarError(e))
    )
  }

  crearTarea(dto: CreateTaskRequest): Observable<TaskData> {
    return this.http.post<ApiSuccessResponse<TaskData>>(this.apiUrl, dto).pipe(
      map(res => res.data),
      catchError(e => this.manejarError(e))
    )
  }

  actualizarTarea(id: string, dto: UpdateTaskRequest): Observable<TaskData> {
    return this.http.put<ApiSuccessResponse<TaskData>>(`${this.apiUrl}/${id}`, dto).pipe(
      map(res => res.data),
      catchError(e => this.manejarError(e))
    )
  }

  eliminarTarea(id: string): Observable<void> {
    return this.http.delete<ApiSuccessResponse<void>>(`${this.apiUrl}/${id}`).pipe(
      map(() => undefined),
      catchError(e => this.manejarError(e))
    )
  }

  toggleTarea(id: string): Observable<TaskData> {
    return this.http.patch<ApiSuccessResponse<TaskData>>(`${this.apiUrl}/${id}/toggle`, {}).pipe(
      map(res => res.data),
      catchError(e => this.manejarError(e))
    )
  }

  agregarSubtarea(tareaId: string, label: string): Observable<TaskData> {
    return this.http.post<ApiSuccessResponse<TaskData>>(`${this.apiUrl}/${tareaId}/subtasks`, { label }).pipe(
      map(res => res.data),
      catchError(e => this.manejarError(e))
    )
  }

  eliminarSubtarea(tareaId: string, subtaskId: string): Observable<TaskData> {
    return this.http.delete<ApiSuccessResponse<TaskData>>(`${this.apiUrl}/${tareaId}/subtasks/${subtaskId}`).pipe(
      map(res => res.data),
      catchError(e => this.manejarError(e))
    )
  }

  toggleSubtarea(tareaId: string, subtaskId: string): Observable<TaskData> {
    return this.http.patch<ApiSuccessResponse<TaskData>>(`${this.apiUrl}/${tareaId}/subtasks/toggle`, { subtaskId }).pipe(
      map(res => res.data),
      catchError(e => this.manejarError(e))
    )
  }
}
