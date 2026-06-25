import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http'
import { inject } from '@angular/core'
import { AuthService } from '../services/auth.service'
import { catchError, switchMap, throwError } from 'rxjs'

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService)
  const token = authService.accessToken

  let authReq = req
  if (token) {
    authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/')) {
        return authService.refreshToken().pipe(
          switchMap(() => {
            const newToken = authService.accessToken
            const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } })
            return next(retryReq)
          }),
          catchError(() => {
            authService.logout()
            return throwError(() => error)
          })
        )
      }
      return throwError(() => error)
    })
  )
}
