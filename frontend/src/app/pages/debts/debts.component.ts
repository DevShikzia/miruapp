import { Component, ChangeDetectorRef } from '@angular/core'
import { Router } from '@angular/router'
import { NgIf, NgFor, DecimalPipe } from '@angular/common'
import { ApiService } from '../../services/api.service'
import type { DebtData } from '@shared/types/debt.types'

@Component({
  selector: 'app-debts',
  standalone: true,
  imports: [NgIf, NgFor, DecimalPipe],
  template: `
    <div class="page">

      <!-- Header -->
      <header class="header">
        <button class="btn-back" (click)="goBack()">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h1 class="title">Deudas</h1>
        <button class="btn-add" (click)="goCreate()">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
        </button>
      </header>

      <!-- Loading -->
      <div class="loading-state" *ngIf="state === 'loading'">
        <div class="skeleton summary-skel"></div>
        <div class="skeleton card-skel" *ngFor="let _ of [].constructor(3)"></div>
      </div>

      <!-- Error -->
      <div class="error-state" *ngIf="state === 'error'">
        <p class="error-msg">No pudimos cargar tus deudas</p>
        <button class="btn-retry" (click)="loadDebts()">Reintentar</button>
      </div>

      <!-- Empty -->
      <div class="empty-state" *ngIf="state === 'loaded' && debts.length === 0">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#697586" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"><path d="M11 12H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5"/><path d="M18 8V5a2 2 0 0 0-2-2h-3a2 2 0 0 0-2 2v12l-4-3"/></svg>
        <h3 class="empty-title">No ten\u00e9s deudas registradas</h3>
        <p class="empty-sub">Registr\u00e1 las deudas que tengas para llevar el control.</p>
        <button class="btn-empty" (click)="goCreate()">Registrar deuda</button>
      </div>

      <!-- Loaded -->
      <ng-container *ngIf="state === 'loaded' && debts.length > 0">

        <!-- Summary -->
        <div class="summary-card">
          <div class="summary-row">
            <div class="summary-col">
              <span class="summary-label">Total adeudado</span>
              <span class="summary-amount negative">$ {{ totalOwed | number:'1.0-0' }}</span>
            </div>
            <div class="summary-col">
              <span class="summary-label">Pagado</span>
              <span class="summary-amount positive">$ {{ totalPaid | number:'1.0-0' }}</span>
            </div>
          </div>
          <div class="progress-track">
            <div class="progress-fill" [style.width.%]="overallProgress"></div>
          </div>
          <span class="progress-label">{{ overallProgress }}% pagado \u00b7 {{ activeDebts }} deudas activas</span>
        </div>

        <!-- Filters -->
        <div class="chips-row">
          <button class="chip" [class.active]="filter === 'active'" (click)="filter = 'active'">Activas</button>
          <button class="chip" [class.active]="filter === 'paid'" (click)="filter = 'paid'">Pagadas</button>
        </div>

        <!-- Debt list -->
        <div class="debt-list">
          <div class="debt-card" *ngFor="let debt of filteredDebts" (click)="goDetail(debt._id)" [class.paid]="debt.isPaid">
            <div class="debt-top">
              <div class="debt-left">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E05252" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 12H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5"/><path d="M18 8V5a2 2 0 0 0-2-2h-3a2 2 0 0 0-2 2v12l-4-3"/></svg>
              </div>
              <span class="debt-name">{{ debt.personName }}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#697586" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </div>
            <div class="debt-mid">
              <span class="debt-total">$ {{ debt.totalAmount | number:'1.0-0' }}</span>
              <span class="debt-remaining">Restan $ {{ (debt.totalAmount - debt.paidAmount) | number:'1.0-0' }}</span>
            </div>
            <div class="debt-progress">
              <div class="progress-track-sm">
                <div class="progress-fill-sm" [style.width.%]="debt.progress" [style.background]="progressGradient(debt.progress)"></div>
              </div>
              <span class="progress-pct">{{ debt.progress }}%</span>
            </div>
            <div class="debt-footer">
              <span class="paid-label">Pagado: $ {{ debt.paidAmount | number:'1.0-0' }}</span>
              <span class="urgency-tag" *ngIf="getUrgency(debt) as urg" [class.overdue]="urg.overdue">{{ urg.label }}</span>
            </div>
          </div>
        </div>

      </ng-container>

      <!-- FAB Speed Dial -->
      <div class="fab-container">
        <div class="fab-menu" *ngIf="fabOpen">
          <button class="fab-option expense" (click)="onFabAction('expense')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" x2="19" y1="12" y2="12"/><line x1="12" x2="12" y1="5" y2="19"/></svg>
            Agregar gasto
          </button>
          <button class="fab-option income" (click)="onFabAction('income')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
            Agregar ingreso
          </button>
          <button class="fab-option task" (click)="onFabAction('task')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            Nueva tarea
          </button>
        </div>
        <button class="fab-main" (click)="fabOpen = !fabOpen" [class.open]="fabOpen">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; background: #0C0F14; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
    .page { padding: 56px 20px 24px; }

    ::-webkit-scrollbar { display: none; }

    .header { display: flex; align-items: center; justify-content: space-between; }
    .btn-back, .btn-add { background: none; border: none; padding: 4px; cursor: pointer; display: flex; align-items: center; color: #F0F2F5; }
    .btn-add { color: #E4B3E9; }
    .title { font-size: 20px; font-weight: 700; color: #F0F2F5; margin: 0; }

    /* Skeleton */
    .loading-state { display: flex; flex-direction: column; gap: 16px; margin-top: 24px; }
    .skeleton { background: #1E2530; border-radius: 20px; animation: shimmer 1.5s ease-in-out infinite; }
    .summary-skel { height: 140px; }
    .card-skel { height: 160px; }
    @keyframes shimmer { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }

    /* Error */
    .error-state { display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: 48px; }
    .error-msg { color: #F87171; font-size: 14px; font-weight: 500; margin: 0; }
    .btn-retry { background: #1E2530; border: none; border-radius: 999px; padding: 10px 20px; color: #F0F2F5; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; }

    /* Empty */
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; margin-top: 80px; text-align: center; }
    .empty-title { font-size: 16px; font-weight: 500; color: #8A95A8; margin: 0; }
    .empty-sub { font-size: 13px; font-weight: 400; color: #697586; margin: 0; max-width: 260px; line-height: 1.4; }
    .btn-empty { background: #E4B3E9; color: #0C0F14; border: none; border-radius: 999px; padding: 12px 24px; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; margin-top: 8px; }

    /* Summary */
    .summary-card { margin-top: 16px; background: #161B24; border-radius: 24px; border: 1px solid rgba(255,255,255,0.06); padding: 20px; }
    .summary-row { display: flex; justify-content: space-between; }
    .summary-col { display: flex; flex-direction: column; gap: 4px; }
    .summary-label { font-size: 12px; font-weight: 500; color: #8A95A8; }
    .summary-amount { font-size: 28px; font-weight: 700; }
    .summary-amount.negative { color: #E05252; }
    .summary-amount.positive { color: #15C48C; }
    .progress-track { height: 8px; background: #1E2530; border-radius: 999px; margin-top: 16px; overflow: hidden; }
    .progress-fill { height: 100%; background: #15C48C; border-radius: 999px; transition: width 0.5s ease; }
    .progress-label { font-size: 12px; font-weight: 400; color: #8A95A8; margin-top: 8px; display: block; }

    /* Filters */
    .chips-row { display: flex; gap: 8px; margin-top: 20px; }
    .chip { flex-shrink: 0; padding: 10px 20px; border: none; border-radius: 999px; background: #1E2530; color: #8A95A8; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .chip.active { background: rgba(228,179,233,0.15); color: #E4B3E9; font-weight: 600; }

    /* Debt list */
    .debt-list { display: flex; flex-direction: column; gap: 12px; margin-top: 16px; padding-bottom: 80px; }
    .debt-card { background: #161B24; border-radius: 20px; border: 1px solid rgba(255,255,255,0.06); padding: 16px; cursor: pointer; transition: opacity 150ms; }
    .debt-card.paid { opacity: 0.7; }
    .debt-top { display: flex; align-items: center; gap: 10px; }
    .debt-left { width: 36px; height: 36px; background: rgba(224,82,82,0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .debt-name { flex: 1; font-size: 14px; font-weight: 600; color: #F0F2F5; }
    .debt-mid { display: flex; align-items: baseline; gap: 10px; margin-top: 8px; }
    .debt-total { font-size: 18px; font-weight: 700; color: #E05252; }
    .debt-remaining { font-size: 12px; font-weight: 400; color: #8A95A8; }
    .debt-progress { display: flex; align-items: center; gap: 8px; margin-top: 12px; }
    .progress-track-sm { flex: 1; height: 6px; background: #1E2530; border-radius: 999px; overflow: hidden; }
    .progress-fill-sm { height: 100%; border-radius: 999px; transition: width 0.5s ease; }
    .progress-pct { font-size: 12px; font-weight: 600; color: #F0F2F5; flex-shrink: 0; }
    .debt-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 6px; }
    .paid-label { font-size: 11px; font-weight: 400; color: #8A95A8; }
    .urgency-tag { font-size: 11px; font-weight: 500; color: #C99A0A; background: rgba(201,154,10,0.15); border-radius: 6px; padding: 4px 8px; }
    .urgency-tag.overdue { color: #E05252; background: rgba(224,82,82,0.15); }

    .fab-container { position: fixed; bottom: 80px; right: 20px; display: flex; flex-direction: column-reverse; align-items: flex-end; gap: 8px; z-index: 90; }
    .fab-menu { display: flex; flex-direction: column-reverse; gap: 8px; }
    .fab-option { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: #161B24; border: 1px solid rgba(255,255,255,0.08); border-radius: 999px; color: #F0F2F5; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; white-space: nowrap; animation: fabIn 200ms ease-out backwards; }
    @keyframes fabIn { from { opacity: 0; transform: scale(0.8) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    .fab-option.income { color: #15C48C; animation-delay: 0.05s; }
    .fab-option.expense { color: #E05252; animation-delay: 0.1s; }
    .fab-option.task { color: #E4B3E9; animation-delay: 0.15s; }
    .fab-main { width: 52px; height: 52px; background: #E4B3E9; border: none; border-radius: 999px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(228,179,233,0.3); transition: transform 200ms, box-shadow 200ms; }
    .fab-main:hover { transform: scale(1.05); box-shadow: 0 6px 20px rgba(228,179,233,0.4); }
    .fab-main.open { transform: rotate(45deg); }
    .fab-main svg { stroke: #0C0F14; }
  `]
})
export class DebtsComponent {
  state: 'loading' | 'loaded' | 'error' = 'loading'
  debts: DebtData[] = []
  filter: 'active' | 'paid' = 'active'
  fabOpen = false

