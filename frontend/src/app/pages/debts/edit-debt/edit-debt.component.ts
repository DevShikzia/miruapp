import { Component, OnInit, OnDestroy } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router, ActivatedRoute } from '@angular/router'
import { NgIf, NgFor, DecimalPipe } from '@angular/common'
import { Subject, takeUntil } from 'rxjs'
import { ApiService } from '../../../services/api.service'
import type { DebtData, UpdateDebtRequest } from '@shared/types/debt.types'

@Component({
  selector: 'app-edit-debt',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, DecimalPipe],
  template: `
    <div class="container">
      <header class="header">
        <button class="btn-back" (click)="onBack()">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8A95A8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h1 class="title">Editar deuda</h1>
        <button class="btn-save-header" [class.disabled]="!dirty" [disabled]="!dirty || state === 'saving'" (click)="onSave()">
          <span *ngIf="state !== 'saving'">Guardar</span>
          <span *ngIf="state === 'saving'" class="header-spinner">
            <img src="/assets/miru-icon.svg" class="spinner-miru" alt="Cargando" />
          </span>
        </button>
      </header>

      <div class="loading-state" *ngIf="state === 'loading'">
        <div class="skeleton skeleton-field" *ngFor="let _ of [].constructor(7)"></div>
      </div>

      <ng-container *ngIf="state !== 'loading'">
        <div class="field-section">
          <label class="field-label">{{ isCreditor ? '¿Quién te debe?' : '¿A quién le debés?' }}</label>
          <div class="input-wrapper" [class.readonly]="hasPayments">
            <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#697586" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><line x1="9" x2="9" y1="10" y2="10.01"/><line x1="15" x2="15" y1="10" y2="10.01"/><line x1="9" x2="9" y1="14" y2="14.01"/><line x1="15" x2="15" y1="14" y2="14.01"/></svg>
            <input
              class="text-input"
              [(ngModel)]="personName"
              name="personName"
              type="text"
              [placeholder]="isCreditor ? 'Ej: Juan Pérez' : 'Ej: Banco Galicia'"
              [readonly]="false"
            />
          </div>
        </div>

        <div class="toggle-row" (click)="toggleDirection()">
          <span class="toggle-label">Me deben a mí</span>
          <div class="toggle-switch" [class.active]="isCreditor">
            <div class="toggle-circle"></div>
          </div>
        </div>

        <div class="field-section">
          <label class="field-label">Monto total</label>
          <div class="input-wrapper" [class.readonly]="hasPayments">
            <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#697586" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            <input
              class="text-input"
              [value]="amountDisplay"
              name="amount"
              type="text"
              (input)="onAmountInput($event)"
              (focus)="onAmountFocus()"
              placeholder="$ 0"
              inputmode="decimal"
              [readonly]="hasPayments"
            />
          </div>
          <span class="field-hint" *ngIf="hasPayments">No se puede modificar porque ya tiene pagos registrados</span>
        </div>

        <div class="field-section">
          <label class="field-label">Tipo</label>
          <div class="chip-row" [class.readonly]="hasPayments">
            <button class="chip" [class.active]="debtType === 'fixed'" [class.readonly]="hasPayments" (click)="hasPayments ? null : debtType = 'fixed'">Cuota fija</button>
            <button class="chip" [class.active]="debtType === 'credit'" [class.readonly]="hasPayments" (click)="hasPayments ? null : debtType = 'credit'">Crédito</button>
          </div>
          <span class="field-hint" *ngIf="hasPayments">No se puede modificar porque ya tiene pagos registrados</span>
        </div>

        <div class="field-section" *ngIf="debtType">
          <label class="field-label">Cuotas</label>
          <div class="split-inputs">
            <div class="split-group">
              <input
                class="text-input center"
                [(ngModel)]="installments"
                name="installments"
                type="number"
                min="1"
                max="36"
                placeholder="1"
                (input)="onInstallmentsChange()"
                [readonly]="hasPayments"
              />
              <span class="split-label">{{ installments === 1 ? 'cuota' : 'cuotas' }}</span>
            </div>
            <div class="split-sep">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#697586" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>
            </div>
            <div class="split-group">
              <input
                class="text-input center"
                [ngModel]="installmentAmount"
                (ngModelChange)="onInstallmentAmountChange($event)"
                name="installmentAmount"
                type="text"
                inputmode="decimal"
                placeholder="$ 0"
                [readonly]="hasPayments"
              />
              <span class="split-label">c/u</span>
            </div>
          </div>
          <span class="field-hint" *ngIf="installments > 0 && amount > 0 && installmentAmount > 0">
            Total: $ {{ (installmentAmount * installments) | number:'1.0-0' }}
            <span *ngIf="(installmentAmount * installments) !== amount">
              · Dif: $ {{ ((installmentAmount * installments) - amount) | number:'1.0-0' }}
            </span>
          </span>
        </div>

        <div class="field-section">
          <label class="field-label">Vencimiento (opcional)</label>
          <div class="input-wrapper">
            <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#697586" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
            <input
              class="text-input"
              [(ngModel)]="dueDate"
              name="dueDate"
              type="date"
            />
          </div>
        </div>

        <div class="field-section" *ngIf="debtType === 'credit'">
          <label class="field-label">Tasa de interés mensual</label>
          <div class="input-wrapper inline">
            <input
              class="text-input narrow"
              [(ngModel)]="interestRate"
              name="interestRate"
              type="number"
              min="0"
              max="100"
              placeholder="0"
              (input)="onInterestChange()"
            />
            <span class="inline-suffix">%</span>
            <span class="inline-hint warn" *ngIf="interestRate > 0 && amount > 0">
              Interés total estimado: $ {{ estimatedInterest | number:'1.0-0' }}
            </span>
          </div>
        </div>

        <div class="field-section">
          <label class="field-label">Notas (opcional)</label>
          <textarea
            class="text-input textarea"
            [(ngModel)]="description"
            name="description"
            placeholder="Ej: Préstamo para el auto"
            rows="2"
          ></textarea>
        </div>

        <p class="error-msg" *ngIf="state === 'error'">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          No pudimos guardar los cambios
        </p>

        <button class="btn-save" [disabled]="!dirty || state === 'saving'" (click)="onSave()" [style.background]="accentColor">
          <span *ngIf="state !== 'saving'">Guardar cambios</span>
          <span *ngIf="state === 'saving'" class="save-spinner">
            <img src="/assets/miru-icon.svg" class="spinner-miru" alt="Cargando" />
          </span>
        </button>
      </ng-container>

      <div class="modal-overlay" *ngIf="showDiscardModal">
        <div class="modal-card">
          <p class="modal-title">¿Descartar cambios?</p>
          <p class="modal-desc">Los cambios que hiciste no se van a guardar.</p>
          <div class="modal-actions">
            <button class="modal-btn secondary" (click)="showDiscardModal = false">Seguir editando</button>
            <button class="modal-btn primary" (click)="confirmDiscard()">Descartar</button>
          </div>
        </div>
      </div>

      <div class="success-overlay" *ngIf="state === 'success'">
        <div class="success-check">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#15C48C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; background: #0C0F14; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
    .container { padding: 0 24px; max-width: 390px; margin: 0 auto; position: relative; min-height: 100vh; }
    ::-webkit-scrollbar { display: none; }

    .header { display: flex; align-items: center; justify-content: space-between; padding-top: 56px; }
    .btn-back { background: none; border: none; padding: 4px; cursor: pointer; display: flex; align-items: center; margin-left: -4px; color: #8A95A8; }
    .title { font-size: 20px; font-weight: 700; color: #F0F2F5; margin: 0; }
    .btn-save-header { background: none; border: none; padding: 4px; cursor: pointer; color: #E4B3E9; transition: opacity 150ms; display: flex; align-items: center; gap: 6px; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; }
    .btn-save-header.disabled { opacity: 0.4; cursor: not-allowed; }
    .header-spinner { display: flex; align-items: center; }
    .spinner-miru { width: 20px; height: 20px; animation: spin 800ms linear infinite; }

    .loading-state { display: flex; flex-direction: column; gap: 16px; margin-top: 32px; }
    .skeleton { background: #1E2530; border-radius: 16px; animation: shimmer 1.5s ease-in-out infinite; }
    .skeleton-field { height: 48px; }
    @keyframes shimmer { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }

    .field-section { margin-top: 16px; display: flex; flex-direction: column; gap: 8px; }
    .field-section:first-of-type { margin-top: 24px; }
    .field-label { font-size: 12px; font-weight: 500; color: #8A95A8; }
    .field-hint { font-size: 11px; font-weight: 400; color: #697586; margin-top: 2px; }

    .split-inputs { display: flex; align-items: center; gap: 4px; background: #1E2530; border-radius: 16px; height: 48px; padding: 0 8px; }
    .split-group { flex: 1; display: flex; align-items: center; gap: 4px; padding: 0 8px; }
    .split-sep { flex-shrink: 0; display: flex; align-items: center; opacity: 0.4; }
    .split-label { font-size: 12px; font-weight: 500; color: #8A95A8; white-space: nowrap; }
    .text-input.center { text-align: center; }

    .input-wrapper { display: flex; align-items: center; gap: 10px; background: #1E2530; border-radius: 16px; height: 48px; padding: 0 16px; transition: opacity 150ms; }
    .input-wrapper.inline { flex-wrap: wrap; height: auto; min-height: 48px; padding: 8px 16px; gap: 8px; }
    .input-wrapper.readonly { opacity: 0.5; }
    .input-icon { flex-shrink: 0; }
    .text-input { flex: 1; background: transparent; border: none; outline: none; color: #F0F2F5; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 400; height: 100%; padding: 0; }
    .text-input::placeholder { color: #697586; }
    .text-input.narrow { flex: 0 0 80px; text-align: center; }
    .text-input.textarea { height: auto; min-height: 72px; padding: 16px; resize: none; border: 1px solid transparent; transition: border-color 150ms; }
    .text-input.textarea:focus { border-color: #E05252; }
    .input-wrapper:focus-within { outline: 1px solid #E05252; }

    .inline-hint { font-size: 13px; font-weight: 500; color: #8A95A8; white-space: nowrap; }
    .inline-hint.warn { color: #C99A0A; }
    .inline-suffix { font-size: 14px; font-weight: 500; color: #8A95A8; }

    .toggle-row { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; cursor: pointer; padding: 4px 0; }
    .toggle-label { font-size: 13px; font-weight: 500; color: #F0F2F5; }
    .toggle-switch { width: 44px; height: 24px; background: #1E2530; border-radius: 999px; position: relative; transition: background 150ms; flex-shrink: 0; }
    .toggle-switch.active { background: #5B8DEF; }
    .toggle-circle { width: 20px; height: 20px; background: #697586; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: all 150ms; }
    .toggle-switch.active .toggle-circle { background: #F0F2F5; left: 22px; }

    .chip-row { display: flex; gap: 8px; }
    .chip-row.readonly { opacity: 0.5; pointer-events: none; }
    .chip { flex-shrink: 0; height: 36px; padding: 0 20px; background: #1E2530; border: 1px solid transparent; border-radius: 999px; color: #8A95A8; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 150ms; }
    .chip.active { border-color: #E05252; background: rgba(224,82,82,0.08); color: #F0F2F5; }

    .error-msg { display: flex; align-items: center; justify-content: center; gap: 6px; color: #F87171; font-size: 12px; font-weight: 400; margin-top: 16px; text-align: center; }

    .btn-save { width: 100%; height: 44px; margin-top: 24px; color: #F0F2F5; border: none; border-radius: 999px; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: opacity 150ms; }
    .btn-save:disabled { opacity: 0.4; cursor: not-allowed; }
    .save-spinner { display: flex; align-items: center; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 24px; }
    .modal-card { background: #161B24; border-radius: 20px; padding: 24px; width: 100%; max-width: 320px; border: 1px solid rgba(255,255,255,0.06); }
    .modal-title { font-size: 16px; font-weight: 600; color: #F0F2F5; margin: 0 0 8px; text-align: center; }
    .modal-desc { font-size: 13px; font-weight: 400; color: #8A95A8; margin: 0 0 20px; text-align: center; }
    .modal-actions { display: flex; flex-direction: column; gap: 8px; }
    .modal-btn { height: 44px; border: none; border-radius: 999px; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; padding: 0 20px; }
    .modal-btn.secondary { background: #1E2530; color: #F0F2F5; }
    .modal-btn.primary { background: #E05252; color: #FFFFFF; }

    .success-overlay { position: fixed; inset: 0; background: #0C0F14; display: flex; align-items: center; justify-content: center; z-index: 200; animation: fadeIn 200ms ease-out; }
    .success-check { animation: scaleIn 200ms ease-out; }

    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes scaleIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }

    input[type="date"] { color-scheme: dark; }
    input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.7); cursor: pointer; }
    input[readonly] { opacity: 0.6; }
  `]
})
export class EditDebtComponent implements OnInit, OnDestroy {
  debtId = ''
  original: DebtData | null = null

