import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'
import { Router, ActivatedRoute, RouterLink } from '@angular/router'
import { NgIf, NgFor, DecimalPipe, DatePipe } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Subject, takeUntil } from 'rxjs'
import { TarjetasService } from '../../../services/tarjetas.service'
import { CardItemService } from '../../../services/card-item.service'
import type { CreditCardData, CardStatement, CardStatementItem } from '@shared/types/credit-card.types'
import type { CreateCardItemRequest, UpdateCardItemRequest, CardItem } from '@shared/types/card-item.types'

@Component({
  selector: 'app-detalle-tarjeta',
  standalone: true,
  imports: [NgIf, NgFor, DecimalPipe, DatePipe, RouterLink, FormsModule],
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
          <button class="btn-pay" *ngIf="statement.totalAmount > 0" (click)="openPayModal()">Pagar resumen</button>
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
              <span class="expense-amount">
                <span *ngIf="exp.currency === 'USD'" class="usd-badge">USD</span>
                $ {{ exp.amount | number:'1.0-0':'es-AR' }}
              </span>
            </div>
          </div>

          <div class="items-section" *ngIf="statement.items.length > 0">
            <div class="items-divider">
              <span class="items-divider-label">Items activos</span>
              <span class="items-divider-total">$ {{ statement.itemsTotal | number:'1.0-0':'es-AR' }}</span>
            </div>
            <div class="expense-list">
              <div class="expense-item" *ngFor="let item of statement.items">
                <div class="expense-left">
                  <span class="expense-category-icon">{{ getCategoryEmoji(item.category) }}</span>
                  <div class="expense-info">
                    <span class="expense-desc">
                      {{ item.description }}
                      <span class="item-badge" *ngIf="item.itemType === 'recurring'">recurrente</span>
                      <span class="item-badge badge-cuota" *ngIf="item.itemType === 'installment'">
                        {{ item.currentInstallment }}/{{ item.currentInstallment! + (item.remainingInstallments ?? 0) }}
                      </span>
                    </span>
                    <span class="expense-date" *ngIf="item.needsUpdate">
                      <span class="rate-warning">
                        \u26A0 D\u00f3lar subi\u00f3 {{ item.rateChange }}%
                      </span>
                    </span>
                  </div>
                </div>
                <div class="expense-right">
                  <span class="expense-amount">
                    <span *ngIf="item.currency === 'USD'" class="usd-badge">USD</span>
                    $ {{ item.amount | number:'1.0-0':'es-AR' }}
                  </span>
                  <button class="item-edit" (click)="openItemForm(item)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#697586" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                  </button>
                  <button class="item-delete" (click)="deleteItem(item._id)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#697586" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="empty-expenses" *ngIf="statement.expenses.length === 0 && statement.items.length === 0">
            No hay gastos en este ciclo
          </div>
        </div>

        <button class="btn-add-item" (click)="openItemForm()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Agregar item
        </button>

        <button class="btn-history" (click)="openHistoryModal()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Ver historial
        </button>

        <div class="modal-overlay" *ngIf="showItemForm" (click)="closeItemForm()">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <span class="modal-title">{{ editingItemId ? 'Editar item' : 'Nuevo item' }}</span>
              <button class="modal-close" (click)="closeItemForm()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A95A8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <div class="form-field">
              <label class="form-label">Descripci\u00f3n</label>
              <input class="form-input" [(ngModel)]="itemForm.description" name="desc" placeholder="Ej: Netflix" />
            </div>

            <div class="form-field">
              <label class="form-label">Categor\u00eda</label>
              <select class="form-input" [(ngModel)]="itemForm.category" name="cat">
                <option value="entertainment">Entretenimiento</option>
                <option value="utilities">Servicios</option>
                <option value="transport">Transporte</option>
                <option value="health">Salud</option>
                <option value="education">Educaci\u00f3n</option>
                <option value="other">Otro</option>
              </select>
            </div>

            <div class="form-row">
              <div class="form-field flex1">
                <label class="form-label">Tipo</label>
                <select class="form-input" [(ngModel)]="itemForm.type" name="type" (change)="onItemTypeChange()">
                  <option value="recurring">Recurrente</option>
                  <option value="installment">Cuotas</option>
                </select>
              </div>
              <div class="form-field flex1">
                <label class="form-label">Moneda</label>
                <select class="form-input" [(ngModel)]="itemForm.currency" name="currency" (change)="onCurrencyChange()">
                  <option value="ARS">ARS</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>

            <div class="form-field" *ngIf="itemForm.type === 'installment' && itemForm.currency !== 'USD'">
              <label class="form-label">{{ installmentInputMode === 'cuota' ? 'Valor cuota' : 'Total financiado' }}</label>
              <div class="installment-row">
                <div class="installment-input-wrap">
                  <span class="installment-prefix">{{ installmentInputMode === 'cuota' ? '$' : '$' }}</span>
                  <input *ngIf="installmentInputMode === 'total'" class="installment-input" [value]="itemForm.totalAmount" (input)="onTotalChange(+$any($event.target).value)" type="text" inputmode="decimal" placeholder="0" />
                  <input *ngIf="installmentInputMode === 'cuota'" class="installment-input" [value]="itemForm.amount" (input)="onCuotaChange(+$any($event.target).value)" type="text" inputmode="decimal" placeholder="0" />
                </div>
                <span class="installment-x">x</span>
                <div class="installment-input-wrap short">
                  <input class="installment-input" [value]="itemForm.totalInstallments" (input)="onInstallmentsChange(+$any($event.target).value)" type="number" min="1" max="60" placeholder="12" />
                  <span class="installment-suffix">cuotas</span>
                </div>
              </div>
              <div class="installment-calc" *ngIf="((itemForm.totalAmount ?? 0) > 0 || itemForm.amount > 0) && (itemForm.totalInstallments ?? 0) > 0">
                <span class="calc-label">{{ installmentInputMode === 'total' ? '= $ ' : 'Total: $ ' }}{{ installmentInputMode === 'total' ? (calculatedCuota | number:'1.0-0':'es-AR') : ((itemForm.amount * (itemForm.totalInstallments ?? 1)) | number:'1.0-0':'es-AR') }} {{ installmentInputMode === 'total' ? 'por cuota' : '' }}</span>
                <span class="calc-toggle" (click)="toggleInstallmentMode()">
                  {{ installmentInputMode === 'total' ? 'Ingresás por cuota' : 'Ingresás por total' }}
                </span>
              </div>
              <div class="installment-calc" *ngIf="hasRoundDiff">
                <span class="calc-warning">Total real: $ {{ realTotal | number:'1.0-0':'es-AR' }}</span>
              </div>
            </div>

            <div class="form-field" *ngIf="itemForm.type === 'installment' && itemForm.currency === 'USD'">
              <label class="form-label">{{ installmentInputMode === 'cuota' ? 'Valor cuota USD' : 'Total USD' }}</label>
              <div class="installment-row">
                <div class="installment-input-wrap">
                  <span class="installment-prefix">USD</span>
                  <input *ngIf="installmentInputMode === 'total'" class="installment-input" [value]="itemForm.totalAmount" (input)="onTotalChange(+$any($event.target).value)" type="text" inputmode="decimal" placeholder="0" />
                  <input *ngIf="installmentInputMode === 'cuota'" class="installment-input" [value]="itemForm.amountUsd" (input)="onCuotaChangeUSD(+$any($event.target).value)" type="text" inputmode="decimal" placeholder="0" />
                </div>
                <span class="installment-x">x</span>
                <div class="installment-input-wrap short">
                  <input class="installment-input" [value]="itemForm.totalInstallments" (input)="onInstallmentsChange(+$any($event.target).value)" type="number" min="1" max="60" placeholder="12" />
                  <span class="installment-suffix">cuotas</span>
                </div>
              </div>
              <div class="amount-rate" *ngIf="currentRate && ((itemForm.totalAmount ?? 0) > 0 || ((itemForm.amountUsd ?? 0) > 0))">
                {{ installmentInputMode === 'total' ? 'Total ARS: $ ' : 'Valor cuota ARS: $ ' }}{{ installmentInputMode === 'total' ? (((itemForm.totalAmount ?? 0) * currentRate) | number:'1.0-0':'es-AR') : (((itemForm.amountUsd ?? 0) * currentRate) | number:'1.0-0':'es-AR') }} (~{{ installmentInputMode === 'total' ? (( ((itemForm.totalAmount ?? 0) * currentRate) / (itemForm.totalInstallments ?? 1)) | number:'1.0-0':'es-AR') : ((itemForm.amountUsd ?? 0) * currentRate | number:'1.0-0':'es-AR') }}/cuota)
              </div>
            </div>

            <div class="form-field" *ngIf="itemForm.type !== 'installment'">
              <label class="form-label">{{ itemForm.currency === 'USD' ? 'Monto USD' : 'Monto' }}</label>
              <div class="amount-row">
                <input *ngIf="itemForm.currency === 'USD'" class="form-input flex1" [ngModel]="itemForm.amountUsd" (ngModelChange)="onItemAmountChange($event)" name="amountUsd" type="text" inputmode="decimal" placeholder="0" />
                <input *ngIf="itemForm.currency !== 'USD'" class="form-input flex1" [ngModel]="itemForm.amount" (ngModelChange)="onItemAmountChange($event)" name="amount" type="text" inputmode="decimal" placeholder="0" />
                <span class="amount-rate" *ngIf="itemForm.currency === 'USD' && currentRate && itemForm.amountUsd">
                  x {{ currentRate | number:'1.0-0':'es-AR' }} = $ {{ (itemForm.amountUsd * currentRate) | number:'1.0-0':'es-AR' }}
                </span>
              </div>
            </div>

            <div class="form-field">
              <label class="form-label">Inicia</label>
              <input class="form-input" [(ngModel)]="itemForm.startPeriod" name="start" type="datetime-local" />
            </div>

            <button class="btn-save-item" [disabled]="!canSaveItem" (click)="saveItem()">
              {{ editingItemId ? 'Guardar cambios' : 'Agregar item' }}
            </button>
          </div>
        </div>

        <div class="modal-overlay" *ngIf="showPayModal" (click)="closePayModal()">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <span class="modal-title">Pagar resumen</span>
              <button class="modal-close" (click)="closePayModal()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A95A8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <div class="form-field">
              <label class="form-label">Total a pagar</label>
              <input class="form-input" type="number" [(ngModel)]="payForm.amount" name="payAmount" />
            </div>

            <div class="form-field">
              <label class="form-label">M\u00e9todo de pago</label>
              <select class="form-input" [(ngModel)]="payForm.paymentMethod" name="payMethod">
                <option value="debit">D\u00e9bito</option>
                <option value="cash">Efectivo</option>
                <option value="transfer">Transferencia</option>
                <option value="credit_card">Otra tarjeta</option>
              </select>
            </div>

            <div class="form-field" *ngIf="payForm.paymentMethod === 'credit_card'">
              <label class="form-label">Tarjeta origen</label>
              <select class="form-input" [(ngModel)]="payForm.sourceCardId" name="sourceCard">
                <option value="">Seleccionar tarjeta...</option>
                <option *ngFor="let c of otherCards" [value]="c._id">{{ c.name }}</option>
              </select>
            </div>

            <div class="form-field">
              <label class="form-label">Comisi\u00f3n (opcional)</label>
              <input class="form-input" type="number" [(ngModel)]="payForm.commission" name="commission" placeholder="Monto adicional" />
            </div>

            <div class="form-field">
              <label class="form-label">Descripci\u00f3n (opcional)</label>
              <input class="form-input" [(ngModel)]="payForm.description" name="payDesc" placeholder="Ej: PagoVisa" />
            </div>

            <button class="btn-save-item" [disabled]="!canConfirmPay" (click)="confirmPay()">
              Confirmar pago
            </button>
          </div>
        </div>

        <div class="modal-overlay" *ngIf="showHistoryModal" (click)="closeHistoryModal()">
          <div class="modal-card modal-large" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <span class="modal-title">Historial de ciclos</span>
              <button class="modal-close" (click)="closeHistoryModal()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A95A8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <div class="history-list" *ngIf="!selectedHistoryPeriod">
              <div class="history-item" *ngFor="let period of historyPeriods" (click)="selectHistoryPeriod(period)">
                <div class="history-period-info">
                  <span class="history-period-label">{{ period.label }}</span>
                  <span class="history-period-dates">{{ period.start }} → {{ period.end }}</span>
                </div>
                <div class="history-period-right">
                  <span class="history-amount">$ {{ period.total | number:'1.0-0':'es-AR' }}</span>
                  <span class="history-status" [class.paid]="period.isPaid">{{ period.isPaid ? 'Pagado' : 'No pagado' }}</span>
                </div>
              </div>
            </div>

            <div class="history-detail" *ngIf="selectedHistoryPeriod">
              <button class="btn-back-history" (click)="selectedHistoryPeriod = null">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A95A8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                Volver
              </button>
              <div class="history-detail-header">
                <span>{{ selectedHistoryPeriod.label }}</span>
                <span class="history-detail-amount">$ {{ selectedHistoryPeriod.total | number:'1.0-0':'es-AR' }}</span>
              </div>
              <div class="history-items-section" *ngIf="historyStatement && historyStatement.items.length > 0">
                <div class="items-divider">
                  <span class="items-divider-label">Items</span>
                </div>
                <div class="expense-list">
                  <div class="expense-item" *ngFor="let item of historyStatement.items">
                    <div class="expense-left">
                      <span class="expense-category-icon">{{ getCategoryEmoji(item.category) }}</span>
                      <div class="expense-info">
                        <span class="expense-desc">{{ item.description }}</span>
                        <span class="expense-date">{{ item.startPeriod | date:'dd/MM/yyyy' }}</span>
                      </div>
                    </div>
                    <div class="expense-right">
                      <span class="expense-amount">$ {{ item.amount | number:'1.0-0':'es-AR' }}</span>
                      <span class="item-paid-badge" *ngIf="item.isPaid">Pagado</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="empty-history" *ngIf="!historyStatement || historyStatement.items.length === 0">
                No hay items en este período
              </div>
            </div>
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
    :host { display: block; min-height: 100vh; background: #0C0F14; font-family: 'Inter', sans-serif; }
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
    .btn-pay { width: 100%; height: 40px; background: #22C55E; border: none; border-radius: 999px; color: #F0F2F5; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; margin-top: 12px; transition: opacity 150ms; }
    .btn-pay:disabled { opacity: 0.4; cursor: not-allowed; }

    .btn-history { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; height: 40px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 999px; color: #8A95A8; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; margin-top: 12px; transition: all 150ms; }
    .btn-history:hover { background: rgba(255,255,255,0.08); color: #F0F2F5; }

    .modal-large { max-height: 80vh; overflow-y: auto; }

    .history-list { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }
    .history-item { display: flex; align-items: center; justify-content: space-between; background: #1E2530; border-radius: 12px; padding: 14px 16px; cursor: pointer; transition: background 150ms; }
    .history-item:hover { background: rgba(255,255,255,0.08); }
    .history-period-info { display: flex; flex-direction: column; gap: 2px; }
    .history-period-label { font-size: 14px; font-weight: 600; color: #F0F2F5; }
    .history-period-dates { font-size: 11px; font-weight: 400; color: #697586; }
    .history-period-right { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
    .history-amount { font-size: 14px; font-weight: 600; color: #F0F2F5; }
    .history-status { font-size: 11px; font-weight: 500; color: #F87171; }
    .history-status.paid { color: #22C55E; }

    .history-detail { margin-top: 8px; }
    .btn-back-history { display: flex; align-items: center; gap: 4px; background: none; border: none; color: #8A95A8; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; padding: 0; margin-bottom: 12px; }
    .btn-back-history:hover { color: #F0F2F5; }
    .history-detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; font-size: 15px; font-weight: 600; color: #F0F2F5; }
    .history-detail-amount { font-size: 18px; font-weight: 700; }
    .empty-history { text-align: center; color: #697586; font-size: 13px; padding: 24px 0; }
    .item-paid-badge { font-size: 10px; font-weight: 600; color: #22C55E; background: rgba(34,197,94,0.15); padding: 2px 8px; border-radius: 4px; }

    .statement-section { margin-top: 20px; }
    .statement-header { display: flex; justify-content: space-between; align-items: center; }
    .statement-title { font-size: 16px; font-weight: 600; color: #F0F2F5; }
    .statement-total { font-size: 16px; font-weight: 700; color: #F0F2F5; }
    .statement-period { font-size: 11px; font-weight: 400; color: #697586; margin-top: 2px; margin-bottom: 12px; }

    .expense-list { display: flex; flex-direction: column; gap: 8px; }
    .expense-item { display: flex; align-items: center; justify-content: space-between; background: #161B24; border-radius: 12px; padding: 12px 16px; }
    .expense-left { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
    .expense-category-icon { font-size: 16px; flex-shrink: 0; }
    .expense-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .expense-desc { font-size: 14px; font-weight: 500; color: #F0F2F5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 6px; }
    .expense-date { font-size: 11px; font-weight: 400; color: #697586; }
    .expense-amount { font-size: 14px; font-weight: 700; color: #F0F2F5; white-space: nowrap; display: flex; align-items: center; gap: 4px; }
    .expense-right { display: flex; align-items: center; gap: 8px; }
    .usd-badge { font-size: 10px; font-weight: 700; color: #22C55E; background: rgba(34,197,94,0.12); padding: 2px 6px; border-radius: 4px; }
    .item-badge { font-size: 10px; font-weight: 600; color: #697586; background: #1E2530; padding: 2px 8px; border-radius: 999px; }
    .badge-cuota { color: #5B8DEF; background: rgba(91,141,239,0.12); }
    .rate-warning { color: #C99A0A; font-size: 11px; font-weight: 500; }
    .item-delete { background: none; border: none; padding: 4px; cursor: pointer; display: flex; align-items: center; opacity: 0.4; transition: opacity 150ms; }
    .item-delete:hover { opacity: 1; }
    .item-edit { background: none; border: none; padding: 4px; cursor: pointer; display: flex; align-items: center; opacity: 0.4; transition: opacity 150ms; }
    .item-edit:hover { opacity: 1; }

    .installment-row { display: flex; align-items: center; gap: 10px; }
    .installment-input-wrap { display: flex; align-items: center; background: #1E2530; border-radius: 12px; height: 44px; padding: 0 12px; flex: 1; }
    .installment-input-wrap.short { flex: 0 0 auto; max-width: 110px; }
    .installment-prefix { font-size: 14px; font-weight: 500; color: #8A95A8; margin-right: 6px; white-space: nowrap; }
    .installment-suffix { font-size: 12px; font-weight: 500; color: #8A95A8; margin-left: 6px; white-space: nowrap; }
    .installment-input { background: transparent; border: none; outline: none; color: #F0F2F5; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500; width: 100%; padding: 0; }
    .installment-input::placeholder { color: #697586; }
    .installment-x { font-size: 14px; font-weight: 500; color: #8A95A8; }
    .installment-calc { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; flex-wrap: wrap; gap: 4px; }
    .calc-label { font-size: 13px; font-weight: 600; color: #F0F2F5; }
    .calc-toggle { font-size: 11px; font-weight: 500; color: #5B8DEF; cursor: pointer; }
    .calc-warning { font-size: 11px; font-weight: 400; color: #697586; }

    .items-section { margin-top: 16px; }
    .items-divider { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; }
    .items-divider-label { font-size: 13px; font-weight: 600; color: #8A95A8; }
    .items-divider-total { font-size: 13px; font-weight: 700; color: #8A95A8; }

    .empty-expenses { text-align: center; font-size: 13px; font-weight: 400; color: #697586; padding: 24px 0; }

    .btn-add-item { width: 100%; height: 44px; margin: 16px 0 40px; background: #1E2530; border: 1px dashed #697586; border-radius: 12px; color: #8A95A8; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 150ms; }
    .btn-add-item:hover { border-color: #E4B3E9; color: #E4B3E9; }

    .error-msg { display: flex; align-items: center; justify-content: center; gap: 8px; color: #F87171; font-size: 12px; margin-top: 60px; }
    .btn-retry { background: none; border: none; color: #5B8DEF; font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; text-decoration: underline; padding: 0; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 20px; }
    .modal-card { background: #161B24; border-radius: 20px; padding: 24px; width: 100%; max-width: 360px; border: 1px solid rgba(255,255,255,0.06); max-height: 90vh; overflow-y: auto; }
    .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .modal-title { font-size: 18px; font-weight: 700; color: #F0F2F5; }
    .modal-close { background: none; border: none; padding: 4px; cursor: pointer; display: flex; }

    .form-field { margin-bottom: 14px; }
    .form-label { display: block; font-size: 12px; font-weight: 500; color: #8A95A8; margin-bottom: 6px; }
    .form-input { width: 100%; height: 44px; background: #1E2530; border: none; border-radius: 12px; color: #F0F2F5; font-family: 'Inter', sans-serif; font-size: 14px; padding: 0 14px; outline: none; box-sizing: border-box; }
    .form-input:focus { outline: 1px solid #E4B3E9; }
    .form-input::placeholder { color: #697586; }
    select.form-input { appearance: none; cursor: pointer; }
    .form-row { display: flex; gap: 10px; }
    .flex1 { flex: 1; }
    .amount-row { display: flex; flex-direction: column; gap: 4px; }
    .amount-rate { font-size: 12px; font-weight: 500; color: #8A95A8; padding-left: 4px; }

    .btn-save-item { width: 100%; height: 44px; background: #E05252; border: none; border-radius: 999px; color: #F0F2F5; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; margin-top: 8px; transition: opacity 150ms; }
    .btn-save-item:disabled { opacity: 0.4; cursor: not-allowed; }

    @keyframes shimmer { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
  `]
})
export class DetalleTarjetaComponent implements OnInit, OnDestroy {
  cardId = ''
  card: CreditCardData | null = null
  cards: CreditCardData[] = []
  statement: CardStatement | null = null
  state: 'loading' | 'loaded' | 'error' = 'loading'
  showItemForm = false
  showPayModal = false
  editingItemId: string | null = null
  currentRate = 1600
  installmentInputMode: 'total' | 'cuota' = 'total'

  itemForm: CreateCardItemRequest & { installmentManual?: boolean } = {
    cardId: '',
    description: '',
    category: 'entertainment',
    type: 'recurring',
    currency: 'ARS',
    amount: 0,
    totalAmount: 0,
    totalInstallments: 1,
    installmentManual: false,
    startPeriod: '',
  }

  payForm: {
    amount: number
    paymentMethod: 'debit' | 'cash' | 'transfer' | 'credit_card'
    sourceCardId?: string
    commission?: number
    description?: string
  } = {
    amount: 0,
    paymentMethod: 'debit',
  }

  showHistoryModal = false
  historyPeriods: { label: string; start: string; end: string; total: number; isPaid: boolean; month: string }[] = []
  selectedHistoryPeriod: { label: string; start: string; end: string; total: number; isPaid: boolean; month: string } | null = null
  historyStatement: CardStatement | null = null

  private destroy$ = new Subject<void>()

  constructor(
    private tarjetasService: TarjetasService,
    private cardItemService: CardItemService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.cardId = params['id']
      this.itemForm.cardId = this.cardId
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

  get canSaveItem(): boolean {
    if (!this.itemForm.description || !this.itemForm.startPeriod) return false
    if (this.itemForm.type === 'installment') {
      return (this.itemForm.totalAmount ?? 0) > 0 && (this.itemForm.totalInstallments ?? 0) > 0
    }
    return this.itemForm.amount > 0
  }

  get calculatedCuota(): number {
    const total = this.itemForm.totalAmount ?? 0
    const inst = this.itemForm.totalInstallments ?? 1
    if (inst <= 0) return 0
    return Math.round(total / inst)
  }

  get realTotal(): number {
    const cuota = this.itemForm.amount ?? 0
    const inst = this.itemForm.totalInstallments ?? 1
    return cuota * inst
  }

  get hasRoundDiff(): boolean {
    const total = this.itemForm.totalAmount ?? 0
    return total > 0 && Math.abs(this.realTotal - total) > 1
  }

  get otherCards(): CreditCardData[] {
    return this.cards.filter(c => c._id !== this.cardId && c.isActive)
  }

  get canConfirmPay(): boolean {
    if (this.payForm.amount <= 0) return false
    if (this.payForm.paymentMethod === 'credit_card' && !this.payForm.sourceCardId) return false
    return true
  }

  openPayModal(): void {
    this.payForm = {
      amount: this.statement?.totalAmount ?? 0,
      paymentMethod: 'debit',
      sourceCardId: '',
      commission: undefined,
      description: '',
    }
    this.showPayModal = true
  }

  closePayModal(): void {
    this.showPayModal = false
  }

  confirmPay(): void {
    if (!this.canConfirmPay || !this.card) return
    const payload: any = { ...this.payForm }
    if (!payload.commission) delete payload.commission
    if (!payload.description) delete payload.description
    if (payload.paymentMethod !== 'credit_card') delete payload.sourceCardId

    this.tarjetasService.payStatement(this.cardId, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.closePayModal()
          this.loadStatement()
        },
        error: () => {},
      })
  }

  openHistoryModal(): void {
    this.showHistoryModal = true
    this.selectedHistoryPeriod = null
    this.historyStatement = null
    this.loadHistoryPeriods()
  }

  closeHistoryModal(): void {
    this.showHistoryModal = false
    this.selectedHistoryPeriod = null
    this.historyStatement = null
  }

  private loadHistoryPeriods(): void {
    const now = new Date()
    const periods: { label: string; start: string; end: string; total: number; isPaid: boolean; month: string }[] = []

    for (let i = 0; i <= 5; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const year = d.getFullYear()
      const month = d.getMonth() + 1
      const monthStr = `${year}-${String(month).padStart(2, '0')}`
      const label = d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })

      this.tarjetasService.getStatement(this.cardId, monthStr)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (stmt) => {
            periods.push({
              label: label.charAt(0).toUpperCase() + label.slice(1),
              start: stmt.periodStart,
              end: stmt.periodEnd,
              total: stmt.totalAmount,
              isPaid: stmt.items.length > 0 ? stmt.items.every(it => it.isPaid) : false,
              month: monthStr,
            })
            periods.sort((a, b) => b.month.localeCompare(a.month))
            this.historyPeriods = [...periods]
          },
          error: () => {},
        })
    }
  }

  selectHistoryPeriod(period: { label: string; start: string; end: string; total: number; isPaid: boolean; month: string }): void {
    this.selectedHistoryPeriod = period
    this.tarjetasService.getStatement(this.cardId, period.month)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stmt) => {
          this.historyStatement = stmt
        },
        error: () => {},
      })
  }

  loadData(): void {
    this.state = 'loading'
    this.tarjetasService.getById(this.cardId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (card) => {
          this.card = card
          this.cdr.markForCheck()
          this.loadRate()
          this.loadStatement()
          this.loadAllCards()
        },
        error: () => {
          this.state = 'error'
          this.cdr.markForCheck()
        },
      })
  }

  private loadAllCards(): void {
    this.tarjetasService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cards) => {
          this.cards = cards ?? []
        },
        error: () => {},
      })
  }

  private loadRate(): void {
    this.cardItemService.getRate()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.currentRate = res.rate
        },
        error: () => {},
      })
  }

  private loadStatement(): void {
    this.tarjetasService.getStatement(this.cardId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (statement) => {
          console.log('[DEBUG] Statement loaded:', statement)
          console.log('[DEBUG] Expenses:', statement?.expenses?.length, 'Items:', statement?.items?.length)
          this.statement = statement
          this.state = 'loaded'
          this.cdr.markForCheck()
        },
        error: (err) => {
          console.error('[DEBUG] Statement error:', err)
          this.statement = null
          this.state = 'loaded'
          this.cdr.markForCheck()
        },
      })
  }

  openItemForm(item?: CardStatementItem): void {
    const now = new Date()
    const pad = (n: number) => n.toString().padStart(2, '0')
    const nowLocal = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`

    const prepareForm = (startPeriodIso: string) => ({
      cardId: this.cardId,
      description: item?.description ?? '',
      category: item?.category ?? 'entertainment',
      type: (item?.itemType ?? 'recurring') as 'installment' | 'recurring',
      currency: item?.currency ?? 'ARS',
      amount: item?.amount ?? 0,
      amountUsd: undefined,
      totalAmount: item?.totalAmount ?? item?.amount ?? 0,
      totalInstallments: item?.totalInstallments ?? 1,
      installmentManual: item?.installmentManual ?? false,
      startPeriod: startPeriodIso,
    })

    if (item) {
      this.editingItemId = item._id
      this.cardItemService.getById(item._id).pipe(takeUntil(this.destroy$)).subscribe({
        next: (cardItem) => {
          const startPeriodLocal = cardItem.startPeriod ? this.isoToLocal(cardItem.startPeriod) : nowLocal
          this.itemForm = prepareForm(startPeriodLocal)
          this.installmentInputMode = cardItem.installmentManual ? 'cuota' : 'total'
          this.showItemForm = true
        },
        error: () => {
          this.itemForm = prepareForm(nowLocal)
          this.installmentInputMode = 'total'
          this.showItemForm = true
        },
      })
    } else {
      this.editingItemId = null
      this.itemForm = prepareForm(nowLocal)
      this.installmentInputMode = 'total'
      this.showItemForm = true
    }
  }

  closeItemForm(): void {
    this.showItemForm = false
  }

  onItemTypeChange(): void {
    if (this.itemForm.type === 'installment') {
      this.itemForm.totalInstallments = this.itemForm.totalInstallments || 12
      this.itemForm.totalAmount = this.itemForm.totalAmount || this.itemForm.amount || 0
      this.recalcFromMode()
    } else {
      this.itemForm.totalInstallments = undefined
      this.itemForm.totalAmount = undefined
      this.itemForm.installmentManual = undefined
    }
  }

  private recalcFromMode(): void {
    if (this.installmentInputMode === 'cuota') {
      this.itemForm.totalAmount = this.itemForm.amount * (this.itemForm.totalInstallments || 1)
      this.itemForm.installmentManual = true
    } else {
      this.itemForm.amount = this.calculatedCuota
      this.itemForm.installmentManual = false
    }
  }

  onTotalChange(value: number): void {
    this.itemForm.totalAmount = value
    this.installmentInputMode = 'total'
    this.itemForm.installmentManual = false
    if (this.itemForm.currency === 'USD') {
      this.itemForm.amountUsd = value
      this.itemForm.amount = Math.round(value * this.currentRate)
    } else {
      this.itemForm.amount = this.calculatedCuota
    }
  }

  onInstallmentsChange(value: number): void {
    this.itemForm.totalInstallments = value
    if (this.installmentInputMode === 'cuota') {
      this.itemForm.totalAmount = this.itemForm.amount * value
    } else {
      this.itemForm.amount = this.calculatedCuota
      if (this.itemForm.currency === 'USD') {
        this.itemForm.amountUsd = this.itemForm.totalAmount
      }
    }
  }

  onCuotaChange(value: number): void {
    this.itemForm.amount = value
    this.installmentInputMode = 'cuota'
    this.itemForm.installmentManual = true
    this.itemForm.totalAmount = value * (this.itemForm.totalInstallments || 1)
  }

  onCuotaChangeUSD(value: number): void {
    this.itemForm.amountUsd = value
    this.itemForm.amount = Math.round(value * this.currentRate)
    this.installmentInputMode = 'cuota'
    this.itemForm.installmentManual = true
    this.itemForm.totalAmount = value * (this.itemForm.totalInstallments || 1)
  }

  toggleInstallmentMode(): void {
    this.installmentInputMode = this.installmentInputMode === 'total' ? 'cuota' : 'total'
    if (this.installmentInputMode === 'cuota') {
      this.itemForm.amount = this.calculatedCuota
      this.itemForm.installmentManual = true
      if (this.itemForm.currency === 'USD') {
        this.itemForm.amountUsd = this.itemForm.totalAmount
      }
    } else {
      this.itemForm.totalAmount = this.itemForm.amount * (this.itemForm.totalInstallments || 1)
      this.itemForm.installmentManual = false
      if (this.itemForm.currency === 'USD') {
        this.itemForm.amountUsd = this.itemForm.totalAmount
        this.itemForm.amount = Math.round(this.itemForm.totalAmount * this.currentRate)
      }
    }
  }

  onCurrencyChange(): void {
    if (this.itemForm.type === 'installment') {
      if (this.itemForm.currency === 'USD') {
        if (this.installmentInputMode === 'cuota') {
          this.itemForm.amountUsd = this.itemForm.amount
          this.itemForm.amount = Math.round(this.itemForm.amount * this.currentRate)
          this.itemForm.totalAmount = (this.itemForm.amountUsd ?? 0) * (this.itemForm.totalInstallments || 1)
        } else {
          this.itemForm.amountUsd = this.itemForm.totalAmount ?? 0
          this.itemForm.amount = Math.round((this.itemForm.totalAmount ?? 0) * this.currentRate)
        }
      } else {
        if (this.installmentInputMode === 'cuota') {
          this.itemForm.amount = this.itemForm.amountUsd ?? 0
          this.itemForm.totalAmount = (this.itemForm.amount ?? 0) * (this.itemForm.totalInstallments || 1)
        } else {
          this.itemForm.amount = this.calculatedCuota
        }
        this.itemForm.amountUsd = undefined
      }
    } else {
      if (this.itemForm.currency === 'USD' && this.itemForm.amount > 0) {
        this.itemForm.amountUsd = this.itemForm.amount
        this.itemForm.amount = Math.round(this.itemForm.amount * this.currentRate)
      } else if (this.itemForm.currency === 'ARS' && this.itemForm.amountUsd) {
        this.itemForm.amount = this.itemForm.amountUsd
        this.itemForm.amountUsd = undefined
      }
    }
  }

  onItemAmountChange(value: number): void {
    if (this.itemForm.type === 'installment') {
      this.onCuotaChange(value)
    } else {
      if (this.itemForm.currency === 'USD') {
        this.itemForm.amountUsd = value
      }
    }
  }

  private isoToLocal(iso: string): string {
    const d = new Date(iso)
    const pad = (n: number) => n.toString().padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  private localToIso(local: string): string {
    return `${local}:00.000Z`
  }

  saveItem(): void {
    if (!this.canSaveItem) return

    const amount = this.itemForm.currency === 'USD' && this.itemForm.amountUsd
      ? Math.round(this.itemForm.amountUsd * this.currentRate)
      : this.itemForm.amount

    const payload: any = {
      ...this.itemForm,
      amount,
      rateUsed: this.itemForm.currency === 'USD' ? this.currentRate : undefined,
      startPeriod: this.localToIso(this.itemForm.startPeriod),
    }

    if (this.editingItemId) {
      this.cardItemService.update(this.editingItemId, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showItemForm = false
            this.loadStatement()
          },
          error: () => {},
        })
    } else {
      this.cardItemService.create(payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showItemForm = false
            this.loadStatement()
          },
          error: () => {},
        })
    }
  }

  deleteItem(id: string): void {
    this.cardItemService.delete(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.loadStatement(),
        error: () => {},
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
      savings: '\uD83D\uDCB0',
      debt: '\uD83C\uDFE6',
      other: '\uD83D\uDCB3',
    }
    return map[category] || '\uD83D\uDCB3'
  }

  onBack(): void {
    this.router.navigate(['/tarjetas'])
  }
}
