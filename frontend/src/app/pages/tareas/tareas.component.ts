import { Component, ChangeDetectorRef, OnDestroy, ChangeDetectionStrategy } from '@angular/core'
import { Router } from '@angular/router'
import { NgIf, NgFor } from '@angular/common'
import { Subject, takeUntil } from 'rxjs'
import { TaskData, TASK_CATEGORIES, TASK_PRIORITIES } from '@shared/types/task.types'
import { TareasService } from '../../services/tareas.service'
import { TaskCardComponent } from '../../shared/task-card/task-card.component'
import { TaskFormComponent, FamilyMember } from '../../shared/task-form/task-form.component'
import { ApiService } from '../../services/api.service'
import { AuthService } from '../../services/auth.service'

@Component({
  selector: 'app-tareas',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIf,
    NgFor,
    TaskCardComponent,
    TaskFormComponent,
  ],
  template: `
    <div class="page" (touchstart)="onTouchStart($event)" (touchmove)="onTouchMove($event)" (touchend)="onTouchEnd()">

      <!-- Pull indicator -->
      <div class="pull-indicator" [style.height.px]="pullDistance">
        <div class="pull-spinner" *ngIf="pulling"></div>
      </div>

      <!-- Header -->
      <header class="header">
        <h1 class="title">Tareas</h1>
        <button class="btn-nav" (click)="goCompletadas()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          Completadas
        </button>
      </header>

      <!-- Loading -->
      <div class="loading-state" *ngIf="state === 'loading'">
        <div class="skeleton card-skel" *ngFor="let _ of [].constructor(4)"></div>
      </div>

      <!-- Error -->
      <div class="error-state" *ngIf="state === 'error'">
        <p class="error-msg">No pudimos cargar tus tareas</p>
        <button class="btn-retry" (click)="loadTareas()">Reintentar</button>
      </div>

      <!-- Empty -->
      <div class="empty-state" *ngIf="state === 'loaded' && groupedTasks.length === 0">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#697586" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
        <h3 class="empty-title">No tenés tareas pendientes</h3>
        <p class="empty-sub">Creá una tarea para empezar a organizarte.</p>
      </div>

      <!-- Loaded -->
      <ng-container *ngIf="state === 'loaded' && groupedTasks.length > 0">

        <!-- Filters -->
        <div class="filters-section">
          <div class="filter-row">
            <span class="filter-label">Categoría</span>
            <div class="chips-scroll">
              <button class="chip" [class.active]="!categoryFilter" (click)="categoryFilter = ''">Todas</button>
              <button
                class="chip"
                *ngFor="let cat of categories"
                [class.active]="categoryFilter === cat.key"
                (click)="categoryFilter = cat.key"
              >
                {{ cat.icon }} {{ cat.label }}
              </button>
            </div>
          </div>
          <div class="filter-row">
            <span class="filter-label">Prioridad</span>
            <div class="chips-scroll">
              <button class="chip" [class.active]="!priorityFilter" (click)="priorityFilter = ''">Todas</button>
              <button
                class="chip"
                *ngFor="let p of priorities"
                [class.active]="priorityFilter === p.key"
                [style.--p-color]="p.color"
                (click)="priorityFilter = p.key"
              >
                <span class="chip-dot" [style.background]="p.color"></span>
                {{ p.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Task Groups -->
        <div class="task-groups">
          <div class="task-group" *ngFor="let group of filteredGroupedTasks">
            <button class="group-header" (click)="toggleGroup(group.category)">
              <span class="group-title">
                <span class="group-icon">{{ group.icon }}</span>
                {{ group.label }}
                <span class="group-count">({{ group.tasks.length }})</span>
              </span>
              <svg
                class="group-arrow"
                [class.collapsed]="collapsedCategories[group.category]"
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              ><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <div class="group-tasks" *ngIf="!collapsedCategories[group.category]">
              <app-task-card
                *ngFor="let task of group.tasks"
                [task]="task"
                (onToggle)="onTaskToggle($event)"
                (onClick)="goToDetail($event)"
              ></app-task-card>
            </div>
          </div>
        </div>

      </ng-container>

      <!-- FAB Speed Dial -->
      <div class="fab-container">
        <div class="fab-menu" *ngIf="fabOpen">
          <button class="fab-option" (click)="openTaskForm()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            Nueva tarea
          </button>
        </div>
        <button class="fab-main" (click)="fabOpen = !fabOpen" [class.open]="fabOpen">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
        </button>
      </div>

      <!-- Task Form Modal -->
      <app-task-form
        *ngIf="showTaskForm"
        [members]="familyMembers"
        (onClose)="closeTaskForm()"
        (onSaved)="onTaskSaved($event)"
      ></app-task-form>

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
    .title { font-size: 20px; font-weight: 700; color: #F0F2F5; margin: 0; }
    .btn-nav { display: flex; align-items: center; gap: 6px; background: none; border: none; padding: 6px 12px; color: #E4B3E9; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; border-radius: 999px; transition: background 150ms; }
    .btn-nav:hover { background: rgba(228,179,233,0.1); }

    .loading-state { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
    .skeleton { background: #1E2530; border-radius: 20px; animation: shimmer 1.5s ease-in-out infinite; }
    .card-skel { height: 140px; }
    @keyframes shimmer { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }

    .error-state { display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: 48px; }
    .error-msg { color: #F87171; font-size: 14px; font-weight: 500; margin: 0; }
    .btn-retry { background: #1E2530; border: none; border-radius: 999px; padding: 10px 20px; color: #F0F2F5; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; }

    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; margin-top: 80px; text-align: center; }
    .empty-title { font-size: 16px; font-weight: 500; color: #8A95A8; margin: 0; }
    .empty-sub { font-size: 13px; font-weight: 400; color: #697586; margin: 0; max-width: 260px; line-height: 1.4; }

    .filters-section { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
    .filter-row { display: flex; flex-direction: column; gap: 8px; }
    .filter-label { font-size: 11px; font-weight: 600; color: #8A95A8; text-transform: uppercase; letter-spacing: 0.5px; }
    .chips-scroll { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
    .chip { flex-shrink: 0; display: flex; align-items: center; gap: 4px; padding: 8px 14px; border: none; border-radius: 999px; background: #1E2530; color: #8A95A8; font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 150ms; }
    .chip.active { background: rgba(228,179,233,0.15); color: #E4B3E9; font-weight: 600; }
    .chip-dot { width: 6px; height: 6px; border-radius: 50%; }

    .task-groups { display: flex; flex-direction: column; gap: 16px; padding-bottom: 80px; }
    .task-group { display: flex; flex-direction: column; }
    .group-header { display: flex; align-items: center; justify-content: space-between; background: none; border: none; padding: 8px 0; cursor: pointer; }
    .group-title { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #F0F2F5; }
    .group-icon { font-size: 14px; }
    .group-count { font-size: 12px; font-weight: 400; color: #8A95A8; }
    .group-arrow { color: #697586; transition: transform 200ms; flex-shrink: 0; }
    .group-arrow.collapsed { transform: rotate(-90deg); }
    .group-tasks { display: flex; flex-direction: column; gap: 10px; margin-top: 8px; }

    .fab-container { position: fixed; bottom: 80px; right: 20px; display: flex; flex-direction: column-reverse; align-items: flex-end; gap: 8px; z-index: 90; }
    .fab-menu { display: flex; flex-direction: column-reverse; gap: 8px; }
    .fab-option { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: #161B24; border: 1px solid rgba(255,255,255,0.08); border-radius: 999px; color: #E4B3E9; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; white-space: nowrap; animation: fabIn 200ms ease-out backwards; }
    @keyframes fabIn { from { opacity: 0; transform: scale(0.8) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    .fab-main { width: 52px; height: 52px; background: #E4B3E9; border: none; border-radius: 999px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(228,179,233,0.3); transition: transform 200ms, box-shadow 200ms; }
    .fab-main:hover { transform: scale(1.05); box-shadow: 0 6px 20px rgba(228,179,233,0.4); }
    .fab-main.open { transform: rotate(45deg); }
    .fab-main svg { stroke: #0C0F14; }
  `]
})
export class TareasComponent implements OnDestroy {
  state: 'loading' | 'loaded' | 'error' = 'loading'
  tareas: TaskData[] = []
  categoryFilter = ''
  priorityFilter = ''
  fabOpen = false
  showTaskForm = false
  familyMembers: FamilyMember[] = []
  collapsedCategories: Record<string, boolean> = {}

