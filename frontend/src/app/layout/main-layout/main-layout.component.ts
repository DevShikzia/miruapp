import { Component } from '@angular/core'
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router'
import { NgIf } from '@angular/common'
import { AuthService } from '../../services/auth.service'

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf],
  template: `
    <div class="app-shell">
      <aside class="sidebar" [class.open]="sidebarOpen">
        <div class="sidebar-header">
          <img src="assets/miru-logo-horizontal.svg" alt="Miru" class="logo" />
        </div>
        <nav class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="active" (click)="sidebarOpen = false">
            <span class="icon">📊</span> Dashboard
          </a>
          <a routerLink="/incomes" routerLinkActive="active" (click)="sidebarOpen = false">
            <span class="icon">💰</span> Ingresos
          </a>
          <a routerLink="/expenses" routerLinkActive="active" (click)="sidebarOpen = false">
            <span class="icon">💳</span> Gastos
          </a>
          <a routerLink="/recurring-bills" routerLinkActive="active" (click)="sidebarOpen = false">
            <span class="icon">🔄</span> Recurrentes
          </a>
          <a routerLink="/debts" routerLinkActive="active" (click)="sidebarOpen = false">
            <span class="icon">📋</span> Deudas
          </a>
          <a routerLink="/savings" routerLinkActive="active" (click)="sidebarOpen = false">
            <span class="icon">🎯</span> Ahorros
          </a>
        </nav>
      </aside>
      <div class="overlay" *ngIf="sidebarOpen" (click)="sidebarOpen = false"></div>
      <main class="main-content">
        <header class="topbar">
          <button class="menu-btn" (click)="sidebarOpen = !sidebarOpen">☰</button>
          <span class="topbar-title">Miru</span>
          <button class="logout-btn" (click)="auth.logout()">Salir</button>
        </header>
        <div class="content">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .app-shell { display: flex; min-height: 100vh; background: var(--bg-primary, #0C0F14); color: var(--text-primary, #F0F2F5); }
    .sidebar { width: 240px; background: var(--bg-secondary, #14181F); padding: 24px; display: flex; flex-direction: column; gap: 24px; transition: transform 0.3s ease; }
    .sidebar-header { padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .sidebar-header .logo { height: 32px; }
    .sidebar-nav { display: flex; flex-direction: column; gap: 4px; }
    .sidebar-nav a { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 12px; color: var(--text-secondary, #8A95A8); text-decoration: none; font-size: 14px; transition: background 0.2s, color 0.2s; }
    .sidebar-nav a:hover, .sidebar-nav a.active { background: rgba(228,179,233,0.1); color: var(--brand, #E4B3E9); }
    .sidebar-nav a .icon { font-size: 18px; }
    .overlay { display: none; }
    .main-content { flex: 1; display: flex; flex-direction: column; }
    .topbar { display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; background: var(--bg-card, #1A1F26); border-bottom: 1px solid rgba(255,255,255,0.06); }
    .menu-btn { display: none; background: none; border: none; color: var(--text-primary, #F0F2F5); font-size: 20px; cursor: pointer; }
    .topbar-title { font-weight: 700; font-size: 18px; }
    .logout-btn { background: none; border: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary, #8A95A8); padding: 6px 16px; border-radius: 999px; cursor: pointer; font-size: 13px; transition: border-color 0.2s, color 0.2s; }
    .logout-btn:hover { border-color: var(--danger, #FF6B6B); color: var(--danger, #FF6B6B); }
    .content { flex: 1; padding: 24px; overflow-y: auto; }
    @media (max-width: 768px) {
      .sidebar { position: fixed; top: 0; left: 0; bottom: 0; z-index: 100; transform: translateX(-100%); }
      .sidebar.open { transform: translateX(0); }
      .overlay { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 99; }
      .menu-btn { display: block; }
    }
  `]
})
export class MainLayoutComponent {
  sidebarOpen = false
  constructor(public auth: AuthService) {}
}
