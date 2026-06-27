import { Component } from '@angular/core'
import { Router, RouterLink } from '@angular/router'
import { NgIf, NgFor, NgClass, DecimalPipe } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ApiService } from '../../services/api.service'
import type { IChecklistItem, IChecklistSummary, IChecklistResponse } from '@shared/types/checklist.types'

interface Transaction {
  name: string
  category: string
  date: string
  amount: number
  type: 'income' | 'expense'
}

interface DebtSummary {
  active: number
  total: number
  paidPercent: number
}

interface SavingGoal {
  name: string
  current: number
  target: number
}

interface DashboardData {
  balance: number
  variationPercent: number
  incomes: number
  expenses: number
  recentTransactions: Transaction[]
  debts: DebtSummary
  savingGoal?: SavingGoal
}

const MOCK_DATA: DashboardData = {
  balance: 124500,
  variationPercent: 15,
  incomes: 380000,
  expenses: 255500,
  recentTransactions: [
    { name: 'Sueldo Enero', category: 'Salario', date: 'Hoy', amount: 380000, type: 'income' },
    { name: 'Supermercado', category: 'Alimentación', date: 'Hoy', amount: 45200, type: 'expense' },
    { name: 'Netflix', category: 'Suscripciones', date: 'Ayer', amount: 8900, type: 'expense' },
    { name: 'Freelance diseño', category: 'Trabajo', date: 'Ayer', amount: 45000, type: 'income' },
    { name: 'Sube', category: 'Transporte', date: 'Ayer', amount: 3200, type: 'expense' },
  ],
  debts: { active: 3, total: 85000, paidPercent: 42 },
  savingGoal: { name: 'Viaje a la costa', current: 45000, target: 120000 },
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, DecimalPipe, RouterLink, FormsModule],
  template: `
    <!-- Loading state -->
    <div class="dashboard" *ngIf="state === 'loading'">
      <div class="skeleton header-skel"></div>
      <div class="skeleton balance-skel"></div>
      <div class="skel-row">
        <div class="skeleton card-skel"></div>
        <div class="skeleton card-skel"></div>
      </div>
      <div class="skeleton card-skel wide"></div>
    </div>

    <!-- Error state -->
    <div class="dashboard" *ngIf="state === 'error'">
      <div class="error-banner">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
        No pudimos cargar tus datos. Deslizá para reintentar.
      </div>
    </div>

    <!-- Dashboard content -->
    <div class="dashboard" *ngIf="state === 'loaded'">
      <!-- Header -->
      <header class="header">
        <img src="assets/miru-icon.svg" alt="Miru" class="logo-mobile" />
        <img src="assets/miru-logo-horizontal.svg" alt="Miru" class="logo-desktop" />
        <div class="header-actions">
          <button class="icon-btn" (click)="onNotificationClick()">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            <span class="badge" *ngIf="unreadNotifications">3</span>
          </button>
          <button class="icon-btn" (click)="onProfileClick()">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
          </button>
        </div>
      </header>

      <!-- Saldo neto -->
      <section class="balance-section">
        <span class="balance-label">Saldo neto del mes</span>
        <div class="balance-amount">
          <span class="currency">$</span>
          <span class="amount">{{ data.balance | number:'1.0-0' }}</span>
        </div>
        <div class="variation" [class.positive]="data.variationPercent > 0" [class.negative]="data.variationPercent < 0" [class.neutral]="data.variationPercent === 0">
          <svg *ngIf="data.variationPercent > 0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          <svg *ngIf="data.variationPercent < 0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
          <svg *ngIf="data.variationPercent === 0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" x2="19" y1="12" y2="12"/></svg>
          <span *ngIf="data.variationPercent > 0">+{{ data.variationPercent }}% vs mes anterior</span>
          <span *ngIf="data.variationPercent < 0">{{ data.variationPercent }}% vs mes anterior</span>
          <span *ngIf="data.variationPercent === 0">Sin cambios</span>
        </div>
      </section>

      <!-- Resumen ingresos/gastos -->
      <section class="summary-row">
        <div class="summary-card income">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m8 12 4 4 4-4"/><path d="M12 8v7"/></svg>
          <span class="summary-label">Ingresos</span>
          <span class="summary-amount">$ {{ data.incomes | number:'1.0-0' }}</span>
        </div>
        <div class="summary-card expense">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m16 12-4-4-4 4"/><path d="M12 16V9"/></svg>
          <span class="summary-label">Gastos</span>
          <span class="summary-amount">$ {{ data.expenses | number:'1.0-0' }}</span>
        </div>
      </section>

      <!-- Semáforo financiero -->
      <section class="traffic-light" [ngClass]="trafficColor">
        <div class="tl-left">
          <span class="tl-dot"></span>
          <div class="tl-text">
            <strong>{{ trafficLabel }}</strong>
            <span class="tl-sub">{{ trafficSub }}</span>
          </div>
        </div>
        <span class="tl-amount">{{ trafficAmount }}</span>
      </section>

      <!-- Barra de progreso -->
      <section class="progress-section">
        <div class="progress-track">
          <div class="progress-fill" [style.width.%]="expenseRatio" [ngClass]="trafficColor"></div>
        </div>
        <div class="progress-labels">
          <span>Gastado: $ {{ data.expenses | number:'1.0-0' }}</span>
          <span>Disponible: $ {{ data.balance | number:'1.0-0' }}</span>
        </div>
      </section>

      <!-- Últimos movimientos -->
      <section class="section">
        <div class="section-header">
          <h3>Últimos movimientos</h3>
          <a routerLink="/movimientos" class="section-link">Ver todos</a>
        </div>
        <div class="tx-list">
          <div class="tx-item" *ngFor="let tx of data.recentTransactions">
            <div class="tx-icon" [class.income]="tx.type === 'income'" [class.expense]="tx.type === 'expense'">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
            </div>
            <div class="tx-info">
              <span class="tx-name">{{ tx.name }}</span>
              <span class="tx-meta">{{ tx.category }} · {{ tx.date }}</span>
            </div>
            <span class="tx-amount" [class.income]="tx.type === 'income'" [class.expense]="tx.type === 'expense'">
              {{ tx.type === 'income' ? '+' : '-' }}$ {{ tx.amount | number:'1.0-0' }}
            </span>
          </div>
        </div>
        <div class="empty-tx" *ngIf="data.recentTransactions.length === 0">
          <p>Todavía no hay movimientos. Agregá tu primer ingreso o gasto.</p>
          <button class="btn-cta" (click)="onAddMovement()">Agregar movimiento</button>
        </div>
      </section>

      <!-- Resumen de deudas -->
      <section class="section">
        <div class="section-header">
          <h3>Deudas activas</h3>
          <a routerLink="/deudas" class="section-link">Ver todas</a>
        </div>
        <div class="debt-card">
          <div class="debt-header">
            <div class="debt-left">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 12H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5"/><path d="M18 8V5a2 2 0 0 0-2-2h-3a2 2 0 0 0-2 2v12l-4-3"/></svg>
              <span class="debt-text">Tenés {{ data.debts.active }} deudas activas</span>
            </div>
            <span class="debt-total">$ {{ data.debts.total | number:'1.0-0' }}</span>
          </div>
          <div class="debt-bar">
            <div class="debt-fill" [style.width.%]="data.debts.paidPercent"></div>
          </div>
          <span class="debt-label">{{ data.debts.paidPercent }}% pagado</span>
        </div>
      </section>

      <!-- Meta de ahorro -->
      <section class="section" *ngIf="data.savingGoal">
        <div class="section-header">
          <h3>Meta de ahorro</h3>
        </div>
        <div class="saving-card">
          <div class="saving-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2h0V5z"/><path d="M2 9v1c0 1.1.9 2 2 2h1"/><path d="M16 11h0"/></svg>
            <span class="saving-name">{{ data.savingGoal.name }}</span>
          </div>
          <div class="saving-bar">
            <div class="saving-fill" [style.width.%]="savingPercent"></div>
          </div>
          <div class="saving-footer">
            <span>$ {{ data.savingGoal.current | number:'1.0-0' }} / $ {{ data.savingGoal.target | number:'1.0-0' }}</span>
            <span>{{ savingPercent }}%</span>
          </div>
        </div>
      </section>

      <!-- Checklist mensual -->
      <section class="section">
        <div class="section-header">
          <h3>Checklist mensual</h3>
        </div>

        <div class="cl-loading" *ngIf="clState === 'loading'">
          <div class="skeleton" style="height:100px;border-radius:20px;"></div>
          <div class="skeleton" style="height:52px;border-radius:16px;margin-top:12px;"></div>
          <div class="skeleton" style="height:52px;border-radius:16px;margin-top:8px;"></div>
        </div>

        <div class="cl-error" *ngIf="clState === 'error'">
          <span>No pudimos cargar el checklist</span>
          <button (click)="loadChecklist()">Reintentar</button>
        </div>

        <ng-container *ngIf="clState === 'loaded'">
          <!-- Month summary -->
          <div class="cl-summary">
            <div class="cl-summary-left">
              <span class="cl-month">{{ monthName }}</span>
              <div class="cl-streak" *ngIf="clSummary.streak > 0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#E05252" stroke="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                <span>Llevás {{ clSummary.streak }} mes{{ clSummary.streak > 1 ? 'es' : '' }} seguido{{ clSummary.streak > 1 ? 's' : '' }} completando tu checklist</span>
              </div>
            </div>
            <div class="cl-circle">
              <svg width="56" height="56" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="24" fill="none" stroke="#1E2530" stroke-width="4"/>
                <circle cx="28" cy="28" r="24" fill="none" stroke="#15C48C" stroke-width="4"
                  stroke-dasharray="150.8" [attr.stroke-dashoffset]="150.8 - (150.8 * clSummary.percentage / 100)"
                  stroke-linecap="round" transform="rotate(-90 28 28)"/>
              </svg>
              <span class="cl-circle-text">{{ clSummary.completed }}/{{ clSummary.total }}</span>
            </div>
          </div>

          <!-- Completed all -->
          <div class="cl-celebration" *ngIf="clSummary.total > 0 && clSummary.percentage === 100 && showConfetti">
            <div class="confetti-container">
              <div class="confetti-piece" *ngFor="let _ of confettiPieces" [style.--x]="_.x" [style.--d]="_.d" [style.--c]="_.c"></div>
            </div>
            <p class="cl-done-text">¡Completaste todo!</p>
            <p class="cl-done-sub">Mes de {{ monthName }} listo.</p>
          </div>

          <!-- Pending items -->
          <div class="cl-items">
            <div
              class="cl-item"
              *ngFor="let item of visibleItems; trackBy: itemTrackBy"
              [class.completed]="item.isCompleted"
            >
              <button class="cl-check" [class.checked]="item.isCompleted" (click)="toggleItem(item)" [disabled]="clToggling">
                <svg *ngIf="item.isCompleted" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F0F2F5" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </button>
              <div class="cl-item-info">
                <span class="cl-item-name">{{ item.name }}</span>
                <span class="cl-item-meta" *ngIf="item.category || item.dueDay">
                  <span *ngIf="item.category" class="cl-tag">{{ item.category }}</span>
                  <span *ngIf="item.dueDay">Vence el {{ item.dueDay | number:'2.0' }}</span>
                </span>
              </div>
              <span class="cl-item-amount" *ngIf="item.amount">$ {{ item.amount | number:'1.0-0' }}</span>
              <button class="cl-delete" *ngIf="item._id && item.isCompleted" (click)="deleteItem(item._id)" title="Eliminar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#697586" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
              </button>
            </div>
          </div>

          <div class="cl-empty" *ngIf="clSummary.total === 0">
            <p>Todavía no hay tareas para este mes. Agregá la primera.</p>
          </div>

          <!-- Add task -->
          <div class="cl-add-wrap" *ngIf="!showAddTask">
            <button class="cl-add-btn" (click)="showAddTask = true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A95A8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
              Agregar tarea personalizada
            </button>
          </div>

          <div class="cl-add-inline" *ngIf="showAddTask">
            <input
              class="cl-add-input"
              [(ngModel)]="newTaskName"
              name="newTaskName"
              type="text"
              placeholder="Nombre de la tarea"
              maxlength="60"
              (keyup.enter)="addCustomTask()"
              autofocus
            />
            <div class="cl-add-actions">
              <button class="cl-add-cancel" (click)="cancelAddTask()">Cancelar</button>
              <button class="cl-add-confirm" [disabled]="!newTaskName.trim() || clAdding" (click)="addCustomTask()">
                <span *ngIf="!clAdding">Agregar</span>
                <span *ngIf="clAdding" class="add-spinner">
                  <img src="/assets/miru-icon.svg" class="spinner-miru" alt="" />
                </span>
              </button>
            </div>
          </div>
        </ng-container>
      </section>

      <!-- FAB -->
      <div class="fab-container">
        <div class="fab-menu" *ngIf="fabOpen">
          <button class="fab-option income" (click)="onFabAction('income')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
            Ingreso
          </button>
          <button class="fab-option expense" (click)="onFabAction('expense')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" x2="19" y1="12" y2="12"/></svg>
            Gasto
          </button>
        </div>
        <button class="fab-main" (click)="fabOpen = !fabOpen" [class.open]="fabOpen">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .dashboard { padding: 40px 20px 80px; display: flex; flex-direction: column; gap: 0; }

    /* Skeleton */
    .skeleton { background: #1E2530; border-radius: 12px; animation: shimmer 1.5s ease-in-out infinite; }
    @keyframes shimmer { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
    .header-skel { height: 44px; margin-bottom: 8px; }
    .balance-skel { height: 80px; margin-bottom: 16px; }
    .skel-row { display: flex; gap: 12px; margin-bottom: 12px; }
    .card-skel { flex: 1; height: 100px; }
    .card-skel.wide { height: 60px; }

    /* Error */
    .error-banner {
      display: flex; align-items: center; gap: 8px; padding: 12px 16px;
      background: rgba(224,82,82,0.15); border-radius: 12px;
      color: #E05252; font-family: 'Inter', sans-serif; font-size: 13px;
    }

    /* Header */
    .header { display: flex; align-items: center; justify-content: space-between; height: 44px; }
    .logo-mobile { display: block; width: 28px; height: 28px; }
    .logo-desktop { display: none; }
    @media (min-width: 768px) {
      .logo-mobile { display: none; }
      .logo-desktop { display: block; height: 24px; }
    }
    .header-actions { display: flex; gap: 16px; }
    .icon-btn {
      background: none; border: none; color: #8A95A8; cursor: pointer;
      padding: 0; display: flex; position: relative;
    }
    .badge {
      position: absolute; top: -2px; right: -4px;
      width: 8px; height: 8px; background: #E05252; border-radius: 50%;
    }

    /* Saldo */
    .balance-section { padding: 20px 0; }
    .balance-label { font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500; color: #8A95A8; }
    .balance-amount { display: flex; align-items: baseline; gap: 4px; margin-top: 4px; }
    .currency { font-family: 'Inter', sans-serif; font-size: 24px; font-weight: 600; color: #8A95A8; }
    .amount { font-family: 'Inter', sans-serif; font-size: 36px; font-weight: 800; color: #F0F2F5; }
    .variation { display: flex; align-items: center; gap: 4px; margin-top: 4px; font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500; }
    .variation.positive { color: #15C48C; }
    .variation.negative { color: #E05252; }
    .variation.neutral { color: #8A95A8; }

    /* Summary cards */
    .summary-row { display: flex; gap: 12px; }
    .summary-card {
      flex: 1; background: #161B24; border-radius: 20px; border: 1px solid rgba(255,255,255,0.06);
      padding: 16px; display: flex; flex-direction: column; gap: 4px;
    }
    .summary-card svg { margin-bottom: 4px; }
    .summary-card.income svg { color: #15C48C; }
    .summary-card.expense svg { color: #E05252; }
    .summary-label { font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500; color: #8A95A8; }
    .summary-amount { font-family: 'Inter', sans-serif; font-size: 18px; font-weight: 700; }
    .summary-card.income .summary-amount { color: #15C48C; }
    .summary-card.expense .summary-amount { color: #E05252; }

    /* Traffic light */
    .traffic-light {
      margin-top: 16px; display: flex; align-items: center; justify-content: space-between;
      padding: 14px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.06);
    }
    .traffic-light.green { background: rgba(21,196,140,0.08); }
    .traffic-light.yellow { background: rgba(201,154,10,0.08); }
    .traffic-light.red { background: rgba(224,82,82,0.08); }
    .tl-left { display: flex; align-items: center; gap: 10px; }
    .tl-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
    .green .tl-dot { background: #15C48C; }
    .yellow .tl-dot { background: #C99A0A; }
    .red .tl-dot { background: #E05252; }
    .tl-text { display: flex; flex-direction: column; }
    .tl-text strong { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; }
    .green .tl-text strong { color: #15C48C; }
    .yellow .tl-text strong { color: #C99A0A; }
    .red .tl-text strong { color: #E05252; }
    .tl-sub { font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 400; color: #8A95A8; }
    .tl-amount { font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 700; }
    .green .tl-amount { color: #15C48C; }
    .yellow .tl-amount { color: #C99A0A; }
    .red .tl-amount { color: #E05252; }

    /* Progress bar */
    .progress-section { margin-top: 16px; }
    .progress-track { height: 6px; background: #1E2530; border-radius: 999px; overflow: hidden; }
    .progress-fill { height: 100%; border-radius: 999px; transition: width 0.5s ease; }
    .progress-fill.green { background: linear-gradient(90deg, #15C48C, #20D9A0); }
    .progress-fill.yellow { background: linear-gradient(90deg, #C99A0A, #DBAF1A); }
    .progress-fill.red { background: linear-gradient(90deg, #E05252, #F06A6A); }
    .progress-labels { display: flex; justify-content: space-between; margin-top: 6px; }
    .progress-labels span { font-family: 'Inter', sans-serif; font-size: 11px; }
    .progress-labels span:first-child { color: #8A95A8; }
    .progress-labels span:last-child { color: #697586; }

    /* Sections */
    .section { margin-top: 24px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .section-header h3 { font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 600; color: #F0F2F5; margin: 0; }
    .section-link { font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500; color: #E4B3E9; text-decoration: none; }

    /* Transaction list */
    .tx-list { display: flex; flex-direction: column; }
    .tx-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
    .tx-item:last-child { border: none; }
    .tx-icon {
      width: 36px; height: 36px; border-radius: 50%; display: flex;
      align-items: center; justify-content: center; flex-shrink: 0;
    }
    .tx-icon.income { background: rgba(21,196,140,0.15); color: #15C48C; }
    .tx-icon.expense { background: rgba(224,82,82,0.15); color: #E05252; }
    .tx-info { flex: 1; display: flex; flex-direction: column; }
    .tx-name { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500; color: #F0F2F5; }
    .tx-meta { font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 400; color: #697586; }
    .tx-amount { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; }
    .tx-amount.income { color: #15C48C; }
    .tx-amount.expense { color: #E05252; }
    .empty-tx { text-align: center; padding: 32px 0; }
    .empty-tx p { font-family: 'Inter', sans-serif; font-size: 13px; color: #8A95A8; margin: 0 0 16px; }
    .btn-cta { background: #E4B3E9; color: #0C0F14; border: none; border-radius: 999px; padding: 12px 24px; font-size: 14px; font-weight: 600; cursor: pointer; }

    /* Debt */
    .debt-card { background: #161B24; border-radius: 20px; border: 1px solid rgba(255,255,255,0.06); padding: 16px; }
    .debt-header { display: flex; justify-content: space-between; align-items: center; }
    .debt-left { display: flex; align-items: center; gap: 8px; color: #E05252; }
    .debt-text { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500; color: #F0F2F5; }
    .debt-total { font-family: 'Inter', sans-serif; font-size: 20px; font-weight: 700; color: #E05252; }
    .debt-bar { height: 4px; background: #1E2530; border-radius: 999px; margin-top: 12px; overflow: hidden; }
    .debt-fill { height: 100%; background: #E05252; border-radius: 999px; }
    .debt-label { font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 400; color: #8A95A8; margin-top: 6px; display: block; }

    /* Saving goal */
    .saving-card { background: #161B24; border-radius: 20px; border: 1px solid rgba(255,255,255,0.06); padding: 16px; }
    .saving-header { display: flex; align-items: center; gap: 8px; color: #C99A0A; margin-bottom: 12px; }
    .saving-name { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; color: #F0F2F5; }
    .saving-bar { height: 6px; background: #1E2530; border-radius: 999px; overflow: hidden; }
    .saving-fill { height: 100%; background: #C99A0A; border-radius: 999px; }
    .saving-footer { display: flex; justify-content: space-between; margin-top: 8px; }
    .saving-footer span { font-family: 'Inter', sans-serif; font-size: 13px; }
    .saving-footer span:first-child { font-weight: 500; color: #8A95A8; }
    .saving-footer span:last-child { font-weight: 600; color: #C99A0A; }

    /* Checklist */
    .cl-loading { display: flex; flex-direction: column; }
    .cl-error { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #F87171; }
    .cl-error button { background: #1E2530; border: none; border-radius: 999px; padding: 6px 12px; color: #F0F2F5; font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500; cursor: pointer; }
    .cl-summary { display: flex; align-items: flex-start; justify-content: space-between; background: #161B24; border-radius: 24px; border: 1px solid rgba(255,255,255,0.06); padding: 16px; gap: 12px; }
    .cl-summary-left { flex: 1; display: flex; flex-direction: column; gap: 8px; }
    .cl-month { font-family: 'Inter', sans-serif; font-size: 18px; font-weight: 700; color: #F0F2F5; }
    .cl-streak { display: flex; align-items: center; gap: 6px; }
    .cl-streak span { font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500; color: #8A95A8; }
    .cl-circle { position: relative; width: 56px; height: 56px; flex-shrink: 0; }
    .cl-circle-text { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 700; color: #F0F2F5; }
    .cl-celebration { text-align: center; padding: 16px 0 8px; position: relative; overflow: hidden; }
    .confetti-container { position: absolute; inset: 0; pointer-events: none; }
    .confetti-piece { position: absolute; top: -8px; left: calc(var(--x) * 1%); width: 6px; height: 6px; border-radius: 2px; background: var(--c); animation: confettiFall 1s ease-out var(--d) forwards; opacity: 0; }
    @keyframes confettiFall { 0% { opacity: 1; transform: translateY(0) rotate(0deg); } 100% { opacity: 0; transform: translateY(120px) rotate(360deg); } }
    .cl-done-text { font-family: 'Inter', sans-serif; font-size: 20px; font-weight: 700; color: #15C48C; margin: 0; }
    .cl-done-sub { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 400; color: #8A95A8; margin: 4px 0 0; }
    .cl-items { display: flex; flex-direction: column; margin-top: 12px; }
    .cl-item { display: flex; align-items: center; gap: 10px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
    .cl-item.completed { opacity: 0.6; }
    .cl-item.completed .cl-item-name { color: #8A95A8; text-decoration: line-through; }
    .cl-check { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; background: none; border: none; cursor: pointer; flex-shrink: 0; position: relative; }
    .cl-check::before { content: ''; width: 22px; height: 22px; border-radius: 6px; border: 2px solid #697586; background: transparent; position: absolute; transition: all 150ms; }
    .cl-check.checked::before { background: #15C48C; border-color: #15C48C; transform: scale(1); }
    .cl-check svg { position: relative; z-index: 1; }
    .cl-item-info { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .cl-item-name { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500; color: #F0F2F5; }
    .cl-item-meta { display: flex; align-items: center; gap: 6px; font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 400; color: #697586; flex-wrap: wrap; }
    .cl-tag { font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 400; color: #C99A0A; background: rgba(201,154,10,0.12); border-radius: 4px; padding: 2px 6px; }
    .cl-item-amount { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; color: #F0F2F5; flex-shrink: 0; }
    .cl-delete { background: none; border: none; padding: 4px; cursor: pointer; display: flex; flex-shrink: 0; }
    .cl-empty { text-align: center; padding: 24px 0; }
    .cl-empty p { font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 400; color: #8A95A8; margin: 0; }
    .cl-add-wrap { margin-top: 12px; }
    .cl-add-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 14px; background: transparent; border: 1px dashed rgba(255,255,255,0.1); border-radius: 16px; color: #8A95A8; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; }
    .cl-add-inline { margin-top: 12px; display: flex; flex-direction: column; gap: 8px; }
    .cl-add-input { width: 100%; height: 44px; background: #1E2530; border: none; border-radius: 12px; padding: 0 14px; color: #F0F2F5; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 400; outline: none; }
    .cl-add-input::placeholder { color: #697586; }
    .cl-add-actions { display: flex; gap: 8px; }
    .cl-add-cancel, .cl-add-confirm { flex: 1; height: 40px; border-radius: 999px; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; border: none; cursor: pointer; }
    .cl-add-cancel { background: #161B24; color: #8A95A8; }
    .cl-add-confirm { background: #C99A0A; color: #0C0F14; }
    .cl-add-confirm:disabled { opacity: 0.4; cursor: not-allowed; }
    .add-spinner { display: flex; align-items: center; justify-content: center; }
    .spinner-miru { width: 18px; height: 18px; animation: spin 800ms linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* FAB */
    .fab-container { position: fixed; bottom: 80px; right: 20px; display: flex; flex-direction: column; align-items: flex-end; gap: 8px; z-index: 90; }
    .fab-menu { display: flex; flex-direction: column; gap: 8px; }
    .fab-option {
      display: flex; align-items: center; gap: 8px; padding: 10px 16px; border: none;
      border-radius: 999px; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600;
      cursor: pointer; white-space: nowrap; transition: opacity 0.2s;
    }
    .fab-option.income { background: rgba(21,196,140,0.15); color: #15C48C; }
    .fab-option.expense { background: rgba(224,82,82,0.15); color: #E05252; }
    .fab-main {
      width: 56px; height: 56px; border-radius: 50%; border: none;
      background: #E4B3E9; color: #0C0F14; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 16px rgba(228,179,233,0.3);
      transition: transform 0.2s;
    }
    .fab-main.open { transform: rotate(45deg); }
  `]
})
export class DashboardComponent {
  state: 'loading' | 'loaded' | 'error' = 'loaded'
  data: DashboardData = MOCK_DATA
  unreadNotifications = true
  fabOpen = false

