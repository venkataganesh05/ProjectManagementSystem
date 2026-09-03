import { TaskItem } from './task.types';

export type ProjectStatus = 'Planned' | 'Active' | 'Completed' | 'Archived';

export interface Project {
  id: number;
  name: string;
  description: string | null;
  status: ProjectStatus;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string | null;
  totalTasks: number;
  completedTasks: number;
  tasks: TaskItem[];
}

export interface CreateProjectDto {
  name: string;
  description?: string | null;
  status: ProjectStatus;
  startDate: string;
  endDate?: string | null;
}

export interface UpdateProjectDto {
  name: string;
  description?: string | null;
  status: ProjectStatus;
  startDate: string;
  endDate?: string | null;
}

export interface ProjectFilterParams {
  search?: string;
  status?: ProjectStatus;
  pageNumber?: number;
  pageSize?: number;
}
