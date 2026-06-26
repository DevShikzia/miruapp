import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router, RouterLink } from '@angular/router'
import { AuthService } from '../../services/auth.service'
import { NgIf } from '@angular/common'
import { Subject, takeUntil } from 'rxjs'

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, NgIf],
  template: `
    <div class="register-page">
      <div class="header">
        <img src="assets/miru-logo-horizontal.svg" alt="Miru" class="logo" />
      </div>

      <div class="welcome">
        <h1>Creá tu cuenta</h1>
        <p>Empezá a organizar tus finanzas con tu familia.</p>
      </div>

      <form (ngSubmit)="onSubmit()" class="form">
        <!-- Nombre -->
        <div class="field">
          <label for="name">Nombre</label>
          <div class="input-wrapper" [class.error]="errors['name']">
            <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <input
              id="name"
              [(ngModel)]="name"
              name="name"
              type="text"
              placeholder="Tu nombre"
              autocomplete="name"
              (input)="validateField('name')"
            />
          </div>
          <p class="field-error" *ngIf="errors['name']">{{ errors['name'] }}</p>
        </div>

        <!-- Email -->
        <div class="field">
          <label for="email">Email</label>
          <div class="input-wrapper" [class.error]="errors['email']">
            <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            <input
              id="email"
              [(ngModel)]="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              autocomplete="email"
              (input)="validateField('email')"
            />
          </div>
          <p class="field-error" *ngIf="errors['email']">{{ errors['email'] }}</p>
        </div>

        <!-- Contraseña -->
        <div class="field">
          <label for="password">Contraseña</label>
          <div class="input-wrapper" [class.error]="errors['password']">
            <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <input
              id="password"
              [(ngModel)]="password"
              name="password"
              [type]="showPassword ? 'text' : 'password'"
              placeholder="Mínimo 8 caracteres"
              autocomplete="new-password"
              (input)="validateField('password')"
            />
            <button type="button" class="toggle-pw" (click)="showPassword = !showPassword" tabindex="-1">
              <svg *ngIf="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg *ngIf="showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
            </button>
          </div>
          <p class="field-error" *ngIf="errors['password']">{{ errors['password'] }}</p>
        </div>

        <!-- Confirmar contraseña -->
        <div class="field">
          <label for="confirm">Confirmar contraseña</label>
          <div class="input-wrapper" [class.error]="errors['confirm']">
            <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <input
              id="confirm"
              [(ngModel)]="confirm"
              name="confirm"
              type="password"
              placeholder="Repetí tu contraseña"
              autocomplete="new-password"
              (input)="validateField('confirm')"
            />
          </div>
          <p class="field-error" *ngIf="errors['confirm']">{{ errors['confirm'] }}</p>
        </div>

        <!-- Términos -->
        <label class="terms">
          <input type="checkbox" [(ngModel)]="termsAccepted" name="terms" (change)="validateField('terms')" />
          <span class="check-box" [class.checked]="termsAccepted">
            <svg *ngIf="termsAccepted" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0C0F14" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </span>
          <span class="terms-text">
            Acepto los <a href="#">Términos y Condiciones</a> y la <a href="#">Política de Privacidad</a>
          </span>
        </label>

        <!-- Error general -->
        <p class="error-msg" *ngIf="generalError">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          {{ generalError }}
        </p>

        <!-- Submit -->
        <button type="submit" class="btn-primary" [disabled]="!canSubmit || loading">
          <span *ngIf="!loading">Crear cuenta</span>
          <span *ngIf="loading" class="btn-spinner"></span>
        </button>
      </form>

      <!-- Separator -->
      <div class="separator">
        <span>o registrate con</span>
      </div>

      <!-- Google -->
      <div class="google-btn-area">
        <button class="btn-google">
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/><path fill="none" d="M1 1h22v22H1z"/></svg>
          Continuar con Google
        </button>
        <div #googleBtn class="google-btn-overlay"></div>
      </div>

      <!-- Login link -->
      <p class="login-link">
        ¿Ya tenés cuenta?<a routerLink="/login"> Iniciá sesión</a>
      </p>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .register-page {
      min-height: 100vh;
      background: #0C0F14;
      padding: 64px 24px 0;
      display: flex;
      flex-direction: column;
    }
    .header {
      display: flex;
      justify-content: center;
    }
    .logo { height: 40px; }
    .welcome {
      margin-top: 32px;
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
      margin-top: 28px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 6px;
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
      height: 48px;
      border: 1px solid transparent;
      transition: border-color 150ms ease-in-out;
    }
    .input-wrapper:focus-within { border-color: #E4B3E9; }
    .input-wrapper.error { border-color: #F87171; }
    .input-icon { color: #697586; flex-shrink: 0; }
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
    .input-wrapper input::placeholder { color: #697586; }
    .toggle-pw {
      background: none;
      border: none;
      color: #697586;
      cursor: pointer;
      padding: 0;
      display: flex;
      flex-shrink: 0;
    }
    .field-error {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 11px;
      font-weight: 400;
      color: #F87171;
      margin: 0;
    }

    /* Terms */
    .terms {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      cursor: pointer;
      margin-top: 2px;
    }
    .terms input { display: none; }
    .check-box {
      width: 18px;
      height: 18px;
      border-radius: 4px;
      border: 1.5px solid #697586;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 1px;
      transition: background 150ms, border-color 150ms;
    }
    .check-box.checked {
      background: #E4B3E9;
      border-color: #E4B3E9;
    }
    .terms-text {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 12px;
      font-weight: 400;
      color: #8A95A8;
      line-height: 1.4;
    }
    .terms-text a {
      font-weight: 500;
      color: #E4B3E9;
      text-decoration: none;
    }
    .terms-text a:hover { text-decoration: underline; }

    .error-msg {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #F87171;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 12px;
      font-weight: 400;
      margin: 0;
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
      transition: background 150ms, opacity 150ms;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .btn-primary:hover:not(:disabled) { background: #D89BDF; }
    .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-spinner {
      display: inline-block;
      width: 22px;
      height: 22px;
      border: 2px solid rgba(255,255,255,0.2);
      border-top-color: #FFFFFF;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Separator */
    .separator {
      margin-top: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      color: #697586;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 12px;
      font-weight: 400;
    }
    .separator::before, .separator::after {
      content: '';
      flex: 1;
      height: 1px;
      background: rgba(255,255,255,0.06);
    }

    .google-btn-area {
      margin-top: 14px;
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

    .login-link {
      margin-top: 28px;
      text-align: center;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      font-weight: 400;
      color: #8A95A8;
    }
    .login-link a {
      font-weight: 600;
      color: #E4B3E9;
      text-decoration: none;
    }
    .login-link a:hover { text-decoration: underline; }
  `]
})
export class RegisterComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('googleBtn', { static: false }) googleBtnRef!: ElementRef

  name = ''
  email = ''
  password = ''
  confirm = ''
  termsAccepted = false
  loading = false
  showPassword = false
  generalError = ''

  errors: Record<string, string> = {}
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

  get canSubmit(): boolean {
    return !!(this.name && this.email && this.password && this.confirm && this.termsAccepted && !Object.values(this.errors).some(Boolean))
  }

  validateField(field: string): void {
    switch (field) {
      case 'name':
        if (!this.name) this.errors['name'] = ''
        else if (this.name.length < 2) this.errors['name'] = 'Mínimo 2 caracteres'
        else if (this.name.length > 50) this.errors['name'] = 'Máximo 50 caracteres'
        else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(this.name)) this.errors['name'] = 'Solo letras y espacios'
        else this.errors['name'] = ''
        break
      case 'email':
        if (!this.email) this.errors['email'] = ''
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) this.errors['email'] = 'Email inválido'
        else this.errors['email'] = ''
        break
      case 'password':
        if (!this.password) this.errors['password'] = ''
        else if (this.password.length < 8) this.errors['password'] = 'Mínimo 8 caracteres'
        else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(this.password)) this.errors['password'] = 'Debe tener al menos 1 letra y 1 número'
        else this.errors['password'] = ''
        if (this.confirm) this.validateField('confirm')
        break
      case 'confirm':
        if (!this.confirm) this.errors['confirm'] = ''
        else if (this.confirm !== this.password) this.errors['confirm'] = 'Las contraseñas no coinciden'
        else this.errors['confirm'] = ''
        break
    }
  }

  onSubmit(): void {
    if (!this.canSubmit || this.loading) return
    this.loading = true
    this.generalError = ''
    this.auth.register(this.name, this.email, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.loading = false
        this.generalError = 'No pudimos crear tu cuenta. Intentá de nuevo.'
      },
    })
  }

  private handleGoogleResponse(credential: string): void {
    if (!credential) return
    this.loading = true
    this.generalError = ''
    this.auth.googleLogin(credential).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.loading = false
        this.generalError = 'No pudimos iniciar sesión con Google.'
      },
    })
  }
}
