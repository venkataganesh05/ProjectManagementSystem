import { useState } from 'react';
import { CreateTaskDto, TaskItem } from '../types/task.types';
import { tasksApi } from '../api/tasks.api';
import { ApiError } from '../types/api.types';

export function useCreateTask() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createTask = async (projectId: number, data: CreateTaskDto): Promise<TaskItem> => {
    try {
      setLoading(true);
      setError(null);
      return await tasksApi.createTask(projectId, data);
    } catch (err) {
      const apiErr = err as ApiError;
      const msg = apiErr.errors?.join(', ') || apiErr.message || 'Failed to create task.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createTask, loading, error };
}
