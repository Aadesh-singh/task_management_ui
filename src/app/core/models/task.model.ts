export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'completed' | 'pending';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  _id: string,
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  createdAt: string;
  assignee?: {
    name: string;
    avatarUrl: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  teamId?: string;
  assigneeId?: string;
}
