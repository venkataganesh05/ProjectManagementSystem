export type TaskStatus = 'Todo' | 'InProgress' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface TaskItem {
  id: number;
  projectId: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  assigneeName: string | null;
  assigneeEmail: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateTaskDto {
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  assigneeName?: string | null;
  assigneeEmail?: string | null;
}

export interface UpdateTaskDto {
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  assigneeName?: string | null;
  assigneeEmail?: string | null;
}

export interface TaskFilterParams {
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  sortBy?: 'dueDate' | 'priority' | 'title' | 'status' | 'createdAt';
  sortDescending?: boolean;
  pageNumber?: number;
  pageSize?: number;
}
