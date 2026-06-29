import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { ApiService } from './api.service'
import type { CardItem, CreateCardItemRequest, UpdateCardItemRequest } from '@shared/types/card-item.types'

@Injectable({ providedIn: 'root' })
export class CardItemService {
  constructor(private api: ApiService) {}

  getByCard(cardId: string): Observable<CardItem[]> {
    return this.api.get<CardItem[]>(`/card-items/card/${cardId}`).pipe(map(res => res.data))
  }

  getById(id: string): Observable<CardItem> {
    return this.api.get<CardItem>(`/card-items/${id}`).pipe(map(res => res.data))
  }

  create(data: CreateCardItemRequest): Observable<CardItem> {
    return this.api.post<CardItem>('/card-items', data).pipe(map(res => res.data))
  }

  update(id: string, data: UpdateCardItemRequest): Observable<CardItem> {
    return this.api.put<CardItem>(`/card-items/${id}`, data).pipe(map(res => res.data))
  }

  delete(id: string): Observable<void> {
    return this.api.delete<void>(`/card-items/${id}`).pipe(map(() => undefined))
  }

  getRate(): Observable<{ rate: number; moneda: string; casa: string }> {
    return this.api.get<{ rate: number; moneda: string; casa: string }>('/card-items/rate').pipe(map(res => res.data))
  }
}
