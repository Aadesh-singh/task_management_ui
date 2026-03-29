import { Component, inject, OnInit, signal } from '@angular/core';
import { TaskService } from '../../core/services/task.service';
import { AuthService } from '../../core/services/auth.service';
import { TaskCardComponent } from '../../shared/components/task-card/task-card.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskStatus, TaskPriority } from '../../core/models/task.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TaskCardComponent, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  taskService = inject(TaskService);
  authService = inject(AuthService);
  private fb = inject(FormBuilder);

  isNewTaskModalOpen = false;
  isUpdateTaskModelOpen = false;
  isSubmittingTask = signal(false);
  teams: any[] = [];
  teamMembers: any[] = [];

  // Use computed or raw signals for reactivity
  currentUser = this.authService.currentUser;

  newTaskForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    priority: ['medium', Validators.required],
    status: ['todo', Validators.required],
    dueDate: ['', Validators.required],
    teamId: [''],
    assigneeId: ['']
  });
  editTaskId: any;

  ngOnInit(): void {
    console.log('Dashboard Component Initialized');
    this.fetchTasks();
    this.fetchTeams();
    this.setupTeamAndAssigneeLogic();
  }

  fetchTasks() {
    this.taskService.fetchTasks().subscribe({
      error: (err) => console.error('Failed to initial fetch tasks:', err)
    });
  }

  setupTeamAndAssigneeLogic() {
    const teamIdControl = this.newTaskForm.get('teamId');
    const assigneeIdControl = this.newTaskForm.get('assigneeId');

    console.log(this.currentUser())
    if (this.currentUser()?.registrationType === 'individual') return;
    // If registrationType is team, both are required
    if (this.currentUser()?.registrationType === 'team') {
      teamIdControl?.setValidators([Validators.required]);
      assigneeIdControl?.setValidators([Validators.required]);
    }

    // When teamId changes, fetch team members
    teamIdControl?.valueChanges.subscribe(id => {
      console.log('Team selection changed to:', id);
      if (id) {
        this.authService.getTeamMembers(id).subscribe({
          next: (res) => {
            this.teamMembers = res.users || res.data?.users || res;
          },
          error: (err) => {
            console.error('Failed to fetch team members:', err);
            this.teamMembers = [];
          }
        });
      } else {
        this.teamMembers = [];
        assigneeIdControl?.reset('');
      }
    });

    this.newTaskForm.updateValueAndValidity();
  }

  fetchTeams() {
    console.log('Fetching teams for dashboard...');
    this.authService.getTeams().subscribe({
      next: (data: any) => {
        console.log('Teams fetched:', data);
        this.teams = data.teams || [];
      },
      error: (err) => console.error('Failed to fetch teams in dashboard:', err)
    });
  }

  openNewTaskModal() {
    this.newTaskForm.reset({ priority: 'medium', status: 'todo', teamId: '', assigneeId: '' });
    this.isNewTaskModalOpen = true;
  }

  openUpdateTaskModal(task: any) {
    console.log('task: ', task);

    this.editTaskId = task._id;
    this.newTaskForm.patchValue({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: new Date(task.dueDate).toISOString().split('T')[0],
      teamId: task.team,
      assigneeId: task.assignee._id
    });


    this.isUpdateTaskModelOpen = true;
  }

  closeNewTaskModal() {
    this.isNewTaskModalOpen = false;
    this.isSubmittingTask.set(false);
    this.resetNewTaskForm();
  }
  closeUpdateTaskModal() {
    this.isUpdateTaskModelOpen = false;
    this.isSubmittingTask.set(false);
    this.editTaskId = null;
    this.resetNewTaskForm();
  }

  resetNewTaskForm() {
    this.newTaskForm.reset();
    this.newTaskForm.markAsUntouched();
    this.newTaskForm.markAsPristine();
  }

  onSubmitNewTask() {
    if (this.newTaskForm.valid) {
      this.isSubmittingTask.set(true);
      const formValue = this.newTaskForm.value;

      // If individual, assign to self
      const assigneeId = this.currentUser()?.registrationType === 'team'
        ? formValue.assigneeId
        : this.currentUser()?.id;

      const taskData = {
        title: formValue.title,
        description: formValue.description,
        priority: formValue.priority as TaskPriority,
        status: formValue.status as TaskStatus,
        dueDate: new Date(formValue.dueDate).toISOString(),
        teamId: formValue.teamId,
        assigneeId: assigneeId
      };

      this.taskService.createTask(taskData).subscribe({
        next: () => {
          this.closeNewTaskModal();
        },
        error: (err) => {
          console.error('Task creation failed:', err);
          this.isSubmittingTask.set(false);

        }
      });
    } else {
      this.newTaskForm.markAllAsTouched();
    }
  }

  handleDelete(id: any) {
    console.log('id: ', id)
    this.taskService.deleteTask(id).subscribe();
  }

  handleEdit(task: any) {
    // this.taskService.deleteTask(task).subscribe();
    this.openUpdateTaskModal(task);
  }

  onSubmitUpdateTask() {
    if (!this.editTaskId) {
      console.error('No task flagged to update');
      return
    };
    if (this.newTaskForm.valid) {
      this.isSubmittingTask.set(true);
      const formValue = this.newTaskForm.value;

      // If individual, assign to self
      const assigneeId = this.currentUser()?.registrationType === 'team'
        ? formValue.assigneeId
        : this.currentUser()?.id;

      const taskData = {
        title: formValue.title,
        description: formValue.description,
        priority: formValue.priority as TaskPriority,
        status: formValue.status as TaskStatus,
        dueDate: new Date(formValue.dueDate).toISOString(),
        teamId: formValue.teamId,
        assigneeId: assigneeId
      };

      this.taskService.updateTask(this.editTaskId, taskData).subscribe({
        next: () => {
          this.closeUpdateTaskModal();
        },
        error: (err) => {
          console.error('Task creation failed:', err);
          this.isSubmittingTask.set(false);
        }
      });
    } else {
      this.newTaskForm.markAllAsTouched();
    }
  }
}
