import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'
import { Router, ActivatedRoute, RouterLink } from '@angular/router'
import { NgIf, NgFor, DecimalPipe } from '@angular/common'
import { Subject, takeUntil } from 'rxjs'
import { TarjetasService } from '../../../services/tarjetas.service'
import type { CreditCardData, CardStatement } from '@shared/types/credit-card.types'

@Component({
  selector: 'app-detalle-tarjeta',
  standalone: true,
  imports: [NgIf, NgFor, DecimalPipe, RouterLink],
  template: `
    <div class="container">
      <header class="header">
        <button class="btn-back" (click)="onBack()">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8A95A8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h1 class="title">
          <span class="title-color" [style.background]="card?.color || '#5B8DEF'"></span>
          {{ card?.name || 'Cargando...' }}
        </h1>
        <button class="btn-edit" [routerLink]="['/tarjetas', cardId, 'editar']">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8A95A8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
        </button>
      </header>

      <div class="loading-state" *ngIf="state === 'loading'">
        <div class="skeleton-card"></div>
        <div class="skeleton-bar"></div>
      </div>

      <ng-container *ngIf="state === 'loaded' && card">
        <div class="info-card">
          <div class="info-row">
            <span class="card-name-lg">{{ card.name }}</span>
            <span class="card-digits" *ngIf="card.lastFourDigits || card.bankName">
              {{ card.bankName }}{{ card.bankName && card.lastFourDigits ? ' ' : '' }}{{ card.lastFourDigits ? '&bull;&bull;&bull;&bull; ' + card.lastFourDigits : '' }}
            </span>
          </div>
          <div class="info-badges">
            <span class="badge badge-cierre">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Cierre d\u00eda {{ card.closingDay }}
            </span>
            <span class="badge badge-vence">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Vence d\u00eda {{ card.dueDay }}
            </span>
          </div>
          <div class="info-limit" *ngIf="card.creditLimit">
            L\u00edmite: $ {{ card.creditLimit | number:'1.0-0':'es-AR' }}
          </div>
        </div>

        <div class="bar-section" *ngIf="card.creditLimit">
          <div class="bar-header">
            <span>Gasto actual</span>
            <span>L\u00edmite</span>
          </div>
          <div class="bar-values">
            <span class="bar-current">$ {{ (statement?.totalAmount ?? 0) | number:'1.0-0':'es-AR' }}</span>
            <span class="bar-max">$ {{ card.creditLimit | number:'1.0-0':'es-AR' }}</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" [style.width.%]="barPercent" [style.background]="barColor"></div>
          </div>
          <div class="bar-available" *ngIf="card.creditLimit">
            Disponible: $ {{ (card.creditLimit - (statement?.totalAmount ?? 0)) | number:'1.0-0':'es-AR' }}
          </div>
        </div>

        <div class="next-payment" *ngIf="statement">
          <div class="payment-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A95A8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
            <span class="payment-label">Pr\u00f3ximo pago</span>
          </div>
          <div class="payment-amount" *ngIf="statement.totalAmount > 0">
            $ {{ statement.totalAmount | number:'1.0-0':'es-AR' }}
          </div>
          <div class="payment-amount empty" *ngIf="statement.totalAmount === 0">
            Sin gastos en este ciclo
          </div>
          <div class="payment-due">Vence el {{ statement.dueDate }}</div>
        </div>

        <div class="statement-section" *ngIf="statement">
          <div class="statement-header">
            <span class="statement-title">Gastos del ciclo</span>
            <span class="statement-total">$ {{ statement.totalAmount | number:'1.0-0':'es-AR' }}</span>
          </div>
          <div class="statement-period">{{ statement.periodStart }} \u2192 {{ statement.periodEnd }}</div>

          <div class="expense-list" *ngIf="statement.expenses.length > 0">
            <div class="expense-item" *ngFor="let exp of statement.expenses">
              <div class="expense-left">
                <span class="expense-category-icon">{{ getCategoryEmoji(exp.category) }}</span>
                <div class="expense-info">
                  <span class="expense-desc">{{ exp.description || 'Sin descripci\u00f3n' }}</span>
                  <span class="expense-date">{{ exp.date }}</span>
                </div>
              </div>
              <span class="expense-amount">$ {{ exp.amount | number:'1.0-0':'es-AR' }}</span>
            </div>
          </div>

          <div class="empty-expenses" *ngIf="statement.expenses.length === 0">
            No hay gastos en este ciclo
          </div>
        </div>
      </ng-container>

      <p class="error-msg" *ngIf="state === 'error'">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F87171" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
        No pudimos cargar el detalle de la tarjeta
        <button class="btn-retry" (click)="loadData()">Reintentar</button>
      </p>
    </div>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; background: #0C0F14; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
    .container { padding: 0 20px; max-width: 390px; margin: 0 auto; position: relative; min-height: 100vh; }
    ::-webkit-scrollbar { display: none; }

    .header { display: flex; align-items: center; justify-content: space-between; padding-top: 56px; gap: 8px; }
    .btn-back { background: none; border: none; padding: 4px; cursor: pointer; display: flex; align-items: center; margin-left: -4px; }
    .title { font-size: 20px; font-weight: 700; color: #F0F2F5; margin: 0; display: flex; align-items: center; gap: 8px; flex: 1; }
    .title-color { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
    .btn-edit { background: none; border: none; padding: 4px; cursor: pointer; display: flex; align-items: center; }

    .loading-state { padding-top: 24px; }
    .skeleton-card { height: 140px; background: #1E2530; border-radius: 16px; animation: shimmer 1.5s infinite; }
    .skeleton-bar { height: 100px; background: #1E2530; border-radius: 16px; margin-top: 16px; animation: shimmer 1.5s infinite; }

    .info-card { margin-top: 16px; background: #161B24; border-radius: 16px; padding: 16px; }
    .info-row { margin-bottom: 12px; }
    .card-name-lg { font-size: 18px; font-weight: 700; color: #F0F2F5; display: block; }
    .card-digits { font-size: 12px; font-weight: 400; color: #697586; }
    .info-badges { display: flex; gap: 8px; margin-bottom: 12px; }
    .badge { display: flex; align-items: center; gap: 4px; padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 500; }
    .badge-cierre { background: rgba(91,141,239,0.12); color: #5B8DEF; }
    .badge-vence { background: rgba(201,154,10,0.12); color: #C99A0A; }
    .info-limit { font-size: 12px; font-weight: 400; color: #8A95A8; }

    .bar-section { margin-top: 16px; background: #161B24; border-radius: 16px; padding: 16px; }
    .bar-header { display: flex; justify-content: space-between; font-size: 11px; font-weight: 400; color: #697586; margin-bottom: 4px; }
    .bar-values { display: flex; justify-content: space-between; margin-bottom: 12px; }
    .bar-current { font-size: 24px; font-weight: 700; color: #F0F2F5; }
    .bar-max { font-size: 12px; font-weight: 400; color: #8A95A8; align-self: flex-end; }
    .bar-track { height: 8px; background: #1E2530; border-radius: 999px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 999px; transition: width 300ms; }
    .bar-available { font-size: 12px; font-weight: 500; color: #22C55E; margin-top: 8px; }

    .next-payment { margin-top: 16px; background: #161B24; border-radius: 16px; padding: 16px; }
    .payment-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .payment-label { font-size: 13px; font-weight: 500; color: #8A95A8; }
    .payment-amount { font-size: 22px; font-weight: 700; color: #F0F2F5; }
    .payment-amount.empty { font-size: 14px; font-weight: 400; color: #697586; }
    .payment-due { font-size: 12px; font-weight: 400; color: #8A95A8; margin-top: 4px; }

    .statement-section { margin-top: 20px; }
    .statement-header { display: flex; justify-content: space-between; align-items: center; }
    .statement-title { font-size: 16px; font-weight: 600; color: #F0F2F5; }
    .statement-total { font-size: 16px; font-weight: 700; color: #F0F2F5; }
    .statement-period { font-size: 11px; font-weight: 400; color: #697586; margin-top: 2px; margin-bottom: 12px; }

    .expense-list { display: flex; flex-direction: column; gap: 8px; }
    .expense-item { display: flex; align-items: center; justify-content: space-between; background: #161B24; border-radius: 12px; padding: 12px 16px; }
    .expense-left { display: flex; align-items: center; gap: 10px; }
    .expense-category-icon { font-size: 16px; }
    .expense-info { display: flex; flex-direction: column; gap: 2px; }
    .expense-desc { font-size: 14px; font-weight: 500; color: #F0F2F5; }
    .expense-date { font-size: 11px; font-weight: 400; color: #697586; }
    .expense-amount { font-size: 14px; font-weight: 700; color: #F0F2F5; }
    .empty-expenses { text-align: center; font-size: 13px; font-weight: 400; color: #697586; padding: 24px 0; }

    .error-msg { display: flex; align-items: center; justify-content: center; gap: 8px; color: #F87171; font-size: 12px; margin-top: 60px; }
    .btn-retry { background: none; border: none; color: #5B8DEF; font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; text-decoration: underline; padding: 0; }

    @keyframes shimmer { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
  `]
})
export class DetalleTarjetaComponent implements OnInit, OnDestroy {
  cardId = ''
  card: CreditCardData | null = null
  statement: CardStatement | null = null
  state: 'loading' | 'loaded' | 'error' = 'loading'
  private destroy$ = new Subject<void>()

