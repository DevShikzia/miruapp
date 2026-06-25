import { Component } from '@angular/core'
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router'

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="layout">
      <main class="content">
        <router-outlet></router-outlet>
      </main>
      <nav class="bottom-nav">
        <a routerLink="/dashboard" routerLinkActive="active" class="tab">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
          <span>Inicio</span>
        </a>
        <a routerLink="/movimientos" routerLinkActive="active" class="tab">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg>
          <span>Movimientos</span>
        </a>
        <a routerLink="/deudas" routerLinkActive="active" class="tab">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 12H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5"/><path d="M18 8V5a2 2 0 0 0-2-2h-3a2 2 0 0 0-2 2v12l-4-3"/><path d="M11 8h10"/><path d="m16 13 3 3 4-4"/></svg>
          <span>Deudas</span>
        </a>
        <a routerLink="/ahorros" routerLinkActive="active" class="tab">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2h0V5z"/><path d="M2 9v1c0 1.1.9 2 2 2h1"/><path d="M16 11h0"/></svg>
          <span>Ahorros</span>
        </a>
        <a routerLink="/familia" routerLinkActive="active" class="tab">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <span>Familia</span>
        </a>
      </nav>
    </div>
  `,
  styles: [`
    .layout {
      min-height: 100vh;
      background: #0C0F14;
      display: flex;
      flex-direction: column;
    }
    .content {
      flex: 1;
      padding-bottom: 64px;
    }
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 64px;
      background: #161B24;
      border-top: 1px solid rgba(255,255,255,0.06);
      display: flex;
      justify-content: space-around;
      align-items: center;
      z-index: 100;
    }
    .tab {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      text-decoration: none;
      color: #697586;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 10px;
      font-weight: 500;
      min-height: 44px;
      justify-content: center;
      padding: 0 8px;
      transition: color 150ms;
    }
    .tab.active {
      color: #E4B3E9;
    }
    .tab svg {
      transition: color 150ms;
    }
    .tab.active svg {
      color: #E4B3E9;
    }
  `]
})
export class MainLayoutComponent {}
