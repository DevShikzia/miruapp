import { Component, ChangeDetectorRef } from '@angular/core'
import { Router } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { NgIf, NgFor, DecimalPipe } from '@angular/common'
import { Subject, takeUntil } from 'rxjs'
import { ApiService } from '../../services/api.service'
import { GoalEmojiPipe } from '../../pipes/goal-emoji.pipe'
import type { SavingData, AddContributionRequest } from '@shared/types/saving.types'

@Component({
  selector: 'app-savings',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, DecimalPipe, GoalEmojiPipe],
  template: `
    <div class="page"
      (touchstart)="onTouchStart($event)"
      (touchmove)="onTouchMove($event)"
      (touchend)="onTouchEnd()"
    >
      <header class="header">
        <button class="btn-back" (click)="goBack()">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F0F2F5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h1 class="title">Ahorros</h1>
        <button class="btn-add" (click)="goCreate()">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C99A0A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
        </button>
      </header>

      <div class="pull-indicator" *ngIf="pullDistance > 0" [style.height.px]="pullDistance">
        <span class="pull-text">{{ pullDistance > 60 ? 'Suelta para recargar' : 'Tira para recargar' }}</span>
      </div>

      <div class="loading-state" *ngIf="state === 'loading'">
        <div class="skeleton summary-skel"></div>
        <div class="skeleton card-skel" *ngFor="let _ of [].constructor(3)"></div>
      </div>

      <div class="error-state" *ngIf="state === 'error'">
        <p class="error-msg">No pudimos cargar tus metas</p>
        <button class="btn-retry" (click)="loadSavings()">Reintentar</button>
      </div>

      <ng-container *ngIf="state !== 'loading' && state !== 'error'">

        <!-- Empty -->
        <div class="empty-state" *ngIf="savings.length === 0">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#697586" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.5"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z"/><path d="M2 9v1c0 1.1.9 2 2 2h1"/><path d="M16 11h.01"/></svg>
          <h3 class="empty-title">Todavía no creaste metas de ahorro</h3>
          <p class="empty-sub">Ahorrar es más fácil cuando tenés un objetivo claro.</p>
          <button class="btn-empty" (click)="goCreate()">Crear primera meta</button>
        </div>

        <!-- Loaded -->
        <ng-container *ngIf="savings.length > 0">

          <!-- Summary -->
          <div class="summary-card">
            <span class="summary-label">Total ahorrado</span>
            <span class="summary-amount">$ {{ totalSaved | number:'1.0-0' }}</span>
            <span class="summary-sub">De $ {{ totalTarget | number:'1.0-0' }} hacia tus metas</span>
            <div class="progress-track">
              <div class="progress-fill" [style.width.%]="overallProgress"></div>
            </div>
          </div>

          <!-- Highlighted goal -->
          <div class="highlight-card" *ngIf="highlighted as hl">
            <span class="hl-badge">¡Casi!</span>
            <div class="hl-row">
              <span class="hl-emoji">{{ hl.name | goalEmoji }}</span>
              <div class="hl-info">
                <span class="hl-name">{{ hl.name }}</span>
                <span class="hl-progress">$ {{ hl.currentAmount | number:'1.0-0' }} / $ {{ hl.targetAmount | number:'1.0-0' }}</span>
              </div>
            </div>
            <div class="progress-track hl-track">
              <div class="progress-fill hl-fill" [style.width.%]="hl.progress"></div>
            </div>
            <span class="hl-pct">{{ hl.progress }}%</span>
          </div>

          <!-- Goal list -->
          <div class="goal-list">
            <div class="goal-card" *ngFor="let goal of savings" [class.completed]="goal.progress >= 100" (click)="goDetail(goal._id)">
              <div class="goal-top">
                <span class="goal-emoji">{{ goal.name | goalEmoji }}</span>
                <div class="goal-info">
                  <span class="goal-name">{{ goal.name }}</span>
                  <span class="goal-progress-text">$ {{ goal.currentAmount | number:'1.0-0' }} / $ {{ goal.targetAmount | number:'1.0-0' }}</span>
                </div>
                <span class="goal-badge-completed" *ngIf="goal.progress >= 100">Completada</span>
              </div>

              <div class="goal-progress-row">
                <div class="progress-track">
                  <div class="progress-fill" [style.width.%]="goal.progress"></div>
                </div>
                <span class="goal-pct">{{ goal.progress }}%</span>
              </div>

              <button class="btn-contribute" (click)="$event.stopPropagation(); openContribute(goal)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
                Agregar dinero
              </button>
            </div>
          </div>

        </ng-container>
      </ng-container>

      <!-- Contribute Modal -->
      <div class="modal-overlay" *ngIf="showContributeModal" (click)="closeContribute()">
        <div class="bottom-sheet" (click)="$event.stopPropagation()">
          <div class="sheet-handle"></div>
          <h3 class="sheet-title">Agregar dinero</h3>
          <p class="sheet-sub">{{ contributeGoal?.name }}</p>

          <div class="sheet-amount-row">
            <span class="sheet-prefix">$</span>
            <input
              class="sheet-input"
              [value]="contributeAmountDisplay"
              name="contributeAmount"
              type="text"
              (input)="onContributeInput($event)"
              placeholder="0"
              inputmode="decimal"
              autofocus
            />
          </div>

          <div class="sheet-date-row">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#697586" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
            <input class="sheet-date" [(ngModel)]="contributeDate" name="contributeDate" type="date" />
          </div>

          <p class="sheet-error" *ngIf="contributeError">{{ contributeError }}</p>

          <button class="btn-save" [disabled]="contributeAmount <= 0 || contributeSaving" (click)="submitContribution()">
            <span *ngIf="!contributeSaving">Ahorrar</span>
            <span *ngIf="contributeSaving" class="save-spinner">
              <img src="/assets/miru-icon.svg" class="spinner-miru" alt="Cargando" />
            </span>
          </button>

          <div class="contributions-section" *ngIf="contributeGoal && contributeGoal.contributions.length > 0">
            <h4 class="contrib-title">Historial de aportes</h4>
            <div class="contrib-item" *ngFor="let c of contributeGoal.contributions">
              <span class="contrib-date">{{ c.date }}</span>
              <span class="contrib-amount">$ {{ c.amount | number:'1.0-0' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Success overlay -->
      <div class="success-overlay" *ngIf="state === 'success'">
        <div class="success-check">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#15C48C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; background: #0C0F14; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
    .page { padding: 56px 20px 24px; max-width: 390px; margin: 0 auto; min-height: 100vh; }
    ::-webkit-scrollbar { display: none; }

    .header { display: flex; align-items: center; justify-content: space-between; }
    .btn-back, .btn-add { background: none; border: none; padding: 4px; cursor: pointer; display: flex; align-items: center; }
    .btn-add { color: #C99A0A; }
    .title { font-size: 20px; font-weight: 700; color: #F0F2F5; margin: 0; }

    .pull-indicator { display: flex; align-items: center; justify-content: center; overflow: hidden; transition: height 0.1s; }
    .pull-text { font-size: 12px; color: #697586; font-weight: 400; }

    .loading-state { display: flex; flex-direction: column; gap: 16px; margin-top: 24px; }
    .skeleton { background: #1E2530; border-radius: 24px; animation: shimmer 1.5s ease-in-out infinite; }
    .summary-skel { height: 120px; }
    .card-skel { height: 180px; }
    @keyframes shimmer { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }

    .error-state { display: flex; flex-direction: column; align-items: center; gap: 12px; margin-top: 48px; }
    .error-msg { color: #F87171; font-size: 14px; font-weight: 500; margin: 0; }
    .btn-retry { background: #1E2530; border: none; border-radius: 999px; padding: 10px 20px; color: #F0F2F5; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; }

    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; margin-top: 80px; text-align: center; }
    .empty-title { font-size: 16px; font-weight: 500; color: #8A95A8; margin: 0; }
    .empty-sub { font-size: 13px; font-weight: 400; color: #697586; margin: 0; max-width: 260px; line-height: 1.4; }
    .btn-empty { background: #C99A0A; color: #0C0F14; border: none; border-radius: 999px; padding: 12px 24px; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; margin-top: 8px; }

    .summary-card { margin-top: 16px; background: #161B24; border-radius: 24px; border: 1px solid rgba(255,255,255,0.06); padding: 20px; display: flex; flex-direction: column; gap: 4px; }
    .summary-label { font-size: 12px; font-weight: 500; color: #8A95A8; }
    .summary-amount { font-size: 36px; font-weight: 800; color: #C99A0A; }
    .summary-sub { font-size: 13px; font-weight: 400; color: #697586; }
    .summary-card .progress-track { height: 6px; background: #1E2530; border-radius: 999px; margin-top: 8px; overflow: hidden; }
    .summary-card .progress-fill { height: 100%; background: #C99A0A; border-radius: 999px; transition: width 0.5s ease; }

    .highlight-card { margin-top: 16px; background: #161B24; border-radius: 24px; border: 1.5px solid #C99A0A; padding: 16px; position: relative; }
    .hl-badge { display: inline-block; font-size: 11px; font-weight: 500; padding: 4px 8px; border-radius: 6px; background: rgba(201,154,10,0.2); color: #C99A0A; margin-bottom: 12px; }
    .hl-row { display: flex; align-items: center; gap: 12px; }
    .hl-emoji { font-size: 28px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; background: rgba(201,154,10,0.1); border-radius: 12px; }
    .hl-info { display: flex; flex-direction: column; gap: 2px; flex: 1; }
    .hl-name { font-size: 14px; font-weight: 600; color: #F0F2F5; }
    .hl-progress { font-size: 12px; font-weight: 400; color: #8A95A8; }
    .hl-track { margin-top: 12px; }
    .hl-fill { background: #C99A0A; }
    .hl-pct { font-size: 13px; font-weight: 700; color: #C99A0A; margin-top: 4px; display: block; text-align: right; }

    .goal-list { display: flex; flex-direction: column; gap: 12px; margin-top: 20px; padding-bottom: 80px; }
    .goal-card { background: #161B24; border-radius: 24px; border: 1px solid rgba(255,255,255,0.06); padding: 16px; cursor: pointer; transition: opacity 150ms; }
    .goal-card.completed { opacity: 0.8; }
    .goal-top { display: flex; align-items: center; gap: 12px; }
    .goal-emoji { font-size: 24px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: rgba(201,154,10,0.1); border-radius: 12px; flex-shrink: 0; }
    .goal-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .goal-name { font-size: 16px; font-weight: 600; color: #F0F2F5; }
    .goal-progress-text { font-size: 13px; font-weight: 500; color: #8A95A8; }
    .goal-badge-completed { font-size: 11px; font-weight: 500; padding: 4px 8px; border-radius: 6px; background: rgba(21,196,140,0.15); color: #15C48C; flex-shrink: 0; }

    .goal-progress-row { display: flex; align-items: center; gap: 8px; margin-top: 12px; }
    .goal-progress-row .progress-track { flex: 1; height: 8px; background: #1E2530; border-radius: 999px; overflow: hidden; }
    .goal-progress-row .progress-fill { height: 100%; background: #C99A0A; border-radius: 999px; transition: width 0.5s ease; }
    .goal-pct { font-size: 13px; font-weight: 700; color: #C99A0A; flex-shrink: 0; }

    .btn-contribute { width: 100%; height: 36px; margin-top: 12px; background: rgba(201,154,10,0.12); border: 1px solid rgba(201,154,10,0.2); border-radius: 999px; color: #C99A0A; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: background 150ms; }
    .btn-contribute:hover { background: rgba(201,154,10,0.2); }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: flex-end; justify-content: center; z-index: 200; }
    .bottom-sheet { width: 100%; max-width: 390px; background: #1E2530; border-radius: 24px 24px 0 0; padding: 16px 20px 32px; max-height: 80vh; overflow-y: auto; }
    .sheet-handle { width: 36px; height: 4px; background: #697586; border-radius: 999px; margin: 0 auto 16px; }
    .sheet-title { font-size: 16px; font-weight: 600; color: #F0F2F5; margin: 0; text-align: center; }
    .sheet-sub { font-size: 13px; font-weight: 400; color: #8A95A8; margin: 4px 0 20px; text-align: center; }

    .sheet-amount-row { display: flex; align-items: center; gap: 6px; background: #161B24; border-radius: 16px; height: 56px; padding: 0 20px; }
    .sheet-prefix { font-size: 24px; font-weight: 600; color: #8A95A8; }
    .sheet-input { flex: 1; background: transparent; border: none; outline: none; color: #F0F2F5; font-family: 'Inter', sans-serif; font-size: 28px; font-weight: 700; text-align: center; height: 100%; padding: 0; }
    .sheet-input::placeholder { color: #697586; }

    .sheet-date-row { display: flex; align-items: center; gap: 8px; margin-top: 12px; background: #161B24; border-radius: 12px; height: 44px; padding: 0 14px; }
    .sheet-date { flex: 1; background: transparent; border: none; outline: none; color: #F0F2F5; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 400; height: 100%; }
    input[type="date"] { color-scheme: dark; }
    input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.7); cursor: pointer; }

    .sheet-error { color: #F87171; font-size: 12px; font-weight: 400; text-align: center; margin: 8px 0 0; }

    .btn-save { width: 100%; height: 44px; margin-top: 16px; background: #C99A0A; color: #0C0F14; border: none; border-radius: 999px; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: opacity 150ms; }
    .btn-save:disabled { opacity: 0.4; cursor: not-allowed; }
    .save-spinner { display: flex; align-items: center; }
    .spinner-miru { width: 20px; height: 20px; animation: spin 800ms linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .contributions-section { margin-top: 20px; }
    .contrib-title { font-size: 13px; font-weight: 600; color: #8A95A8; margin: 0 0 8px; }
    .contrib-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
    .contrib-date { font-size: 12px; font-weight: 400; color: #697586; }
    .contrib-amount { font-size: 14px; font-weight: 600; color: #C99A0A; }

    .success-overlay { position: fixed; inset: 0; background: #0C0F14; display: flex; align-items: center; justify-content: center; z-index: 300; animation: fadeIn 200ms ease-out; }
    .success-check { animation: scaleIn 200ms ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes scaleIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  `]
})
export class SavingsComponent {
  state: 'loading' | 'loaded' | 'error' | 'success' = 'loading'
  savings: SavingData[] = []
  private destroy$ = new Subject<void>()

