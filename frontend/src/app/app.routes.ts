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
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'incomes', loadComponent: () => import('./pages/incomes/incomes.component').then(m => m.IncomesComponent) },
      { path: 'expenses', loadComponent: () => import('./pages/expenses/expenses.component').then(m => m.ExpensesComponent) },
      { path: 'recurring-bills', loadComponent: () => import('./pages/recurring-bills/recurring-bills.component').then(m => m.RecurringBillsComponent) },
      { path: 'debts', loadComponent: () => import('./pages/debts/debts.component').then(m => m.DebtsComponent) },
      { path: 'savings', loadComponent: () => import('./pages/savings/savings.component').then(m => m.SavingsComponent) },
    ],
  },
  { path: '**', redirectTo: '/dashboard' },
]