  // Checklist
  clState: 'loading' | 'loaded' | 'error' = 'loading'
  clItems: IChecklistItem[] = []
  clSummary: IChecklistSummary = { total: 0, completed: 0, percentage: 0, month: '', streak: 0 }
  clToggling = false
  clAdding = false
  showAddTask = false
  newTaskName = ''
  showConfetti = false
  confettiPieces: Array<{ x: number; d: string; c: string }> = []

  constructor(
    private router: Router,
    private api: ApiService,
  ) {
    this.loadChecklist()
  }

  get monthName(): string {
    if (!this.clSummary.month) return ''
    const [y, m] = this.clSummary.month.split('-')
    const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
    return `${months[parseInt(m, 10) - 1]} ${y}`
  }

  get visibleItems(): IChecklistItem[] {
    const pending = this.clItems.filter(i => !i.isCompleted)
    const done = this.clItems.filter(i => i.isCompleted)
    return [...pending, ...done]
  }

  itemTrackBy(_index: number, item: IChecklistItem): string {
    return item._id
  }

  loadChecklist(): void {
    this.clState = 'loading'
    this.api.get<IChecklistResponse>('/checklist')
      .subscribe({
        next: (res) => {
          const cl = res?.data
          if (cl) {
            this.clItems = cl.items ?? []
            this.clSummary = cl.summary ?? { total: 0, completed: 0, percentage: 0, month: '', streak: 0 }
            if (this.clSummary.percentage === 100 && this.clSummary.total > 0) {
              this.triggerConfetti()
            }
          }
          this.clState = 'loaded'
        },
        error: () => {
          this.clState = 'error'
        },
      })
  }

