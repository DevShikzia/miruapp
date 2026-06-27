import { Routes } from '@angular/router'
import { authGuard, loginGuard } from './guards/auth.guard'

export const routes: Routes = [
  { path: '', redirectTo: '/splash', pathMatch: 'full' },
  {
    path: 'splash',
    loadComponent: () => import('./pages/splash/splash.component').then(m => m.SplashComponent),
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./pages/onboarding/onboarding.component').then(m => m.OnboardingComponent),
  },
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [loginGuard],
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'ingresos/nuevo',
    loadComponent: () => import('./pages/incomes/create-income/create-income.component').then(m => m.CreateIncomeComponent),
  },
  {
    path: 'gastos/nuevo',
    loadComponent: () => import('./pages/expenses/create-expense/create-expense.component').then(m => m.CreateExpenseComponent),
  },
  {
    path: 'ingresos/editar/:id',
    loadComponent: () => import('./pages/incomes/edit-income/edit-income.component').then(m => m.EditIncomeComponent),
  },
  {
    path: 'gastos/editar/:id',
    loadComponent: () => import('./pages/expenses/edit-expense/edit-expense.component').then(m => m.EditExpenseComponent),
  },
  {
    path: 'deudas/crear',
    loadComponent: () => import('./pages/debts/create-debt/create-debt.component').then(m => m.CreateDebtComponent),
  },
  {
    path: 'deudas/editar/:id',
    loadComponent: () => import('./pages/debts/edit-debt/edit-debt.component').then(m => m.EditDebtComponent),
  },
  {
    path: 'deudas/:id',
    loadComponent: () => import('./pages/debts/debt-detail/debt-detail.component').then(m => m.DebtDetailComponent),
  },
  {
    path: 'ahorros/crear',
    loadComponent: () => import('./pages/savings/create-saving/create-saving.component').then(m => m.CreateSavingComponent),
  },
  {
    path: 'ahorros/editar/:id',
    loadComponent: () => import('./pages/savings/edit-saving/edit-saving.component').then(m => m.EditSavingComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'movimientos', loadComponent: () => import('./pages/movimientos/movimientos.component').then(m => m.MovimientosComponent) },
      { path: 'deudas', loadComponent: () => import('./pages/debts/debts.component').then(m => m.DebtsComponent) },
      { path: 'ahorros', loadComponent: () => import('./pages/savings/savings.component').then(m => m.SavingsComponent) },
      { path: 'familia', loadComponent: () => import('./pages/familia/familia.component').then(m => m.FamiliaComponent) },
    ],
  },
  { path: '**', redirectTo: '/dashboard' },
]