  constructor(
    private tarjetasService: TarjetasService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.cardId = params['id']
      this.loadData()
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  get barPercent(): number {
    if (!this.card?.creditLimit || !this.statement) return 0
    return Math.min(100, Math.round((this.statement.totalAmount / this.card.creditLimit) * 100))
  }

  get barColor(): string {
    if (this.barPercent > 90) return '#E05252'
    if (this.barPercent > 70) return '#C99A0A'
    return '#5B8DEF'
  }

  loadData(): void {
    this.state = 'loading'
    this.tarjetasService.getById(this.cardId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (card) => {
          this.card = card
          this.cdr.markForCheck()
          this.loadStatement()
        },
        error: () => {
          this.state = 'error'
          this.cdr.markForCheck()
        },
      })
  }

  private loadStatement(): void {
    this.tarjetasService.getStatement(this.cardId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (statement) => {
          this.statement = statement
          this.state = 'loaded'
          this.cdr.markForCheck()
        },
        error: () => {
          this.statement = null
          this.state = 'loaded'
          this.cdr.markForCheck()
        },
      })
  }

  getCategoryEmoji(category: string): string {
    const map: Record<string, string> = {
      food: '\uD83C\uDF54',
      transport: '\uD83D\uDE97',
      utilities: '\u26A1',
      rent: '\uD83C\uDFE0',
      health: '\uD83D\uDC9A',
      education: '\uD83D\uDCDA',
      entertainment: '\uD83C\uDFAE',
      other: '\uD83D\uDCB3',
    }
    return map[category] || '\uD83D\uDCB3'
  }

  onBack(): void {
    this.router.navigate(['/tarjetas'])
  }
}
