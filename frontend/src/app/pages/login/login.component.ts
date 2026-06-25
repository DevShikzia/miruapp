import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router, RouterLink } from '@angular/router'
import { AuthService } from '../../services/auth.service'
import { NgIf } from '@angular/common'
import { Subject, takeUntil } from 'rxjs'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, NgIf],
  template: `
    <div class="login-page">
      <div class="header">
        <img src="assets/miru-icon.svg" alt="Miru" class="logo" />
        <span class="wordmark">Miru</span>
        <span class="badge">APP</span>
      </div>

      <div class="welcome">
        <h1>Bienvenida/o de vuelta</h1>
        <p>Ingresá a tu cuenta para ver cómo va todo.</p>
      </div>

      <form (ngSubmit)="onSubmit()" class="form">
        <!-- Email -->
        <div class="field">
          <label for="email">Email</label>
          <div class="input-wrapper" [class.error]="hasError">
            <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            <input
              id="email"
              [(ngModel)]="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              autocomplete="email"
              (focus)="hasError = false"
            />
          </div>
        </div>

        <!-- Password -->
        <div class="field">
          <label for="password">Contraseña</label>
          <div class="input-wrapper" [class.error]="hasError">
            <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <input
              id="password"
              [(ngModel)]="password"
              name="password"
              [type]="showPassword ? 'text' : 'password'"
              placeholder="Tu contraseña"
              autocomplete="current-password"
              (focus)="hasError = false"
            />
            <button type="button" class="toggle-pw" (click)="showPassword = !showPassword" tabindex="-1">
              <svg *ngIf="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg *ngIf="showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
            </button>
          </div>
          <a class="forgot" href="#">¿Olvidaste tu contraseña?</a>
        </div>

        <!-- Error -->
        <p class="error-msg" *ngIf="error">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          {{ error }}
        </p>

        <!-- Submit -->
        <button type="submit" class="btn-primary" [disabled]="loading">
          <span *ngIf="!loading">Ingresar</span>
          <span *ngIf="loading" class="dots">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </span>
        </button>
      </form>

      <!-- Separator -->
      <div class="separator">
        <span>o continuá con</span>
      </div>

      <!-- Google -->
      <div class="google-btn-area">
        <button class="btn-google">
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/><path fill="none" d="M1 1h22v22H1z"/></svg>
          Continuar con Google
        </button>
        <div #googleBtn class="google-btn-overlay"></div>
      </div>

      <!-- Register link -->
      <p class="register-link">
        ¿No tenés cuenta?<a routerLink="/register"> Registrate</a>
      </p>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .login-page {
      min-height: 100vh;
      background: #0C0F14;
      padding: 64px 24px 0;
      display: flex;
      flex-direction: column;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .logo { width: 40px; height: 40px; }
    .wordmark {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 20px;
      font-weight: 700;
      color: #F0F2F5;
    }
    .badge {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 12px;
      font-weight: 500;
      color: #8A95A8;
      margin-left: -4px;
    }
    .welcome {
      margin-top: 40px;
      text-align: left;
    }
    .welcome h1 {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 28px;
      font-weight: 700;
      color: #F0F2F5;
      margin: 0;
    }
    .welcome p {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      font-weight: 400;
      color: #8A95A8;
      margin: 8px 0 0;
    }

    /* Form */
    .form {
      margin-top: 32px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .field label {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 12px;
      font-weight: 500;
      color: #8A95A8;
    }
    .input-wrapper {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #1E2530;
      border-radius: 16px;
      padding: 0 16px;
      height: 52px;
      border: 1px solid transparent;
      transition: border-color 150ms ease-in-out;
    }
    .input-wrapper:focus-within {
      border-color: #E4B3E9;
    }
    .input-wrapper.error {
      border-color: #F87171;
    }
    .input-icon {
      color: #697586;
      flex-shrink: 0;
    }
    .input-wrapper input {
      flex: 1;
      background: none;
      border: none;
      outline: none;
      color: #F0F2F5;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      height: 100%;
    }
    .input-wrapper input::placeholder {
      color: #697586;
    }
    .toggle-pw {
      background: none;
      border: none;
      color: #697586;
      cursor: pointer;
      padding: 0;
      display: flex;
      flex-shrink: 0;
    }
    .forgot {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 12px;
      font-weight: 500;
      color: #E4B3E9;
      text-align: right;
      text-decoration: none;
    }
    .error-msg {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #F87171;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 12px;
      font-weight: 400;
      margin: -8px 0 0;
    }
    .btn-primary {
      width: 100%;
      height: 44px;
      background: #E4B3E9;
      color: #0C0F14;
      border: none;
      border-radius: 999px;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: background 150ms;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .btn-primary:hover:not(:disabled) { background: #D89BDF; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    /* Loading dots */
    .dots { display: flex; gap: 4px; }
    .dot {
      width: 5px;
      height: 5px;
      background: #0C0F14;
      border-radius: 50%;
      animation: dotPulse 1.4s ease-in-out infinite;
    }
    .dot:nth-child(2) { animation-delay: 0.2s; }
    .dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes dotPulse {
      0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
      40% { opacity: 1; transform: scale(1); }
    }

    /* Separator */
    .separator {
      margin-top: 24px;
      display: flex;
      align-items: center;
      gap: 12px;
      color: #697586;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 12px;
      font-weight: 400;
    }
    .separator::before,
    .separator::after {
      content: '';
      flex: 1;
      height: 1px;
      background: rgba(255,255,255,0.06);
    }

    /* Google button */
    .google-btn-area {
      margin-top: 16px;
      position: relative;
      width: 100%;
      height: 44px;
    }
    .btn-google {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #161B24;
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 999px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      color: #F0F2F5;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 150ms;
      z-index: 1;
      pointer-events: none;
    }
    .google-btn-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 2;
      opacity: 0.01;
    }
    .google-btn-overlay > * { width: 100% !important; height: 100% !important; }

    /* Register link */
    .register-link {
      margin-top: 32px;
      text-align: center;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      font-weight: 400;
      color: #8A95A8;
    }
    .register-link a {
      font-weight: 600;
      color: #E4B3E9;
      text-decoration: none;
    }
    .register-link a:hover { text-decoration: underline; }
  `]
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('googleBtn', { static: false }) googleBtnRef!: ElementRef

  email = ''
  password = ''
  error = ''
  loading = false
  showPassword = false
  hasError = false
  private destroy$ = new Subject<void>()

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.auth.googleCredential$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (credential) => this.handleGoogleResponse(credential),
    })
  }

  ngAfterViewInit(): void {
    if (this.googleBtnRef) {
      this.auth.renderGoogleButton(this.googleBtnRef.nativeElement)
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }

  onSubmit(): void {
    if (!this.email || !this.password) return
    this.loading = true
    this.error = ''
    this.hasError = false
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.loading = false
        this.error = 'Email o contraseña incorrectos.'
        this.hasError = true
      },
    })
  }

  private handleGoogleResponse(credential: string): void {
    if (!credential) return
    this.loading = true
    this.error = ''
    this.auth.googleLogin(credential).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.loading = false
        this.error = 'No pudimos iniciar sesión con Google.'
      },
    })
  }
}
