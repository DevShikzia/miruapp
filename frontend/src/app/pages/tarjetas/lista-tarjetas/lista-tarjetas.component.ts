import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'
import { Router } from '@angular/router'
import { NgIf, NgFor, DecimalPipe } from '@angular/common'
import { Subject, takeUntil, forkJoin } from 'rxjs'
import { TarjetasService } from '../../../services/tarjetas.service'
import type { CreditCardData, CardStatement } from '@shared/types/credit-card.types'

@Component({
  selector: 'app-lista-tarjetas',
  standalone: true,
  imports: [NgIf, NgFor, DecimalPipe],
  template: `
    <div class="container">
      <header class="header">
        <h1 class="title">Tarjetas</h1>
        <button class="btn-add" (click)="createCard()">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E4B3E9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
        </button>
      </header>

      <div class="loading-state" *ngIf="state === 'loading'">
        <div class="skeleton-resumen"></div>
        <div class="skeleton-card-item" *ngFor="let _ of [].constructor(3)"></div>
      </div>

      <ng-container *ngIf="state === 'loaded'">
        <div class="resumen-card" *ngIf="cards.length > 0">
          <div class="resumen-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E4B3E9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="12" y2="12"/></svg>
            <span class="resumen-title">Deuda total en tarjetas</span>
          </div>
          <div class="resumen-monto">$ {{ totalDeuda | number:'1.0-0':'es-AR' }}</div>
          <div class="resumen-bar-wrapper">
            <div class="resumen-bar">
              <div class="resumen-bar-fill" [style.width.%]="limitePorcentaje" [style.background]="limiteColor"></div>
            </div>
            <span class="resumen-pct">{{ limitePorcentaje | number:'1.1-1':'es-AR' }}%</span>
          </div>
          <div class="resumen-footer">
            <span>L\u00edmite total: $ {{ limiteTotal | number:'1.0-0':'es-AR' }}</span>
            <span *ngIf="proximoVencimiento">Pr\u00f3ximo vence: {{ proximoVencimiento }}</span>
          </div>
        </div>

        <div class="lista" *ngIf="cards.length > 0">
          <button class="card-item" *ngFor="let card of cards" [class.inactive]="!card.isActive" (click)="openDetail(card._id)">
            <div class="card-left">
              <span class="card-color" [style.background]="card.color || '#5B8DEF'"></span>
              <div class="card-info">
                <span class="card-name">{{ card.name }}</span>
                <span class="card-digits" *ngIf="card.bankName || card.lastFourDigits">{{ card.bankName }}{{ card.bankName && card.lastFourDigits ? ' •••• ' : '' }}{{ card.lastFourDigits ? '•••• ' + card.lastFourDigits : '' }}</span>
              </div>
            </div>
            <div class="card-right">
              <div class="card-balance" *ngIf="card.creditLimit">
                <span class="balance-gastado">$ {{ getStatementTotal(card._id) | number:'1.0-0':'es-AR' }}</span>
                <span class="balance-disponible">/ $ {{ getDisponible(card) | number:'1.0-0':'es-AR' }}</span>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#697586" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </div>
          </button>
        </div>

        <div class="empty-state" *ngIf="cards.length === 0">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#697586" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="12" y2="12"/></svg>
          <p class="empty-text">No ten\u00e9s tarjetas registradas</p>
          <button class="btn-empty" (click)="createCard()">Agregar primera tarjeta</button>
        </div>
      </ng-container>

      <p class="error-msg" *ngIf="state === 'error'">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F87171" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
        No pudimos cargar tus tarjetas
        <button class="btn-retry" (click)="loadCards()">Reintentar</button>
      </p>

      <button class="fab" (click)="createCard()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0C0F14" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
      </button>
    </div>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; background: #0C0F14; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
    .container { padding: 0 20px; max-width: 390px; margin: 0 auto; position: relative; min-height: 100vh; }
    ::-webkit-scrollbar { display: none; }

    .header { display: flex; align-items: center; justify-content: space-between; padding-top: 56px; }
    .title { font-size: 20px; font-weight: 700; color: #F0F2F5; margin: 0; }
    .btn-add { background: none; border: none; padding: 4px; cursor: pointer; display: flex; align-items: center; }

    .loading-state { padding-top: 24px; }
    .skeleton-resumen { height: 120px; background: #1E2530; border-radius: 16px; animation: shimmer 1.5s infinite; }
    .skeleton-card-item { height: 64px; background: #1E2530; border-radius: 16px; margin-top: 12px; animation: shimmer 1.5s infinite; }

    .resumen-card { margin-top: 20px; background: #161B24; border-radius: 16px; padding: 16px; }
    .resumen-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .resumen-title { font-size: 12px; font-weight: 500; color: #8A95A8; }
    .resumen-monto { font-size: 32px; font-weight: 800; color: #F0F2F5; margin-bottom: 12px; }
    .resumen-bar-wrapper { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .resumen-bar { flex: 1; height: 6px; background: #1E2530; border-radius: 999px; overflow: hidden; }
    .resumen-bar-fill { height: 100%; border-radius: 999px; transition: width 300ms; }
    .resumen-pct { font-size: 11px; font-weight: 500; color: #8A95A8; min-width: 32px; text-align: right; }
    .resumen-footer { display: flex; justify-content: space-between; font-size: 11px; font-weight: 400; color: #697586; }

    .lista { margin-top: 20px; display: flex; flex-direction: column; gap: 10px; }
    .card-item { display: flex; align-items: center; justify-content: space-between; background: #161B24; border: 1px solid transparent; border-radius: 16px; padding: 16px; width: 100%; cursor: pointer; transition: all 150ms; }
    .card-item:hover { background: rgba(255,255,255,0.04); }
    .card-item.inactive { opacity: 0.5; }
    .card-left { display: flex; align-items: center; gap: 12px; }
    .card-color { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
    .card-info { display: flex; flex-direction: column; gap: 2px; text-align: left; }
    .card-name { font-size: 14px; font-weight: 600; color: #F0F2F5; }
    .card-digits { font-size: 11px; font-weight: 400; color: #697586; }
    .card-arrow { display: flex; align-items: center; }
    .card-right { display: flex; align-items: center; gap: 12px; }
    .card-balance { display: flex; align-items: baseline; gap: 2px; text-align: right; }
    .balance-gastado { font-size: 14px; font-weight: 600; color: #F0F2F5; }
    .balance-disponible { font-size: 11px; font-weight: 400; color: #697586; }

    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; margin-top: 80px; }
    .empty-text { font-size: 14px; font-weight: 400; color: #697586; text-align: center; }
    .btn-empty { height: 44px; padding: 0 24px; background: #5B8DEF; color: #F0F2F5; border: none; border-radius: 999px; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; }

    .error-msg { display: flex; align-items: center; justify-content: center; gap: 8px; color: #F87171; font-size: 12px; margin-top: 60px; }
    .btn-retry { background: none; border: none; color: #5B8DEF; font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; text-decoration: underline; padding: 0; }

    .fab { position: fixed; bottom: 80px; right: 20px; width: 56px; height: 56px; background: #5B8DEF; border: none; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 12px rgba(91,141,239,0.4); transition: transform 150ms; z-index: 50; }
    .fab:active { transform: scale(0.95); }

    @keyframes shimmer { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
  `]
})
export class ListaTarjetasComponent implements OnInit, OnDestroy {
  cards: CreditCardData[] = []
  statements: Map<string, CardStatement> = new Map()
  state: 'loading' | 'loaded' | 'error' = 'loading'
  private destroy$ = new Subject<void>()