  contributeGoal: SavingData | null = null
  showContributeModal = false
  contributeAmount = 0
  contributeAmountDisplay = ''
  contributeDate = ''
  contributeSaving = false
  contributeError = ''

  pullDistance = 0
  private pullStartY = 0
  private pulling = false

  constructor(
    private api: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.loadSavings()
  }

  get totalSaved(): number {
    return this.savings.reduce((s, g) => s + g.currentAmount, 0)
  }

  get totalTarget(): number {
    return this.savings.reduce((s, g) => s + g.targetAmount, 0)
  }

  get overallProgress(): number {
    const total = this.totalTarget
    if (total === 0) return 0
    return Math.round((this.totalSaved / total) * 100)
  }

  get highlighted(): SavingData | null {
    const active = this.savings.filter(g => g.progress < 100 && g.progress > 0)
    if (active.length === 0) return null
    return active.reduce((best, g) => g.progress > best.progress ? g : best)
  }

  loadSavings(): void {
    this.state = 'loading'
    this.api.getPaginated<SavingData>('/savings')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.savings = res?.data ?? []
          this.state = 'loaded'
          this.cdr.detectChanges()
        },
        error: () => {
          this.state = 'error'
          this.cdr.detectChanges()
        },
      })
  }

  goBack(): void {
    this.router.navigate(['/dashboard'])
  }

  goCreate(): void {
    this.router.navigate(['/ahorros/crear'])
  }

  goDetail(id: string): void {
    // TODO: Navegar a detalle de meta
  }

  openContribute(goal: SavingData): void {
    this.contributeGoal = goal
    this.contributeAmount = 0
    this.contributeAmountDisplay = ''
    this.contributeDate = new Date().toISOString().split('T')[0]
    this.contributeError = ''
    this.showContributeModal = true
  }

  closeContribute(): void {
    this.showContributeModal = false
    this.contributeGoal = null
  }

  private getRawNumeric(value: string): string {
    return value.replace(/[^0-9]/g, '')
  }

  onContributeInput(event: Event): void {
    const input = event.target as HTMLInputElement
    const raw = this.getRawNumeric(input.value)
    this.contributeAmount = raw === '' ? 0 : parseInt(raw, 10)
    this.contributeAmountDisplay = this.contributeAmount === 0 ? '' : this.contributeAmount.toLocaleString('es-AR')
    input.value = this.contributeAmountDisplay
  }

  submitContribution(): void {
    if (!this.contributeGoal || this.contributeAmount <= 0) return

    this.contributeSaving = true
    this.contributeError = ''

    const payload: AddContributionRequest = {
      amount: this.contributeAmount,
      date: this.contributeDate,
    }

    this.api.post<AddContributionRequest>('/savings/' + this.contributeGoal._id + '/contributions', payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.contributeSaving = false
          this.showContributeModal = false
          this.contributeGoal = null
          this.state = 'success'
          setTimeout(() => {
            this.state = 'loaded'
            this.loadSavings()
          }, 400)
        },
        error: () => {
          this.contributeSaving = false
          this.contributeError = 'No pudimos registrar el aporte'
          this.cdr.detectChanges()
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
      this.loadSavings()
    }
    this.pullDistance = 0
    this.pulling = false
  }
}
