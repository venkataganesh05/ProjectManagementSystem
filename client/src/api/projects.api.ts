import { apiClient } from './client';
import { ApiResponse, PagedResult } from '../types/api.types';
import { Project, CreateProjectDto, UpdateProjectDto, ProjectFilterParams } from '../types/project.types';

export const projectsApi = {
  getProjects: async (params?: ProjectFilterParams): Promise<PagedResult<Project>> => {
    const response = await apiClient.get<ApiResponse<PagedResult<Project>>>('/projects', { params });
    return response.data.data;
  },

  getProject: async (id: number): Promise<Project> => {
    const response = await apiClient.get<ApiResponse<Project>>(`/projects/${id}`);
    return response.data.data;
  },

  createProject: async (data: CreateProjectDto): Promise<Project> => {
    const response = await apiClient.post<ApiResponse<Project>>('/projects', data);
    return response.data.data;
  },

  updateProject: async (id: number, data: UpdateProjectDto): Promise<Project> => {
    const response = await apiClient.put<ApiResponse<Project>>(`/projects/${id}`, data);
    return response.data.data;
  },

  deleteProject: async (id: number): Promise<string> => {
    const response = await apiClient.delete<ApiResponse<string>>(`/projects/${id}`);
    return response.data.data;
  },
};