  pullStartY = 0
  pullDistance = 0
  pulling = false

  categories = Object.entries(TASK_CATEGORIES).map(([key, val]) => ({ key, ...val }))
  priorities = Object.entries(TASK_PRIORITIES).map(([key, val]) => ({ key, ...val }))

  private destroy$ = new Subject<void>()

  constructor(
    private tareasService: TareasService,
    private api: ApiService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.loadTareas()
    this.loadFamilyMembers()
    this.initSocket()
  }

  private initSocket(): void {
    const token = this.authService.accessToken
    if (token) {
      this.tareasService.connectSocket(token)
      this.tareasService.events$.pipe(
        takeUntil(this.destroy$)
      ).subscribe(event => {
        this.handleSocketEvent(event)
      })
    }
  }

  private handleSocketEvent(event: { type: string; data: TaskData; familyId: string }): void {
    switch (event.type) {
      case 'task:created':
        if (!this.tareas.find(t => t._id === event.data._id)) {
          this.tareas = [event.data, ...this.tareas]
        }
        break
      case 'task:updated':
      case 'task:subtask:updated':
        const updatedIndex = this.tareas.findIndex(t => t._id === event.data._id)
        if (updatedIndex !== -1) {
          this.tareas[updatedIndex] = event.data
        }
        break
      case 'task:completed':
        const completedIndex = this.tareas.findIndex(t => t._id === event.data._id)
        if (completedIndex !== -1) {
          this.tareas[completedIndex] = event.data
        }
        break
      case 'task:deleted':
        this.tareas = this.tareas.filter(t => t._id !== event.data._id)
        break
    }
    this.cdr.detectChanges()
  }

