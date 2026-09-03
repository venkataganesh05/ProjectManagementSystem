import { useState } from 'react';
import { CreateProjectDto, Project } from '../types/project.types';
import { projectsApi } from '../api/projects.api';
import { ApiError } from '../types/api.types';

export function useCreateProject() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createProject = async (data: CreateProjectDto): Promise<Project> => {
    try {
      setLoading(true);
      setError(null);
      return await projectsApi.createProject(data);
    } catch (err) {
      const apiErr = err as ApiError;
      const msg = apiErr.errors?.join(', ') || apiErr.message || 'Failed to create project.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createProject, loading, error };
}
