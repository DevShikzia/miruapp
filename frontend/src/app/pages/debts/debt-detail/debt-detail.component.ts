import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router, ActivatedRoute } from '@angular/router'
import { NgIf, NgFor, DecimalPipe, DatePipe } from '@angular/common'
import { Subject, takeUntil } from 'rxjs'
import { ApiService } from '../../../services/api.service'
import { AuthService } from '../../../services/auth.service'
import { TarjetasService } from '../../../services/tarjetas.service'
import type { DebtData, CreatePaymentRequest } from '@shared/types/debt.types'
import type { PaymentType } from '@shared/types/expense.types'
import type { CreditCardData } from '@shared/types/credit-card.types'

@Component({
  selector: 'app-debt-detail',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, DecimalPipe, DatePipe],
  template: `
    <div class="page" #scrollContainer
      (touchstart)="onTouchStart($event)"
      (touchmove)="onTouchMove($event)"
      (touchend)="onTouchEnd()"
    >
      <header class="header">
        <button class="btn-back" (click)="goBack()">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F0F2F5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h1 class="title">{{ debt?.personName || 'Detalle' }}</h1>
        <div class="menu-wrap" (click)="toggleMenu()" (blur)="showMenu = false" tabindex="0">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8A95A8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          <div class="menu-dropdown" *ngIf="showMenu">
            <button class="menu-item" (click)="goEdit()">Editar</button>
            <button class="menu-item danger" (click)="confirmDelete()">Eliminar</button>
          </div>
        </div>
      </header>

      <div class="pull-indicator" *ngIf="pullDistance > 0" [style.height.px]="pullDistance">
        <span class="pull-text">{{ pullDistance > 60 ? 'Suelta para recargar' : 'Tira para recargar' }}</span>
      </div>

      <div class="loading-state" *ngIf="state === 'loading'">
        <div class="skeleton skeleton-card"></div>
        <div class="skeleton skeleton-section"></div>
      </div>

      <div class="error-state" *ngIf="state === 'error'">
        <p class="error-msg">No pudimos cargar el detalle</p>
        <button class="btn-retry" (click)="loadDebt()">Reintentar</button>
      </div>

      <ng-container *ngIf="state !== 'loading' && state !== 'error' && debt">

        <!-- Status Card -->
        <div class="status-card" [class.paid-card]="debt.isPaid">
          <span class="type-tag" [class.creditor]="debt.type === 'creditor'" [class.debtor]="debt.type === 'debtor'">
            {{ debt.type === 'creditor' ? 'Me deben' : 'Le debo a' }}
          </span>
          <span class="badge-paid" *ngIf="debt.isPaid">Pagada</span>

          <div class="amount-large">$ {{ debt.totalAmount | number:'1.0-0' }}</div>

          <div class="progress-section">
            <div class="progress-track-lg">
              <div class="progress-fill-lg" [style.width.%]="debt.progress" [style.background]="progressGradient(debt.progress)"></div>
            </div>
            <div class="progress-labels">
              <span class="paid-label">Pagado: $ {{ debt.paidAmount | number:'1.0-0' }}</span>
              <span class="pct-label">{{ debt.progress }}%</span>
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat">
              <span class="stat-label">Cuotas</span>
              <span class="stat-value">{{ debt.payments.length }} / {{ debt.installments || 1 }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Próximo vencimiento</span>
              <span class="stat-value">{{ debt.dueDate ? (debt.dueDate | date:'dd/MM/yyyy') : '—' }}</span>
            </div>
            <div class="stat" *ngIf="debt.interestRate > 0">
              <span class="stat-label">Tasa</span>
              <span class="stat-value">{{ debt.interestRate }}% mensual</span>
            </div>
          </div>
        </div>

        <!-- Paid message -->
        <div class="paid-message" *ngIf="debt.isPaid">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15C48C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
          Deuda saldada
        </div>

        <!-- Register Payment -->
        <div class="payment-card" *ngIf="!debt.isPaid">
          <h3 class="section-title">Registrar pago</h3>

          <div class="payment-input-row" *ngIf="payMode !== 'installment'">
            <span class="pay-prefix">$</span>
            <input
              class="pay-input"
              [value]="payAmountDisplay"
              name="payAmount"
              type="text"
              (input)="onPayAmountInput($event)"
              placeholder="Monto"
              inputmode="decimal"
              autofocus
            />
          </div>

          <div class="pay-type-row">
            <button class="pay-type-btn" *ngFor="let pt of PAYMENT_TYPES" [class.selected]="paymentType === pt.key" (click)="selectPaymentType(pt.key)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="12" y2="12"/></svg>
              <span>{{ pt.label }}</span>
            </button>
          </div>

          <div class="card-selector-section" *ngIf="paymentType === 'credit_card'">
            <select class="card-select" [(ngModel)]="creditCardId" name="creditCardId">
              <option value="" disabled selected>Seleccionar tarjeta</option>
              <option *ngFor="let card of creditCards" [value]="card._id">{{ card.name }} {{ card.lastFourDigits ? '•••• ' + card.lastFourDigits : '' }}</option>
            </select>
          </div>

          <div class="pay-actions">
            <button class="pay-btn" (click)="quickPayInstallment()">
              Pago la cuota ($ {{ debt.installmentAmount | number:'1.0-0' }})
            </button>
            <button class="pay-btn" (click)="quickPayCustom()">
              {{ payMode === 'custom' ? 'Ingresar monto' : 'Otro monto' }}
            </button>
          </div>

          <button class="btn-mark-paid" *ngIf="payAmount > 0 && payAmount >= debt.totalAmount - debt.paidAmount" (click)="registerPayment(true)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Marcar como pagado
          </button>

          <button class="btn-register-pay" *ngIf="payAmount > 0 && payAmount < debt.totalAmount - debt.paidAmount" (click)="registerPayment(false)">
            Registrar pago
          </button>
        </div>

        <!-- Payment History -->
        <div class="history-section">
          <h3 class="section-title">Historial de pagos</h3>

          <div class="empty-history" *ngIf="debt.payments.length === 0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#697586" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v6h6"/></svg>
            <p>Todavía no registraste pagos</p>
          </div>

          <div class="payment-item" *ngFor="let p of debt.payments">
            <div class="pay-item-top">
              <span class="pay-date">{{ p.date | date:'dd/MM/yyyy' }}</span>
              <span class="pay-amount">$ {{ p.amount | number:'1.0-0' }}</span>
            </div>
            <p class="pay-desc">{{ p.description || 'Pago' }}</p>
            <span class="pay-who">Pagado por: {{ p.paidBy === currentUserId ? 'Vos' : p.paidByName }}</span>
          </div>
        </div>

        <!-- Original Info (collapsible) -->
        <div class="info-section">
          <div class="info-header" (click)="showInfo = !showInfo">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8A95A8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            Información original
          </div>
          <div class="info-body" *ngIf="showInfo">
            <div class="info-row">
              <span class="info-label">Fecha de creación</span>
              <span class="info-value">{{ debt.createdAt | date:'dd/MM/yyyy' }}</span>
            </div>
            <div class="info-row" *ngIf="debt.interestRate > 0">
              <span class="info-label">Tasa de interés</span>
              <span class="info-value">{{ debt.interestRate }}% mensual</span>
            </div>
            <div class="info-row" *ngIf="debt.installmentAmount > 0">
              <span class="info-label">Valor de cuota</span>
              <span class="info-value">$ {{ debt.installmentAmount | number:'1.0-0' }}</span>
            </div>
            <div class="info-row" *ngIf="debt.description">
              <span class="info-label">Notas</span>
              <span class="info-value">{{ debt.description }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Creado por</span>
              <span class="info-value">{{ debt.createdBy === currentUserId ? 'Vos' : debt.createdByName }}</span>
            </div>
          </div>
        </div>

      </ng-container>

      <!-- Delete confirmation modal -->
      <div class="modal-overlay" *ngIf="showDeleteModal">
        <div class="modal-card">
          <p class="modal-title">¿Eliminar deuda?</p>
          <p class="modal-desc">Esta acción no se puede deshacer. La deuda y todos sus pagos se eliminarán permanentemente.</p>
          <div class="modal-actions">
            <button class="modal-btn secondary" (click)="showDeleteModal = false">Cancelar</button>
            <button class="modal-btn primary danger" (click)="deleteDebt()">Eliminar</button>
          </div>
        </div>
      </div>

      <!-- Success overlay -->
      <div class="success-overlay" *ngIf="state === 'success-pay'">
        <div class="success-check">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#15C48C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; background: #0C0F14; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
    .page { padding: 56px 20px 24px; max-width: 390px; margin: 0 auto; min-height: 100vh; position: relative; overflow: hidden; }
    ::-webkit-scrollbar { display: none; }

    .header { display: flex; align-items: center; justify-content: space-between; position: relative; }
    .btn-back { background: none; border: none; padding: 4px; cursor: pointer; display: flex; align-items: center; color: #F0F2F5; margin-left: -4px; }
    .title { font-size: 18px; font-weight: 700; color: #F0F2F5; margin: 0; flex: 1; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 8px; }
    .menu-wrap { position: relative; cursor: pointer; background: none; border: none; padding: 4px; color: #8A95A8; outline: none; }
    .menu-dropdown { position: absolute; top: 32px; right: 0; background: #1E2530; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 4px; min-width: 140px; z-index: 100; box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
    .menu-item { display: block; width: 100%; background: none; border: none; padding: 10px 16px; color: #F0F2F5; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; text-align: left; border-radius: 8px; cursor: pointer; }
    .menu-item:hover { background: rgba(255,255,255,0.06); }
    .menu-item.danger { color: #E05252; }

    .pull-indicator { display: flex; align-items: center; justify-content: center; overflow: hidden; transition: height 0.1s; }
    .pull-text { font-size: 12px; color: #697586; font-weight: 400; }

    .loading-state { display: flex; flex-direction: column; gap: 16px; margin-top: 20px; }
    .skeleton { background: #1E2530; border-radius: 24px; animation: shimmer 1.5s ease-in-out infinite; }
    .skeleton-card { height: 260px; }
    .skeleton-section { height: 120px; }
    @keyframes shimmer { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }

    .error-state { display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: 48px; }
    .error-msg { color: #F87171; font-size: 14px; font-weight: 500; margin: 0; }
    .btn-retry { background: #1E2530; border: none; border-radius: 999px; padding: 10px 20px; color: #F0F2F5; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; }

    .status-card { margin-top: 16px; background: #161B24; border-radius: 24px; border: 1px solid rgba(255,255,255,0.06); padding: 20px; }
    .status-card.paid-card { border-color: rgba(21,196,140,0.3); }
    .type-tag { display: inline-block; font-size: 11px; font-weight: 500; padding: 4px 8px; border-radius: 6px; }
    .type-tag.debtor { background: rgba(224,82,82,0.15); color: #E05252; }
    .type-tag.creditor { background: rgba(91,141,239,0.15); color: #5B8DEF; }
    .badge-paid { display: inline-block; margin-left: 8px; font-size: 11px; font-weight: 500; padding: 4px 8px; border-radius: 6px; background: rgba(21,196,140,0.15); color: #15C48C; }

    .amount-large { font-size: 36px; font-weight: 800; color: #F0F2F5; margin-top: 12px; }
    .progress-section { margin-top: 16px; }
    .progress-track-lg { height: 10px; background: #1E2530; border-radius: 999px; overflow: hidden; }
    .progress-fill-lg { height: 100%; border-radius: 999px; transition: width 0.3s ease; }
    .progress-labels { display: flex; justify-content: space-between; margin-top: 6px; }
    .paid-label { font-size: 13px; font-weight: 500; color: #15C48C; }
    .pct-label { font-size: 13px; font-weight: 700; color: #F0F2F5; }

    .stats-grid { display: flex; gap: 24px; margin-top: 16px; flex-wrap: wrap; }
    .stat { display: flex; flex-direction: column; gap: 2px; }
    .stat-label { font-size: 11px; font-weight: 400; color: #8A95A8; }
    .stat-value { font-size: 14px; font-weight: 600; color: #F0F2F5; }

    .paid-message { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 20px; color: #15C48C; font-size: 14px; font-weight: 500; }

    .payment-card { margin-top: 20px; background: #161B24; border-radius: 20px; padding: 16px; }
    .section-title { font-size: 14px; font-weight: 600; color: #F0F2F5; margin: 0 0 12px; }
    .payment-input-row { display: flex; align-items: center; gap: 6px; background: #1E2530; border-radius: 16px; height: 48px; padding: 0 16px; margin-bottom: 12px; }
    .pay-prefix { font-size: 18px; font-weight: 600; color: #8A95A8; }
    .pay-input { flex: 1; background: transparent; border: none; outline: none; color: #F0F2F5; font-family: 'Inter', sans-serif; font-size: 18px; font-weight: 700; height: 100%; padding: 0; }
    .pay-input::placeholder { color: #697586; }
    .pay-actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .pay-btn { background: #1E2530; color: #F0F2F5; border: none; border-radius: 999px; padding: 8px 16px; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; transition: background 150ms; }
    .pay-btn:hover { background: rgba(255,255,255,0.08); }
    .pay-type-row { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
    .pay-type-btn { flex: 1; min-width: 70px; height: 34px; background: #1E2530; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; color: #8A95A8; font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; transition: all 150ms; }
    .pay-type-btn.selected { background: rgba(91,141,239,0.15); border-color: #5B8DEF; color: #5B8DEF; }
    .card-selector-section { margin-bottom: 12px; }
    .card-select { width: 100%; height: 40px; background: #1E2530; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; color: #F0F2F5; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 400; padding: 0 12px; outline: none; }
    .card-select option { background: #1E2530; color: #F0F2F5; }

    .btn-mark-paid { width: 100%; height: 44px; margin-top: 12px; background: #15C48C; color: #041710; border: none; border-radius: 999px; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .btn-register-pay { width: 100%; height: 44px; margin-top: 12px; background: #E05252; color: #F0F2F5; border: none; border-radius: 999px; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; }

    .history-section { margin-top: 20px; }
    .empty-history { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 24px 0; color: #8A95A8; font-size: 13px; font-weight: 400; }
    .payment-item { padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
    .payment-item:last-child { border-bottom: none; }
    .pay-item-top { display: flex; justify-content: space-between; align-items: center; }
    .pay-date { font-size: 13px; font-weight: 500; color: #8A95A8; }
    .pay-amount { font-size: 14px; font-weight: 600; color: #15C48C; }
    .pay-desc { font-size: 14px; font-weight: 500; color: #F0F2F5; margin: 4px 0 2px; }
    .pay-who { font-size: 12px; font-weight: 400; color: #697586; }

    .info-section { margin-top: 20px; }
    .info-header { display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 600; color: #F0F2F5; cursor: pointer; padding: 12px 16px; background: #161B24; border-radius: 16px; }
    .info-body { background: #161B24; border-radius: 0 0 16px 16px; padding: 0 16px 16px; margin-top: -8px; display: flex; flex-direction: column; gap: 10px; }
    .info-row { display: flex; justify-content: space-between; align-items: center; }
    .info-label { font-size: 12px; font-weight: 400; color: #697586; }
    .info-value { font-size: 14px; font-weight: 500; color: #F0F2F5; text-align: right; max-width: 60%; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 24px; }
    .modal-card { background: #161B24; border-radius: 20px; padding: 24px; width: 100%; max-width: 320px; border: 1px solid rgba(255,255,255,0.06); }
    .modal-title { font-size: 16px; font-weight: 600; color: #F0F2F5; margin: 0 0 8px; text-align: center; }
    .modal-desc { font-size: 13px; font-weight: 400; color: #8A95A8; margin: 0 0 20px; text-align: center; line-height: 1.4; }
    .modal-actions { display: flex; flex-direction: column; gap: 8px; }
    .modal-btn { height: 44px; border: none; border-radius: 999px; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; padding: 0 20px; }
    .modal-btn.secondary { background: #1E2530; color: #F0F2F5; }
    .modal-btn.primary { background: #E05252; color: #FFFFFF; }
    .modal-btn.primary.danger { background: #E05252; }

    .success-overlay { position: fixed; inset: 0; background: #0C0F14; display: flex; align-items: center; justify-content: center; z-index: 200; animation: fadeIn 200ms ease-out; }
    .success-check { animation: scaleIn 200ms ease-out; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes scaleIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  `]
})
export class DebtDetailComponent implements OnInit, OnDestroy {
  debtId = ''
  debt: DebtData | null = null
  currentUserId = ''
  state: 'loading' | 'loaded' | 'error' | 'success-pay' = 'loading'
  showMenu = false
  showInfo = false
  showDeleteModal = false