  ngOnDestroy(): void {
    this.tareasService.disconnectSocket()
    this.destroy$.next()
    this.destroy$.complete()
  }

  get groupedTasks(): { category: string; label: string; icon: string; tasks: TaskData[] }[] {
    const pending = this.tareas.filter(t => !t.isCompleted)
    const groups: { category: string; label: string; icon: string; tasks: TaskData[] }[] = []

    for (const cat of this.categories) {
      const tasks = pending.filter(t => t.category === cat.key)
      if (tasks.length > 0) {
        groups.push({ category: cat.key, label: cat.label, icon: cat.icon, tasks })
      }
    }

    return groups
  }

  get filteredGroupedTasks(): { category: string; label: string; icon: string; tasks: TaskData[] }[] {
    let groups = this.groupedTasks

    if (this.categoryFilter) {
      groups = groups.filter(g => g.category === this.categoryFilter)
    }

    if (this.priorityFilter) {
      groups = groups.map(g => ({
        ...g,
        tasks: g.tasks.filter(t => t.priority === this.priorityFilter)
      })).filter(g => g.tasks.length > 0)
    }

    return groups
  }

  loadTareas(): void {
    this.state = 'loading'
    this.tareasService.obtenerTareas().pipe(
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

  toggleGroup(category: string): void {
    this.collapsedCategories[category] = !this.collapsedCategories[category]
    this.cdr.detectChanges()
  }

  onTaskToggle(id: string): void {
    this.tareasService.toggleTarea(id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (updated) => {
        const index = this.tareas.findIndex(t => t._id === id)
        if (index !== -1) {
          this.tareas[index] = updated
          this.cdr.detectChanges()
        }
      },
      error: () => {
        this.cdr.detectChanges()
      },
    })
  }

  openTaskForm(): void {
    this.fabOpen = false
    this.showTaskForm = true
    this.cdr.detectChanges()
  }

  closeTaskForm(): void {
    this.showTaskForm = false
    this.cdr.detectChanges()
  }

  onTaskSaved(task: TaskData): void {
    this.showTaskForm = false
    if (!this.tareas.find(t => t._id === task._id)) {
      this.tareas = [task, ...this.tareas]
    }
    this.cdr.detectChanges()
  }

  goCompletadas(): void {
    this.router.navigate(['/tareas/completadas'])
  }

  goToDetail(id: string): void {
    this.router.navigate(['/tareas', id])
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
