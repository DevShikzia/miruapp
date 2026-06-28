import { Component, OnInit, OnDestroy } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'
import { Router, ActivatedRoute, RouterLink } from '@angular/router'
import { NgIf, NgFor } from '@angular/common'
import { Subject, takeUntil } from 'rxjs'
import { ApiService } from '../../../services/api.service'
import { TarjetasService } from '../../../services/tarjetas.service'
import { CategoryLabelPipe } from '../../../pipes/category-label.pipe'
import type { ExpenseCategory, PaymentType, ExpenseData } from '@shared/types/expense.types'
import type { CreditCardData } from '@shared/types/credit-card.types'

interface CategoryOption {
  key: ExpenseCategory
  label: string
  color: string
  icon: string
}

interface PaymentTypeOption {
  key: PaymentType
  label: string
  icon: string
}

const CATEGORIES: CategoryOption[] = [
  { key: 'food', label: 'Comidas', color: '#E05252', icon: 'utensils' },
  { key: 'transport', label: 'Transporte', color: '#5B8DEF', icon: 'car' },
  { key: 'utilities', label: 'Servicios', color: '#C99A0A', icon: 'zap' },
  { key: 'rent', label: 'Alquiler', color: '#E05252', icon: 'home' },
  { key: 'health', label: 'Salud', color: '#E05252', icon: 'heart-pulse' },
  { key: 'education', label: 'Educaci\u00f3n', color: '#5B8DEF', icon: 'book-open' },
  { key: 'entertainment', label: 'Entretenimiento', color: '#9B6EF3', icon: 'gamepad-2' },
  { key: 'savings', label: 'Ahorros', color: '#15C48C', icon: 'piggy-bank' },
  { key: 'debt', label: 'Deudas', color: '#E05252', icon: 'landmark' },
  { key: 'other', label: 'Otro', color: '#8A95A8', icon: 'ellipsis' },
]

const PAYMENT_TYPES: PaymentTypeOption[] = [
  { key: 'cash', label: 'Efectivo', icon: 'banknote' },
  { key: 'credit_card', label: 'Tarjeta cr\u00e9dito', icon: 'credit-card' },
  { key: 'debit_card', label: 'Tarjeta d\u00e9bito', icon: 'credit-card' },
  { key: 'transfer', label: 'Transferencia', icon: 'building' },
]

const CATEGORY_ICONS: Record<string, string> = {
  utensils: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
  car: '<path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14Z"/>',
  home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>',
  'heart-pulse': '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M7 11h2l1 2 2-4 1 2h2"/>',
  'book-open': '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3Z"/>',
  'gamepad-2': '<path d="M6 11h4M8 9v4M15 12h.01M18 10h.01"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5Z"/>',
  ellipsis: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  'piggy-bank': '<path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z"/><path d="M2 9v1c0 1.1.9 2 2 2h1"/><path d="M16 11h.01"/>',
  landmark: '<path d="M3 22h18"/><path d="M6 18v-8"/><path d="M10 18v-8"/><path d="M14 18v-8"/><path d="M18 18v-8"/><path d="M12 2 3 7h18Z"/>',
}

const PAYMENT_ICONS: Record<string, string> = {
  banknote: '<path d="M12 17c3 0 6-1 6-3V9c0-2-3-3-6-3S6 7 6 9v5c0 2 3 3 6 3Z"/><path d="M6 9c0 2 3 3 6 3s6-1 6-3"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="10" r="0.5" fill="currentColor"/>',
  'credit-card': '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="12" y2="12"/><line x1="6" x2="10" y1="16" y2="16"/>',
  building: '<rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><line x1="9" x2="9" y1="10" y2="10.01"/><line x1="15" x2="15" y1="10" y2="10.01"/><line x1="9" x2="9" y1="14" y2="14.01"/><line x1="15" x2="15" y1="14" y2="14.01"/>',
}

