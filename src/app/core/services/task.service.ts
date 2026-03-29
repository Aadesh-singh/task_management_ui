import { Injectable, signal, computed, inject } from '@angular/core';
import { Task, TaskStatus } from '../models/task.model';
import { ApiService } from './api.service';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiService = inject(ApiService);

  // State leveraging modern Angular Signals
  private tasksSignal = signal<Task[]>([]);

  // Computed views of the state for efficient UI binding
  tasks = this.tasksSignal.asReadonly();

  todoTasks = computed(() => this.tasksSignal().filter(t => t.status === 'todo'));
  inProgressTasks = computed(() => this.tasksSignal().filter(t => t.status === 'in-progress'));
  reviewTasks = computed(() => this.tasksSignal().filter(t => t.status === 'review'));
  doneTasks = computed(() => this.tasksSignal().filter(t => t.status === 'completed'));
  pendingTasks = computed(() => this.tasksSignal().filter(t => t.status === 'pending'));

  tasksStats = computed(() => {
    const all = this.tasksSignal();
    return {
      total: all.length,
      completed: all.filter(t => t.status === 'completed').length,
    };
  });

  constructor() { }

  fetchTasks(): Observable<any> {
    return this.apiService.get<any>('tasks/getAllTasks').pipe(
      tap(res => {
        const data = res.tasks || res.data || res;
        console.log('tasks: ', data.tasks)
        this.tasksSignal.set(Array.isArray(data.tasks) ? data.tasks : []);
      })
    );
  }

  createTask(task: any): Observable<any> {
    return this.apiService.post<any>('tasks/create-task', task).pipe(
      tap(() => this.fetchTasks().subscribe())
    );
  }

  updateTask(taskId: string, task: any): Observable<any> {
    return this.apiService.patch<any>('tasks/update-task?task=' + taskId, task).pipe(
      tap(() => this.fetchTasks().subscribe())
    );
  }

  addTask(task: Omit<Task, 'id' | 'createdAt'>) { // Keep for back-compat if needed briefly
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    this.tasksSignal.update(tasks => [newTask, ...tasks]);
  }

  updateTaskStatus(id: string, status: TaskStatus) {
    this.tasksSignal.update(tasks =>
      tasks.map(t => t.id === id ? { ...t, status } : t)
    );
  }

  deleteTask(id: string) {
    return this.apiService.delete<any>('tasks/delete-task?task=' + id).pipe(
      tap(() => this.fetchTasks().subscribe())
    );
  }

  // Seed Data for visual wow-factor
  private getInitialTasks(): Task[] {
    return [];
    // return [
    //   {
    //     id: '1',
    //     title: 'Design Authentication Flow',
    //     description: 'Create wireframes and user flows for the new SSO integration.',
    //     priority: 'high',
    //     status: 'in-progress',
    //     dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days
    //     createdAt: new Date().toISOString(),
    //     assignee: { name: 'Alice Smith', avatarUrl: 'https://i.pravatar.cc/150?u=alice' }
    //   },
    //   {
    //     id: '2',
    //     title: 'Migrate to Angular Signals',
    //     description: 'Update the core state management to use the new Signals pattern.',
    //     priority: 'urgent',
    //     status: 'todo',
    //     dueDate: new Date(Date.now() + 86400000 * 1).toISOString(),
    //     createdAt: new Date().toISOString(),
    //     assignee: { name: 'Bob Jones', avatarUrl: 'https://i.pravatar.cc/150?u=bob' }
    //   },
    //   {
    //     id: '3',
    //     title: 'Optimize Database Queries',
    //     description: 'Review slow query logs and add indexes to the tasks table.',
    //     priority: 'medium',
    //     status: 'review',
    //     dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    //     createdAt: new Date().toISOString(),
    //   },
    //   {
    //     id: '4',
    //     title: 'Update Tailwind Config',
    //     description: 'Add new theme variants and dynamic scale animations.',
    //     priority: 'low',
    //     status: 'done',
    //     dueDate: new Date(Date.now() - 86400000 * 1).toISOString(),
    //     createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    //     assignee: { name: 'Alice Smith', avatarUrl: 'https://i.pravatar.cc/150?u=alice' }
    //   }
    // ];
  }
}
