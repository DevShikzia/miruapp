import { Component, ChangeDetectorRef, OnDestroy, ChangeDetectionStrategy } from '@angular/core'
import { Router } from '@angular/router'
import { NgIf, NgFor } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Subject, takeUntil } from 'rxjs'
import { TaskData, TASK_CATEGORIES } from '@shared/types/task.types'
import { TareasService } from '../../../services/tareas.service'
import { ApiService } from '../../../services/api.service'
import { TaskCategoryLabelPipe, TaskCategoryIconPipe } from '../../../pipes/task-category-label.pipe'
import { TaskPriorityColorPipe } from '../../../pipes/task-priority-label.pipe'

export interface FamilyMember {
  _id: string
  name: string
  email: string
}

@Component({
  selector: 'app-tareas-completadas',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIf,
    NgFor,
    FormsModule,
    TaskCategoryLabelPipe,
    TaskCategoryIconPipe,
    TaskPriorityColorPipe,
  ],
  template: `
    <div class="page" (touchstart)="onTouchStart($event)" (touchmove)="onTouchMove($event)" (touchend)="onTouchEnd()">

      <!-- Pull indicator -->
      <div class="pull-indicator" [style.height.px]="pullDistance">
        <div class="pull-spinner" *ngIf="pulling"></div>
      </div>

      <!-- Header -->
      <header class="header">
        <button class="btn-back" (click)="goBack()">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h1 class="title">Completadas</h1>
        <div class="header-spacer"></div>
      </header>

      <!-- Filters -->
      <div class="filters-section">
        <div class="filter-row">
          <label class="filter-label">Categoría</label>
          <div class="select-wrapper">
            <select class="filter-select" [(ngModel)]="categoryFilter" (ngModelChange)="applyFilters()">
              <option value="">Todas</option>
              <option *ngFor="let cat of categories" [value]="cat.key">{{ cat.icon }} {{ cat.label }}</option>
            </select>
            <svg class="select-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#697586" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>

        <div class="filter-row">
          <label class="filter-label">Completado por</label>
          <div class="select-wrapper">
            <select class="filter-select" [(ngModel)]="completedByFilter" (ngModelChange)="applyFilters()">
              <option value="">Todos</option>
              <option *ngFor="let member of familyMembers" [value]="member._id">{{ member.name }}</option>
            </select>
            <svg class="select-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#697586" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>

        <div class="filter-row date-row">
          <div class="date-field">
            <label class="filter-label">Desde</label>
            <input class="date-input" type="date" [(ngModel)]="startDate" (ngModelChange)="applyFilters()" />
          </div>
          <div class="date-field">
            <label class="filter-label">Hasta</label>
            <input class="date-input" type="date" [(ngModel)]="endDate" (ngModelChange)="applyFilters()" />
          </div>
        </div>

        <button class="btn-clear" *ngIf="hasActiveFilters" (click)="clearFilters()">Limpiar filtros</button>
      </div>

      <!-- Loading -->
      <div class="loading-state" *ngIf="state === 'loading'">
        <div class="skeleton card-skel" *ngFor="let _ of [].constructor(3)"></div>
      </div>

      <!-- Error -->
      <div class="error-state" *ngIf="state === 'error'">
        <p class="error-msg">No pudimos cargar las tareas completadas</p>
        <button class="btn-retry" (click)="loadTareas()">Reintentar</button>
      </div>

      <!-- Empty -->
      <div class="empty-state" *ngIf="state === 'loaded' && tareas.length === 0">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#697586" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
        <h3 class="empty-title">No hay tareas completadas</h3>
        <p class="empty-sub">Las tareas que completes aparecerán aquí.</p>
      </div>

      <!-- Loaded -->
      <div class="task-list" *ngIf="state === 'loaded' && tareas.length > 0">
        <div class="task-card" *ngFor="let task of tareas" (click)="goDetail(task._id)">
          <div class="task-header">
            <div class="priority-dot" [style.background]="task.priority | taskPriorityColor"></div>
            <span class="task-title">{{ task.title }}</span>
          </div>
          <div class="task-meta">
            <span class="meta-chip">
              <span class="meta-icon">{{ task.category | taskCategoryIcon }}</span>
              {{ task.category | taskCategoryLabel }}
            </span>
            <span class="meta-chip completed-info" *ngIf="task.completedBy">
              ✓ {{ task.completedBy.name }}
            </span>
            <span class="meta-chip date" *ngIf="task.completedAt">
              {{ formatDate(task.completedAt) }}
            </span>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; background: #0C0F14; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
    .page { padding: 56px 20px 24px; position: relative; }

    ::-webkit-scrollbar { display: none; }

    .pull-indicator { height: 0; overflow: hidden; display: flex; align-items: center; justify-content: center; transition: height 0.2s; }
    .pull-spinner { width: 24px; height: 24px; border: 2px solid #1E2530; border-top-color: #E4B3E9; border-radius: 50%; animation: spin 800ms linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .btn-back { background: none; border: none; padding: 4px; cursor: pointer; display: flex; align-items: center; color: #F0F2F5; }
    .title { font-size: 20px; font-weight: 700; color: #F0F2F5; margin: 0; }
    .header-spacer { width: 36px; }

    .loading-state { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
    .skeleton { background: #1E2530; border-radius: 20px; animation: shimmer 1.5s ease-in-out infinite; }
    .card-skel { height: 100px; }
    @keyframes shimmer { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }

    .error-state { display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: 48px; }
    .error-msg { color: #F87171; font-size: 14px; font-weight: 500; margin: 0; }
    .btn-retry { background: #1E2530; border: none; border-radius: 999px; padding: 10px 20px; color: #F0F2F5; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; }

    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; margin-top: 80px; text-align: center; }
    .empty-title { font-size: 16px; font-weight: 500; color: #8A95A8; margin: 0; }
    .empty-sub { font-size: 13px; font-weight: 400; color: #697586; margin: 0; max-width: 260px; line-height: 1.4; }

    .filters-section { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
    .filter-row { display: flex; flex-direction: column; gap: 6px; }
    .filter-label { font-size: 11px; font-weight: 600; color: #8A95A8; text-transform: uppercase; letter-spacing: 0.5px; }
    .select-wrapper { position: relative; }
    .filter-select { width: 100%; height: 40px; background: #1E2530; border: none; border-radius: 12px; padding: 0 32px 0 12px; color: #F0F2F5; font-family: 'Inter', sans-serif; font-size: 13px; cursor: pointer; appearance: none; }
    .select-arrow { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); pointer-events: none; }

    .date-row { flex-direction: row; gap: 12px; }
    .date-field { flex: 1; display: flex; flex-direction: column; gap: 6px; }
    .date-input { height: 40px; background: #1E2530; border: none; border-radius: 12px; padding: 0 12px; color: #F0F2F5; font-family: 'Inter', sans-serif; font-size: 13px; color-scheme: dark; cursor: pointer; }
    input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.7); cursor: pointer; }

    .btn-clear { align-self: flex-start; padding: 8px 16px; background: transparent; border: 1px solid rgba(255,255,255,0.1); border-radius: 999px; color: #8A95A8; font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500; cursor: pointer; margin-top: 4px; }

    .task-list { display: flex; flex-direction: column; gap: 12px; }
    .task-card { background: #161B24; border-radius: 20px; border: 1px solid rgba(255,255,255,0.06); padding: 16px; cursor: pointer; transition: opacity 150ms; }
    .task-card:active { opacity: 0.8; }
    .task-header { display: flex; align-items: center; gap: 8px; }
    .priority-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .task-title { font-size: 14px; font-weight: 600; color: #F0F2F5; flex: 1; }
    .task-meta { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
    .meta-chip { display: flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 500; color: #8A95A8; background: rgba(255,255,255,0.04); padding: 4px 8px; border-radius: 6px; }
    .meta-icon { font-size: 10px; }
    .meta-chip.completed-info { color: #15C48C; }
  `]
})
export class TareasCompletadasComponent implements OnDestroy {
  state: 'loading' | 'loaded' | 'error' = 'loading'
  tareas: TaskData[] = []
  familyMembers: FamilyMember[] = []

