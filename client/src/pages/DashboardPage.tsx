import React from "react";
import { useProjects } from "../hooks/useProjects";
import { ProjectStatusBadge } from "../components/projects/ProjectStatusBadge";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { ErrorState } from "../components/common/ErrorState";
import { FolderKanban, CheckCircle2, Clock, Archive, Plus, ArrowRight } from "lucide-react";
import { Project, ProjectStatus } from "../types/project.types";
import { Pagination } from "../components/common/Pagination";

interface DashboardPageProps {
  onNavigateToProjects: () => void;
  onSelectProject: (project: Project) => void;
  onOpenCreateProject: () => void;
}

const statusTabs: { label: string; value?: ProjectStatus }[] = [
  { label: "All Projects", value: undefined },
  { label: "Active",       value: "Active" },
  { label: "Planned",      value: "Planned" },
  { label: "Completed",    value: "Completed" },
  { label: "Archived",     value: "Archived" },
];

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onSelectProject,
  onOpenCreateProject,
}) => {
  const {
    projects,
    loading,
    error,
    status,
    setStatus,
    totalCount,
    totalPages,
    pageNumber,
    setPageNumber,
    pageSize,
    refreshProjects,
  } = useProjects(8);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const statCards = [
    {
      label: "Total Projects",
      value: totalCount,
      icon: <FolderKanban className="h-5 w-5" />,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Active",
      value: projects.filter((p) => p.status === "Active").length,
      icon: <Clock className="h-5 w-5" />,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Planned",
      value: projects.filter((p) => p.status === "Planned").length,
      icon: <Archive className="h-5 w-5" />,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Completed",
      value: projects.filter((p) => p.status === "Completed").length,
      icon: <CheckCircle2 className="h-5 w-5" />,
      color: "bg-blue-50 text-blue-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Overview of your engineering projects and task progress.
          </p>
        </div>
        <button
          onClick={onOpenCreateProject}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3"
          >
            <div className={`rounded-lg p-2.5 ${card.color}`}>{card.icon}</div>
            <div>
              <p className="text-xs font-medium text-slate-500">{card.label}</p>
              <p className="text-2xl font-bold text-slate-900">
                {loading ? "—" : card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Projects Table with Filter Tabs */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Filter Tabs Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 gap-3 flex-wrap">
          <div className="flex items-center space-x-1 overflow-x-auto">
            {statusTabs.map((tab) => {
              const isSelected = status === tab.value;
              return (
                <button
                  key={tab.label}
                  onClick={() => setStatus(tab.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    isSelected
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          <span className="text-xs text-slate-400 whitespace-nowrap">
            {loading ? "" : `${totalCount} project${totalCount !== 1 ? "s" : ""}`}
          </span>
        </div>

        {/* Project List */}
        {loading ? (
          <div className="p-6">
            <LoadingSpinner message="Loading projects..." />
          </div>
        ) : error ? (
          <div className="p-6">
            <ErrorState message={error} onRetry={refreshProjects} />
          </div>
        ) : projects.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <FolderKanban className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-700">No projects found</p>
            <p className="text-xs text-slate-500 mt-1">
              {status
                ? `No ${status.toLowerCase()} projects. Try a different filter.`
                : "Get started by creating your first project."}
            </p>
            {!status && (
              <button
                onClick={onOpenCreateProject}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Create Project
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-100">
              {projects.map((project) => {
                const pct =
                  project.totalTasks > 0
                    ? Math.round((project.completedTasks / project.totalTasks) * 100)
                    : 0;
                return (
                  <div
                    key={project.id}
                    onClick={() => onSelectProject(project)}
                    className="flex items-center gap-4 px-6 py-3.5 hover:bg-indigo-50/40 cursor-pointer transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                        {project.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Started {formatDate(project.startDate)}
                      </p>
                    </div>
                    <ProjectStatusBadge status={project.status} size="sm" />
                    <div className="hidden sm:flex flex-col items-end gap-1 w-28">
                      <span className="text-xs text-slate-600 font-medium">
                        {project.completedTasks}/{project.totalTasks} tasks
                      </span>
                      <div className="h-1.5 w-28 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="border-t border-slate-100 px-4">
              <Pagination
                currentPage={pageNumber}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                onPageChange={setPageNumber}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