  toggleItem(item: IChecklistItem): void {
    if (this.clToggling || !this.clSummary.month) return
    this.clToggling = true
    this.api.patch<IChecklistResponse>(`/checklist/${this.clSummary.month}/items/${item._id}`, {})
      .subscribe({
        next: (res) => {
          const cl = res?.data
          if (cl) {
            this.clItems = cl.items ?? []
            this.clSummary = cl.summary ?? this.clSummary
            if (this.clSummary.percentage === 100 && this.clSummary.total > 0) {
              this.triggerConfetti()
            } else {
              this.showConfetti = false
            }
          }
          this.clToggling = false
        },
        error: () => {
          this.clToggling = false
        },
      })
  }

  addCustomTask(): void {
    const name = this.newTaskName.trim()
    if (!name || this.clAdding || !this.clSummary.month) return
    this.clAdding = true
    this.api.post<IChecklistResponse>(`/checklist/${this.clSummary.month}/items`, { name })
      .subscribe({
        next: (res) => {
          const cl = res?.data
          if (cl) {
            this.clItems = cl.items ?? []
            this.clSummary = cl.summary ?? this.clSummary
          }
          this.clAdding = false
          this.showAddTask = false
          this.newTaskName = ''
        },
        error: () => {
          this.clAdding = false
        },
      })
  }

