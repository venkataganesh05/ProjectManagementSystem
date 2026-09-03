import { useState } from 'react';
import { UpdateTaskDto, TaskItem } from '../types/task.types';
import { tasksApi } from '../api/tasks.api';
import { ApiError } from '../types/api.types';

export function useUpdateTask() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateTask = async (id: number, data: UpdateTaskDto): Promise<TaskItem> => {
    try {
      setLoading(true);
      setError(null);
      return await tasksApi.updateTask(id, data);
    } catch (err) {
      const apiErr = err as ApiError;
      const msg = apiErr.errors?.join(', ') || apiErr.message || 'Failed to update task.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateTask, loading, error };
}
