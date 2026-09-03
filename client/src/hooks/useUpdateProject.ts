import { useState } from 'react';
import { UpdateProjectDto, Project } from '../types/project.types';
import { projectsApi } from '../api/projects.api';
import { ApiError } from '../types/api.types';

export function useUpdateProject() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateProject = async (id: number, data: UpdateProjectDto): Promise<Project> => {
    try {
      setLoading(true);
      setError(null);
      return await projectsApi.updateProject(id, data);
    } catch (err) {
      const apiErr = err as ApiError;
      const msg = apiErr.errors?.join(', ') || apiErr.message || 'Failed to update project.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateProject, loading, error };
}