@Component({
  selector: 'app-edit-expense',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, RouterLink, CategoryLabelPipe],
  template: `
    <div class="container">
      <header class="header">
        <button class="btn-back" (click)="onBack()">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8A95A8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h1 class="title">Editar gasto</h1>
        <button class="btn-save-header" [class.disabled]="!dirty" [disabled]="!dirty || state === 'saving'" (click)="onSave()">
          <span *ngIf="state !== 'saving'">Guardar</span>
          <span *ngIf="state === 'saving'" class="header-spinner">
            <img src="/assets/miru-icon.svg" class="spinner-miru" alt="Cargando" />
          </span>
        </button>
      </header>

      <div class="loading-state" *ngIf="state === 'loading'">
        <div class="skeleton-monto"></div>
        <div class="skeleton-grid">
          <div class="skeleton-card" *ngFor="let _ of [].constructor(8)"></div>
        </div>
      </div>

      <ng-container *ngIf="state !== 'loading'">
        <div class="monto-section">
          <label class="field-label">\u00bfCu\u00e1nto gastaste?</label>
          <div class="monto-input-wrapper">
            <span class="monto-prefix">$</span>
            <input
              class="monto-input"
              [value]="amountDisplay"
              name="amount"
              type="text"
              inputmode="decimal"
              (input)="onAmountInput($event)"
              (focus)="onAmountFocus()"
              placeholder="0" (keydown)="onKeydown($event)"
            />
          </div>
        </div>

        <div class="category-section">
          <label class="field-label">Categor\u00eda</label>
          <div class="category-grid">
            <button
              class="category-card"
              *ngFor="let cat of categories"
              [class.selected]="category === cat.key"
              (click)="selectCategory(cat.key)"
            >
              <div class="category-icon" [style.color]="cat.color">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" [innerHTML]="getCategoryIcon(cat.icon)"></svg>
              </div>
              <span class="category-label">{{ cat.key | categoryLabel }}</span>
            </button>
          </div>
        </div>

        <div class="payment-section">
          <label class="field-label">Tipo de pago</label>
          <div class="payment-chips">
            <button
              class="payment-chip"
              *ngFor="let pt of paymentTypes"
              [class.selected]="paymentType === pt.key"
              (click)="selectPaymentType(pt.key)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" [innerHTML]="getPaymentIcon(pt.icon)"></svg>
              {{ pt.label }}
            </button>
          </div>
        </div>

        <div class="card-selector-section" *ngIf="paymentType === 'credit_card'">
          <label class="field-label">Tarjeta de cr\u00e9dito</label>
          <div class="card-select" *ngIf="!loadingCards">
            <button
              class="card-option"
              *ngFor="let card of creditCards"
              [class.selected]="creditCardId === card._id"
              [style.--card-color]="card.color || '#E4B3E9'"
              (click)="creditCardId = card._id"
            >
              <div class="card-indicator" [style.background]="card.color || '#E4B3E9'"></div>
              <div class="card-info">
                <span class="card-name">{{ card.name }}</span>
                <span class="card-meta" *ngIf="card.lastFourDigits">**** {{ card.lastFourDigits }}</span>
              </div>
              <svg *ngIf="creditCardId === card._id" class="card-check" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15C48C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
          </div>
          <div class="card-select-loading" *ngIf="loadingCards">
            <span class="loading-dots">Cargando tarjetas...</span>
          </div>
          <p class="card-select-empty" *ngIf="!loadingCards && creditCards.length === 0">
            No hay tarjetas activas. <a routerLink="/tarjetas/nueva" class="card-create-link">Crear tarjeta</a>
          </p>
        </div>

        <div class="desc-section">
          <label class="field-label">Descripci\u00f3n (opcional)</label>
          <input
            class="desc-input"
            [(ngModel)]="description"
            name="description"
            type="text"
            placeholder="Ej: Supermercado del s\u00e1bado"
          />
        </div>

        <!-- TODO: Selector de qui\u00e9n pag\u00f3 - implementar cuando el feature de familia est\u00e9 disponible -->

        <p class="error-msg" *ngIf="state === 'error'">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          No pudimos guardar los cambios
        </p>

        <button class="btn-save" [disabled]="!dirty || state === 'saving'" (click)="onSave()">
          <span *ngIf="state !== 'saving'">Guardar cambios</span>
          <span *ngIf="state === 'saving'" class="save-spinner">
            <img src="/assets/miru-icon.svg" class="spinner-miru" alt="Cargando" />
          </span>
        </button>
      </ng-container>

      <div class="modal-overlay" *ngIf="showDiscardModal">
        <div class="modal-card">
          <p class="modal-title">\u00bfDescartar cambios?</p>
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
    .btn-back { background: none; border: none; padding: 4px; cursor: pointer; display: flex; align-items: center; margin-left: -4px; }
    .title { font-size: 20px; font-weight: 700; color: #F0F2F5; margin: 0; }
    .btn-save-header { background: none; border: none; padding: 4px; cursor: pointer; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; color: #E05252; transition: opacity 150ms; display: flex; align-items: center; gap: 6px; }
    .btn-save-header.disabled { opacity: 0.4; cursor: not-allowed; }
    .header-spinner { display: flex; align-items: center; }
    .spinner-sm { display: inline-block; width: 18px; height: 18px; border: 2px solid rgba(228,179,233,0.2); border-top-color: #E4B3E9; border-radius: 50%; animation: spin 0.6s linear infinite; }
    .spinner-miru { width: 20px; height: 20px; animation: spin 800ms linear infinite; }

    .loading-state { padding-top: 32px; }
    .skeleton-monto { height: 72px; width: 200px; margin: 0 auto; background: #1E2530; border-radius: 12px; animation: shimmer 1.5s infinite; }
    .skeleton-grid { margin-top: 28px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .skeleton-card { height: 80px; background: #1E2530; border-radius: 16px; animation: shimmer 1.5s infinite; }

    .monto-section { margin-top: 32px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
    .field-label { font-size: 12px; font-weight: 500; color: #8A95A8; align-self: flex-start; }
    .monto-section .field-label { align-self: center; }
    .monto-input-wrapper { display: flex; align-items: center; justify-content: center; gap: 4px; height: 72px; }
    .monto-prefix { font-family: 'Inter', sans-serif; font-size: 32px; font-weight: 600; color: #8A95A8; line-height: 1; }
    .monto-input { background: transparent; border: none; outline: none; color: #F0F2F5; font-family: 'Inter', sans-serif; font-size: 48px; font-weight: 800; text-align: center; width: 240px; padding: 0; caret-color: #E05252; }
    .monto-input::placeholder { color: #697586; opacity: 0.5; }

    .category-section { margin-top: 28px; display: flex; flex-direction: column; gap: 8px; }
    .category-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .category-card { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; width: 100%; height: 80px; background: #161B24; border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; cursor: pointer; padding: 12px; transition: all 150ms; }
    .category-card:hover { background: rgba(255,255,255,0.04); }
    .category-card.selected { border: 1.5px solid #E05252; background: rgba(224,82,82,0.08); animation: selectPop 200ms ease; }
    .category-icon { display: flex; align-items: center; justify-content: center; }
    .category-label { font-size: 11px; font-weight: 400; color: #F0F2F5; text-align: center; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }

    .payment-section { margin-top: 16px; display: flex; flex-direction: column; gap: 8px; }
    .payment-chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .payment-chip { display: flex; align-items: center; gap: 6px; height: 36px; padding: 0 14px; background: #1E2530; border: 1px solid transparent; border-radius: 999px; color: #F0F2F5; font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 150ms; }
    .payment-chip.selected { border-color: #E05252; background: rgba(224,82,82,0.08); }

    .card-selector-section { margin-top: 16px; display: flex; flex-direction: column; gap: 8px; }
    .card-select { display: flex; flex-direction: column; gap: 8px; }
    .card-option { display: flex; align-items: center; gap: 12px; width: 100%; height: 52px; padding: 0 14px; background: #161B24; border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; cursor: pointer; transition: all 150ms; }
    .card-option.selected { border-color: var(--card-color, #E4B3E9); background: rgba(228,179,233,0.06); }
    .card-indicator { width: 6px; height: 28px; border-radius: 3px; flex-shrink: 0; }
    .card-info { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
    .card-name { font-size: 13px; font-weight: 500; color: #F0F2F5; }
    .card-meta { font-size: 11px; font-weight: 400; color: #697586; }
    .card-check { flex-shrink: 0; }
    .card-select-loading { padding: 12px 0; }
    .loading-dots { font-size: 12px; color: #697586; }
    .card-select-empty { font-size: 12px; color: #697586; text-align: center; padding: 12px 0; }
    .card-create-link { color: #E4B3E9; text-decoration: none; font-weight: 600; }
    .desc-section { margin-top: 16px; display: flex; flex-direction: column; gap: 8px; }
    .desc-input { background: #1E2530; border: 1px solid transparent; border-radius: 16px; height: 48px; padding: 0 16px; color: #F0F2F5; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 400; outline: none; transition: border-color 150ms; }
    .desc-input:focus { border-color: #E05252; }
    .desc-input::placeholder { color: #697586; }

    .error-msg { display: flex; align-items: center; justify-content: center; gap: 6px; color: #F87171; font-size: 12px; font-weight: 400; margin-top: 16px; text-align: center; }

    .btn-save { width: 100%; height: 44px; margin-top: 24px; background: #E05252; color: #F0F2F5; border: none; border-radius: 999px; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: opacity 150ms; }
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
    @keyframes selectPop { 0% { transform: scale(1); } 50% { transform: scale(1.02); } 100% { transform: scale(1); } }
    @keyframes shimmer { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes scaleIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  `]
})
export class EditExpenseComponent implements OnInit, OnDestroy {
  expenseId = ''
  original: ExpenseData | null = null

