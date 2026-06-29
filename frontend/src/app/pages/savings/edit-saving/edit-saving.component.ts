import { Component, ChangeDetectorRef } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { NgIf, NgFor } from '@angular/common'
import { ApiService } from '../../../services/api.service'
import type { SavingData, UpdateSavingRequest } from '@shared/types/saving.types'
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
  selector: 'app-edit-saving',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor],
  template: `
    <div class="page">
      <!-- Modal descarte -->
      <div class="modal-overlay" *ngIf="showDiscardModal">
        <div class="modal-card">
          <h3 class="modal-title">¿Descartar cambios?</h3>
          <p class="modal-text">Los cambios que hiciste no se guardarán.</p>
          <div class="modal-actions">
            <button class="modal-btn secondary" (click)="showDiscardModal = false">Seguir editando</button>
            <button class="modal-btn primary" (click)="discard()">Descartar</button>
          </div>
        </div>
      </div>

      <header class="header">
        <button class="btn-back" (click)="onBack()">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8A95A8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <span class="header-title">Editar meta</span>
        <button class="btn-save-header" [class.disabled]="!dirty() || saving" (click)="save()">
          Guardar
        </button>
      </header>

      <div class="loading-state" *ngIf="state === 'loading'">
        <div class="skeleton" *ngFor="let _ of [].constructor(5)"></div>
      </div>

      <div class="error-load" *ngIf="state === 'error'">
        <p class="error-msg">No pudimos cargar la meta</p>
        <button class="btn-retry" (click)="loadGoal()">Reintentar</button>
      </div>

      <ng-container *ngIf="state === 'loaded' && goal">
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
          <div class="warning-row" *ngIf="targetReductionWarning as w">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C99A0A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
            <span>{{ w }}</span>
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
        </section>

        <!-- Color -->
        <section class="field-section">
          <label class="field-label">Color de la meta</label>
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

        <!-- Save -->
        <button class="btn-submit" [disabled]="!dirty() || saving" (click)="save()">
          <span *ngIf="!saving">Guardar cambios</span>
          <span *ngIf="saving" class="save-spinner">
            <img src="/assets/miru-icon.svg" class="spinner-miru" alt="Cargando" />
          </span>
        </button>

        <p class="error-msg" *ngIf="saveError">{{ saveError }}</p>
      </ng-container>
    </div>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; background: #0C0F14; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
    .page { padding: 56px 24px 32px; max-width: 390px; margin: 0 auto; }
    ::-webkit-scrollbar { display: none; }

    .header { display: flex; align-items: center; justify-content: space-between; }
    .btn-back { background: none; border: none; padding: 4px; cursor: pointer; display: flex; }
    .header-title { font-size: 20px; font-weight: 700; color: #F0F2F5; }
    .btn-save-header { background: none; border: none; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; color: #C99A0A; cursor: pointer; padding: 4px; }
    .btn-save-header.disabled { opacity: 0.35; cursor: not-allowed; }

    .loading-state { display: flex; flex-direction: column; gap: 16px; margin-top: 32px; }
    .skeleton { height: 56px; background: #1E2530; border-radius: 16px; animation: shimmer 1.5s ease-in-out infinite; }
    @keyframes shimmer { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }

    .error-load { display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: 48px; }
    .error-msg { color: #F87171; font-size: 13px; font-weight: 400; text-align: center; margin-top: 12px; }
    .btn-retry { background: #1E2530; border: none; border-radius: 999px; padding: 10px 20px; color: #F0F2F5; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; }

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

    .warning-row { margin-top: 8px; display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 400; color: #C99A0A; }

    .color-row { display: flex; gap: 12px; }
    .color-circle { width: 28px; height: 28px; border-radius: 999px; border: 3px solid transparent; cursor: pointer; transition: all 150ms; padding: 0; }
    .color-circle.selected { border-color: #F0F2F5; transform: scale(1.1); }

    .btn-submit { width: 100%; height: 44px; margin-top: 24px; background: #C99A0A; color: #0C0F14; border: none; border-radius: 999px; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: opacity 150ms; }
    .btn-submit:disabled { opacity: 0.35; cursor: not-allowed; }
    .save-spinner { display: flex; align-items: center; }
    .spinner-miru { width: 20px; height: 20px; animation: spin 800ms linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 24px; }
    .modal-card { background: #1E2530; border-radius: 24px; padding: 24px; width: 100%; max-width: 320px; }
    .modal-title { font-size: 16px; font-weight: 600; color: #F0F2F5; margin: 0 0 8px; }
    .modal-text { font-size: 13px; font-weight: 400; color: #8A95A8; margin: 0 0 20px; }
    .modal-actions { display: flex; gap: 8px; }
    .modal-btn { flex: 1; height: 40px; border-radius: 999px; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; border: none; cursor: pointer; }
    .modal-btn.secondary { background: #161B24; color: #F0F2F5; }
    .modal-btn.primary { background: #C99A0A; color: #0C0F14; }
  `]
})
export class EditSavingComponent {
  emojis = EMOJIS
  colors = COLORS

