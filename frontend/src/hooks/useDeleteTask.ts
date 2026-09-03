import { useState } from 'react';
import { tasksApi } from '../api/tasks.api';
import { ApiError } from '../types/api.types';

export function useDeleteTask() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const deleteTask = async (id: number): Promise<string> => {
    try {
      setLoading(true);
      setError(null);
      return await tasksApi.deleteTask(id);
    } catch (err) {
      const apiErr = err as ApiError;
      const msg = apiErr.errors?.join(', ') || apiErr.message || 'Failed to delete task.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteTask, loading, error };
}
