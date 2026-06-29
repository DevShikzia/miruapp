import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core'
import { NgIf, NgFor } from '@angular/common'
import { TaskData, TaskSubtaskData, TASK_CATEGORIES, TASK_PRIORITIES } from '@shared/types/task.types'
import { TaskCategoryLabelPipe, TaskCategoryIconPipe } from '../../pipes/task-category-label.pipe'
import { TaskPriorityLabelPipe, TaskPriorityColorPipe } from '../../pipes/task-priority-label.pipe'

@Component({
  selector: 'app-task-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, NgFor, TaskCategoryLabelPipe, TaskCategoryIconPipe, TaskPriorityLabelPipe, TaskPriorityColorPipe],
  template: `
    <div class="task-card" [class.completed]="task.isCompleted">
      <button class="toggle-btn" [class.checked]="task.isCompleted" (click)="onToggle.emit(task._id); $event.stopPropagation()">
        <svg *ngIf="task.isCompleted" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      </button>
      <div class="task-content" (click)="onClick.emit(task._id)">
        <div class="task-header">
          <div class="priority-dot" [style.background]="task.priority | taskPriorityColor"></div>
          <span class="priority-label" [style.color]="task.priority | taskPriorityColor">{{ task.priority | taskPriorityLabel }}</span>
          <span class="task-title">{{ task.title }}</span>
        </div>

        <p class="task-description" *ngIf="task.description">{{ task.description }}</p>

        <div class="task-meta">
          <span class="meta-chip category">
            <span class="meta-icon">{{ task.category | taskCategoryIcon }}</span>
            {{ task.category | taskCategoryLabel }}
          </span>
          <span class="meta-chip date" *ngIf="task.dueDate">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
            {{ formatDate(task.dueDate) }}
          </span>
        </div>

        <div class="subtasks-section" *ngIf="task.subtasks && task.subtasks.length > 0">
          <div class="subtask-progress">
            <span class="subtask-count">{{ completedSubtasks(task) }}/{{ task.subtasks.length }}</span>
            <div class="subtask-track">
              <div class="subtask-fill" [style.width.%]="subtaskProgress(task)"></div>
            </div>
          </div>
          <div class="subtask-list">
            <div class="subtask-item" *ngFor="let sub of task.subtasks.slice(0, 3)" [class.done]="sub.completed">
              <span class="subtask-check">{{ sub.completed ? '✓' : '○' }}</span>
              <span class="subtask-label">{{ sub.label }}</span>
            </div>
            <div class="subtask-more" *ngIf="task.subtasks.length > 3">
              +{{ task.subtasks.length - 3 }} más
            </div>
          </div>
        </div>

        <div class="task-footer">
          <span class="footer-info" *ngIf="task.createdBy">
            Creado por {{ task.createdBy.name }}
          </span>
          <span class="footer-info" *ngIf="task.assignedTo">
            → Asignado a {{ task.assignedTo.name }}
          </span>
        </div>

        <div class="overdue-badge" *ngIf="isOverdue(task)">Vencida</div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .task-card {
      background: #161B24;
      border-radius: 20px;
      border: 1px solid rgba(255,255,255,0.06);
      padding: 12px 16px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      position: relative;
      transition: opacity 150ms;
    }
    .task-card.completed { opacity: 0.6; }

    .toggle-btn {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 2px solid #697586;
      background: transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 4px;
      transition: all 150ms;
    }
    .toggle-btn:hover { border-color: #15C48C; }
    .toggle-btn.checked { background: #15C48C; border-color: #15C48C; }
    .toggle-btn.checked svg { stroke: #0C0F14; }

    .task-content {
      flex: 1;
      min-width: 0;
      cursor: pointer;
    }

    .task-header { display: flex; align-items: center; gap: 8px; }
    .priority-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .priority-label { font-size: 11px; font-weight: 600; flex-shrink: 0; }
    .task-title { font-size: 14px; font-weight: 600; color: #F0F2F5; flex: 1; }

    .task-description { font-size: 12px; color: #8A95A8; margin: 8px 0 0; line-height: 1.4; }

    .task-meta { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
    .meta-chip { display: flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 500; color: #8A95A8; background: rgba(255,255,255,0.04); padding: 4px 8px; border-radius: 6px; }
    .meta-icon { font-size: 10px; }

    .subtasks-section { margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.04); }
    .subtask-progress { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .subtask-count { font-size: 11px; font-weight: 600; color: #8A95A8; flex-shrink: 0; }
    .subtask-track { flex: 1; height: 4px; background: #1E2530; border-radius: 999px; overflow: hidden; }
    .subtask-fill { height: 100%; background: #E4B3E9; border-radius: 999px; transition: width 300ms ease; }
    .subtask-list { display: flex; flex-direction: column; gap: 4px; }
    .subtask-item { display: flex; align-items: center; gap: 6px; }
    .subtask-item.done .subtask-label { text-decoration: line-through; opacity: 0.5; }
    .subtask-check { font-size: 10px; color: #15C48C; flex-shrink: 0; }
    .subtask-label { font-size: 12px; color: #F0F2F5; }
    .subtask-more { font-size: 11px; color: #697586; margin-top: 2px; }

    .task-footer { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
    .footer-info { font-size: 10px; color: #697586; }

    .overdue-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      font-size: 10px;
      font-weight: 600;
      color: #E05252;
      background: rgba(224,82,82,0.15);
      padding: 2px 6px;
      border-radius: 4px;
    }
  `]
})
export class TaskCardComponent {
  @Input({ required: true }) task!: TaskData
  @Output() onToggle = new EventEmitter<string>()
  @Output() onClick = new EventEmitter<string>()

  completedSubtasks(task: TaskData): number {
    return task.subtasks.filter(s => s.completed).length
  }

  subtaskProgress(task: TaskData): number {
    if (task.subtasks.length === 0) return 0
    return (this.completedSubtasks(task) / task.subtasks.length) * 100
  }

  isOverdue(task: TaskData): boolean {
    if (!task.dueDate || task.isCompleted) return false
    const today = new Date().toISOString().split('T')[0]
    return task.dueDate < today
  }

  formatDate(date: string): string {
    const d = new Date(date)
    const day = d.getDate().toString().padStart(2, '0')
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    return `${day}/${month}`
  }
}