  state: 'loading' | 'loaded' | 'error' = 'loading'
  goal: SavingData | null = null

  selectedEmoji = ''
  name = ''
  targetAmount = 0
  targetAmountDisplay = ''
  deadline = ''
  selectedColor: SavingColor = '#C99A0A'

  saving = false
  saveError = ''
  showDiscardModal = false

  private originalName = ''
  private originalTarget = 0
  private originalDeadline = ''
  private originalColor: SavingColor = '#C99A0A'
  private goalId = ''

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {
    this.goalId = this.route.snapshot.paramMap.get('id') || ''
    this.loadGoal()
  }

  get targetReductionWarning(): string | null {
    if (!this.goal || this.goal.currentAmount <= 0) return null
    if (this.targetAmount >= this.goal.targetAmount) return null
    const projected = Math.round((this.goal.currentAmount / this.targetAmount) * 100)
    if (projected >= 100) {
      return 'Si reducís el objetivo, la meta quedará marcada como completada'
    }
    return `Si reducís el objetivo, el progreso pasará a ${projected}%`
  }

  get dirty(): () => boolean {
    return () =>
      this.name !== this.originalName ||
      this.targetAmount !== this.originalTarget ||
      this.deadline !== this.originalDeadline ||
      this.selectedColor !== this.originalColor
  }

  loadGoal(): void {
    this.state = 'loading'
    this.api.get<SavingData>('/savings/' + this.goalId)
      .subscribe({
        next: (res) => {
          const g = res?.data
          if (!g) { this.state = 'error'; this.cdr.detectChanges(); return }
          this.goal = g
          this.name = g.name
          this.originalName = g.name
          this.targetAmount = g.targetAmount
          this.originalTarget = g.targetAmount
          this.targetAmountDisplay = g.targetAmount.toLocaleString('es-AR')
          this.deadline = g.deadline
          this.originalDeadline = g.deadline
          this.selectedColor = (g.color as SavingColor) || '#C99A0A'
          this.originalColor = this.selectedColor
          this.selectedEmoji = g.name
          this.state = 'loaded'
          this.cdr.detectChanges()
        },
        error: () => {
          this.state = 'error'
          this.cdr.detectChanges()
        },
      })
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

  onBack(): void {
    if (this.dirty()) {
      this.showDiscardModal = true
    } else {
      this.router.navigate(['/ahorros'])
    }
  }

  discard(): void {
    this.showDiscardModal = false
    this.router.navigate(['/ahorros'])
  }

  save(): void {
    if (!this.dirty() || this.saving) return
    this.saving = true
    this.saveError = ''

    const payload: UpdateSavingRequest = {}
    if (this.name !== this.originalName) payload.name = this.name.trim()
    if (this.targetAmount !== this.originalTarget) payload.targetAmount = this.targetAmount
    if (this.deadline !== this.originalDeadline) payload.deadline = this.deadline
    if (this.selectedColor !== this.originalColor) payload.color = this.selectedColor

    this.api.put<UpdateSavingRequest>('/savings/' + this.goalId, payload)
      .subscribe({
        next: () => {
          this.saving = false
          this.cdr.detectChanges()
          this.router.navigate(['/ahorros'])
        },
        error: () => {
          this.saving = false
          this.saveError = 'No pudimos guardar los cambios'
          this.cdr.detectChanges()
        },
      })
  }
}
