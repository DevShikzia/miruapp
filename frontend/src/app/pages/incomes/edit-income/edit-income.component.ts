import { Component, OnInit, OnDestroy } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'
import { Router, ActivatedRoute } from '@angular/router'
import { NgIf, NgFor } from '@angular/common'
import { Subject, takeUntil } from 'rxjs'
import { ApiService } from '../../../services/api.service'
import type { IIncome, IncomeCategory } from '@shared/types/income.types'

interface CategoryOption {
  key: IncomeCategory
  label: string
  color: string
  icon: string
}

const CATEGORIES: CategoryOption[] = [
  { key: 'salary', label: 'Sueldo', color: '#15C48C', icon: 'briefcase' },
  { key: 'freelance', label: 'Freelance', color: '#5B8DEF', icon: 'laptop' },
  { key: 'investment', label: 'Inversi\u00f3n', color: '#9B6EF3', icon: 'trending-up' },
  { key: 'sale', label: 'Venta', color: '#C99A0A', icon: 'shopping-bag' },
  { key: 'family', label: 'Familiar', color: '#E05252', icon: 'heart' },
  { key: 'loan', label: 'Pr\u00e9stamo', color: '#E4B3E9', icon: 'hand-coins' },
  { key: 'refund', label: 'Devoluci\u00f3n', color: '#15C48C', icon: 'rotate-ccw' },
  { key: 'other', label: 'Otro', color: '#8A95A8', icon: 'ellipsis' },
]

const CATEGORY_ICONS: Record<string, string> = {
  briefcase: '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/>',
  laptop: '<path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0-4 2v2H6v-2l-4-2m20 0h-4"/>',
  'trending-up': '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
  'shopping-bag': '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  'hand-coins': '<path d="M11 15h2a2 2 0 1 0 0-4h-2v4Z"/><path d="M13 11V9"/><path d="M13 17v-2"/><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>',
  'rotate-ccw': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  ellipsis: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
}

@Component({
  selector: 'app-edit-income',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor],
  template: `
    <div class="container">
      <header class="header">
        <button class="btn-back" (click)="onBack()">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8A95A8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h1 class="title">Editar ingreso</h1>
        <button class="btn-save-header" [class.disabled]="!dirty" [disabled]="!dirty || state === 'saving'" (click)="onSave()">
          <span *ngIf="state !== 'saving'">Guardar</span>
          <span *ngIf="state === 'saving'" class="header-spinner">
            <span class="spinner-sm"></span>
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
          <label class="field-label">\u00bfCu\u00e1nto recibiste?</label>
          <div class="monto-input-wrapper">
            <span class="monto-prefix">$</span>
            <input
              class="monto-input"
              [value]="amountDisplay"
              name="amount"
              type="text"
              inputmode="numeric"
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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" [innerHTML]="getIcon(cat.icon)"></svg>
              </div>
              <span class="category-label">{{ cat.label }}</span>
            </button>
          </div>
        </div>

        <div class="desc-section">
          <label class="field-label">Descripci\u00f3n (opcional)</label>
          <input
            class="desc-input"
            [(ngModel)]="description"
            name="description"
            type="text"
            placeholder="Ej: Sueldo de junio"
          />
        </div>

        <!-- TODO: Selector de qui\u00e9n recibi\u00f3 - implementar cuando el feature de familia est\u00e9 disponible -->

        <p class="error-msg" *ngIf="state === 'error'">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          No pudimos guardar los cambios
        </p>

        <button class="btn-save" [disabled]="!dirty || state === 'saving'" (click)="onSave()">
          <span *ngIf="state !== 'saving'">Guardar cambios</span>
          <span *ngIf="state === 'saving'" class="save-spinner">
            <span class="spinner-sm"></span>
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

    .header { display: flex; align-items: center; justify-content: space-between; padding-top: 40px; }
    .btn-back { background: none; border: none; padding: 4px; cursor: pointer; display: flex; align-items: center; margin-left: -4px; }
    .title { font-size: 20px; font-weight: 700; color: #F0F2F5; margin: 0; }
    .btn-save-header { background: none; border: none; padding: 4px; cursor: pointer; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; color: #E4B3E9; transition: opacity 150ms; display: flex; align-items: center; gap: 6px; }
    .btn-save-header.disabled { opacity: 0.4; cursor: not-allowed; }
    .header-spinner { display: flex; align-items: center; }
    .spinner-sm { display: inline-block; width: 18px; height: 18px; border: 2px solid rgba(228,179,233,0.2); border-top-color: #E4B3E9; border-radius: 50%; animation: spin 0.6s linear infinite; }

    .loading-state { padding-top: 32px; }
    .skeleton-monto { height: 72px; width: 200px; margin: 0 auto; background: #1E2530; border-radius: 12px; animation: shimmer 1.5s infinite; }
    .skeleton-grid { margin-top: 28px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .skeleton-card { height: 80px; background: #1E2530; border-radius: 16px; animation: shimmer 1.5s infinite; }

    .monto-section { margin-top: 32px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
    .field-label { font-size: 12px; font-weight: 500; color: #8A95A8; align-self: flex-start; }
    .monto-section .field-label { align-self: center; }
    .monto-input-wrapper { display: flex; align-items: center; justify-content: center; gap: 4px; height: 72px; }
    .monto-prefix { font-family: 'Inter', sans-serif; font-size: 32px; font-weight: 600; color: #8A95A8; line-height: 1; }
    .monto-input { background: transparent; border: none; outline: none; color: #F0F2F5; font-family: 'Inter', sans-serif; font-size: 48px; font-weight: 800; text-align: center; width: 240px; padding: 0; caret-color: #E4B3E9; }
    .monto-input::placeholder { color: #697586; opacity: 0.5; }

    .category-section { margin-top: 28px; display: flex; flex-direction: column; gap: 8px; }
    .category-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .category-card { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; width: 100%; height: 80px; background: #161B24; border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; cursor: pointer; padding: 12px; transition: all 150ms; }
    .category-card:hover { background: rgba(255,255,255,0.04); }
    .category-card.selected { border: 1.5px solid #E4B3E9; background: rgba(228,179,233,0.08); }
    .category-icon { display: flex; align-items: center; justify-content: center; }
    .category-label { font-size: 11px; font-weight: 400; color: #F0F2F5; text-align: center; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }

    .desc-section { margin-top: 20px; display: flex; flex-direction: column; gap: 8px; }
    .desc-input { background: #1E2530; border: 1px solid transparent; border-radius: 16px; height: 48px; padding: 0 16px; color: #F0F2F5; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 400; outline: none; transition: border-color 150ms; }
    .desc-input:focus { border-color: #E4B3E9; }
    .desc-input::placeholder { color: #697586; }

    .error-msg { display: flex; align-items: center; justify-content: center; gap: 6px; color: #F87171; font-size: 12px; font-weight: 400; margin-top: 16px; text-align: center; }

    .btn-save { width: 100%; height: 44px; margin-top: 28px; background: #15C48C; color: #041710; border: none; border-radius: 999px; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: opacity 150ms; }
    .btn-save:disabled { opacity: 0.4; cursor: not-allowed; }
    .save-spinner { display: flex; align-items: center; }
    .save-spinner .spinner-sm { width: 20px; height: 20px; }

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
    @keyframes shimmer { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes scaleIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  `]
})
export class EditIncomeComponent implements OnInit, OnDestroy {
  incomeId = ''
  original: IIncome | null = null

