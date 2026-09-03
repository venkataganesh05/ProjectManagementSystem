import { apiClient } from './client';
import { ApiResponse, PagedResult } from '../types/api.types';
import { TaskItem, CreateTaskDto, UpdateTaskDto, TaskFilterParams } from '../types/task.types';

export const tasksApi = {
  getTasks: async (projectId: number, params?: TaskFilterParams): Promise<PagedResult<TaskItem>> => {
    const response = await apiClient.get<ApiResponse<PagedResult<TaskItem>>>(`/projects/${projectId}/tasks`, {
      params,
    });
    return response.data.data;
  },

  getTask: async (id: number): Promise<TaskItem> => {
    const response = await apiClient.get<ApiResponse<TaskItem>>(`/tasks/${id}`);
    return response.data.data;
  },

  createTask: async (projectId: number, data: CreateTaskDto): Promise<TaskItem> => {
    const response = await apiClient.post<ApiResponse<TaskItem>>(`/projects/${projectId}/tasks`, data);
    return response.data.data;
  },

  updateTask: async (id: number, data: UpdateTaskDto): Promise<TaskItem> => {
    const response = await apiClient.put<ApiResponse<TaskItem>>(`/tasks/${id}`, data);
    return response.data.data;
  },

  deleteTask: async (id: number): Promise<string> => {
    const response = await apiClient.delete<ApiResponse<string>>(`/tasks/${id}`);
    return response.data.data;
  },
};
