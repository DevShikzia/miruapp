import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { AuthService } from '../../services/auth.service'

@Component({
  selector: 'app-splash',
  standalone: true,
  template: `
    <div class="splash">
      <div class="glow"></div>
      <div class="content">
        <img src="assets/miru-icon.svg" alt="Miru" class="logo" />
        <div class="wordmark">
          <span class="title">Miru</span>
          <span class="badge">APP</span>
        </div>
        <p class="tagline">Tu familia, sus finanzas.</p>
      </div>
      <div class="bottom">
        <div class="progress-track">
          <div class="progress-bar"></div>
        </div>
        <span class="version">v2.0.0</span>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .splash {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #0C0F14;
      position: relative;
      overflow: hidden;
    }
    .glow {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 280px;
      height: 280px;
      transform: translate(-50%, -50%);
      background: radial-gradient(circle, rgba(228,179,233,0.08) 0%, transparent 70%);
      animation: fadeInGlow 400ms ease-in-out forwards;
    }
    @keyframes fadeInGlow {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .content {
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index: 1;
      gap: 0;
    }
    .logo {
      width: 96px;
      height: 96px;
      animation: logoIn 300ms ease-in-out 150ms both;
    }
    @keyframes logoIn {
      from { opacity: 0; transform: scale(0.85); }
      to { opacity: 1; transform: scale(1); }
    }
    .wordmark {
      margin-top: 16px;
      display: flex;
      align-items: center;
      animation: fadeInText 200ms ease 350ms both;
    }
    .wordmark .title {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 28px;
      font-weight: 700;
      color: #F0F2F5;
    }
    .wordmark .badge {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 12px;
      font-weight: 500;
      color: #8A95A8;
      margin-left: 6px;
    }
    .tagline {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      font-weight: 400;
      color: #8A95A8;
      margin: 8px 0 0;
      animation: fadeInText 200ms ease 450ms both;
    }
    @keyframes fadeInText {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .bottom {
      position: absolute;
      bottom: 48px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .progress-track {
      width: 48px;
      height: 2px;
      border-radius: 999px;
      background: rgba(255,255,255,0.06);
      overflow: hidden;
    }
    .progress-bar {
      height: 100%;
      width: 0;
      background: #E4B3E9;
      border-radius: 999px;
      animation: progress 1.8s linear 500ms forwards;
    }
    @keyframes progress {
      from { width: 0; }
      to { width: 100%; }
    }
    .version {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 12px;
      font-weight: 400;
      color: #697586;
    }
    .splash.fade-out {
      animation: fadeOut 300ms ease-in-out forwards;
    }
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `]
})
export class SplashComponent implements OnInit {
  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const totalDuration = 2100
    setTimeout(() => {
      const el = document.querySelector('.splash')
      el?.classList.add('fade-out')
      setTimeout(() => {
        if (this.auth.isLoggedIn) {
          this.router.navigate(['/dashboard'])
        } else if (!localStorage.getItem('onboarding_visto')) {
          this.router.navigate(['/onboarding'])
        } else {
          this.router.navigate(['/login'])
        }
      }, 300)
    }, totalDuration)
  }
}
