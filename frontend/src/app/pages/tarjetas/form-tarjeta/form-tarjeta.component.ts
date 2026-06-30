import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router, ActivatedRoute } from '@angular/router'
import { NgIf, NgFor } from '@angular/common'
import { Subject, takeUntil } from 'rxjs'
import { TarjetasService } from '../../../services/tarjetas.service'
import type { CardBrand, CreditCardData, CreateCreditCardRequest, UpdateCreditCardRequest } from '@shared/types/credit-card.types'

const BRANDS: { key: CardBrand; label: string }[] = [
  { key: 'visa', label: 'Visa' },
  { key: 'mastercard', label: 'Mastercard' },
  { key: 'amex', label: 'Amex' },
  { key: 'other', label: 'Otra' },
]

const COLORS: string[] = ['#5B8DEF', '#22C55E', '#E05252', '#C99A0A', '#9B6EF3', '#E4B3E9', '#F97316', '#8A95A8']

@Component({
  selector: 'app-form-tarjeta',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor],
  template: `
    <div class="container">
      <header class="header">
        <button class="btn-back" (click)="onBack()">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8A95A8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h1 class="title">{{ isEdit ? 'Editar tarjeta' : 'Nueva tarjeta' }}</h1>
        <button class="btn-save-header" [class.disabled]="!canSave || state === 'saving'" [disabled]="!canSave || state === 'saving'" (click)="onSave()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          <span>Guardar</span>
        </button>
      </header>

      <div class="loading-state" *ngIf="state === 'loading'">
        <div class="skeleton-input"></div>
        <div class="skeleton-input" style="width: 60%"></div>
      </div>

      <ng-container *ngIf="state !== 'loading'">
        <div class="field-section">
          <label class="field-label">Nombre de la tarjeta</label>
          <input class="text-input" [(ngModel)]="name" name="name" type="text" placeholder="Ej: Visa Platino" (input)="onNameInput()" />
        </div>

        <div class="field-section">
          <label class="field-label">Marca</label>
          <div class="brand-chips">
            <button class="brand-chip" *ngFor="let b of brands" [class.selected]="brand === b.key" (click)="selectBrand(b.key)">
              {{ b.label }}
            </button>
          </div>
        </div>

        <div class="field-group">
          <div class="group-header">Datos de la tarjeta (opcional)</div>
          <div class="field-section">
            <label class="field-label">\u00daltimos 4 d\u00edgitos</label>
            <input class="text-input digits-input" [(ngModel)]="lastFourDigits" name="lastFourDigits" type="text" inputmode="numeric" maxlength="4" placeholder="&bull;&bull;&bull;&bull;" (keydown)="onDigitsKeydown($event)" />
          </div>
          <div class="field-section">
            <label class="field-label">Banco</label>
            <input class="text-input" [(ngModel)]="bankName" name="bankName" type="text" placeholder="Ej: Banco Naci\u00f3n" />
          </div>
          <div class="field-section">
            <label class="field-label">L\u00edmite de cr\u00e9dito</label>
            <div class="monto-input-wrapper">
              <span class="monto-prefix">$</span>
              <input class="text-input" [(ngModel)]="creditLimitDisplay" name="creditLimit" type="text" inputmode="numeric" placeholder="0" (input)="onLimitInput($event)" />
            </div>
          </div>
        </div>

        <div class="field-group">
          <div class="group-header">Fechas del ciclo</div>
          <div class="fechas-row">
            <div class="field-section">
              <label class="field-label">D\u00eda de cierre</label>
              <input class="text-input day-input" [(ngModel)]="closingDay" name="closingDay" type="number" min="1" max="28" placeholder="15" />
            </div>
            <div class="field-section">
              <label class="field-label">D\u00eda de venc.</label>
              <input class="text-input day-input" [(ngModel)]="dueDay" name="dueDay" type="number" min="1" max="28" placeholder="5" />
            </div>
          </div>
          <p class="field-hint" *ngIf="closingDay && dueDay && closingDay === dueDay">El d\u00eda de cierre y vencimiento no pueden ser iguales</p>
        </div>

        <div class="field-section">
          <label class="field-label">Color (opcional)</label>
          <div class="color-palette">
            <button class="color-swatch" *ngFor="let c of colors" [style.background]="c" [class.selected]="selectedColor === c" (click)="selectColor(c)"></button>
          </div>
        </div>

        <div class="field-section">
          <label class="field-label">Notas (opcional)</label>
          <textarea class="text-area" [(ngModel)]="notes" name="notes" placeholder="Ej: Usar solo para suscripciones"></textarea>
        </div>

        <div class="delete-section" *ngIf="isEdit">
          <div class="delete-divider"></div>
          <button class="btn-delete" (click)="onDelete()">Eliminar tarjeta</button>
        </div>

        <p class="error-msg" *ngIf="state === 'error'">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          {{ errorMsg }}
        </p>

        <button class="btn-save" [disabled]="!canSave || state === 'saving'" (click)="onSave()">
          <span *ngIf="state !== 'saving'">{{ isEdit ? 'Guardar cambios' : 'Guardar tarjeta' }}</span>
          <span *ngIf="state === 'saving'" class="save-spinner">
            <img src="/assets/miru-icon.svg" class="spinner-miru" alt="Cargando" />
          </span>
        </button>
      </ng-container>

      <div class="modal-overlay" *ngIf="showDeleteModal">
        <div class="modal-card">
          <p class="modal-title">\u00bfEliminar tarjeta?</p>
          <p class="modal-desc">Se eliminar\u00e1 "{{ name }}". Los gastos asociados no se eliminar\u00e1n.</p>
          <div class="modal-actions">
            <button class="modal-btn secondary" (click)="showDeleteModal = false">Cancelar</button>
            <button class="modal-btn primary" (click)="confirmDelete()">Eliminar</button>
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
    .btn-save-header { background: none; border: none; padding: 4px; cursor: pointer; color: #5B8DEF; transition: opacity 150ms; display: flex; align-items: center; gap: 6px; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; }
    .btn-save-header.disabled { opacity: 0.4; cursor: not-allowed; }

    .loading-state { padding-top: 32px; }
    .skeleton-input { height: 48px; background: #1E2530; border-radius: 16px; margin-bottom: 16px; animation: shimmer 1.5s infinite; }

    .field-section { margin-top: 16px; display: flex; flex-direction: column; gap: 8px; }
    .field-label { font-size: 12px; font-weight: 500; color: #8A95A8; }
    .text-input { background: #1E2530; border: 1px solid transparent; border-radius: 16px; height: 48px; padding: 0 16px; color: #F0F2F5; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 400; outline: none; transition: border-color 150ms; }
    .text-input:focus { border-color: #5B8DEF; }
    .text-input::placeholder { color: #697586; }
    .digits-input { width: 120px; font-size: 18px; font-weight: 600; letter-spacing: 4px; }
    .day-input { width: 100%; text-align: center; }

    .brand-chips { display: flex; gap: 8px; }
    .brand-chip { height: 36px; padding: 0 16px; background: #1E2530; border: 1px solid transparent; border-radius: 999px; color: #F0F2F5; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 150ms; }
    .brand-chip.selected { border-color: #5B8DEF; background: rgba(91,141,239,0.08); }

    .field-group { margin-top: 20px; }
    .group-header { font-size: 13px; font-weight: 600; color: #8A95A8; margin-bottom: 4px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06); }

    .monto-input-wrapper { display: flex; align-items: center; gap: 6px; }
    .monto-prefix { font-size: 16px; font-weight: 600; color: #8A95A8; }

    .fechas-row { display: flex; gap: 12px; }
    .fechas-row .field-section { flex: 1; }
    .field-hint { font-size: 11px; color: #C99A0A; margin: 4px 0 0; }

    .color-palette { display: flex; gap: 8px; flex-wrap: wrap; }
    .color-swatch { width: 32px; height: 32px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; transition: all 150ms; padding: 0; }
    .color-swatch.selected { border-color: #F0F2F5; transform: scale(1.15); }

    .text-area { background: #1E2530; border: 1px solid transparent; border-radius: 16px; height: 80px; padding: 12px 16px; color: #F0F2F5; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 400; outline: none; transition: border-color 150ms; resize: none; }
    .text-area:focus { border-color: #5B8DEF; }
    .text-area::placeholder { color: #697586; }

    .delete-section { margin-top: 32px; }
    .delete-divider { height: 1px; background: rgba(255,255,255,0.06); margin-bottom: 16px; }
    .btn-delete { background: none; border: none; color: #E05252; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; padding: 8px 0; width: 100%; text-align: center; }

    .error-msg { display: flex; align-items: center; justify-content: center; gap: 6px; color: #F87171; font-size: 12px; margin-top: 16px; }

    .btn-save { width: 100%; height: 44px; margin-top: 24px; background: #5B8DEF; color: #F0F2F5; border: none; border-radius: 999px; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: opacity 150ms; }
    .btn-save:disabled { opacity: 0.4; cursor: not-allowed; }
    .save-spinner { display: flex; align-items: center; }
    .spinner-miru { width: 20px; height: 20px; animation: spin 800ms linear infinite; }

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
export class FormTarjetaComponent implements OnInit, OnDestroy {
  isEdit = false
  cardId = ''

  name = ''
  brand: CardBrand = 'visa'
  lastFourDigits = ''
  bankName = ''
  creditLimitDisplay = ''
  creditLimit = 0
  closingDay: number | null = null
  dueDay: number | null = null
  selectedColor = ''
  notes = ''
  showDeleteModal = false

  state: 'default' | 'loading' | 'saving' | 'error' | 'success' = 'default'
  errorMsg = 'No pudimos guardar la tarjeta'
  brands = BRANDS
  colors = COLORS
  private destroy$ = new Subject<void>()

  constructor(
    private tarjetasService: TarjetasService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        this.isEdit = true
        this.cardId = params['id']
        this.loadCard()
      } else {
        this.state = 'default'
      }
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  get canSave(): boolean {
    if (this.state === 'loading') return false
    const nameOk = this.name.trim().length >= 2
    const closingOk = this.closingDay !== null && this.closingDay >= 1 && this.closingDay <= 28
    const dueOk = this.dueDay !== null && this.dueDay >= 1 && this.dueDay <= 28
    const sameDay = this.closingDay !== null && this.dueDay !== null && this.closingDay === this.dueDay
    return nameOk && closingOk && dueOk && !sameDay
  }

  private loadCard(): void {
    this.state = 'loading'
    this.tarjetasService.getById(this.cardId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.name = data.name
          this.brand = data.brand
          this.lastFourDigits = data.lastFourDigits || ''
          this.bankName = data.bankName || ''
          this.creditLimit = data.creditLimit || 0
          this.creditLimitDisplay = this.creditLimit > 0 ? this.creditLimit.toLocaleString('es-AR') : ''
          this.closingDay = data.closingDay
          this.dueDay = data.dueDay
          this.selectedColor = data.color || ''
          this.notes = data.notes || ''
          this.state = 'default'
          this.cdr.markForCheck()
        },
        error: () => {
          this.errorMsg = 'No pudimos cargar los datos de la tarjeta'
          this.state = 'error'
          this.cdr.markForCheck()
        },
      })
  }

  selectBrand(b: CardBrand): void {
    this.brand = b
  }

  selectColor(c: string): void {
    this.selectedColor = this.selectedColor === c ? '' : c
  }

  onNameInput(): void {
    this.name = this.name.slice(0, 50)
  }

  onDigitsKeydown(event: KeyboardEvent): void {
    const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight']
    if (allowed.includes(event.key)) return
    if (!/^\d$/.test(event.key) && event.key !== 'Enter') {
      event.preventDefault()
    }
  }

  onLimitInput(event: Event): void {
    const input = event.target as HTMLInputElement
    const raw = input.value.replace(/[^0-9]/g, '')
    this.creditLimit = raw ? parseInt(raw, 10) : 0
    this.creditLimitDisplay = raw ? parseInt(raw, 10).toLocaleString('es-AR') : ''
  }

  onBack(): void {
    this.router.navigate(['/tarjetas'])
  }

  onSave(): void {
    if (!this.canSave || this.state === 'saving') return
    this.state = 'saving'

    const payload: CreateCreditCardRequest = {
      name: this.name.trim(),
      brand: this.brand,
      closingDay: this.closingDay!,
      dueDay: this.dueDay!,
      lastFourDigits: this.lastFourDigits || undefined,
      bankName: this.bankName || undefined,
      creditLimit: this.creditLimit > 0 ? this.creditLimit : undefined,
      color: this.selectedColor || undefined,
      notes: this.notes || undefined,
      isActive: true,
      creditUsed: 0,
    }

    const request = this.isEdit
      ? this.tarjetasService.update(this.cardId, payload as UpdateCreditCardRequest)
      : this.tarjetasService.create(payload)

    request.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.state = 'success'
        this.cdr.markForCheck()
        setTimeout(() => {
          this.router.navigate(['/tarjetas'])
        }, 200)
      },
      error: () => {
        this.state = 'error'
        this.cdr.markForCheck()
      },
    })
  }

  onDelete(): void {
    this.showDeleteModal = true
  }

  confirmDelete(): void {
    this.showDeleteModal = false
    this.state = 'saving'
    this.tarjetasService.delete(this.cardId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/tarjetas'])
        },
        error: () => {
          this.state = 'error'
          this.errorMsg = 'No pudimos eliminar la tarjeta'
        },
      })
  }
}