  cancelAddTask(): void {
    this.showAddTask = false
    this.newTaskName = ''
  }

  deleteItem(id: string): void {
    if (!this.clSummary.month) return
    this.api.delete<IChecklistResponse>(`/checklist/${this.clSummary.month}/items/${id}`)
      .subscribe({
        next: (res) => {
          const cl = res?.data
          if (cl) {
            this.clItems = cl.items ?? []
            this.clSummary = cl.summary ?? this.clSummary
          }
        },
        error: () => {},
      })
  }

  private triggerConfetti(): void {
    this.showConfetti = true
    this.confettiPieces = Array.from({ length: 20 }, () => ({
      x: Math.random() * 100,
      d: `${Math.random() * 0.5}s`,
      c: ['#15C48C','#C99A0A','#5B8DEF','#E05252','#E4B3E9','#9B6EF3'][Math.floor(Math.random() * 6)],
    }))
  }

  get expenseRatio(): number {
    return Math.round((this.data.expenses / this.data.incomes) * 100)
  }

  get trafficColor(): string {
    const r = this.expenseRatio
    if (r < 60) return 'green'
    if (r <= 85) return 'yellow'
    return 'red'
  }

  get trafficLabel(): string {
    const r = this.expenseRatio
    if (r < 60) return 'Vas bien'
    if (r <= 85) return 'Cuidado'
    return 'Alerta'
  }

