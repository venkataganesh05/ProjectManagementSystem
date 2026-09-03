import React, { useState } from 'react';
import { useProject } from '../hooks/useProject';
import { useTasks } from '../hooks/useTasks';
import { useUpdateProject } from '../hooks/useUpdateProject';
import { useDeleteProject } from '../hooks/useDeleteProject';
import { useCreateTask } from '../hooks/useCreateTask';
import { useUpdateTask } from '../hooks/useUpdateTask';
import { useDeleteTask } from '../hooks/useDeleteTask';
import { TaskItem, TaskStatus } from '../types/task.types';
import { ProjectFormData } from '../schemas/project.schema';
import { TaskFormData } from '../schemas/task.schema';
import { ProjectStatusBadge } from '../components/projects/ProjectStatusBadge';
import { ProjectForm } from '../components/projects/ProjectForm';
import { TaskFilters } from '../components/tasks/TaskFilters';
import { TaskList } from '../components/tasks/TaskList';
import { TaskForm } from '../components/tasks/TaskForm';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';
import { Button } from '../components/common/Button';
import { ArrowLeft, Plus, Calendar, Edit2, Trash2 } from 'lucide-react';

interface ProjectDetailPageProps {
  projectId: number;
  onBack: () => void;
  onProjectDeleted: () => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({
  projectId,
  onBack,
  onProjectDeleted,
}) => {
  const { project, loading: isProjectLoading, error: projectError, refreshProject } =
    useProject(projectId);

  const {
    tasks,
    loading: isTasksLoading,
    error: tasksError,
    search,
    setSearch,
    status,
    setStatus,
    priority,
    setPriority,
    sortBy,
    setSortBy,
    sortDescending,
    setSortDescending,
    pageNumber,
    setPageNumber,
    pageSize,
    totalCount,
    totalPages,
    clearFilters,
    refreshTasks,
  } = useTasks(projectId, 10);

  const { updateProject, loading: isUpdatingProject } = useUpdateProject();
  const { deleteProject, loading: isDeletingProject } = useDeleteProject();

  const { createTask, loading: isCreatingTask } = useCreateTask();
  const { updateTask, loading: isUpdatingTask } = useUpdateTask();
  const { deleteTask, loading: isDeletingTask } = useDeleteTask();

  // Dialog / Modal states
  const [isEditProjectOpen, setIsEditProjectOpen] = useState<boolean>(false);
  const [isDeleteProjectOpen, setIsDeleteProjectOpen] = useState<boolean>(false);

  const [isTaskFormOpen, setIsTaskFormOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [deletingTask, setDeletingTask] = useState<TaskItem | null>(null);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handleEditProjectSubmit = async (data: ProjectFormData) => {
    try {
      await updateProject(projectId, {
        name: data.name,
        description: data.description || null,
        status: data.status,
        startDate: data.startDate,
        endDate: data.endDate || null,
      });
      setIsEditProjectOpen(false);
      refreshProject();
    } catch {
      // Handled by hook
    }
  };

  const handleDeleteProjectConfirm = async () => {
    try {
      await deleteProject(projectId);
      setIsDeleteProjectOpen(false);
      onProjectDeleted();
    } catch {
      // Handled by hook
    }
  };

  const handleOpenCreateTask = () => {
    setEditingTask(null);
    setIsTaskFormOpen(true);
  };

  const handleOpenEditTask = (task: TaskItem) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  };

  const handleTaskFormSubmit = async (data: TaskFormData) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, {
          title: data.title,
          description: data.description || null,
          status: data.status,
          priority: data.priority,
          dueDate: data.dueDate || null,
          assigneeName: data.assigneeName || null,
          assigneeEmail: data.assigneeEmail || null,
        });
      } else {
        await createTask(projectId, {
          title: data.title,
          description: data.description || null,
          status: data.status,
          priority: data.priority,
          dueDate: data.dueDate || null,
          assigneeName: data.assigneeName || null,
          assigneeEmail: data.assigneeEmail || null,
        });
      }
      setIsTaskFormOpen(false);
      refreshTasks();
      refreshProject();
    } catch {
      // Handled by hook
    }
  };

  const handleQuickStatusChange = async (task: TaskItem, newStatus: TaskStatus) => {
    try {
      await updateTask(task.id, {
        title: task.title,
        description: task.description,
        status: newStatus,
        priority: task.priority,
        dueDate: task.dueDate,
        assigneeName: task.assigneeName,
        assigneeEmail: task.assigneeEmail,
      });
      refreshTasks();
      refreshProject();
    } catch {
      // Handled by hook
    }
  };

  const handleDeleteTaskConfirm = async () => {
    if (!deletingTask) return;
    try {
      await deleteTask(deletingTask.id);
      setDeletingTask(null);
      refreshTasks();
      refreshProject();
    } catch {
      // Handled by hook
    }
  };

  if (isProjectLoading) {
    return <LoadingSpinner message="Loading project details..." />;
  }

  if (projectError || !project) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Projects
        </Button>
        <ErrorState
          message={projectError || 'Project not found.'}
          onRetry={refreshProject}
        />
      </div>
    );
  }

  const completionPercentage =
    project.totalTasks > 0
      ? Math.round((project.completedTasks / project.totalTasks) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Navigation and Actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Projects
        </Button>

        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsEditProjectOpen(true)}
          >
            <Edit2 className="h-3.5 w-3.5 mr-1.5" />
            Edit Project
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDeleteProjectOpen(true)}
            className="text-rose-600 hover:bg-rose-50"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Delete Project
          </Button>
        </div>
      </div>

      {/* Project Overview Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
              <ProjectStatusBadge status={project.status} />
            </div>
            <p className="text-sm text-slate-600 max-w-3xl">
              {project.description || 'No description provided.'}
            </p>
          </div>

          <Button onClick={handleOpenCreateTask} className="self-start md:self-auto flex-shrink-0">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Task
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-100 text-sm">
          <div>
            <span className="text-xs text-slate-500 font-medium block">Timeline</span>
            <div className="flex items-center gap-1.5 mt-0.5 text-slate-700 font-medium text-xs">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>{formatDate(project.startDate)}</span>
              {project.endDate && (
                <>
                  <span>→</span>
                  <span>{formatDate(project.endDate)}</span>
                </>
              )}
            </div>
          </div>

          <div>
            <span className="text-xs text-slate-500 font-medium block">Total Tasks</span>
            <span className="mt-0.5 text-base font-bold text-slate-900 block">
              {project.totalTasks}
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-500 font-medium block">Completed</span>
            <span className="mt-0.5 text-base font-bold text-emerald-600 block">
              {project.completedTasks}
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-500 font-medium block">Completion Rate</span>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-slate-700">
                {completionPercentage}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Task Section Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-3">Tasks</h2>

        {/* Filters */}
        <TaskFilters
          search={search}
          status={status}
          priority={priority}
          sortBy={sortBy}
          sortDescending={sortDescending}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          onPriorityChange={setPriority}
          onSortByChange={setSortBy}
          onSortDescendingToggle={() => setSortDescending(!sortDescending)}
          onClearFilters={clearFilters}
        />

        {/* Tasks List */}
        {isTasksLoading ? (
          <LoadingSpinner message="Loading tasks..." />
        ) : tasksError ? (
          <ErrorState message={tasksError} onRetry={refreshTasks} />
        ) : (
          <TaskList
            tasks={tasks}
            totalCount={totalCount}
            totalPages={totalPages}
            pageNumber={pageNumber}
            pageSize={pageSize}
            onPageChange={setPageNumber}
            onStatusChange={handleQuickStatusChange}
            onEdit={handleOpenEditTask}
            onDelete={(t) => setDeletingTask(t)}
            onAddTask={handleOpenCreateTask}
          />
        )}
      </div>

      {/* Create / Edit Task Modal */}
      <TaskForm
        isOpen={isTaskFormOpen}
        task={editingTask}
        projectName={project.name}
        isLoading={isCreatingTask || isUpdatingTask}
        onClose={() => setIsTaskFormOpen(false)}
        onSubmit={handleTaskFormSubmit}
      />

      {/* Edit Project Modal */}
      <ProjectForm
        isOpen={isEditProjectOpen}
        project={project}
        isLoading={isUpdatingProject}
        onClose={() => setIsEditProjectOpen(false)}
        onSubmit={handleEditProjectSubmit}
      />

      {/* Delete Project Confirmation Modal */}
      <ConfirmDialog
        isOpen={isDeleteProjectOpen}
        title={`Delete Project "${project.name}"?`}
        message={`Are you sure you want to delete this project? This will automatically cascade delete all ${project.totalTasks} associated tasks. This cannot be undone.`}
        confirmLabel="Delete Project & All Tasks"
        isDangerous={true}
        isLoading={isDeletingProject}
        onConfirm={handleDeleteProjectConfirm}
        onCancel={() => setIsDeleteProjectOpen(false)}
      />

      {/* Delete Task Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deletingTask}
        title={`Delete Task "${deletingTask?.title}"?`}
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete Task"
        isDangerous={true}
        isLoading={isDeletingTask}
        onConfirm={handleDeleteTaskConfirm}
        onCancel={() => setDeletingTask(null)}
      />
    </div>
  );
};