  onFabAction(type: 'income' | 'expense' | 'task'): void {
    this.fabOpen = false
    if (type === 'income') {
      this.router.navigate(['/ingresos/nuevo'])
    } else if (type === 'expense') {
      this.router.navigate(['/gastos/nuevo'])
    } else if (type === 'task') {
      this.router.navigate(['/tareas'])
    }
  }

  constructor(
    private api: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.loadDebts()
  }

  get filteredDebts(): DebtData[] {
    return this.debts.filter(d => this.filter === 'active' ? !d.isPaid : d.isPaid)
  }

  get totalOwed(): number {
    const active = this.debts.filter(d => !d.isPaid)
    return active.reduce((sum, d) => sum + d.totalAmount, 0)
  }

  get totalPaid(): number {
    return this.debts.reduce((sum, d) => sum + d.paidAmount, 0)
  }

  get overallProgress(): number {
    const total = this.debts.reduce((sum, d) => sum + d.totalAmount, 0)
    if (total === 0) return 0
    return Math.round((this.totalPaid / total) * 100)
  }

  get activeDebts(): number {
    return this.debts.filter(d => !d.isPaid).length
  }

  loadDebts(): void {
    this.state = 'loading'
    this.api.get<DebtData[]>('/debts').subscribe({
      next: (res) => {
        this.debts = res?.data ?? []
        this.state = 'loaded'
        this.cdr.detectChanges()
      },
      error: () => {
        this.state = 'error'
        this.cdr.detectChanges()
      },
    })
  }

  progressGradient(pct: number): string {
    const ratio = pct / 100
    const r = Math.round(224 + (21 - 224) * ratio)
    const g = Math.round(82 + (196 - 82) * ratio)
    const b = Math.round(82 + (140 - 82) * ratio)
    return `linear-gradient(90deg, #E05252 ${0}%, rgb(${r},${g},${b}) ${pct}%)`
  }

  getUrgency(debt: DebtData): { label: string; overdue: boolean } | null {
    if (!debt.dueDate || debt.isPaid) return null
    const now = new Date()
    const due = new Date(debt.dueDate)
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return { label: 'Vencida', overdue: true }
    if (diffDays <= 5) return { label: 'Vence en ' + diffDays + ' d\u00eda' + (diffDays === 1 ? '' : 's'), overdue: false }
    return null
  }

  goBack(): void {
    this.router.navigate(['/dashboard'])
  }

  goCreate(): void {
    this.router.navigate(['/deudas/crear'])
  }

  goDetail(id: string): void {
    this.router.navigate(['/deudas', id])
  }
}
