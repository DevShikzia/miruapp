import { Component } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router, RouterLink } from '@angular/router'
import { AuthService } from '../../services/auth.service'
import { NgIf } from '@angular/common'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, NgIf],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <img src="assets/miru-icon.svg" alt="Miru" class="auth-logo" />
        <h1>Iniciar sesión</h1>
        <form (ngSubmit)="onSubmit()">
          <input [(ngModel)]="email" name="email" type="email" placeholder="Email" required />
          <input [(ngModel)]="password" name="password" type="password" placeholder="Contraseña" required />
          <button type="submit">Ingresar</button>
        </form>
        <p class="error" *ngIf="error">{{ error }}</p>
        <a routerLink="/register">Crear cuenta</a>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg-primary, #0C0F14); padding: 24px; }
    .auth-card { background: var(--bg-card, #1A1F26); border-radius: 24px; padding: 32px; width: 100%; max-width: 380px; display: flex; flex-direction: column; align-items: center; gap: 20px; border: 1px solid rgba(255,255,255,0.06); }
    .auth-logo { width: 48px; height: 48px; }
    h1 { font-size: 28px; font-weight: 700; color: var(--text-primary, #F0F2F5); margin: 0; }
    form { width: 100%; display: flex; flex-direction: column; gap: 12px; }
    input { width: 100%; padding: 14px 16px; background: var(--surface-secondary, #1E2530); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; color: var(--text-primary, #F0F2F5); font-size: 14px; box-sizing: border-box; outline: none; transition: border-color 0.2s; }
    input:focus { border-color: var(--brand, #E4B3E9); }
    button { width: 100%; padding: 14px; background: var(--brand, #E4B3E9); color: #0C0F14; border: none; border-radius: 999px; font-weight: 600; font-size: 14px; cursor: pointer; transition: opacity 0.2s; }
    button:hover { opacity: 0.9; }
    .error { color: var(--danger, #FF6B6B); font-size: 13px; margin: 0; }
    a { color: var(--brand, #E4B3E9); font-size: 13px; text-decoration: none; }
    a:hover { text-decoration: underline; }
  `]
})
export class LoginComponent {
  email = ''
  password = ''
  error = ''

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(): void {
    this.error = ''
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err: any) => this.error = err.error?.error || 'Error al iniciar sesión',
    })
  }
}
