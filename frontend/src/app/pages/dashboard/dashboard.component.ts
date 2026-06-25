import { Component } from '@angular/core'

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `<h1>Dashboard</h1><p>Bienvenido a Miru</p>`,
  styles: [`
    :host { display: block; }
    h1 { color: var(--text-primary, #F0F2F5); font-size: 24px; font-weight: 700; margin: 0 0 8px; }
    p { color: var(--text-secondary, #8A95A8); font-size: 14px; margin: 0; }
  `]
})
export class DashboardComponent {}