  personName = ''
  isCreditor = false
  amount = 0
  amountDisplay = ''
  debtType: 'fixed' | 'credit' | null = null
  installments = 1
  installmentAmount = 0
  installmentManual = false
  dueDate = ''
  interestRate = 0
  description = ''
  hasPayments = false

  state: 'loading' | 'loaded' | 'saving' | 'error' | 'success' = 'loading'
  showDiscardModal = false

  private destroy$ = new Subject<void>()

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  get accentColor(): string {
    return this.isCreditor ? '#5B8DEF' : '#E05252'
  }

  get dirty(): boolean {
    if (!this.original) return false
    return (
      this.personName !== this.original.personName ||
      this.isCreditor !== (this.original.type === 'creditor') ||
      this.amount !== this.original.totalAmount ||
      this.debtType !== (this.original.interestRate > 0 ? 'credit' : 'fixed') ||
      this.installments !== this.original.installments ||
      this.installmentAmount !== this.original.installmentAmount ||
      this.dueDate !== (this.original.dueDate || '') ||
      this.interestRate !== this.original.interestRate ||
      this.description !== (this.original.description || '')
    )
  }

  get estimatedInterest(): number {
    if (this.interestRate <= 0 || this.amount <= 0) return 0
    return Math.round(this.amount * this.interestRate / 100)
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.debtId = params['id']
      this.loadDebt()
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  private loadDebt(): void {
    this.state = 'loading'
    this.api.get<DebtData>('/debts/' + this.debtId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const data = res.data as DebtData
          this.original = data
          this.personName = data.personName
          this.isCreditor = data.type === 'creditor'
          this.amount = data.totalAmount
          this.amountDisplay = this.formatAmount(data.totalAmount)
          this.debtType = data.interestRate > 0 ? 'credit' : 'fixed'
          this.installments = data.installments || 1
          this.installmentAmount = data.installmentAmount || Math.round(this.amount / this.installments)
          this.dueDate = data.dueDate
          this.interestRate = data.interestRate || 0
          this.description = data.description || ''
          this.hasPayments = data.payments && data.payments.length > 0
          this.state = 'loaded'
        },
        error: () => {
          this.state = 'error'
        },
      })
  }

  toggleDirection(): void {
    this.isCreditor = !this.isCreditor
  }

  private formatAmount(value: number): string {
    if (value === 0) return ''
    return value.toLocaleString('es-AR')
  }

  private getRawNumeric(value: string): string {
    return value.replace(/[^0-9]/g, '')
  }

  private calcInstallmentAmount(): void {
    if (this.installments <= 0 || this.amount <= 0) {
      this.installmentAmount = 0
    } else {
      this.installmentAmount = Math.round(this.amount / this.installments)
    }
  }

  onAmountInput(event: Event): void {
    if (this.hasPayments) return
    const input = event.target as HTMLInputElement
    const raw = this.getRawNumeric(input.value)
    this.amount = raw === '' ? 0 : parseInt(raw, 10)
    const formatted = this.amount === 0 ? '' : this.amount.toLocaleString('es-AR')
    this.amountDisplay = formatted
    input.value = this.amountDisplay
    if (!this.installmentManual) this.calcInstallmentAmount()
  }

  onAmountFocus(): void {
    if (this.amountDisplay === '') {
      this.amountDisplay = ''
    }
  }

  onInstallmentsChange(): void {
    if (this.installments < 1) this.installments = 1
    if (this.installments > 36) this.installments = 36
    if (!this.installmentManual) this.calcInstallmentAmount()
  }

  onInstallmentAmountChange(value: string): void {
    const raw = this.getRawNumeric(value)
    const num = raw === '' ? 0 : parseInt(raw, 10)
    this.installmentAmount = num
    this.installmentManual = num > 0
  }

  onInterestChange(): void {
    if (this.interestRate < 0) this.interestRate = 0
    if (this.interestRate > 100) this.interestRate = 100
  }

  onBack(): void {
    if (this.dirty) {
      this.showDiscardModal = true
    } else {
      this.goBack()
    }
  }

  confirmDiscard(): void {
    this.showDiscardModal = false
    this.goBack()
  }

  private goBack(): void {
    this.router.navigate(['/deudas'])
  }

  onSave(): void {
    if (!this.dirty || this.state === 'saving') return

    this.state = 'saving'
    const payload: UpdateDebtRequest = {
      personName: this.personName.trim(),
      totalAmount: this.amount,
      dueDate: this.dueDate || undefined,
      description: this.description.trim() || undefined,
      installments: this.installments,
      installmentAmount: this.installmentAmount,
      interestRate: this.debtType === 'credit' ? this.interestRate : 0,
    }

    this.api.put<UpdateDebtRequest>('/debts/' + this.debtId, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.state = 'success'
          setTimeout(() => {
            this.router.navigate(['/deudas'])
          }, 200)
        },
        error: () => {
          this.state = 'error'
        },
      })
  }
}