  get trafficSub(): string {
    const r = this.expenseRatio
    if (r < 60) return 'Gastaste menos del 60% de tus ingresos'
    if (r <= 85) return 'Ya gastaste más del 60%. Revisá tus gastos.'
    return 'Gastaste más del 85%. Estás al límite este mes.'
  }

  get trafficAmount(): string {
    const r = this.expenseRatio
    const remaining = this.data.incomes - this.data.expenses
    if (r < 60) return `+$ ${remaining.toLocaleString('es-AR')}`
    if (r <= 85) return `Restan $ ${remaining.toLocaleString('es-AR')}`
    return `-$ ${Math.abs(remaining).toLocaleString('es-AR')}`
  }

  get savingPercent(): number {
    if (!this.data.savingGoal) return 0
    return Math.round((this.data.savingGoal.current / this.data.savingGoal.target) * 100)
  }

  onNotificationClick(): void {
    this.unreadNotifications = false
  }

  onProfileClick(): void {
    // navigate to /perfil (future)
  }

  onAddMovement(): void {
    this.router.navigate(['/movimientos'])
  }

  onFabAction(type: 'income' | 'expense'): void {
    this.fabOpen = false
    if (type === 'income') {
      this.router.navigate(['/ingresos/nuevo'])
    } else {
      this.router.navigate(['/gastos/nuevo'])
    }
  }
}
