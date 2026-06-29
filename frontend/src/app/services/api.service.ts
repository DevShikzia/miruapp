import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../environments/environment'

export interface ApiSuccessResponse<T> {
  ok: boolean
  data: T
  mensaje?: string
}

export interface ApiPaginatedResponse<T> {
  ok: boolean
  data: T[]
  total: number
  page: number
  limit: number
  mensaje?: string
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl

  constructor(private http: HttpClient) {}

  get<T>(path: string, params?: Record<string, string | boolean | undefined>): Observable<ApiSuccessResponse<T>> {
    let httpParams = new HttpParams()
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) httpParams = httpParams.set(key, String(value))
      }
    }
    return this.http.get<ApiSuccessResponse<T>>(`${this.baseUrl}${path}`, { params: httpParams })
  }

  getPaginated<T>(path: string, params?: Record<string, string | boolean | undefined>): Observable<ApiPaginatedResponse<T>> {
    let httpParams = new HttpParams()
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) httpParams = httpParams.set(key, String(value))
      }
    }
    return this.http.get<ApiPaginatedResponse<T>>(`${this.baseUrl}${path}`, { params: httpParams })
  }

  post<T>(path: string, body: unknown): Observable<ApiSuccessResponse<T>> {
    return this.http.post<ApiSuccessResponse<T>>(`${this.baseUrl}${path}`, body)
  }

  put<T>(path: string, body: unknown): Observable<ApiSuccessResponse<T>> {
    return this.http.put<ApiSuccessResponse<T>>(`${this.baseUrl}${path}`, body)
  }

  patch<T>(path: string, body?: unknown): Observable<ApiSuccessResponse<T>> {
    return this.http.patch<ApiSuccessResponse<T>>(`${this.baseUrl}${path}`, body)
  }

  delete<T>(path: string): Observable<ApiSuccessResponse<T>> {
    return this.http.delete<ApiSuccessResponse<T>>(`${this.baseUrl}${path}`)
  }
}
