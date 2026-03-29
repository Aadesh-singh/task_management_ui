import { Component, input, output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Task, TaskStatus } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.css'
})
export class TaskCardComponent {
  task = input.required<Task>();

  delete = output<string>();
  edit = output<Task>();

  onDelete(event: Event) {
    event.stopPropagation();
    this.delete.emit(this.task()._id);
  }

  onEdit(event: Event) {
    event.stopPropagation();
    this.edit.emit(this.task());
  }
}
