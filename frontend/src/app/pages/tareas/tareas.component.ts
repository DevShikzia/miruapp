import { Component } from '@angular/core'

@Component({
  selector: 'app-tareas',
  standalone: true,
  template: `
    <div class="placeholder">
      <h1>Lista completa de tareas</h1>
      <p>Próximamente...</p>
    </div>
  `,
  styles: [`
    .placeholder { padding: 40px 20px; text-align: center; color: #8A95A8; font-family: 'Inter', sans-serif; }
    h1 { color: #F0F2F5; font-size: 20px; margin-bottom: 8px; }
    p { font-size: 14px; }
  `]
})
export class TareasComponent {}
