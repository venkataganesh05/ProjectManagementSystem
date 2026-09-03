import { useState, useEffect, useCallback } from 'react';
import { Project, ProjectStatus } from '../types/project.types';
import { projectsApi } from '../api/projects.api';
import { ApiError } from '../types/api.types';

export function useProjects(initialPageSize: number = 6) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState<string>('');
  const [status, setStatus] = useState<ProjectStatus | undefined>(undefined);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await projectsApi.getProjects({
        search: search.trim() || undefined,
        status,
        pageNumber,
        pageSize,
      });

      setProjects(result.items);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  }, [search, status, pageNumber, pageSize]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
    search,
    setSearch: (s: string) => {
      setSearch(s);
      setPageNumber(1);
    },
    status,
    setStatus: (st?: ProjectStatus) => {
      setStatus(st);
      setPageNumber(1);
    },
    pageNumber,
    setPageNumber,
    pageSize,
    setPageSize,
    totalCount,
    totalPages,
    refreshProjects: fetchProjects,
  };
}
