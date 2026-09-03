import { useState } from 'react';
import { projectsApi } from '../api/projects.api';
import { ApiError } from '../types/api.types';

export function useDeleteProject() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const deleteProject = async (id: number): Promise<string> => {
    try {
      setLoading(true);
      setError(null);
      return await projectsApi.deleteProject(id);
    } catch (err) {
      const apiErr = err as ApiError;
      const msg = apiErr.errors?.join(', ') || apiErr.message || 'Failed to delete project.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteProject, loading, error };
}
