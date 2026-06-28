import { Component, HostListener, ChangeDetectorRef } from '@angular/core'
import { NgIf, NgFor, NgClass, DecimalPipe } from '@angular/common'
import { RouterLink } from '@angular/router'
import { ApiService } from '../../services/api.service'
import type { IncomeData } from '@shared/types/income.types'
import type { ExpenseData } from '@shared/types/expense.types'

type MovementType = 'income' | 'expense' | 'transfer'
type FilterType = 'month' | 'all' | 'income' | 'expense' | 'category'

interface Movement {
  id: string
  type: MovementType
  description: string
  amount: number
  category: string
  categoryKey: string
  date: string
  time: string
  createdBy: string
}

interface DateGroup {
  label: string
  items: Movement[]
}

interface MonthOption {
  label: string
  value: string
}

const CATEGORY_LABELS: Record<string, string> = {
  salary: 'Salario', freelance: 'Freelance', investment: 'Inversión',
  sale: 'Venta', family: 'Familia', loan: 'Préstamo', refund: 'Reembolso',
  food: 'Comidas', transport: 'Transporte', utilities: 'Servicios',
  rent: 'Alquiler', health: 'Salud', education: 'Educación',
  entertainment: 'Entretenimiento', savings: 'Ahorros', debt: 'Deudas', other: 'Otro',
}

const MONTH_NAMES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function buildMonthOptions(): MonthOption[] {
  const now = new Date()
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    return { label: `${MONTH_NAMES[d.getMonth()]} ${y}`, value: `${y}-${m}` }
  })
}

function currentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function getDateLabel(dateStr: string): string {
  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().slice(0, 10)

  if (dateStr === todayStr) return 'Hoy'
  if (dateStr === yesterdayStr) return 'Ayer'

  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }).replace(/\./g, '').replace(/ de /g, ' ')
}

function groupByDate(movements: Movement[]): DateGroup[] {
  const groups: Record<string, Movement[]> = {}
  for (const m of movements) {
    if (!groups[m.date]) groups[m.date] = []
    groups[m.date].push(m)
  }
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({ label: getDateLabel(date), items }))
}

