import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { NgIf, NgFor } from '@angular/common'
import { ApiService } from '../../../services/api.service'
import type { CreateSavingRequest } from '@shared/types/saving.types'
import type { SavingColor } from '@shared/types/saving.types'

const EMOJIS = ['🏖️', '🏠', '🚗', '✈️', '🎓', '💍', '🎮', '💻', '🏥', '🐕', '🎸', '🌴', '🏋️', '📚', '🎂', '💼']

const COLORS: { value: SavingColor; label: string }[] = [
  { value: '#C99A0A', label: 'Dorado' },
  { value: '#15C48C', label: 'Verde' },
  { value: '#5B8DEF', label: 'Azul' },
  { value: '#9B6EF3', label: 'Púrpura' },
  { value: '#E05252', label: 'Rojo' },
  { value: '#E4B3E9', label: 'Rosa' },
]

@Component({
  selector: 'app-create-saving',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor],
  template: `
    <div class="page">
      <header class="header">
        <button class="btn-close" (click)="goBack()">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8A95A8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
        </button>
        <span class="header-title">Nueva meta</span>
        <button class="btn-save-header" [class.disabled]="!canSave" (click)="save()">
          Guardar
        </button>
      </header>

      <!-- Emoji grid -->
      <section class="emoji-section">
        <label class="section-label">Elegí un ícono para tu meta</label>
        <div class="emoji-grid">
          <button
            class="emoji-cell"
            *ngFor="let emoji of emojis"
            [class.selected]="selectedEmoji === emoji"
            (click)="selectedEmoji = emoji"
          >{{ emoji }}</button>
        </div>
      </section>

      <!-- Name -->
      <section class="field-section">
        <label class="field-label">¿Qué querés ahorrar?</label>
        <div class="input-row">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#697586" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>
          <input
            class="field-input"
            [(ngModel)]="name"
            name="name"
            type="text"
            placeholder="Ej: Viaje a la costa"
            maxlength="40"
            autofocus
          />
        </div>
        <span class="char-counter">{{ name.length }}/40</span>
      </section>

      <!-- Target amount -->
      <section class="field-section">
        <label class="field-label">¿Cuánto necesitás?</label>
        <div class="input-row">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#697586" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          <input
            class="field-input"
            [value]="targetAmountDisplay"
            name="targetAmount"
            type="text"
            placeholder="$ 0"
            inputmode="decimal"
            (input)="onTargetInput($event)"
          />
        </div>
      </section>

      <!-- Deadline -->
      <section class="field-section">
        <label class="field-label">Fecha límite <span class="optional">(opcional)</span></label>
        <div class="input-row">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#697586" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
          <input
            class="field-input"
            [(ngModel)]="deadline"
            name="deadline"
            type="date"
          />
          <button class="btn-clear" *ngIf="deadline" (click)="deadline = ''">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#697586" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
          </button>
        </div>
        <div class="calc-row" *ngIf="deadline && targetAmount > 0">
          <span class="calc-main">{{ monthlyCalc.text }}</span>
          <span class="calc-sub">{{ monthlyCalc.detail }}</span>
        </div>
      </section>

      <!-- Color -->
      <section class="field-section">
        <label class="field-label">Color de la meta <span class="optional">(opcional)</span></label>
        <div class="color-row">
          <button
            class="color-circle"
            *ngFor="let c of colors"
            [style.background]="c.value"
            [class.selected]="selectedColor === c.value"
            (click)="selectedColor = c.value"
            [attr.aria-label]="c.label"
          ></button>
        </div>
      </section>

      <!-- Auto-save toggle -->
      <section class="toggle-section">
        <div class="toggle-row" (click)="autoSave = !autoSave">
          <div class="toggle-info">
            <span class="toggle-label">🤖 Ahorro automático</span>
            <span class="toggle-sub">Apartá una cantidad automáticamente cada mes</span>
          </div>
          <div class="toggle-switch" [class.active]="autoSave">
            <div class="toggle-knob"></div>
          </div>
        </div>
        <div class="auto-fields" *ngIf="autoSave">
          <div class="auto-field">
            <span class="auto-field-label">Monto mensual</span>
            <div class="input-row auto-input-row">
              <input
                class="field-input"
                [value]="autoSaveAmountDisplay"
                name="autoSaveAmount"
                type="text"
                placeholder="$ 0"
                inputmode="decimal"
                (input)="onAutoAmountInput($event)"
              />
            </div>
          </div>
          <div class="auto-field">
            <span class="auto-field-label">Día del mes</span>
            <div class="input-row auto-input-row">
              <input
                class="field-input"
                [(ngModel)]="autoSaveDayDisplay"
                name="autoSaveDay"
                type="number"
                placeholder="1"
                min="1"
                max="28"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Submit -->
      <button class="btn-submit" [disabled]="!canSave || saving" (click)="save()">
        <span *ngIf="!saving">Crear meta</span>
        <span *ngIf="saving" class="save-spinner">
          <img src="/assets/miru-icon.svg" class="spinner-miru" alt="Cargando" />
        </span>
      </button>

      <p class="error-msg" *ngIf="errorMsg">{{ errorMsg }}</p>
    </div>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; background: #0C0F14; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
    .page { padding: 56px 24px 32px; max-width: 390px; margin: 0 auto; }
    ::-webkit-scrollbar { display: none; }

    .header { display: flex; align-items: center; justify-content: space-between; }
    .btn-close { background: none; border: none; padding: 4px; cursor: pointer; display: flex; }
    .header-title { font-size: 20px; font-weight: 700; color: #F0F2F5; }
    .btn-save-header { background: none; border: none; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; color: #C99A0A; cursor: pointer; padding: 4px; }
    .btn-save-header.disabled { opacity: 0.35; cursor: not-allowed; }

    .emoji-section { margin-top: 24px; text-align: center; }
    .section-label { font-size: 12px; font-weight: 500; color: #8A95A8; margin-bottom: 12px; display: block; }
    .emoji-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; max-width: 220px; margin: 0 auto; }
    .emoji-cell { width: 44px; height: 44px; background: #1E2530; border-radius: 12px; border: 1.5px solid transparent; display: flex; align-items: center; justify-content: center; font-size: 22px; cursor: pointer; transition: all 150ms; margin: 0 auto; }
    .emoji-cell.selected { background: rgba(201,154,10,0.15); border-color: #C99A0A; transform: scale(1.05); }

    .field-section { margin-top: 20px; }
    .field-label { font-size: 12px; font-weight: 500; color: #8A95A8; display: block; margin-bottom: 8px; }
    .optional { font-weight: 400; color: #697586; }
    .input-row { display: flex; align-items: center; gap: 10px; background: #1E2530; border-radius: 16px; height: 48px; padding: 0 16px; }
    .field-input { flex: 1; background: transparent; border: none; outline: none; color: #F0F2F5; font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 400; height: 100%; }
    .field-input::placeholder { color: #697586; }
    .char-counter { display: block; text-align: right; font-size: 11px; font-weight: 400; color: #697586; margin-top: 4px; }

    .btn-clear { background: none; border: none; padding: 0; cursor: pointer; display: flex; }

    .calc-row { margin-top: 8px; display: flex; flex-direction: column; gap: 2px; }
    .calc-main { font-size: 13px; font-weight: 500; color: #C99A0A; }
    .calc-sub { font-size: 11px; font-weight: 400; color: #697586; }

    .color-row { display: flex; gap: 12px; }
    .color-circle { width: 28px; height: 28px; border-radius: 999px; border: 3px solid transparent; cursor: pointer; transition: all 150ms; padding: 0; }
    .color-circle.selected { border-color: #F0F2F5; transform: scale(1.1); }

    .toggle-section { margin-top: 20px; }
    .toggle-row { display: flex; align-items: center; gap: 12px; cursor: pointer; }
    .toggle-info { flex: 1; }
    .toggle-label { font-size: 14px; font-weight: 500; color: #F0F2F5; display: block; }
    .toggle-sub { font-size: 11px; font-weight: 400; color: #697586; }
    .toggle-switch { width: 44px; height: 24px; background: #1E2530; border-radius: 999px; position: relative; transition: background 200ms; flex-shrink: 0; }
    .toggle-switch.active { background: #C99A0A; }
    .toggle-knob { width: 20px; height: 20px; background: #F0F2F5; border-radius: 999px; position: absolute; top: 2px; left: 2px; transition: transform 200ms; }
    .toggle-switch.active .toggle-knob { transform: translateX(20px); }

    .auto-fields { margin-top: 12px; display: flex; flex-direction: column; gap: 10px; animation: expand 200ms ease-out; overflow: hidden; }
    @keyframes expand { from { max-height: 0; opacity: 0; } to { max-height: 160px; opacity: 1; } }
    .auto-field { display: flex; flex-direction: column; gap: 6px; }
    .auto-field-label { font-size: 12px; font-weight: 500; color: #8A95A8; }
    .auto-input-row { height: 40px; padding: 0 14px; }

    .btn-submit { width: 100%; height: 44px; margin-top: 24px; background: #C99A0A; color: #0C0F14; border: none; border-radius: 999px; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: opacity 150ms; }
    .btn-submit:disabled { opacity: 0.35; cursor: not-allowed; }
    .save-spinner { display: flex; align-items: center; }
    .spinner-miru { width: 20px; height: 20px; animation: spin 800ms linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .error-msg { color: #F87171; font-size: 13px; font-weight: 400; text-align: center; margin-top: 12px; }
  `]
})
export class CreateSavingComponent {
  emojis = EMOJIS
  colors = COLORS

