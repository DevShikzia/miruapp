import { Pipe, PipeTransform } from '@angular/core'
import { TaskPriority, TASK_PRIORITIES } from '@shared/types/task.types'

@Pipe({
  name: 'taskPriorityLabel',
  standalone: true,
})
export class TaskPriorityLabelPipe implements PipeTransform {
  transform(value: TaskPriority): string {
    return TASK_PRIORITIES[value]?.label || value
  }
}

@Pipe({
  name: 'taskPriorityColor',
  standalone: true,
})
export class TaskPriorityColorPipe implements PipeTransform {
  transform(value: TaskPriority): string {
    return TASK_PRIORITIES[value]?.color || '#8A95A8'
  }
}