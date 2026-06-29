import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { NgIf, NgFor } from '@angular/common'
import { Subject, takeUntil } from 'rxjs'
import { TaskData, TaskCategory, TaskPriority, CreateTaskRequest, UpdateTaskRequest, TASK_CATEGORIES, TASK_PRIORITIES } from '@shared/types/task.types'
import { IUserPublic } from '@shared/types/auth.types'
import { TareasService } from '../../services/tareas.service'
import { ApiService } from '../../services/api.service'

export interface FamilyMember {
  _id: string
  name: string
  email: string
}

@Component({
  selector: 'app-task-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, NgIf, NgFor],
  template: `
    <div class="modal-overlay" (click)="onClose.emit()">
      <div class="bottom-sheet" (click)="$event.stopPropagation()">
        <div class="sheet-handle"></div>

        <header class="sheet-header">
          <h2 class="sheet-title">{{ isEditing ? 'Editar tarea' : 'Nueva tarea' }}</h2>
          <button class="btn-close" (click)="onClose.emit()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#697586" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
          </button>
        </header>

        <div class="form-body">
          <!-- Título -->
          <div class="field-section">
            <label class="field-label">Título *</label>
            <div class="input-wrapper" [class.error]="titleError">
              <input
                class="text-input"
                [(ngModel)]="title"
                type="text"
                placeholder="¿Qué necesitas hacer?"
                maxlength="100"
              />
            </div>
            <span class="field-hint" *ngIf="titleError">{{ titleError }}</span>
          </div>

          <!-- Descripción -->
          <div class="field-section">
            <label class="field-label">Descripción</label>
            <div class="input-wrapper textarea-wrapper">
              <textarea
                class="text-input textarea"
                [(ngModel)]="description"
                placeholder="Agrega más detalles..."
                maxlength="500"
                rows="3"
              ></textarea>
            </div>
          </div>

          <!-- Categoría -->
          <div class="field-section">
            <label class="field-label">Categoría *</label>
            <div class="chip-row">
              <button
                type="button"
                class="cat-chip"
                *ngFor="let cat of categories"
                [class.active]="category === cat.key"
                (click)="category = cat.key"
              >
                <span class="cat-icon">{{ cat.icon }}</span>
                {{ cat.label }}
              </button>
            </div>
          </div>

          <!-- Prioridad -->
          <div class="field-section">
            <label class="field-label">Prioridad *</label>
            <div class="priority-row">
              <button
                type="button"
                class="priority-btn"
                *ngFor="let p of priorities"
                [class.active]="priority === p.key"
                [style.--p-color]="p.color"
                (click)="priority = p.key"
              >
                <span class="priority-dot" [style.background]="p.color"></span>
                {{ p.label }}
              </button>
            </div>
          </div>

          <!-- Fecha -->
          <div class="field-section">
            <label class="field-label">Fecha de vencimiento</label>
            <div class="input-wrapper">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#697586" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
              <input class="text-input date-input" [(ngModel)]="dueDate" type="date" />
            </div>
          </div>

          <!-- Asignado a -->
          <div class="field-section" *ngIf="members.length > 0">
            <label class="field-label">Asignar a</label>
            <div class="input-wrapper select-wrapper">
              <select class="text-input select-input" [(ngModel)]="assignedTo">
                <option [value]="''">Sin asignar</option>
                <option *ngFor="let m of members" [value]="m._id">{{ m.name }}</option>
              </select>
              <svg class="select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#697586" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>

          <!-- Subtareas -->
          <div class="field-section">
            <label class="field-label">Subtareas</label>
            <div class="subtask-input-row">
              <input
                class="subtask-input"
                [(ngModel)]="newSubtask"
                type="text"
                placeholder="Escribí y presioná Enter para agregar"
                (keydown.enter)="addSubtask()"
              />
              <button class="btn-add-subtask" (click)="addSubtask()" [disabled]="!newSubtask.trim()">+</button>
            </div>
            <div class="subtask-chips" *ngIf="subtasks.length > 0">
              <div class="subtask-chip" *ngFor="let s of subtasks; let i = index">
                <span>{{ s }}</span>
                <button class="btn-remove-subtask" (click)="removeSubtask(i)">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Error -->
          <p class="form-error" *ngIf="saveError">{{ saveError }}</p>

          <!-- Save Button -->
          <button
            class="btn-save"
            [disabled]="!canSave || saving"
            (click)="onSave()"
          >
            <span *ngIf="saving" class="save-spinner">
              <img src="/assets/miru-icon.svg" class="spinner-miru" alt="Cargando" />
            </span>
            <span *ngIf="!saving">{{ isEditing ? 'Guardar cambios' : 'Crear tarea' }}</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: flex-end; justify-content: center; z-index: 200; }
    .bottom-sheet { width: 100%; max-width: 390px; background: #1E2530; border-radius: 24px 24px 0 0; padding: 0 20px 32px; max-height: 85vh; overflow-y: auto; }
    .sheet-handle { width: 36px; height: 4px; background: #697586; border-radius: 999px; margin: 0 auto 16px; }

    .sheet-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .sheet-title { font-size: 18px; font-weight: 600; color: #F0F2F5; margin: 0; }
    .btn-close { background: none; border: none; padding: 4px; cursor: pointer; display: flex; align-items: center; }

    .form-body { display: flex; flex-direction: column; gap: 16px; }

    .field-section { display: flex; flex-direction: column; gap: 8px; }
    .field-label { font-size: 12px; font-weight: 600; color: #8A95A8; text-transform: uppercase; letter-spacing: 0.5px; }
    .field-hint { font-size: 11px; color: #E05252; }

    .input-wrapper { display: flex; align-items: center; gap: 10px; background: #161B24; border-radius: 12px; height: 44px; padding: 0 14px; border: 1px solid transparent; transition: border-color 150ms; }
    .input-wrapper:focus-within { border-color: #E4B3E9; }
    .input-wrapper.error { border-color: #E05252; }
    .input-wrapper.textarea-wrapper { height: auto; min-height: 72px; padding: 12px 14px; align-items: flex-start; }
    .input-wrapper.select-wrapper { cursor: pointer; }

    .text-input { flex: 1; background: transparent; border: none; outline: none; color: #F0F2F5; font-family: 'Inter', sans-serif; font-size: 14px; }
    .text-input::placeholder { color: #697586; }
    .textarea { resize: none; height: auto; min-height: 60px; }
    .date-input { color-scheme: dark; cursor: pointer; }
    input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.7); cursor: pointer; }
    .select-input { cursor: pointer; appearance: none; }
    .select-arrow { flex-shrink: 0; pointer-events: none; }

    .chip-row { display: flex; flex-wrap: wrap; gap: 6px; }
    .cat-chip { display: flex; align-items: center; gap: 4px; padding: 8px 12px; background: #161B24; border: 1px solid transparent; border-radius: 999px; color: #8A95A8; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 150ms; }
    .cat-chip.active { background: rgba(228,179,233,0.15); border-color: #E4B3E9; color: #E4B3E9; }
    .cat-icon { font-size: 12px; }

    .priority-row { display: flex; gap: 8px; }
    .priority-btn { display: flex; align-items: center; gap: 6px; padding: 10px 16px; background: #161B24; border: 1px solid transparent; border-radius: 999px; color: #8A95A8; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 150ms; }
    .priority-btn.active { background: rgba(var(--p-color-rgb, 228,179,233), 0.15); border-color: var(--p-color); color: var(--p-color); }
    .priority-dot { width: 8px; height: 8px; border-radius: 50%; }

    .subtask-input-row { display: flex; gap: 8px; }
    .subtask-input { flex: 1; height: 40px; background: #161B24; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 0 14px; color: #F0F2F5; font-family: 'Inter', sans-serif; font-size: 13px; outline: none; }
    .subtask-input:focus { border-color: #E4B3E9; }
    .subtask-input::placeholder { color: #697586; }
    .btn-add-subtask { width: 40px; height: 40px; background: rgba(228,179,233,0.15); border: none; border-radius: 12px; color: #E4B3E9; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .btn-add-subtask:disabled { opacity: 0.4; cursor: not-allowed; }

    .subtask-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .subtask-chip { display: flex; align-items: center; gap: 6px; padding: 6px 10px; background: rgba(228,179,233,0.1); border-radius: 8px; font-size: 12px; color: #E4B3E9; }
    .btn-remove-subtask { background: none; border: none; padding: 0; cursor: pointer; display: flex; align-items: center; color: #E4B3E9; opacity: 0.7; }
    .btn-remove-subtask:hover { opacity: 1; }

    .form-error { color: #F87171; font-size: 12px; font-weight: 400; text-align: center; margin: 0; }

    .btn-save { width: 100%; height: 44px; margin-top: 8px; background: #E4B3E9; color: #0C0F14; border: none; border-radius: 999px; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: opacity 150ms; }
    .btn-save:disabled { opacity: 0.4; cursor: not-allowed; }
    .save-spinner { display: flex; align-items: center; }
    .spinner-miru { width: 20px; height: 20px; animation: spin 800ms linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class TaskFormComponent implements OnInit, OnDestroy {
  @Input() task?: TaskData
  @Input() members: FamilyMember[] = []
  @Output() onClose = new EventEmitter<void>()
  @Output() onSaved = new EventEmitter<TaskData>()

  title = ''
  description = ''
  category: TaskCategory = 'personal'
  priority: TaskPriority = 'medium'
  dueDate = ''
  assignedTo = ''
  subtasks: string[] = []
  newSubtask = ''
  saving = false
  saveError = ''
  titleError = ''

  categories: { key: TaskCategory; label: string; icon: string }[] = Object.entries(TASK_CATEGORIES).map(([key, val]) => ({ key: key as TaskCategory, ...val }))
  priorities: { key: TaskPriority; label: string; color: string }[] = Object.entries(TASK_PRIORITIES).map(([key, val]) => ({ key: key as TaskPriority, ...val }))

  get isEditing(): boolean {
    return !!this.task
  }

  get canSave(): boolean {
    return this.title.trim().length >= 2 && this.title.trim().length <= 100
  }

  private destroy$ = new Subject<void>()

  constructor(
    private tareasService: TareasService,
    private api: ApiService,
  ) {}

  ngOnInit(): void {
    if (this.task) {
      this.title = this.task.title
      this.description = this.task.description || ''
      this.category = this.task.category
      this.priority = this.task.priority
      this.dueDate = this.task.dueDate || ''
      this.assignedTo = this.task.assignedTo?._id || ''
      this.subtasks = this.task.subtasks.map(s => s.label)
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  addSubtask(): void {
    const label = this.newSubtask.trim()
    if (label && !this.subtasks.includes(label)) {
      this.subtasks.push(label)
      this.newSubtask = ''
    }
  }

  removeSubtask(index: number): void {
    this.subtasks.splice(index, 1)
  }

  onSave(): void {
    if (!this.canSave || this.saving) return

    this.titleError = ''
    if (this.title.trim().length < 2) {
      this.titleError = 'El título debe tener al menos 2 caracteres'
      return
    }

    this.saving = true
    this.saveError = ''

    const dto: CreateTaskRequest | UpdateTaskRequest = {
      title: this.title.trim(),
      description: this.description.trim() || undefined,
      category: this.category,
      priority: this.priority,
      dueDate: this.dueDate || undefined,
      assignedTo: this.assignedTo || undefined,
      subtasks: this.subtasks.map(label => ({ label })),
    }

    if (this.isEditing && this.task) {
      const updateDto: UpdateTaskRequest = {
        title: dto.title,
        description: dto.description,
        category: dto.category,
        priority: dto.priority,
        dueDate: dto.dueDate,
        assignedTo: dto.assignedTo,
      }
      this.tareasService.actualizarTarea(this.task._id, updateDto).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (updated) => {
          this.saving = false
          this.onSaved.emit(updated)
        },
        error: () => {
          this.saving = false
          this.saveError = 'No pudimos actualizar la tarea'
        },
      })
    } else {
      this.tareasService.crearTarea(dto as CreateTaskRequest).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (created) => {
          this.saving = false
          this.onSaved.emit(created)
        },
        error: () => {
          this.saving = false
          this.saveError = 'No pudimos crear la tarea'
        },
      })
    }
  }
}