  selectedEmoji = ''
  name = ''
  targetAmount = 0
  targetAmountDisplay = ''
  deadline = ''
  selectedColor: SavingColor = '#C99A0A'
  autoSave = false
  autoSaveAmount = 0
  autoSaveAmountDisplay = ''
  autoSaveDayDisplay = ''

  saving = false
  errorMsg = ''

  constructor(
    private api: ApiService,
    private router: Router,
  ) {}

  get canSave(): boolean {
    return this.name.trim().length >= 2 && this.targetAmount > 0
  }

  get monthlyCalc(): { text: string; detail: string } {
    if (!this.deadline || this.targetAmount <= 0) return { text: '', detail: '' }
    const now = new Date()
    const end = new Date(this.deadline)
    if (end <= now) return { text: '', detail: '' }
    const diffMonths = (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth())
    const months = Math.max(diffMonths, 1)
    const monthly = Math.round(this.targetAmount / months)
    return {
      text: `Te faltan ${months} mes${months > 1 ? 'es' : ''} · Ahorro sugerido: $ ${monthly.toLocaleString('es-AR')}/mes`,
      detail: `$ ${this.targetAmount.toLocaleString('es-AR')} / ${months} mes${months > 1 ? 'es' : ''} = $ ${monthly.toLocaleString('es-AR')} por mes`,
    }
  }

