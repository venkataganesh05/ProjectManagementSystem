import { useState, useEffect, useCallback } from 'react';
import { TaskItem, TaskStatus, TaskPriority } from '../types/task.types';
import { tasksApi } from '../api/tasks.api';
import { ApiError } from '../types/api.types';

export function useTasks(projectId: number, initialPageSize: number = 10) {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState<string>('');
  const [status, setStatus] = useState<TaskStatus | undefined>(undefined);
  const [priority, setPriority] = useState<TaskPriority | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'title' | 'status' | 'createdAt'>('createdAt');
  const [sortDescending, setSortDescending] = useState<boolean>(false);

  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchTasks = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError(null);
      const result = await tasksApi.getTasks(projectId, {
        search: search.trim() || undefined,
        status,
        priority,
        sortBy,
        sortDescending,
        pageNumber,
        pageSize,
      });

      setTasks(result.items);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, [projectId, search, status, priority, sortBy, sortDescending, pageNumber, pageSize]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const clearFilters = () => {
    setSearch('');
    setStatus(undefined);
    setPriority(undefined);
    setSortBy('createdAt');
    setSortDescending(false);
    setPageNumber(1);
  };

  return {
    tasks,
    loading,
    error,
    search,
    setSearch: (s: string) => {
      setSearch(s);
      setPageNumber(1);
    },
    status,
    setStatus: (st?: TaskStatus) => {
      setStatus(st);
      setPageNumber(1);
    },
    priority,
    setPriority: (p?: TaskPriority) => {
      setPriority(p);
      setPageNumber(1);
    },
    sortBy,
    setSortBy: (sb: 'dueDate' | 'priority' | 'title' | 'status' | 'createdAt') => {
      setSortBy(sb);
      setPageNumber(1);
    },
    sortDescending,
    setSortDescending: (sd: boolean) => {
      setSortDescending(sd);
      setPageNumber(1);
    },
    pageNumber,
    setPageNumber,
    pageSize,
    setPageSize,
    totalCount,
    totalPages,
    clearFilters,
    refreshTasks: fetchTasks,
  };
}
