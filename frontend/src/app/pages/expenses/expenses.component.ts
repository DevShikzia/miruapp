import { Component } from '@angular/core'

@Component({
  selector: 'app-expenses',
  standalone: true,
  template: `<h1>Gastos</h1>`,
  styles: [`
    h1 { color: var(--text-primary, #F0F2F5); font-size: 24px; font-weight: 700; }
  `]
})
export class ExpensesComponent {}
