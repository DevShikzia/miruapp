import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { NgIf, NgFor } from '@angular/common'
import { Subject, takeUntil } from 'rxjs'
import { TaskData, TaskSubtaskData, TASK_CATEGORIES, TASK_PRIORITIES } from '@shared/types/task.types'
import { TareasService } from '../../../services/tareas.service'
import { TaskCategoryLabelPipe, TaskCategoryIconPipe } from '../../../pipes/task-category-label.pipe'
import { TaskPriorityLabelPipe, TaskPriorityColorPipe } from '../../../pipes/task-priority-label.pipe'
import { TaskFormComponent, FamilyMember } from '../../../shared/task-form/task-form.component'
import { ApiService } from '../../../services/api.service'

@Component({
  selector: 'app-tarea-detalle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIf,
    NgFor,
    FormsModule,
    TaskCategoryLabelPipe,
    TaskCategoryIconPipe,
    TaskPriorityLabelPipe,
    TaskPriorityColorPipe,
    TaskFormComponent,
  ],
  template: `
    <div class="page"
      (touchstart)="onTouchStart($event)"
      (touchmove)="onTouchMove($event)"
      (touchend)="onTouchEnd()"
    >

      <div class="pull-indicator" *ngIf="pullDistance > 0" [style.height.px]="pullDistance">
        <span class="pull-text">{{ pullDistance > 60 ? 'Suelta para recargar' : 'Tira para recargar' }}</span>
      </div>

      <!-- Header -->
      <header class="header">
        <button class="btn-back" (click)="goBack()">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F0F2F5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h1 class="title">{{ task?.title || 'Detalle' }}</h1>
        <div class="menu-wrap" (click)="toggleMenu()" (blur)="showMenu = false" tabindex="0" *ngIf="task">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8A95A8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          <div class="menu-dropdown" *ngIf="showMenu">
            <button class="menu-item" (click)="goEdit()">Editar</button>
            <button class="menu-item danger" (click)="confirmDelete()">Eliminar</button>
          </div>
        </div>
      </header>

      <!-- Loading -->
      <div class="loading-state" *ngIf="state === 'loading'">
        <div class="skeleton skeleton-card"></div>
        <div class="skeleton skeleton-section"></div>
      </div>

      <!-- Error -->
      <div class="error-state" *ngIf="state === 'error'">
        <p class="error-msg">No pudimos cargar el detalle</p>
        <button class="btn-retry" (click)="loadTarea()">Reintentar</button>
      </div>

      <ng-container *ngIf="state !== 'loading' && state !== 'error' && task">

        <!-- Status Card -->
        <div class="status-card" [class.completed-card]="task.isCompleted">
          <div class="status-row">
            <span class="priority-badge" [style.background]="task.priority | taskPriorityColor">
              {{ task.priority | taskPriorityLabel }}
            </span>
            <span class="category-badge">
              {{ task.category | taskCategoryIcon }} {{ task.category | taskCategoryLabel }}
            </span>
            <span class="completed-badge" *ngIf="task.isCompleted">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Completada
            </span>
          </div>

          <h2 class="task-title">{{ task.title }}</h2>

          <p class="task-description" *ngIf="task.description">{{ task.description }}</p>

          <div class="meta-grid">
            <div class="meta-item" *ngIf="task.dueDate">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#697586" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
              <span>{{ formatDate(task.dueDate) }}</span>
            </div>
            <div class="meta-item" *ngIf="task.createdBy">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#697586" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span>Creado por {{ task.createdBy.name }}</span>
            </div>
            <div class="meta-item" *ngIf="task.assignedTo">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#697586" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <span>Asignado a {{ task.assignedTo.name }}</span>
            </div>
            <div class="meta-item" *ngIf="task.completedBy && task.isCompleted">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15C48C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
              <span>Completada por {{ task.completedBy.name }}</span>
            </div>
          </div>
        </div>

        <!-- Subtasks Section -->
        <div class="subtasks-section">
          <div class="section-header">
            <h3 class="section-title">Subtareas</h3>
            <span class="subtask-count" *ngIf="task.subtasks.length > 0">
              {{ completedSubtasksCount }}/{{ task.subtasks.length }}
            </span>
          </div>

          <div class="subtask-progress" *ngIf="task.subtasks.length > 0">
            <div class="progress-track">
              <div class="progress-fill" [style.width.%]="subtaskProgress"></div>
            </div>
          </div>

          <div class="subtask-list">
            <div class="subtask-item" *ngFor="let sub of task.subtasks" [class.completed]="sub.completed">
              <button class="subtask-check" (click)="toggleSubtask(sub)">
                <svg *ngIf="sub.completed" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#15C48C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <svg *ngIf="!sub.completed" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#697586" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>
              </button>
              <span class="subtask-label">{{ sub.label }}</span>
              <button class="subtask-delete" (click)="deleteSubtask(sub)" *ngIf="sub.completed || task.isCompleted">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#697586" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
              </button>
            </div>
          </div>

          <!-- Add subtask -->
          <div class="add-subtask-row" *ngIf="!task.isCompleted">
            <input
              class="subtask-input"
              [(ngModel)]="newSubtaskLabel"
              type="text"
              placeholder="Agregar subtarea..."
              (keydown.enter)="addSubtask()"
            />
            <button class="btn-add-subtask" (click)="addSubtask()" [disabled]="!newSubtaskLabel.trim()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
            </button>
          </div>
        </div>

        <!-- Action Button -->
        <div class="action-section">
          <button
            class="btn-action"
            [class.btn-complete]="!task.isCompleted"
            [class.btn-uncomplete]="task.isCompleted"
            (click)="toggleTask()"
          >
            <svg *ngIf="!task.isCompleted" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            <svg *ngIf="task.isCompleted" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>
            {{ task.isCompleted ? 'Desmarcar como completada' : 'Marcar como completada' }}
          </button>
        </div>

      </ng-container>

      <!-- Delete confirmation modal -->
      <div class="modal-overlay" *ngIf="showDeleteModal" (click)="showDeleteModal = false">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <p class="modal-title">¿Eliminar tarea?</p>
          <p class="modal-desc">Esta acción no se puede deshacer. La tarea y todas sus subtareas se eliminarán permanentemente.</p>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="showDeleteModal = false">Cancelar</button>
            <button class="btn-confirm-delete" (click)="deleteTarea()" [disabled]="deleting">
              <span *ngIf="deleting" class="delete-spinner"></span>
              <span *ngIf="!deleting">Eliminar</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Success overlay -->
      <div class="success-overlay" *ngIf="showSuccess">
        <div class="success-card">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#15C48C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
          <p class="success-msg">{{ successMessage }}</p>
        </div>
      </div>

      <!-- Edit Form Modal -->
      <app-task-form
        *ngIf="showEditForm && task"
        [task]="task"
        [members]="familyMembers"
        (onClose)="closeEditForm()"
        (onSaved)="onTaskUpdated($event)"
      ></app-task-form>

    </div>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; background: #0C0F14; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
    .page { padding: 56px 20px 24px; position: relative; }

    ::-webkit-scrollbar { display: none; }

    .pull-indicator { height: 0; overflow: hidden; display: flex; align-items: center; justify-content: center; transition: height 0.2s; }
    .pull-text { font-size: 12px; color: #8A95A8; }

    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .btn-back { background: none; border: none; padding: 4px; cursor: pointer; display: flex; align-items: center; }
    .title { font-size: 18px; font-weight: 700; color: #F0F2F5; margin: 0; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 12px; }
    .menu-wrap { position: relative; padding: 4px; cursor: pointer; outline: none; }
    .menu-dropdown { position: absolute; right: 0; top: 100%; margin-top: 4px; background: #1E2530; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 4px; min-width: 120px; z-index: 100; }
    .menu-item { display: block; width: 100%; padding: 10px 14px; background: none; border: none; text-align: left; color: #F0F2F5; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; border-radius: 8px; }
    .menu-item:hover { background: rgba(255,255,255,0.05); }
    .menu-item.danger { color: #E05252; }

    .loading-state { display: flex; flex-direction: column; gap: 16px; margin-top: 16px; }
    .skeleton { background: #1E2530; border-radius: 20px; animation: shimmer 1.5s ease-in-out infinite; }
    .skeleton-card { height: 200px; }
    .skeleton-section { height: 120px; }
    @keyframes shimmer { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }

    .error-state { display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: 48px; }
    .error-msg { color: #F87171; font-size: 14px; font-weight: 500; margin: 0; }
    .btn-retry { background: #1E2530; border: none; border-radius: 999px; padding: 10px 20px; color: #F0F2F5; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; }

    .status-card { background: #161B24; border-radius: 24px; border: 1px solid rgba(255,255,255,0.06); padding: 20px; }
    .status-card.completed-card { opacity: 0.7; }
    .status-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
    .priority-badge { font-size: 11px; font-weight: 600; color: #0C0F14; padding: 4px 8px; border-radius: 6px; }
    .category-badge { font-size: 11px; font-weight: 500; color: #8A95A8; background: rgba(255,255,255,0.04); padding: 4px 8px; border-radius: 6px; }
    .completed-badge { display: flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; color: #15C48C; background: rgba(21,196,140,0.15); padding: 4px 8px; border-radius: 6px; }

    .task-title { font-size: 20px; font-weight: 700; color: #F0F2F5; margin: 0 0 8px; line-height: 1.3; }
    .task-description { font-size: 14px; color: #8A95A8; margin: 0 0 16px; line-height: 1.5; }

    .meta-grid { display: flex; flex-direction: column; gap: 8px; }
    .meta-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #8A95A8; }

    .subtasks-section { margin-top: 20px; background: #161B24; border-radius: 24px; border: 1px solid rgba(255,255,255,0.06); padding: 20px; }
    .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .section-title { font-size: 14px; font-weight: 600; color: #F0F2F5; margin: 0; }
    .subtask-count { font-size: 12px; font-weight: 600; color: #8A95A8; }

    .subtask-progress { margin-bottom: 16px; }
    .progress-track { height: 6px; background: #1E2530; border-radius: 999px; overflow: hidden; }
    .progress-fill { height: 100%; background: #E4B3E9; border-radius: 999px; transition: width 300ms ease; }

    .subtask-list { display: flex; flex-direction: column; gap: 8px; }
    .subtask-item { display: flex; align-items: center; gap: 10px; padding: 8px; background: rgba(255,255,255,0.02); border-radius: 10px; }
    .subtask-item.completed .subtask-label { text-decoration: line-through; opacity: 0.5; }
    .subtask-check { background: none; border: none; padding: 0; cursor: pointer; display: flex; align-items: center; flex-shrink: 0; }
    .subtask-label { flex: 1; font-size: 14px; color: #F0F2F5; }
    .subtask-delete { background: none; border: none; padding: 4px; cursor: pointer; display: flex; align-items: center; opacity: 0.5; }
    .subtask-delete:hover { opacity: 1; }

    .add-subtask-row { display: flex; gap: 8px; margin-top: 12px; }
    .subtask-input { flex: 1; height: 40px; background: #1E2530; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 0 14px; color: #F0F2F5; font-family: 'Inter', sans-serif; font-size: 13px; outline: none; }
    .subtask-input:focus { border-color: #E4B3E9; }
    .subtask-input::placeholder { color: #697586; }
    .btn-add-subtask { width: 40px; height: 40px; background: rgba(228,179,233,0.15); border: none; border-radius: 12px; color: #E4B3E9; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .btn-add-subtask:disabled { opacity: 0.4; cursor: not-allowed; }

    .action-section { margin-top: 24px; padding-bottom: 20px; }
    .btn-action { width: 100%; height: 48px; border: none; border-radius: 999px; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: opacity 150ms; }
    .btn-action:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-complete { background: #E4B3E9; color: #0C0F14; }
    .btn-uncomplete { background: #1E2530; color: #F0F2F5; border: 1px solid rgba(255,255,255,0.1); }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 20px; }
    .modal-card { background: #1E2530; border-radius: 20px; padding: 24px; max-width: 320px; width: 100%; }
    .modal-title { font-size: 16px; font-weight: 600; color: #F0F2F5; margin: 0 0 8px; }
    .modal-desc { font-size: 13px; color: #8A95A8; margin: 0 0 20px; line-height: 1.5; }
    .modal-actions { display: flex; gap: 12px; }
    .btn-cancel { flex: 1; height: 40px; background: transparent; border: 1px solid rgba(255,255,255,0.1); border-radius: 999px; color: #F0F2F5; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; }
    .btn-confirm-delete { flex: 1; height: 40px; background: #E05252; border: none; border-radius: 999px; color: #F0F2F5; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .btn-confirm-delete:disabled { opacity: 0.6; cursor: not-allowed; }
    .delete-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 800ms linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .success-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 300; }
    .success-card { background: #161B24; border-radius: 24px; padding: 32px; display: flex; flex-direction: column; align-items: center; gap: 16px; }
    .success-msg { font-size: 14px; font-weight: 600; color: #F0F2F5; margin: 0; text-align: center; }
  `]
})
export class TareaDetalleComponent implements OnInit, OnDestroy {
  state: 'loading' | 'loaded' | 'error' = 'loading'
  task: TaskData | null = null
  showMenu = false
  showDeleteModal = false
  showEditForm = false
  showSuccess = false
  successMessage = ''
  deleting = false
  newSubtaskLabel = ''
  familyMembers: FamilyMember[] = []