  categoryFilter = ''
  completedByFilter = ''
  startDate = ''
  endDate = ''

  pullStartY = 0
  pullDistance = 0
  pulling = false

  categories = Object.entries(TASK_CATEGORIES).map(([key, val]) => ({ key, ...val }))

  private destroy$ = new Subject<void>()

  constructor(
    private tareasService: TareasService,
    private api: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.loadTareas()
    this.loadFamilyMembers()
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  get hasActiveFilters(): boolean {
    return !!(this.categoryFilter || this.completedByFilter || this.startDate || this.endDate)
  }

  loadTareas(): void {
    this.state = 'loading'
    const filtros: {
      category?: string
      completedBy?: string
      startDate?: string
      endDate?: string
    } = {}

    if (this.categoryFilter) filtros.category = this.categoryFilter
    if (this.completedByFilter) filtros.completedBy = this.completedByFilter
    if (this.startDate) filtros.startDate = this.startDate
    if (this.endDate) filtros.endDate = this.endDate

    this.tareasService.obtenerCompletadas(filtros).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (tareas) => {
        this.tareas = tareas ?? []
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

  applyFilters(): void {
    this.loadTareas()
  }

  clearFilters(): void {
    this.categoryFilter = ''
    this.completedByFilter = ''
    this.startDate = ''
    this.endDate = ''
    this.loadTareas()
  }

  goBack(): void {
    this.router.navigate(['/tareas'])
  }

  goDetail(id: string): void {
    this.router.navigate(['/tareas', id])
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
      this.loadTareas()
    }
    this.pullDistance = 0
    this.pulling = false
    this.cdr.detectChanges()
  }
}
