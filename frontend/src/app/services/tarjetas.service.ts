import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { ApiService } from './api.service'
import type { CreditCardData, CreateCreditCardRequest, UpdateCreditCardRequest, CardStatement } from '@shared/types/credit-card.types'
import type { ApiSuccessResponse } from '@shared/types/response.types'

export interface PayStatementRequest {
  amount: number
  paymentMethod: 'debit' | 'cash' | 'transfer' | 'credit_card'
  sourceCardId?: string
  commission?: number
  description?: string
}

@Injectable({ providedIn: 'root' })
export class TarjetasService {
  private apiUrl = '/credit-cards'

  constructor(private api: ApiService) {}

  getAll(): Observable<CreditCardData[]> {
    return this.api.get<CreditCardData[]>(this.apiUrl).pipe(map(res => res.data))
  }

  getById(id: string): Observable<CreditCardData> {
    return this.api.get<CreditCardData>(`${this.apiUrl}/${id}`).pipe(map(res => res.data))
  }

  create(data: CreateCreditCardRequest): Observable<CreditCardData> {
    return this.api.post<CreditCardData>(this.apiUrl, data).pipe(map(res => res.data))
  }

  update(id: string, data: UpdateCreditCardRequest): Observable<CreditCardData> {
    return this.api.put<CreditCardData>(`${this.apiUrl}/${id}`, data).pipe(map(res => res.data))
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`${this.apiUrl}/${id}`).pipe(map(() => undefined))
  }

  getStatement(id: string, month?: string): Observable<CardStatement> {
    const params: Record<string, string> = {}
    if (month) params['month'] = month
    return this.api.get<CardStatement>(`${this.apiUrl}/${id}/statement`, params).pipe(map(res => res.data))
  }

  payStatement(cardId: string, data: PayStatementRequest): Observable<void> {
    return this.api.post<void>(`${this.apiUrl}/${cardId}/pay-statement`, data).pipe(map(res => undefined))
  }
}