  pullStartY = 0
  pullDistance = 0
  pulling = false

  private destroy$ = new Subject<void>()
  private taskId = ''

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tareasService: TareasService,
    private api: ApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.taskId = this.route.snapshot.paramMap.get('id') || ''
    this.loadTarea()
    this.loadFamilyMembers()
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  get completedSubtasksCount(): number {
    return this.task?.subtasks.filter(s => s.completed).length ?? 0
  }

  get subtaskProgress(): number {
    if (!this.task || this.task.subtasks.length === 0) return 0
    return (this.completedSubtasksCount / this.task.subtasks.length) * 100
  }

  loadTarea(): void {
    if (!this.taskId) return
    this.state = 'loading'
    this.tareasService.obtenerTarea(this.taskId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (task) => {
        this.task = task
        this.state = 'loaded'
        this.cdr.detectChanges()
      },
      error: () => {
        this.state = 'error'
        this.cdr.detectChanges()
      },
    })
  }

  loadFamilyMembers(): void {
    this.api.get<FamilyMember[]>('/auth/family-members').pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res) => {
        this.familyMembers = res?.data ?? []
        this.cdr.detectChanges()
      },
      error: () => {
        this.familyMembers = []
        this.cdr.detectChanges()
      },
    })
  }

  toggleMenu(): void {
    this.showMenu = !this.showMenu
    this.cdr.detectChanges()
  }

  goBack(): void {
    this.router.navigate(['/tareas'])
  }

  goEdit(): void {
    this.showMenu = false
    this.showEditForm = true
    this.cdr.detectChanges()
  }

  closeEditForm(): void {
    this.showEditForm = false
    this.cdr.detectChanges()
  }

  onTaskUpdated(updated: TaskData): void {
    this.showEditForm = false
    this.task = updated
    this.cdr.detectChanges()
  }

  confirmDelete(): void {
    this.showMenu = false
    this.showDeleteModal = true
    this.cdr.detectChanges()
  }

  deleteTarea(): void {
    if (!this.task || this.deleting) return
    this.deleting = true
    this.tareasService.eliminarTarea(this.task._id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.showDeleteModal = false
        this.deleting = false
        this.showSuccessMessage('Tarea eliminada')
        setTimeout(() => {
          this.router.navigate(['/tareas'])
        }, 1500)
        this.cdr.detectChanges()
      },
      error: () => {
        this.deleting = false
        this.cdr.detectChanges()
      },
    })
  }

  toggleTask(): void {
    if (!this.task) return
    this.tareasService.toggleTarea(this.task._id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (updated) => {
        this.task = updated
        const msg = updated.isCompleted ? 'Tarea completada' : 'Tarea desmarcada'
        this.showSuccessMessage(msg)
        this.cdr.detectChanges()
      },
      error: () => {
        this.cdr.detectChanges()
      },
    })
  }

  toggleSubtask(sub: TaskSubtaskData): void {
    if (!this.task) return
    this.tareasService.toggleSubtarea(this.task._id, sub.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (updated) => {
        this.task = updated
        this.cdr.detectChanges()
      },
      error: () => {
        this.cdr.detectChanges()
      },
    })
  }

  addSubtask(): void {
    if (!this.task || !this.newSubtaskLabel.trim()) return
    const label = this.newSubtaskLabel.trim()
    this.newSubtaskLabel = ''
    this.tareasService.agregarSubtarea(this.task._id, label).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (updated) => {
        this.task = updated
        this.cdr.detectChanges()
      },
      error: () => {
        this.cdr.detectChanges()
      },
    })
  }

  deleteSubtask(sub: TaskSubtaskData): void {
    if (!this.task) return
    this.tareasService.eliminarSubtarea(this.task._id, sub.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (updated) => {
        this.task = updated
        this.cdr.detectChanges()
      },
      error: () => {
        this.cdr.detectChanges()
      },
    })
  }

  private showSuccessMessage(msg: string): void {
    this.successMessage = msg
    this.showSuccess = true
    this.cdr.detectChanges()
    setTimeout(() => {
      this.showSuccess = false
      this.cdr.detectChanges()
    }, 1500)
  }

  formatDate(date: string): string {
    const d = new Date(date)
    const day = d.getDate().toString().padStart(2, '0')
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const year = d.getFullYear()
    return `${day}/${month}/${year}`
  }

  onTouchStart(event: TouchEvent): void {
    if (window.scrollY <= 0) {
      this.pullStartY = event.touches[0].clientY
      this.pulling = true
    }
  }

  onTouchMove(event: TouchEvent): void {
    if (!this.pulling) return
    const diff = event.touches[0].clientY - this.pullStartY
    if (diff > 0) {
      this.pullDistance = Math.min(diff * 0.4, 120)
      this.cdr.detectChanges()
    }
  }

  onTouchEnd(): void {
    if (this.pullDistance > 60) {
      this.loadTarea()
    }
    this.pullDistance = 0
    this.pulling = false
    this.cdr.detectChanges()
  }
}
