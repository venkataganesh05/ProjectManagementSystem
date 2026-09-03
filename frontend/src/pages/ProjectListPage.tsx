import React, { useState } from 'react';
import { useProjects } from '../hooks/useProjects';
import { useCreateProject } from '../hooks/useCreateProject';
import { useUpdateProject } from '../hooks/useUpdateProject';
import { useDeleteProject } from '../hooks/useDeleteProject';
import { Project, ProjectStatus } from '../types/project.types';
import { ProjectFormData } from '../schemas/project.schema';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectListTable } from '../components/projects/ProjectListTable';
import { ProjectForm } from '../components/projects/ProjectForm';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { Pagination } from '../components/common/Pagination';
import { Button } from '../components/common/Button';
import { Plus, Search, X, LayoutList, LayoutGrid } from 'lucide-react';

interface ProjectListPageProps {
  onSelectProject: (project: Project) => void;
}

export const ProjectListPage: React.FC<ProjectListPageProps> = ({ onSelectProject }) => {
  const {
    projects,
    loading,
    error,
    search,
    setSearch,
    status,
    setStatus,
    pageNumber,
    setPageNumber,
    pageSize,
    totalCount,
    totalPages,
    refreshProjects,
  } = useProjects(8);

  const { createProject, loading: isCreating } = useCreateProject();
  const { updateProject, loading: isUpdating } = useUpdateProject();
  const { deleteProject, loading: isDeleting } = useDeleteProject();

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  const handleOpenCreate = () => {
    setEditingProject(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (project: Project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: ProjectFormData) => {
    try {
      if (editingProject) {
        await updateProject(editingProject.id, {
          name: data.name,
          description: data.description || null,
          status: data.status,
          startDate: data.startDate,
          endDate: data.endDate || null,
        });
      } else {
        await createProject({
          name: data.name,
          description: data.description || null,
          status: data.status,
          startDate: data.startDate,
          endDate: data.endDate || null,
        });
      }
      setIsFormOpen(false);
      refreshProjects();
    } catch {
      // Error is tracked in hook
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingProject) return;
    try {
      await deleteProject(deletingProject.id);
      setDeletingProject(null);
      refreshProjects();
    } catch {
      // Error is tracked in hook
    }
  };

  const statusTabs: { label: string; value?: ProjectStatus }[] = [
    { label: 'All Projects', value: undefined },
    { label: 'Active', value: 'Active' },
    { label: 'Planned', value: 'Planned' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Archived', value: 'Archived' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Projects Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Organize engineering projects, track progress milestones, and manage team task workloads.
          </p>
        </div>

        <Button onClick={handleOpenCreate} className="self-start sm:self-auto">
          <Plus className="h-4 w-4 mr-1.5" />
          New Project
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        {/* Status Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-2 md:pb-0">
          {statusTabs.map((tab) => {
            const isSelected = status === tab.value;
            return (
              <button
                key={tab.label}
                onClick={() => setStatus(tab.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 pl-9 pr-8 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* View Mode Toggle (List / Grid) */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            <button
              onClick={() => setViewMode('list')}
              title="List View"
              aria-label="List View"
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutList className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              title="Grid View"
              aria-label="Grid View"
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <LoadingSpinner message="Loading projects..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refreshProjects} />
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects found"
          description={
            search || status
              ? "No projects match your current filters. Try changing or clearing your search."
              : "Get started by creating your engineering team's first project."
          }
          actionLabel="Create Project"
          onAction={handleOpenCreate}
        />
      ) : (
        <>
          {viewMode === 'list' ? (
            <ProjectListTable
              projects={projects}
              onSelect={onSelectProject}
              onEdit={handleOpenEdit}
              onDelete={(p) => setDeletingProject(p)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onSelect={onSelectProject}
                  onEdit={handleOpenEdit}
                  onDelete={(p) => setDeletingProject(p)}
                />
              ))}
            </div>
          )}

          <Pagination
            currentPage={pageNumber}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={setPageNumber}
          />
        </>
      )}

      {/* Project Create/Edit Modal */}
      <ProjectForm
        isOpen={isFormOpen}
        project={editingProject}
        isLoading={isCreating || isUpdating}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation Modal (Documents cascade deletion) */}
      <ConfirmDialog
        isOpen={!!deletingProject}
        title={`Delete Project "${deletingProject?.name}"?`}
        message={`Are you sure you want to delete this project? This will automatically cascade delete all ${
          deletingProject?.totalTasks || 0
        } associated tasks. This action cannot be undone.`}
        confirmLabel="Delete Project & Tasks"
        isDangerous={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingProject(null)}
      />
    </div>
  );
};