  amount = 0
  amountDisplay = ''
  category: IncomeCategory = 'other'
  description = ''

  state: 'loading' | 'loaded' | 'saving' | 'error' | 'success' = 'loading'
  showDiscardModal = false

  categories = CATEGORIES
  private destroy$ = new Subject<void>()

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
  ) {}

  get dirty(): boolean {
    if (!this.original) return false
    return (
      this.amount !== this.original.amount ||
      this.category !== this.original.category ||
      this.description !== (this.original.description || '')
    )
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.incomeId = params['id']
      this.loadIncome()
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  private loadIncome(): void {
    this.state = 'loading'
    this.api.get<IIncome>('/finance/incomes/' + this.incomeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.original = res.data
          this.amount = res.data.amount
          this.amountDisplay = this.formatAmount(res.data.amount)
          this.category = res.data.category
          this.description = res.data.description || ''
          this.state = 'loaded'
        },
        error: () => {
          this.state = 'error'
        },
      })
  }

  onAmountInput(event: Event): void {
    const input = event.target as HTMLInputElement
    const raw = input.value.replace(/[^0-9]/g, '')
    this.amount = raw ? parseInt(raw, 10) : 0
    this.amountDisplay = this.amount > 0 ? this.amount.toLocaleString('es-AR') : ''
    input.value = this.amountDisplay
  }

  onKeydown(event: KeyboardEvent): void {
    const allowed = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End']
    if (allowed.includes(event.key)) return
    if ((event.ctrlKey || event.metaKey) && ['c', 'v', 'a', 'x'].includes(event.key.toLowerCase())) return
    if (!/^\d$/.test(event.key)) { event.preventDefault() }
  }

  onAmountFocus(): void {
    if (this.amountDisplay === '0' || !this.amountDisplay) {
      this.amountDisplay = ''
    }
  }

  private formatAmount(value: number): string {
    if (value === 0) return ''
    return value.toLocaleString('es-AR')
  }

  getIcon(name: string): SafeHtml {
    const p = CATEGORY_ICONS[name] || CATEGORY_ICONS['ellipsis']
    const svg = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>'
    return this.sanitizer.bypassSecurityTrustHtml(svg)
  }

  selectCategory(cat: IncomeCategory): void {
    this.category = cat
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
    this.api.put<IIncome>('/finance/incomes/' + this.incomeId, {
      amount: this.amount,
      category: this.category,
      description: this.description || undefined,
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