  PAYMENT_TYPES = [
    { key: 'cash' as PaymentType, label: 'Efectivo' },
    { key: 'credit_card' as PaymentType, label: 'Crédito' },
    { key: 'debit_card' as PaymentType, label: 'Débito' },
    { key: 'transfer' as PaymentType, label: 'Transferencia' },
  ]

  payMode: 'installment' | 'custom' | null = null
  payAmount = 0
  payAmountDisplay = ''
  paymentType: PaymentType = 'cash'
  creditCardId = ''
  creditCards: CreditCardData[] = []

  pullDistance = 0
  private pullStartY = 0
  private pulling = false

  private destroy$ = new Subject<void>()

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private tarjetasService: TarjetasService,
  ) {}

  ngOnInit(): void {
    const user = this.auth.user as any
    this.currentUserId = user?._id || ''

    this.tarjetasService.getAll().pipe(takeUntil(this.destroy$)).subscribe({
      next: (cards) => { this.creditCards = cards ?? [] },
    })

    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.debtId = params['id']
      this.loadDebt()
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  loadDebt(): void {
    this.state = 'loading'
    this.api.get<DebtData>('/debts/' + this.debtId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.debt = res.data as DebtData
          this.state = 'loaded'
          this.cdr.markForCheck()
        },
        error: () => {
          this.state = 'error'
          this.cdr.markForCheck()
        },
      })
  }

  progressGradient(pct: number): string {
    const ratio = pct / 100
    const r = Math.round(224 + (21 - 224) * ratio)
    const g = Math.round(82 + (196 - 82) * ratio)
    const b = Math.round(82 + (140 - 82) * ratio)
    return `linear-gradient(90deg, #E05252 0%, rgb(${r},${g},${b}) ${pct}%)`
  }

  toggleMenu(): void {
    this.showMenu = !this.showMenu
  }

  goBack(): void {
    this.router.navigate(['/deudas'])
  }

  goEdit(): void {
    this.showMenu = false
    this.router.navigate(['/deudas/editar', this.debtId])
  }

  confirmDelete(): void {
    this.showMenu = false
    this.showDeleteModal = true
  }

  deleteDebt(): void {
    this.showDeleteModal = false
    this.api.delete('/debts/' + this.debtId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/deudas'])
        },
        error: () => {
          this.state = 'error'
          this.cdr.markForCheck()
        },
      })
  }

  private getRawNumeric(value: string): string {
    return value.replace(/[^0-9]/g, '')
  }

  onPayAmountInput(event: Event): void {
    const input = event.target as HTMLInputElement
    const raw = this.getRawNumeric(input.value)
    this.payAmount = raw === '' ? 0 : parseInt(raw, 10)
    this.payAmountDisplay = this.payAmount === 0 ? '' : this.payAmount.toLocaleString('es-AR')
    input.value = this.payAmountDisplay
  }

  quickPayInstallment(): void {
    if (!this.debt) return
    this.payMode = 'installment'
    this.payAmount = this.debt.installmentAmount
    this.payAmountDisplay = this.payAmount.toLocaleString('es-AR')
    this.registerPayment(false)
  }

  quickPayCustom(): void {
    if (this.payMode === 'custom') {
      this.payMode = null
      this.payAmount = 0
      this.payAmountDisplay = ''
    } else {
      this.payMode = 'custom'
    }
  }

  selectPaymentType(pt: PaymentType): void {
    this.paymentType = pt
    if (pt !== 'credit_card') this.creditCardId = ''
  }

  registerPayment(markPaid: boolean): void {
    if (!this.debt || this.payAmount <= 0) return
    if (this.paymentType === 'credit_card' && !this.creditCardId) return

    const remaining = this.debt.totalAmount - this.debt.paidAmount
    const amount = markPaid ? remaining : Math.min(this.payAmount, remaining)

    const payload: CreatePaymentRequest = {
      amount,
      date: new Date().toISOString().split('T')[0],
      description: markPaid ? 'Pago final' : 'Pago de cuota ' + (this.debt.payments.length + 1) + '/' + this.debt.installments,
      paymentType: this.paymentType,
      creditCardId: this.paymentType === 'credit_card' ? this.creditCardId : undefined,
    }

    this.api.post<CreatePaymentRequest>('/debts/' + this.debtId + '/payments', payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.state = 'success-pay'
          this.payAmount = 0
          this.payAmountDisplay = ''
          this.payMode = null
          this.cdr.markForCheck()
          setTimeout(() => {
            this.state = 'loaded'
            this.cdr.markForCheck()
            this.loadDebt()
          }, 400)
        },
        error: () => {
          this.state = 'error'
          this.cdr.markForCheck()
        },
      })
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
    }
  }

  onTouchEnd(): void {
    if (this.pullDistance > 60) {
      this.loadDebt()
    }
    this.pullDistance = 0
    this.pulling = false
  }
}
