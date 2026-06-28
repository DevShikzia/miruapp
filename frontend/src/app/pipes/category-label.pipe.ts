import { Pipe, PipeTransform } from '@angular/core'

const LABELS: Record<string, string> = {
  food: 'Comidas',
  transport: 'Transporte',
  utilities: 'Servicios',
  rent: 'Alquiler',
  health: 'Salud',
  education: 'Educación',
  entertainment: 'Entretenimiento',
  savings: 'Ahorros',
  debt: 'Deudas',
  other: 'Otro',
}

@Pipe({
  name: 'categoryLabel',
  standalone: true,
})
export class CategoryLabelPipe implements PipeTransform {
  transform(value: string): string {
    return LABELS[value] || value
  }
}
