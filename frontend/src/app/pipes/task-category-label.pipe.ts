import { Pipe, PipeTransform } from '@angular/core'
import { TaskCategory, TASK_CATEGORIES } from '@shared/types/task.types'

@Pipe({
  name: 'taskCategoryLabel',
  standalone: true,
})
export class TaskCategoryLabelPipe implements PipeTransform {
  transform(value: TaskCategory): string {
    return TASK_CATEGORIES[value]?.label || value
  }
}

@Pipe({
  name: 'taskCategoryIcon',
  standalone: true,
})
export class TaskCategoryIconPipe implements PipeTransform {
  transform(value: TaskCategory): string {
    return TASK_CATEGORIES[value]?.icon || '📌'
  }
}