  constructor(
    private tarjetasService: TarjetasService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadCards()
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  get totalDeuda(): number {
    return Array.from(this.statements.values()).reduce((sum, s) => sum + s.totalAmount, 0)
  }

  get limiteTotal(): number {
    return this.cards.reduce((sum, c) => sum + (c.creditLimit || 0), 0)
  }

  get limitePorcentaje(): number {
    const total = this.limiteTotal
    return total > 0 ? (this.totalDeuda / total) * 100 : 0
  }

  get limiteColor(): string {
    const pct = this.limitePorcentaje
    if (pct >= 80) return '#F87171'
    if (pct >= 50) return '#FBBF24'
    return '#5B8DEF'
  }

  get proximoVencimiento(): string | null {
    const now = new Date()
    let nearest: string | null = null
    let nearestDiff = Infinity
    for (const stmt of this.statements.values()) {
      if (stmt.totalAmount > 0) {
        const due = new Date(stmt.dueDate)
        const diff = due.getTime() - now.getTime()
        if (diff > 0 && diff < nearestDiff) {
          nearestDiff = diff
          nearest = stmt.dueDate
        }
      }
    }
    return nearest ? new Date(nearest).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }) : null
  }

  private loadStatements(): void {
    if (this.cards.length === 0) {
      this.state = 'loaded'
      this.cdr.markForCheck()
      return
    }
    forkJoin(this.cards.map(c => this.tarjetasService.getStatement(c._id)))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (statements) => {
          this.statements.clear()
          statements.forEach((s, i) => this.statements.set(this.cards[i]._id, s))
          this.state = 'loaded'
          this.cdr.markForCheck()
        },
        error: () => {
          this.state = 'loaded'
          this.cdr.markForCheck()
        },
      })
  }

  loadCards(): void {
    this.state = 'loading'
    this.tarjetasService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.cards = data ?? []
          this.loadStatements()
        },
        error: () => {
          this.state = 'error'
          this.cdr.markForCheck()
        },
      })

    setTimeout(() => {
      if (this.state === 'loading') {
        this.state = 'error'
        this.cdr.markForCheck()
      }
    }, 10000)
  }

  openDetail(id: string): void {
    this.router.navigate(['/tarjetas', id])
  }

  createCard(): void {
    this.router.navigate(['/tarjetas/nueva'])
  }

  getStatementTotal(cardId: string): number {
    return this.statements.get(cardId)?.totalAmount ?? 0
  }

  getDisponible(card: CreditCardData): number {
    const spent = this.getStatementTotal(card._id)
    return (card.creditLimit || 0) - spent
  }
}
