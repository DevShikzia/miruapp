import { Component, ChangeDetectorRef, signal } from '@angular/core'
import { Router, RouterLink } from '@angular/router'
import { NgIf, NgFor, NgClass, DecimalPipe, DatePipe, TitleCasePipe } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ApiService } from '../../services/api.service'
import { AuthService } from '../../services/auth.service'
import { CategoryLabelPipe } from '../../pipes/category-label.pipe'
import type { TaskData } from '@shared/types/task.types'
import type { DashboardCardItem } from '@shared/types/credit-card.types'

interface Transaction {
  name: string
  category: string
  date: string
  createdAt: string
  createdBy: string
  amount: number
  type: 'income' | 'expense'
}

interface DashboardData {
  balance: number
  variationPercent: number
  totalIncomes: number
  totalExpenses: number
  recentTransactions: Transaction[]
  debts: { active: number; total: number; paidPercent: number }
  savingGoal?: { name: string; current: number; target: number }
  cardItems: DashboardCardItem[]
  cardItemsTotal: number
  pendingTasks: TaskData[]
  pendingTasksCount: number
}

const CATEGORY_ICONS: Record<string, string> = {
  food: '🍔',
  transport: '🚗',
  utilities: '💡',
  rent: '🏠',
  health: '💊',
  education: '📚',
  entertainment: '🎬',
  savings: '🐷',
  debt: '💳',
  other: '📦',
  salary: '💼',
  freelance: '💻',
  investment: '📈',
  sale: '🛒',
  family: '👨‍👩‍👧',
  loan: '🤝',
  refund: '💵',
  electricity: '⚡',
  water: '💧',
  gas: '🔥',
  internet: '🌐',
  insurance: '🛡️',
  subscription: '📱',
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, DecimalPipe, DatePipe, TitleCasePipe, RouterLink, FormsModule, CategoryLabelPipe],
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
        <div class="header-top">
          <img src="assets/miru-icon.svg" alt="Miru" class="logo-mobile" />
          <img src="assets/miru-logo-horizontal.svg" alt="Miru" class="logo-desktop" />
        </div>
        <div class="header-greeting">
          <span>{{ greeting }}, {{ userName }}</span>
          <span class="greeting-date">{{ currentDate }}</span>
        </div>
        <div class="header-actions">
          <button class="icon-btn" (click)="onNotificationClick()">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            <span class="badge" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
          </button>
          <div class="user-menu-wrap">
            <button class="icon-btn" (click)="toggleUserMenu()">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
            </button>
            <div class="user-menu" *ngIf="showUserMenu">
              <button class="user-menu-item logout" (click)="logout()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Saldo neto -->
      <section class="hero-card">
        <div class="balance-section">
          <span class="balance-label">Saldo neto del mes</span>
          <div class="balance-amount">
            <span class="currency">$</span>
            <span class="amount">{{ data.balance | number:'1.0-0' }}</span>
          </div>
          <div class="variation-pill" [class.positive]="data.variationPercent > 0" [class.negative]="data.variationPercent < 0" [class.neutral]="data.variationPercent === 0">
            <svg *ngIf="data.variationPercent > 0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
            <svg *ngIf="data.variationPercent < 0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            <svg *ngIf="data.variationPercent === 0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" x2="19" y1="12" y2="12"/></svg>
            <span *ngIf="data.variationPercent > 0">+{{ data.variationPercent }}% vs mes anterior</span>
            <span *ngIf="data.variationPercent < 0">{{ data.variationPercent }}% vs mes anterior</span>
            <span *ngIf="data.variationPercent === 0">Sin cambios</span>
          </div>
        </div>

        <!-- Barra de progreso dentro del hero -->
        <section class="progress-section">
          <div class="progress-labels">
            <span>Gastado: $ {{ data.totalExpenses | number:'1.0-0' }}</span>
            <span>Disponible: $ {{ data.balance | number:'1.0-0' }}</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" [style.width.%]="expenseRatio" [ngClass]="trafficColor"></div>
            <div class="progress-marker" [style.left.%]="BUDGET_THRESHOLD"></div>
          </div>
          <div class="progress-warning" *ngIf="expenseRatio > BUDGET_THRESHOLD">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span>Ya superaste el {{ BUDGET_THRESHOLD }}% del presupuesto</span>
          </div>
        </section>
      </section>

      <!-- Resumen ingresos/gastos -->
      <section class="summary-row">
        <div class="summary-card income">
          <span class="summary-icon income-icon">↓</span>
          <span class="summary-label">Ingresos</span>
          <span class="summary-amount">$ {{ data.totalIncomes | number:'1.0-0' }}</span>
          <span class="summary-variation positive" *ngIf="data.variationPercent > 0">↑ {{ data.variationPercent }}% vs mes anterior</span>
          <span class="summary-variation negative" *ngIf="data.variationPercent < 0">↓ {{ data.variationPercent | number:'1.0-0' }}% vs mes anterior</span>
        </div>
        <div class="summary-card expense">
          <span class="summary-icon expense-icon">↑</span>
          <span class="summary-label">Gastos</span>
          <span class="summary-amount">$ {{ data.totalExpenses | number:'1.0-0' }}</span>
          <span class="summary-variation negative" *ngIf="data.variationPercent > 0">↑ {{ data.variationPercent }}% vs mes anterior</span>
          <span class="summary-variation positive" *ngIf="data.variationPercent < 0">↓ {{ data.variationPercent | number:'1.0-0' }}% vs mes anterior</span>
        </div>
      </section>

      <!-- Semáforo financiero -->
      <section class="traffic-light" [ngClass]="trafficColor">
        <div class="tl-content">
          <div class="tl-header">
            <span class="tl-dot"></span>
            <strong>{{ trafficLabel }}</strong>
          </div>
          <span class="tl-sub">{{ trafficSub }}</span>
          <span class="tl-amount-warning" *ngIf="trafficColor === 'yellow' || trafficColor === 'red'">{{ trafficAmount }}</span>
        </div>
      </section>

      <!-- Últimos movimientos -->
      <section class="section">
        <div class="section-header">
          <h3>Últimos movimientos</h3>
          <a routerLink="/movimientos" class="section-link">Ver todos</a>
        </div>
        <div class="tx-list">
          <div class="tx-item" *ngFor="let tx of data.recentTransactions; let last = last" [class.last]="last">
            <div class="tx-icon" [class.income]="tx.type === 'income'" [class.expense]="tx.type === 'expense'">
              <span class="tx-category-icon">{{ getCategoryIcon(tx.category) }}</span>
            </div>
            <div class="tx-info">
              <span class="tx-name">{{ tx.name | categoryLabel }}</span>
              <span class="tx-meta">{{ tx.category | categoryLabel }} · {{ tx.date }} {{ tx.createdAt | date:'HH:mm' }} · {{ tx.createdBy }}</span>
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
          <div class="debt-stats">
            <span>$ {{ data.debts.total * data.debts.paidPercent / 100 | number:'1.0-0' }} pagados</span>
            <span>{{ data.debts.paidPercent }}% completado</span>
          </div>
          <div class="debt-bar">
            <div class="debt-fill" [style.width.%]="data.debts.paidPercent"></div>
          </div>
        </div>
      </section>

      <!-- Débitos automáticos activos -->
      <section class="section" *ngIf="data.cardItems.length > 0">
        <div class="section-header">
          <h3>Débitos automáticos activos</h3>
        </div>
        <div class="ci-card">
          <ng-container *ngFor="let item of data.cardItems; trackBy: cardItemTrackBy">
            <div class="ci-item">
              <div class="ci-top">
                <div class="ci-left">
                  <span class="ci-name">{{ item.description }}</span>
                  <span class="ci-card-name">{{ item.cardName }}</span>
                </div>
                <div class="ci-right">
                  <span class="ci-amount" *ngIf="item.currency === 'USD'">USD {{ item.amountUsd ?? item.amount | number:'1.0-0' }}</span>
                  <span class="ci-amount" *ngIf="item.currency !== 'USD'">$ {{ item.amount | number:'1.0-0' }}</span>
                  <span class="ci-badge" [class.recurring]="item.type === 'recurring'" [class.installment]="item.type === 'installment'">
                    {{ item.type === 'recurring' ? 'Recurrente' : item.totalInstallments ? item.totalInstallments + ' cuotas' : 'Cuotas' }}
                  </span>
                </div>
              </div>
            </div>
          </ng-container>
          <div class="ci-total">
            <span>Total mensual</span>
            <span>{{ data.cardItemsTotal | number:'1.0-0' }}</span>
          </div>
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
          <ng-container *ngIf="data.savingGoal.current > 0; else emptySaving">
            <div class="saving-bar">
              <div class="saving-fill" [style.width.%]="savingPercent > 0 ? (savingPercent < 1 ? 1 : savingPercent) : 0"></div>
            </div>
            <div class="saving-footer">
              <span>$ {{ data.savingGoal.current | number:'1.0-0' }} / $ {{ data.savingGoal.target | number:'1.0-0' }}</span>
              <span>{{ savingPercent | number:'1.0-1' }}%</span>
            </div>
          </ng-container>
          <ng-template #emptySaving>
            <div class="saving-bar empty">
              <div class="saving-empty-bar"></div>
            </div>
            <p class="saving-motivation">Cada peso cuenta. ¡Empezá hoy!</p>
          </ng-template>
        </div>
      </section>

      <!-- Tareas pendientes -->
      <section class="section">
        <div class="section-header">
          <h3>Tareas pendientes</h3>
          <a routerLink="/tareas" class="section-link">Ver todas ({{ data.pendingTasksCount }}) →</a>
        </div>

        <div class="tasks-empty" *ngIf="data.pendingTasks.length === 0">
          <p>No tenés tareas pendientes. ¡Bien ahí!</p>
        </div>

        <div class="tasks-list">
          <div class="task-item" *ngFor="let task of data.pendingTasks" [routerLink]="['/tareas', task._id]">
            <div class="task-priority" [style.background]="getPriorityColor(task.priority)"></div>
            <div class="task-info">
              <span class="task-title">{{ task.title }}</span>
              <span class="task-meta">{{ task.category | titlecase }}</span>
            </div>
            <svg class="task-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#697586" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </div>
      </section>

      <!-- FAB Speed Dial -->
      <div class="fab-container">
        <div class="fab-menu" *ngIf="fabOpen">
          <button class="fab-option expense" (click)="onFabAction('expense')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" x2="19" y1="12" y2="12"/><line x1="12" x2="12" y1="5" y2="19"/></svg>
            Agregar gasto
          </button>
          <button class="fab-option income" (click)="onFabAction('income')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
            Agregar ingreso
          </button>
          <button class="fab-option task" (click)="onFabAction('task')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            Nueva tarea
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
    .header { display: flex; flex-direction: column; gap: 4px; }
    .header-top { display: flex; align-items: center; justify-content: space-between; height: 44px; }
    .logo-mobile { display: block; width: 28px; height: 28px; }
    .logo-desktop { display: none; }
    @media (min-width: 768px) {
      .logo-mobile { display: none; }
      .logo-desktop { display: block; height: 24px; }
    }
    .header-greeting { display: flex; flex-direction: column; gap: 2px; }
    .header-greeting span { font-family: 'Inter', sans-serif; font-size: 12px; color: #8A95A8; }
    .greeting-date { font-size: 11px; color: #697586; }
    .header-actions { display: flex; gap: 16px; position: absolute; top: 16px; right: 20px; }
    .icon-btn {
      background: none; border: none; color: #8A95A8; cursor: pointer;
      padding: 0; display: flex; position: relative;
    }
    .badge {
      position: absolute; top: -2px; right: -4px;
      width: 8px; height: 8px; background: #E05252; border-radius: 50%;
    }
    .user-menu-wrap { position: relative; }
    .user-menu {
      position: absolute; top: 100%; right: 0; margin-top: 8px;
      background: #1E2530; border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px; padding: 4px; z-index: 200;
      min-width: 160px; box-shadow: 0 4px 16px rgba(0,0,0,0.4);
    }
    .user-menu-item {
      display: flex; align-items: center; gap: 8px;
      width: 100%; background: none; border: none; padding: 10px 14px;
      color: #F0F2F5; font-family: 'Inter', sans-serif;
      font-size: 13px; font-weight: 500; text-align: left;
      cursor: pointer; border-radius: 8px;
    }
    .user-menu-item:hover { background: rgba(255,255,255,0.05); }
    .user-menu-item.logout { color: #E05252; }
    .user-menu-item.logout:hover { background: rgba(224,82,82,0.1); }

    /* Hero Card */
    .hero-card {
      background: #161B24; border-radius: 24px; border: 1px solid rgba(228,179,233,0.15);
      padding: 20px; margin-top: 16px;
    }

    /* Saldo */
    .balance-section { }
    .balance-label { font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500; color: #8A95A8; }
    .balance-amount { display: flex; align-items: baseline; gap: 4px; margin-top: 4px; }
    .currency { font-family: 'Inter', sans-serif; font-size: 24px; font-weight: 600; color: #8A95A8; }
    .amount { font-family: 'Inter', sans-serif; font-size: 36px; font-weight: 800; color: #F0F2F5; }

    /* Variation Pill */
    .variation-pill {
      display: inline-flex; align-items: center; gap: 4px; margin-top: 8px;
      padding: 3px 10px; border-radius: 99px; font-family: 'Inter', sans-serif;
      font-size: 11px; font-weight: 600;
    }
    .variation-pill.positive { background: rgba(21,196,140,0.12); color: #15C48C; }
    .variation-pill.negative { background: rgba(224,82,82,0.12); color: #E05252; }
    .variation-pill.neutral { background: rgba(138,149,168,0.12); color: #8A95A8; }

    /* Progress bar */
    .progress-section { margin-top: 16px; }
    .progress-labels { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .progress-labels span { font-family: 'Inter', sans-serif; font-size: 11px; }
    .progress-labels span:first-child { color: #8A95A8; }
    .progress-labels span:last-child { color: #697586; }
    .progress-track { height: 10px; background: #1E2530; border-radius: 99px; overflow: hidden; position: relative; }
    .progress-fill { height: 100%; border-radius: 99px; transition: width 0.5s ease; }
    .progress-fill.green { background: linear-gradient(90deg, #15C48C, #20D9A0); }
    .progress-fill.yellow { background: linear-gradient(90deg, #C99A0A, #DBAF1A); }
    .progress-fill.red { background: linear-gradient(90deg, #E05252, #F06A6A); }
    .progress-marker {
      position: absolute; top: -3px; width: 2px; height: 16px;
      background: #697586; border-radius: 1px;
      transform: translateX(-50%);
    }
    .progress-warning {
      display: flex; align-items: center; gap: 4px; margin-top: 8px;
      font-family: 'Inter', sans-serif; font-size: 11px; color: #C99A0A;
    }

    /* Summary cards */
    .summary-row { display: flex; gap: 12px; margin-top: 16px; }
    .summary-card {
      flex: 1; background: #161B24; border-radius: 20px; border: 1px solid rgba(255,255,255,0.06);
      padding: 16px; display: flex; flex-direction: column; gap: 4px;
    }
    .summary-icon { font-size: 20px; margin-bottom: 4px; font-weight: 700; }
    .income-icon { color: #15C48C; }
    .expense-icon { color: #E05252; }
    .summary-label { font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500; color: #8A95A8; }
    .summary-amount { font-family: 'Inter', sans-serif; font-size: 18px; font-weight: 700; }
    .summary-card.income .summary-amount { color: #15C48C; }
    .summary-card.expense .summary-amount { color: #E05252; }
    .summary-variation { font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 500; margin-top: 2px; }
    .summary-variation.positive { color: #15C48C; }
    .summary-variation.negative { color: #E05252; }

    /* Traffic light */
    .traffic-light {
      margin-top: 16px; padding: 14px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.06);
    }
    .traffic-light.green { background: rgba(21,196,140,0.08); }
    .traffic-light.yellow { background: rgba(201,154,10,0.08); }
    .traffic-light.red { background: rgba(224,82,82,0.08); }
    .tl-content { display: flex; flex-direction: column; gap: 4px; }
    .tl-header { display: flex; align-items: center; gap: 8px; }
    .tl-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .green .tl-dot { background: #15C48C; }
    .yellow .tl-dot { background: #C99A0A; }
    .red .tl-dot { background: #E05252; }
    .tl-header strong { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; }
    .green .tl-header strong { color: #15C48C; }
    .yellow .tl-header strong { color: #C99A0A; }
    .red .tl-header strong { color: #E05252; }
    .tl-sub { font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 400; color: #8A95A8; margin-left: 18px; }
    .tl-amount-warning {
      font-family: 'Inter', sans-serif; font-size: 20px; font-weight: 700;
      color: #C99A0A; margin-left: 18px; margin-top: 4px;
    }

    /* Sections */
    .section { margin-top: 24px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .section-header h3 { font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 600; color: #F0F2F5; margin: 0; }
    .section-link { font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500; color: #E4B3E9; text-decoration: none; }

    /* Transaction list */
    .tx-list { display: flex; flex-direction: column; }
    .tx-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
    .tx-item.last { border: none; }
    .tx-icon {
      width: 36px; height: 36px; border-radius: 12px; display: flex;
      align-items: center; justify-content: center; flex-shrink: 0;
      font-size: 16px;
    }
    .tx-icon.income { background: rgba(21,196,140,0.1); }
    .tx-icon.expense { background: rgba(224,82,82,0.1); }
    .tx-category-icon { line-height: 1; }
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
    .debt-stats { display: flex; justify-content: space-between; margin-top: 12px; }
    .debt-stats span { font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 500; color: #8A95A8; }
    .debt-bar { height: 8px; background: #1E2530; border-radius: 999px; margin-top: 8px; overflow: hidden; }
    .debt-fill { height: 100%; background: #E05252; border-radius: 999px; }
    .debt-label { font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 400; color: #8A95A8; margin-top: 6px; display: block; }

    /* Card items */
    .ci-card { background: #161B24; border-radius: 20px; border: 1px solid rgba(255,255,255,0.06); padding: 12px 16px; }
    .ci-item { padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
    .ci-item:last-child { border: none; }
    .ci-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
    .ci-left { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .ci-name { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500; color: #F0F2F5; }
    .ci-card-name { font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 400; color: #697586; }
    .ci-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
    .ci-amount { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; color: #F0F2F5; }
    .ci-badge { font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 500; border-radius: 999px; padding: 2px 8px; }
    .ci-badge.recurring { background: rgba(91,141,239,0.15); color: #5B8DEF; }
    .ci-badge.installment { background: rgba(201,154,10,0.12); color: #C99A0A; }
    .ci-total { display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.06); margin-top: 4px; }
    .ci-total span:first-child { font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500; color: #8A95A8; }
    .ci-total span:last-child { font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 700; color: #F0F2F5; }

    /* Saving goal */
    .saving-card { background: #161B24; border-radius: 20px; border: 1px solid rgba(255,255,255,0.06); padding: 16px; }
    .saving-header { display: flex; align-items: center; gap: 8px; color: #C99A0A; margin-bottom: 12px; }
    .saving-name { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; color: #F0F2F5; }
    .saving-bar { height: 6px; background: #1E2530; border-radius: 999px; overflow: hidden; }
    .saving-fill { height: 100%; background: #C99A0A; border-radius: 999px; }
    .saving-empty-bar { height: 100%; border: 1.5px dashed #697586; border-radius: 999px; background: transparent; }
    .saving-bar.empty { background: transparent; }
    .saving-footer { display: flex; justify-content: space-between; margin-top: 8px; }
    .saving-footer span { font-family: 'Inter', sans-serif; font-size: 13px; }
    .saving-footer span:first-child { font-weight: 500; color: #8A95A8; }
    .saving-footer span:last-child { font-weight: 600; color: #C99A0A; }
    .saving-motivation { font-family: 'Inter', sans-serif; font-size: 12px; font-style: italic; color: #697586; margin: 8px 0 0; text-align: center; }

    /* Tasks */
    .tasks-empty { text-align: center; padding: 24px 0; }
    .tasks-empty p { font-size: 13px; color: #8A95A8; margin: 0; }
    .tasks-list { display: flex; flex-direction: column; margin-top: 12px; }
    .task-item { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: #161B24; border-radius: 16px; margin-bottom: 8px; cursor: pointer; transition: opacity 150ms; }
    .task-item:active { opacity: 0.8; }
    .task-priority { width: 4px; height: 36px; border-radius: 2px; flex-shrink: 0; }
    .task-info { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .task-title { font-size: 14px; font-weight: 500; color: #F0F2F5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .task-meta { font-size: 12px; color: #697586; }
    .task-arrow { flex-shrink: 0; }

    /* FAB */
    .fab-container { position: fixed; bottom: 80px; right: 20px; display: flex; flex-direction: column-reverse; align-items: flex-end; gap: 8px; z-index: 90; }
    .fab-menu { display: flex; flex-direction: column-reverse; gap: 8px; }
    .fab-option {
      display: flex; align-items: center; gap: 8px; padding: 10px 16px; border: none;
      border-radius: 999px; font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600;
      cursor: pointer; white-space: nowrap; opacity: 0; transform: translateY(16px);
      animation: fabOptionIn 0.2s ease forwards;
    }
    @keyframes fabOptionIn {
      to { opacity: 1; transform: translateY(0); }
    }
    .fab-option.income { background: #161B24; color: #15C48C; animation-delay: 0.05s; }
    .fab-option.task { background: #161B24; color: #E4B3E9; animation-delay: 0.1s; }
    .fab-option.expense { background: #161B24; color: #E05252; }
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
  state: 'loading' | 'loaded' | 'error' = 'loading'
  data: DashboardData = {
    balance: 0,
    variationPercent: 0,
    totalIncomes: 0,
    totalExpenses: 0,
    recentTransactions: [],
    debts: { active: 0, total: 0, paidPercent: 0 },
    cardItems: [],
    cardItemsTotal: 0,
    pendingTasks: [],
    pendingTasksCount: 0,
  }
  unreadCount = 0
  fabOpen = false
  showUserMenu = false
  readonly BUDGET_THRESHOLD = 60

  get greeting(): string {
    const hour = new Date().getHours()
    if (hour < 12) return 'Buenos días'
    if (hour < 18) return 'Buenas tardes'
    return 'Buenas noches'
  }

  get currentDate(): string {
    const now = new Date()
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
    return `${dayNames[now.getDay()]} ${now.getDate()} de ${monthNames[now.getMonth()]}`
  }

  get userName(): string {
    const user = this.auth.user as any
    return user?.name || 'Usuario'
  }

  getCategoryIcon(category: string): string {
    return CATEGORY_ICONS[category] || '📦'
  }

  getPriorityColor(priority: string): string {
    const colors: Record<string, string> = { high: '#E05252', medium: '#C99A0A', low: '#15C48C' }
    return colors[priority] || '#8A95A8'
  }

  constructor(
    private router: Router,
    private api: ApiService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadDashboard()
    this.loadUnreadCount()
    setTimeout(() => {
      if (this.state === 'loading') {
        this.state = 'error'
        this.cdr.markForCheck()
      }
    }, 10000)
  }

  cardItemTrackBy(_index: number, item: DashboardCardItem): string {
    return item._id
  }

  private loadDashboard(): void {
    this.state = 'loading'
    this.cdr.markForCheck()
    this.api.get<DashboardData>('/dashboard')
      .subscribe({
        next: (res) => {
          this.data = res.data
          this.state = 'loaded'
          this.cdr.markForCheck()
        },
        error: () => {
          this.state = 'error'
          this.cdr.markForCheck()
        },
      })
  }

  private loadUnreadCount(): void {
    this.api.get<{ count: number }>('/notifications/unread-count')
      .subscribe({
        next: (res) => {
          this.unreadCount = res.data.count
          this.cdr.markForCheck()
        },
        error: () => {
          this.unreadCount = 0
          this.cdr.markForCheck()
        },
      })
  }

  get expenseRatio(): number {
    if (!this.data.totalIncomes) return 0
    return Math.round((this.data.totalExpenses / this.data.totalIncomes) * 100)
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
    const remaining = this.data.totalIncomes - this.data.totalExpenses
    if (r < 60) return `+$ ${remaining.toLocaleString('es-AR')}`
    if (r <= 85) return `Restan $ ${remaining.toLocaleString('es-AR')}`
    return `-$ ${Math.abs(remaining).toLocaleString('es-AR')}`
  }

  get savingPercent(): number {
    if (!this.data.savingGoal || this.data.savingGoal.target === 0) return 0
    const percent = (this.data.savingGoal.current / this.data.savingGoal.target) * 100
    if (percent > 0 && percent < 1) return 1
    return Math.round(percent * 100) / 100
  }

  onNotificationClick(): void {
    this.unreadCount = 0
  }

  onProfileClick(): void {
    this.router.navigate(['/perfil'])
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu
  }

  logout(): void {
    this.auth.logout()
  }

  onAddMovement(): void {
    this.router.navigate(['/movimientos'])
  }

  onFabAction(type: 'income' | 'expense' | 'task'): void {
    this.fabOpen = false
    if (type === 'income') {
      this.router.navigate(['/ingresos/nuevo'])
    } else if (type === 'expense') {
      this.router.navigate(['/gastos/nuevo'])
    } else if (type === 'task') {
      this.router.navigate(['/tareas'])
    }
  }
}
