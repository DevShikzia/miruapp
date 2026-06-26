import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { NgClass, NgIf, NgFor } from '@angular/common'

interface Slide {
  title: string
  description: string
}

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [NgIf, NgFor],
  template: `
    <div class="onboarding"
      (touchstart)="onTouchStart($event)"
      (touchend)="onTouchEnd($event)">
      <div class="slides-wrapper" [style.transform]="'translateX(-' + currentSlide * 100 + 'vw)'">
        <!-- Slide 1 -->
        <div class="slide">
          <div class="illustration illustration-1">
            <div class="float-icon icon-house">🏠</div>
            <div class="float-icon icon-heart">❤️</div>
            <div class="float-icon icon-money">💰</div>
            <div class="float-icon icon-star">⭐</div>
            <div class="center-icon">
              <img src="assets/miru-icon.svg" alt="Miru" />
              <div class="glow-ring"></div>
            </div>
          </div>
          <div class="text-content">
            <h2>Tu familia, organizada.</h2>
            <p>Miru te ayuda a ver tus ingresos, gastos y deudas en un solo lugar. Sin estrés, sin complicaciones.</p>
          </div>
        </div>

        <!-- Slide 2 -->
        <div class="slide">
          <div class="illustration illustration-2">
            <div class="abstract-figure figure-left"></div>
            <div class="connection-line"></div>
            <div class="abstract-figure figure-right"></div>
            <div class="float-icon icon-check-2">✓</div>
            <div class="float-icon icon-heart-2">❤️</div>
            <div class="float-icon icon-coin-2">🪙</div>
          </div>
          <div class="text-content">
            <h2>Compártanlo en familia.</h2>
            <p>Invitá a tu pareja o a quien quieras. Todos ven lo mismo, en tiempo real. Sin secretos, sin sorpresas.</p>
          </div>
        </div>

        <!-- Slide 3 -->
        <div class="slide">
          <div class="illustration illustration-3">
            <div class="kawaii-cat">
              <div class="cat-body">
                <div class="cat-ear ear-left"></div>
                <div class="cat-ear ear-right"></div>
                <div class="cat-face">
                  <div class="cat-eye eye-left"></div>
                  <div class="cat-eye eye-right"></div>
                  <div class="cat-nose"></div>
                  <div class="cat-mouth"></div>
                </div>
              </div>
            </div>
            <div class="star star-1">✦</div>
            <div class="star star-2">✦</div>
            <div class="star star-3">✦</div>
            <div class="star star-4">✦</div>
          </div>
          <div class="text-content">
            <h2>Miru no te juzga.</h2>
            <p>Acá no hay errores, solo pasos. Te acompañamos a ordenar tu economía a tu ritmo, con calma.</p>
          </div>
        </div>
      </div>

      <!-- Bottom controls -->
      <div class="controls">
        <div class="dots">
          <span
            *ngFor="let _ of [0,1,2]; let i = index"
            class="dot"
            [class.active]="i === currentSlide"
            (click)="currentSlide = i">
          </span>
        </div>

        <ng-container *ngIf="currentSlide < 2; else lastSlide">
          <button class="btn-primary" (click)="next()">Siguiente</button>
          <button class="btn-skip" (click)="skip()">Saltar</button>
        </ng-container>

        <ng-template #lastSlide>
          <button class="btn-primary" (click)="goToRegister()">Crear mi cuenta</button>
          <button class="btn-secondary" (click)="goToLogin()">Ya tengo cuenta</button>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .onboarding {
      min-height: 100vh;
      background: #0C0F14;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
    }
    .slides-wrapper {
      display: flex;
      flex: 1;
      transition: transform 150ms ease-in-out;
      width: 300%;
    }
    .slide {
      width: calc(100% / 3);
      display: flex;
      flex-direction: column;
      padding: 0 32px;
      flex-shrink: 0;
    }

    /* --- Illustrations --- */
    .illustration {
      flex: 1;
      min-height: 55vh;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      margin: 32px 0;
      background: #161B24;
      border-radius: 32px;
    }

    /* Slide 1 - floating icons */
    .illustration-1 { position: relative; }
    .float-icon {
      position: absolute;
      font-size: 28px;
      animation: float 3s ease-in-out infinite;
    }
    .icon-house { top: 18%; left: 18%; animation-delay: 0s; }
    .icon-heart { top: 15%; right: 20%; animation-delay: 0.6s; }
    .icon-money { bottom: 22%; left: 22%; animation-delay: 1.2s; }
    .icon-star { bottom: 18%; right: 18%; animation-delay: 0.3s; }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }

    .center-icon {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .center-icon img {
      width: 48px;
      height: 48px;
      position: relative;
      z-index: 1;
    }
    .glow-ring {
      position: absolute;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(228,179,233,0.12) 0%, transparent 70%);
    }

    /* Slide 2 - abstract figures */
    .illustration-2 {
      position: relative;
      gap: 16px;
    }
    .abstract-figure {
      width: 72px;
      height: 72px;
      border-radius: 50%;
    }
    .figure-left {
      background: linear-gradient(135deg, #E4B3E9, #B98AEF);
      opacity: 0.8;
    }
    .figure-right {
      background: linear-gradient(135deg, #B98AEF, #E4B3E9);
      opacity: 0.8;
    }
    .connection-line {
      width: 40px;
      height: 2px;
      background: #E4B3E9;
      border-radius: 1px;
    }
    .icon-check-2 { top: 20%; left: 22%; font-size: 22px; color: #E4B3E9; }
    .icon-heart-2 { top: 18%; right: 22%; font-size: 22px; }
    .icon-coin-2 { bottom: 22%; left: 40%; font-size: 22px; }
    .figure-left, .figure-right {
      animation: float 3s ease-in-out infinite;
    }
    .figure-right { animation-delay: 0.5s; }

    /* Slide 3 - kawaii cat */
    .illustration-3 { position: relative; }
    .kawaii-cat {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .cat-body {
      position: relative;
      width: 80px;
      height: 64px;
      background: linear-gradient(180deg, #F2C8F6, #B98AEF);
      border-radius: 40px 40px 20px 20px;
    }
    .cat-ear {
      position: absolute;
      top: -12px;
      width: 0;
      height: 0;
      border-left: 12px solid transparent;
      border-right: 12px solid transparent;
      border-bottom: 16px solid #D4A8E0;
    }
    .ear-left { left: 8px; }
    .ear-right { right: 8px; }
    .cat-face {
      position: absolute;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 8px;
      width: 48px;
    }
    .cat-eye {
      width: 8px;
      height: 8px;
      background: #0C0F14;
      border-radius: 50%;
    }
    .cat-nose {
      width: 6px;
      height: 4px;
      background: #F2C8F6;
      border-radius: 50%;
      margin-top: 4px;
    }
    .cat-mouth {
      width: 100%;
      height: 4px;
      display: flex;
      justify-content: center;
      gap: 4px;
      margin-top: 2px;
    }
    .cat-mouth::before,
    .cat-mouth::after {
      content: '';
      width: 6px;
      height: 3px;
      border-radius: 0 0 6px 6px;
      border: 1.5px solid #0C0F14;
      border-top: none;
    }
    .star {
      position: absolute;
      color: #E4B3E9;
      font-size: 16px;
      animation: twinkle 2s ease-in-out infinite;
    }
    .star-1 { top: 16%; left: 20%; animation-delay: 0s; }
    .star-2 { top: 14%; right: 20%; animation-delay: 0.5s; }
    .star-3 { bottom: 24%; left: 28%; animation-delay: 1s; }
    .star-4 { bottom: 20%; right: 24%; animation-delay: 1.5s; }
    @keyframes twinkle {
      0%, 100% { opacity: 0.3; transform: scale(0.8); }
      50% { opacity: 1; transform: scale(1.1); }
    }

    /* --- Text content --- */
    .text-content {
      text-align: center;
      padding: 0 0 24px;
    }
    .text-content h2 {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 28px;
      font-weight: 700;
      color: #F0F2F5;
      margin: 0 0 12px;
    }
    .text-content p {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      font-weight: 400;
      color: #8A95A8;
      line-height: 1.6;
      margin: 0;
    }

    /* --- Controls --- */
    .controls {
      padding: 24px 24px 48px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    .dots {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .dot {
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.2s;
      background: rgba(255,255,255,0.15);
      width: 6px;
      height: 6px;
    }
    .dot.active {
      background: #E4B3E9;
      width: 8px;
      height: 8px;
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
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .btn-primary:hover { opacity: 0.9; }
    .btn-secondary {
      width: 100%;
      height: 44px;
      background: transparent;
      color: #E4B3E9;
      border: 1px solid #E4B3E9;
      border-radius: 999px;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    .btn-secondary:hover { background: rgba(228,179,233,0.08); }
    .btn-skip {
      background: none;
      border: none;
      color: #8A95A8;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 14px;
      cursor: pointer;
      padding: 4px;
    }
    .btn-skip:hover { color: #F0F2F5; }
  `]
})
export class OnboardingComponent {
  currentSlide = 0
  private touchStartX = 0

  constructor(private router: Router) {}

  next(): void {
    if (this.currentSlide < 2) this.currentSlide++
  }

  skip(): void {
    localStorage.setItem('onboarding_visto', 'true')
    this.router.navigate(['/login'])
  }

  goToRegister(): void {
    localStorage.setItem('onboarding_visto', 'true')
    this.router.navigate(['/register'])
  }

  goToLogin(): void {
    localStorage.setItem('onboarding_visto', 'true')
    this.router.navigate(['/login'])
  }

  onTouchStart(e: TouchEvent): void {
    this.touchStartX = e.touches[0].clientX
  }

  onTouchEnd(e: TouchEvent): void {
    const diff = this.touchStartX - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0 && this.currentSlide < 2) this.currentSlide++
      else if (diff < 0 && this.currentSlide > 0) this.currentSlide--
    }
  }
}