  amount = 0
  amountDisplay = ''
  category: ExpenseCategory = 'other'
  paymentType: PaymentType = 'cash'
  description = ''

  state: 'loading' | 'loaded' | 'saving' | 'error' | 'success' = 'loading'
  showDiscardModal = false

  categories = CATEGORIES
  paymentTypes = PAYMENT_TYPES
  creditCards: CreditCardData[] = []
  creditCardId: string | null = null
  loadingCards = false
  private destroy$ = new Subject<void>()

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private tarjetasService: TarjetasService,
  ) {}

  get dirty(): boolean {
    if (!this.original) return false
    return (
      this.amount !== this.original.amount ||
      this.category !== this.original.category ||
      this.paymentType !== this.original.paymentType ||
      this.description !== (this.original.description || '') ||
      (this.creditCardId ?? undefined) !== (this.original.creditCardId ?? undefined)
    )
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.expenseId = params['id']
      this.loadCards()
      this.loadExpense()
    })
  }

  private loadCards(): void {
    this.loadingCards = true
    this.tarjetasService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cards) => {
          this.creditCards = cards.filter(c => c.isActive)
          this.loadingCards = false
        },
        error: () => {
          this.loadingCards = false
        },
      })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  private loadExpense(): void {
    this.state = 'loading'
    this.api.get<ExpenseData>('/finance/expenses/' + this.expenseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const data = res.data as ExpenseData
          this.original = data
          this.amount = data.amount
          this.amountDisplay = this.formatAmount(data.amount)
          this.category = data.category as ExpenseCategory
          this.paymentType = data.paymentType || 'cash'
          this.description = data.description || ''
          this.creditCardId = data.creditCardId || null
          this.state = 'loaded'
        },
        error: () => {
          this.state = 'error'
        },
      })
  }

  private getRawNumeric(value: string): { intStr: string; decStr: string; hasComma: boolean } {
    let raw = value.replace(/[^0-9,]/g, '')
    const firstComma = raw.indexOf(',')
    const hasComma = firstComma !== -1
    let intStr = hasComma ? raw.substring(0, firstComma) : raw
    let decStr = hasComma ? raw.substring(firstComma + 1).replace(/,/g, '').substring(0, 2) : ''
    if (intStr.length > 1) intStr = intStr.replace(/^0+/, '')
    return { intStr, decStr, hasComma }
  }

  onAmountInput(event: Event): void {
    const input = event.target as HTMLInputElement
    const { intStr, decStr, hasComma } = this.getRawNumeric(input.value)

    const numericStr = intStr === '' ? '0' : intStr
    const fullNum = hasComma ? numericStr + '.' + (decStr || '0') : numericStr
    this.amount = parseFloat(fullNum) || 0

    const formattedInt = parseInt(numericStr, 10).toLocaleString('es-AR')
    if (intStr === '' && !hasComma) {
      this.amountDisplay = ''
    } else {
      this.amountDisplay = hasComma ? formattedInt + ',' + decStr : formattedInt
    }

    input.value = this.amountDisplay
  }

  onKeydown(event: KeyboardEvent): void {
    const allowed = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End']
    if (allowed.includes(event.key)) return
    if ((event.ctrlKey || event.metaKey) && ['c', 'v', 'a', 'x'].includes(event.key.toLowerCase())) return
    if (!/^[\d,]$/.test(event.key)) { event.preventDefault() }
  }

  onAmountFocus(): void {
    if (this.amountDisplay === '0' || !this.amountDisplay) {
      this.amountDisplay = ''
    }
  }

  private formatAmount(value: number): string {
    if (value === 0) return ''
    const intPart = Math.floor(value)
    const decPart = Math.round((value - intPart) * 100)
    const formattedInt = intPart.toLocaleString('es-AR')
    return decPart > 0 ? formattedInt + ',' + String(decPart).padStart(2, '0') : formattedInt
  }

  getCategoryIcon(name: string): SafeHtml {
    const p = CATEGORY_ICONS[name] || CATEGORY_ICONS['ellipsis']
    const svg = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>'
    return this.sanitizer.bypassSecurityTrustHtml(svg)
  }

  getPaymentIcon(name: string): SafeHtml {
    const p = PAYMENT_ICONS[name] || PAYMENT_ICONS['banknote']
    const svg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>'
    return this.sanitizer.bypassSecurityTrustHtml(svg)
  }

  selectCategory(cat: ExpenseCategory): void {
    this.category = cat
  }

  selectPaymentType(pt: PaymentType): void {
    this.paymentType = pt
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
    this.router.navigate(['/movimientos'])
  }

  onSave(): void {
    if (!this.dirty || this.state === 'saving') return

    this.state = 'saving'
    this.api.put<ExpenseData>('/finance/expenses/' + this.expenseId, {
      amount: this.amount,
      category: this.category,
      paymentType: this.paymentType,
      description: this.description || undefined,
      creditCardId: this.paymentType === 'credit_card' ? this.creditCardId : undefined,
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.state = 'success'
          setTimeout(() => {
            this.router.navigate(['/movimientos'])
          }, 200)
        },
        error: () => {
          this.state = 'error'
        },
      })
  }
}