  private getRawNumeric(value: string): string {
    return value.replace(/[^0-9]/g, '')
  }

  onTargetInput(event: Event): void {
    const input = event.target as HTMLInputElement
    const raw = this.getRawNumeric(input.value)
    this.targetAmount = raw === '' ? 0 : parseInt(raw, 10)
    this.targetAmountDisplay = this.targetAmount === 0 ? '' : this.targetAmount.toLocaleString('es-AR')
    input.value = this.targetAmountDisplay
  }

  onAutoAmountInput(event: Event): void {
    const input = event.target as HTMLInputElement
    const raw = this.getRawNumeric(input.value)
    this.autoSaveAmount = raw === '' ? 0 : parseInt(raw, 10)
    this.autoSaveAmountDisplay = this.autoSaveAmount === 0 ? '' : this.autoSaveAmount.toLocaleString('es-AR')
    input.value = this.autoSaveAmountDisplay
  }

  goBack(): void {
    this.router.navigate(['/ahorros'])
  }

  save(): void {
    if (!this.canSave || this.saving) return
    this.saving = true
    this.errorMsg = ''

    const payload: CreateSavingRequest = {
      name: this.name.trim(),
      targetAmount: this.targetAmount,
      color: this.selectedColor,
      deadline: this.deadline || new Date().toISOString().split('T')[0],
    }

    if (this.autoSave && this.autoSaveAmount > 0) {
      payload.autoSave = true
      payload.autoSaveAmount = this.autoSaveAmount
      const day = parseInt(this.autoSaveDayDisplay, 10)
      if (day >= 1 && day <= 28) payload.autoSaveDay = day
    }

    this.api.post<CreateSavingRequest>('/savings', payload)
      .subscribe({
        next: () => {
          this.saving = false
          this.router.navigate(['/ahorros'])
        },
        error: () => {
          this.saving = false
          this.errorMsg = 'No pudimos crear la meta'
        },
      })
  }
}
