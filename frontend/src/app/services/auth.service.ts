import { Injectable, NgZone } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { BehaviorSubject, Observable, tap, Subject } from 'rxjs'
import { Router } from '@angular/router'
import { environment } from '../../environments/environment'

declare const google: any

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<unknown | null>(null)
  user$ = this.userSubject.asObservable()
  private googleCredentialSubject = new Subject<string>()
  googleCredential$ = this.googleCredentialSubject.asObservable()
  private tokenKey = 'miru_access_token'
  private refreshKey = 'miru_refresh_token'
  private googleInitialized = false

  constructor(
    private http: HttpClient,
    private router: Router,
    private ngZone: NgZone,
  ) {
    this.loadUser()
    this.initGoogle()
  }

  private initGoogle(): void {
    if (typeof google === 'undefined' || this.googleInitialized) return
    this.googleInitialized = true
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: any) => {
        if (response.credential) {
          this.ngZone.run(() => this.googleCredentialSubject.next(response.credential))
        }
      },
    })
  }

  get accessToken(): string | null {
    return localStorage.getItem(this.tokenKey)
  }

  get user(): unknown | null {
    return this.userSubject.value
  }

  get isLoggedIn(): boolean {
    return !!this.accessToken
  }

  login(email: string, password: string): Observable<unknown> {
    return this.http.post<unknown>(
      `${environment.apiUrl}/auth/login`,
      { email, password }
    ).pipe(
      tap((res: any) => this.setSession(res.data))
    )
  }

  register(name: string, email: string, password: string): Observable<unknown> {
    return this.http.post<unknown>(
      `${environment.apiUrl}/auth/register`,
      { name, email, password }
    ).pipe(
      tap((res: any) => this.setSession(res.data))
    )
  }

  renderGoogleButton(container: HTMLElement): void {
    if (typeof google === 'undefined') return
    google.accounts.id.renderButton(container, {
      type: 'icon',
      shape: 'circle',
      size: 'large',
    })
  }

  googleLogin(credential: string): Observable<unknown> {
    return this.http.post<unknown>(
      `${environment.apiUrl}/auth/google`,
      { credential }
    ).pipe(
      tap((res: any) => this.setSession(res.data))
    )
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey)
    localStorage.removeItem(this.refreshKey)
    this.userSubject.next(null)
    this.router.navigate(['/login'])
  }

  refreshToken(): Observable<unknown> {
    const refreshToken = localStorage.getItem(this.refreshKey)
    return this.http.post<unknown>(
      `${environment.apiUrl}/auth/refresh`,
      { refreshToken }
    ).pipe(
      tap((res: any) => {
        localStorage.setItem(this.tokenKey, res.data.accessToken)
        localStorage.setItem(this.refreshKey, res.data.refreshToken)
        const payload = JSON.parse(atob(res.data.accessToken.split('.')[1]))
        this.userSubject.next(payload)
      })
    )
  }

  private setSession(data: any): void {
    localStorage.setItem(this.tokenKey, data.accessToken)
    localStorage.setItem(this.refreshKey, data.refreshToken)
    this.userSubject.next(data.user)
  }

  private loadUser(): void {
    const token = this.accessToken
    if (!token) return
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      this.userSubject.next(payload)
    } catch {
      localStorage.removeItem(this.tokenKey)
      localStorage.removeItem(this.refreshKey)
    }
  }
}
