import { Component } from '@angular/core'

@Component({
  selector: 'app-familia',
  standalone: true,
  template: `<h1>Familia</h1>`,
  styles: [`
    :host { display: block; padding: 24px 20px; }
    h1 { color: #F0F2F5; font-size: 24px; font-weight: 700; font-family: 'Inter', sans-serif; margin: 0; }
  `]
})
export class FamiliaComponent {}