@Component({
  selector: 'app-movimientos',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, DecimalPipe, RouterLink],
  template: `
    <div class="container">
      <!-- Header -->
      <header class="header">
        <a class="btn-back" routerLink="/dashboard">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F0F2F5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </a>
        <h1 class="title">Movimientos</h1>
        <button class="btn-add" (click)="onAdd()">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E4B3E9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        </button>
      </header>

      <!-- Month picker -->
      <div class="month-picker" *ngIf="showMonthPicker">
        <div class="month-options">
          <button class="month-option" *ngFor="let m of months" [class.active]="m.value === selectedMonth" (click)="selectMonth(m.value)">
            {{ m.label }}
          </button>
        </div>
      </div>

      <!-- Filter chips -->
      <div class="chips-wrapper">
        <div class="chips-scroll">
          <button class="chip" *ngFor="let chip of chips" [class.active]="chip.key === activeFilter && chip.key !== 'category'" (click)="onChipClick(chip.key)">
            <span *ngIf="chip.key === 'month'">{{ selectedMonthLabel }}</span>
            <span *ngIf="chip.key !== 'month'">{{ chip.label }}</span>
          </button>
        </div>
      </div>

      <!-- Loading state -->
      <ng-container *ngIf="state === 'loading'">
        <div class="skeleton-summary">
          <div class="skeleton-card"></div>
          <div class="skeleton-card"></div>
        </div>
        <div class="skeleton-list">
          <div class="skeleton-item" *ngFor="let _ of [].constructor(5)"><div class="skeleton-line"></div><div class="skeleton-line short"></div><div class="skeleton-line amount"></div></div>
        </div>
      </ng-container>

      <!-- Error state -->
      <div class="error-state" *ngIf="state === 'error'">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#E05252" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
        <p class="error-text">No pudimos cargar los movimientos</p>
        <button class="btn-retry" (click)="loadMovements()">Reintentar</button>
      </div>

      <!-- Loaded state -->
      <ng-container *ngIf="state === 'loaded' || state === 'loading-more'">
        <!-- Summary cards -->
        <div class="summary" *ngIf="filteredMovements.length > 0 || activeFilter === 'all' || activeFilter === 'month'">
          <div class="summary-card">
            <div class="summary-card-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#15C48C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 7 7 17"/><path d="M17 17H7V7"/></svg>
              <span class="summary-label">Ingresos</span>
            </div>
            <span class="summary-amount income">$ {{ totalIncome | number:'1.0-0' }}</span>
          </div>
          <div class="summary-card">
            <div class="summary-card-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E05252" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7l10 10"/><path d="M17 7v10H7"/></svg>
              <span class="summary-label">Gastos</span>
            </div>
            <span class="summary-amount expense">$ {{ totalExpense | number:'1.0-0' }}</span>
          </div>
        </div>

        <!-- Movement list -->
        <div class="movement-list" *ngIf="displayMovements.length > 0; else emptyState">
          <ng-container *ngFor="let group of groupedDisplay">
            <div class="date-separator">
              <span class="date-label">{{ group.label }}</span>
            </div>
            <div class="movement-item" *ngFor="let m of group.items" (click)="onMovementClick(m)">
              <div class="movement-icon" [ngClass]="m.type">
                <svg *ngIf="m.type === 'income'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#15C48C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 7 7 17"/><path d="M17 17H7V7"/></svg>
                <svg *ngIf="m.type === 'expense'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E05252" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7l10 10"/><path d="M17 7v10H7"/></svg>
                <svg *ngIf="m.type === 'transfer'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5B8DEF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 7-5 5 5 5"/><path d="m15 7 5 5-5 5"/></svg>
              </div>
              <div class="movement-info">
                <span class="movement-name">{{ m.description }}</span>
                <span class="movement-meta">{{ m.category }} · {{ m.time }} · {{ m.createdBy }}</span>
              </div>
              <span class="movement-amount" [ngClass]="m.type">
                {{ m.type === 'income' ? '+' : '-' }}$ {{ m.amount | number:'1.0-0' }}
              </span>
            </div>
          </ng-container>

          <!-- Loading more indicator -->
          <div class="loading-more" *ngIf="state === 'loading-more'">
            <div class="spinner"></div>
          </div>
        </div>

        <!-- Empty state -->
        <ng-template #emptyState>
          <div class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#697586" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            <p class="empty-title">No hay movimientos en este período</p>
            <p class="empty-subtitle">Agregá tu primer movimiento con el botón +</p>
            <button class="btn-empty-add" (click)="onAdd()">Agregar movimiento</button>
          </div>
        </ng-template>
      </ng-container>
    </div>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; background: #0C0F14; font-family: 'Inter', sans-serif; }
    .container { padding: 56px 20px 80px; max-width: 390px; margin: 0 auto; }
    ::-webkit-scrollbar { display: none; }

    /* Header */
    .header { display: flex; align-items: center; justify-content: space-between; padding-top: 40px; }
    .btn-back, .btn-add { background: none; border: none; padding: 4px; cursor: pointer; display: flex; align-items: center; }
    .title { font-size: 20px; font-weight: 700; color: #F0F2F5; margin: 0; }

    /* Month picker */
    .month-picker { margin-top: 12px; background: #161B24; border-radius: 16px; border: 1px solid rgba(255,255,255,0.06); padding: 8px; overflow: hidden; }
    .month-options { display: flex; gap: 4px; overflow-x: auto; }
    .month-option { flex-shrink: 0; padding: 8px 14px; border: none; border-radius: 999px; background: transparent; color: #8A95A8; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; white-space: nowrap; transition: all 0.2s; }
    .month-option.active { background: rgba(228,179,233,0.15); color: #E4B3E9; font-weight: 600; }
    .month-option:hover { background: rgba(255,255,255,0.05); }

    /* Chips */
    .chips-wrapper { margin-top: 20px; overflow: hidden; position: relative; }
    .chips-wrapper::after { content: ''; position: absolute; top: 0; right: 0; width: 40px; height: 100%; background: linear-gradient(to right, transparent, #0C0F14); pointer-events: none; }
    .chips-scroll { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; -ms-overflow-style: none; padding-bottom: 4px; }
    .chip { flex-shrink: 0; padding: 10px 16px; border: none; border-radius: 999px; background: #1E2530; color: #8A95A8; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; white-space: nowrap; transition: all 0.2s; }
    .chip.active { background: rgba(228,179,233,0.15); color: #E4B3E9; font-weight: 600; }
    .chip:hover { background: rgba(255,255,255,0.05); }

    /* Summary */
    .summary { margin-top: 16px; display: flex; gap: 12px; position: sticky; top: 0; z-index: 10; }
    .summary-card { flex: 1; background: #161B24; border-radius: 16px; padding: 12px; display: flex; flex-direction: column; gap: 6px; }
    .summary-card-header { display: flex; align-items: center; gap: 6px; }
    .summary-label { font-size: 11px; font-weight: 400; color: #8A95A8; }
    .summary-amount { font-size: 16px; font-weight: 700; }
    .summary-amount.income { color: #15C48C; }
    .summary-amount.expense { color: #E05252; }

    /* Movement list */
    .movement-list { margin-top: 16px; }
    .date-separator { display: flex; align-items: center; gap: 12px; padding: 12px 0 8px; border-bottom: 1px solid rgba(255,255,255,0.04); margin-bottom: 4px; }
    .date-label { font-size: 12px; font-weight: 500; color: #697586; white-space: nowrap; }

    .movement-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04); cursor: pointer; transition: background 0.15s; min-height: 56px; }
    .movement-item:hover { background: rgba(255,255,255,0.02); margin: 0 -20px; padding-left: 20px; padding-right: 20px; }
    .movement-icon { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .movement-icon.income { background: rgba(21,196,140,0.15); }
    .movement-icon.expense { background: rgba(224,82,82,0.15); }
    .movement-icon.transfer { background: rgba(91,141,239,0.15); }
    .movement-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
    .movement-name { font-size: 14px; font-weight: 500; color: #F0F2F5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .movement-meta { font-size: 12px; font-weight: 400; color: #697586; }
    .movement-amount { font-size: 14px; font-weight: 600; text-align: right; flex-shrink: 0; white-space: nowrap; }
    .movement-amount.income { color: #15C48C; }
    .movement-amount.expense { color: #E05252; }
    .movement-amount.transfer { color: #5B8DEF; }

    /* Empty state */
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 20px; text-align: center; }
    .empty-title { font-size: 14px; font-weight: 500; color: #8A95A8; margin: 16px 0 4px; }
    .empty-subtitle { font-size: 12px; font-weight: 400; color: #697586; margin: 0 0 20px; }
    .btn-empty-add { padding: 12px 24px; border: none; border-radius: 999px; background: #E4B3E9; color: #0C0F14; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; height: 44px; }

    /* Error state */
    .error-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 20px; text-align: center; }
    .error-text { font-size: 14px; font-weight: 500; color: #8A95A8; margin: 16px 0 20px; }
    .btn-retry { padding: 12px 24px; border: none; border-radius: 999px; background: #E4B3E9; color: #0C0F14; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; height: 44px; }

    /* Skeleton */
    .skeleton-summary { margin-top: 16px; display: flex; gap: 12px; }
    .skeleton-card { flex: 1; height: 64px; background: #1E2530; border-radius: 16px; animation: shimmer 1.5s infinite; }
    .skeleton-list { margin-top: 16px; }
    .skeleton-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; min-height: 56px; border-bottom: 1px solid rgba(255,255,255,0.04); }
    .skeleton-line { height: 12px; background: #1E2530; border-radius: 6px; animation: shimmer 1.5s infinite; flex: 1; }
    .skeleton-line.short { max-width: 100px; }
    .skeleton-line.amount { max-width: 80px; }

    /* Loading more */
    .loading-more { display: flex; justify-content: center; padding: 20px; }
    .spinner { width: 24px; height: 24px; border: 2px solid rgba(228,179,233,0.2); border-top-color: #E4B3E9; border-radius: 50%; animation: spin 0.6s linear infinite; }

    @keyframes shimmer { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class MovimientosComponent {
  state: 'loading' | 'loaded' | 'error' | 'loading-more' = 'loading'
  allMovements: Movement[] = []
  displayMovements: Movement[] = []
  groupedDisplay: DateGroup[] = []
  pageSize = 20
  loadedCount = 0
  activeFilter: FilterType = 'all'
  showMonthPicker = false
  selectedMonth = currentMonth()
  months = buildMonthOptions()

  chips = [
    { key: 'month' as FilterType, label: 'Este mes' },
    { key: 'all' as FilterType, label: 'Todos' },
    { key: 'income' as FilterType, label: 'Ingresos' },
    { key: 'expense' as FilterType, label: 'Gastos' },
    { key: 'category' as FilterType, label: 'Categoría' },
  ]

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
  ) {}

  get selectedMonthLabel(): string {
    return this.months.find(m => m.value === this.selectedMonth)?.label || 'Este mes'
  }

  get filteredMovements(): Movement[] {
    let filtered = this.allMovements

    if (this.activeFilter === 'income') {
      filtered = filtered.filter(m => m.type === 'income')
    } else if (this.activeFilter === 'expense') {
      filtered = filtered.filter(m => m.type === 'expense')
    }

    if (this.activeFilter === 'month' || this.activeFilter === 'all') {
      const [year, month] = this.selectedMonth.split('-')
      filtered = filtered.filter(m => m.date.startsWith(`${year}-${month}`))
    }

    return filtered
  }

  get totalIncome(): number {
    return this.filteredMovements
      .filter(m => m.type === 'income')
      .reduce((sum, m) => sum + m.amount, 0)
  }

  get totalExpense(): number {
    return this.filteredMovements
      .filter(m => m.type === 'expense')
      .reduce((sum, m) => sum + m.amount, 0)
  }

  ngOnInit(): void {
    this.loadMovements()
  }

  loadMovements(): void {
    this.state = 'loading'
    this.loadedCount = 0
    this.displayMovements = []
    this.groupedDisplay = []
    this.cdr.markForCheck()

    this.api.get<IncomeData[]>('/finance/incomes').subscribe({
      next: (incRes) => {
        this.api.get<ExpenseData[]>('/finance/expenses').subscribe({
          next: (expRes) => {
            const incomes: Movement[] = (incRes.data ?? []).map(i => ({
              id: i._id,
              type: 'income',
              description: i.description || 'Ingreso',
              amount: i.amount,
              category: CATEGORY_LABELS[i.category] || i.category,
              categoryKey: i.category,
              date: i.date,
              time: i.createdAt ? i.createdAt.slice(11, 16) : '',
              createdBy: i.createdByName || i.createdBy,
            }))
            const expenses: Movement[] = (expRes.data ?? []).map(e => ({
              id: e._id,
              type: 'expense',
              description: e.description || 'Gasto',
              amount: e.amount,
              category: CATEGORY_LABELS[e.category] || e.category,
              categoryKey: e.category,
              date: e.date,
              time: e.createdAt ? e.createdAt.slice(11, 16) : '',
              createdBy: e.createdByName || e.createdBy,
            }))
            this.allMovements = [...incomes, ...expenses].sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`))
            this.state = 'loaded'
            this.cdr.markForCheck()
            this.loadMore()
          },
          error: () => {
            this.state = 'error'
            this.cdr.markForCheck()
          },
        })
      },
      error: () => {
        this.state = 'error'
        this.cdr.markForCheck()
      },
    })

    setTimeout(() => {
      if (this.state === 'loading') {
        this.state = 'error'
        this.cdr.markForCheck()
      }
    }, 10000)
  }

  private loadMore(): void {
    const remaining = this.filteredMovements.slice(this.loadedCount, this.loadedCount + this.pageSize)
    if (remaining.length === 0 && this.loadedCount === 0) {
      this.state = 'loaded'
      this.displayMovements = []
      this.groupedDisplay = []
      return
    }
    this.displayMovements = [...this.displayMovements, ...remaining]
    this.loadedCount = this.displayMovements.length
    this.groupedDisplay = groupByDate(this.displayMovements)
    this.state = 'loaded'
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (this.state !== 'loaded') return
    const scrollPos = window.scrollY + window.innerHeight
    const threshold = document.documentElement.scrollHeight - 200
    if (scrollPos >= threshold && this.loadedCount < this.filteredMovements.length) {
      this.state = 'loading-more'
      setTimeout(() => this.loadMore(), 300)
    }
  }

  onChipClick(key: FilterType): void {
    if (key === 'month') {
      this.showMonthPicker = !this.showMonthPicker
      return
    }
    if (key === 'category') {
      return
    }
    this.showMonthPicker = false
    this.activeFilter = key
    this.resetList()
  }

  selectMonth(value: string): void {
    this.selectedMonth = value
    this.showMonthPicker = false
    this.resetList()
  }

  private resetList(): void {
    this.loadedCount = 0
    this.displayMovements = []
    this.groupedDisplay = []
    this.state = 'loaded'
    this.loadMore()
  }

  onAdd(): void {
    console.log('Nuevo movimiento')
  }

  onMovementClick(m: Movement): void {
    console.log('Detalle:', m.id)
  }
}
