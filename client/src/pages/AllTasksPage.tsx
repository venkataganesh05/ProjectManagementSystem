import React from "react";
import { useProjects } from "../hooks/useProjects";
import { ProjectStatusBadge } from "../components/projects/ProjectStatusBadge";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { ErrorState } from "../components/common/ErrorState";
import { CheckSquare, ArrowRight, CheckCircle2 } from "lucide-react";
import { Project } from "../types/project.types";

interface AllTasksPageProps {
  onSelectProject: (project: Project) => void;
}

export const AllTasksPage: React.FC<AllTasksPageProps> = ({ onSelectProject }) => {
  const { projects, loading, error, totalCount, refreshProjects } = useProjects(50);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tasks</h1>
        <p className="mt-1 text-sm text-slate-500">
          Task progress across all projects. Click a project to view and manage its tasks.
        </p>
      </div>

      {/* Task Progress Table by Project */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">
            Tasks by Project
            {!loading && (
              <span className="ml-2 text-xs font-normal text-slate-400">
                ({totalCount} {totalCount === 1 ? "project" : "projects"})
              </span>
            )}
          </h2>
        </div>

        {loading ? (
          <div className="p-6">
            <LoadingSpinner message="Loading task data..." />
          </div>
        ) : error ? (
          <div className="p-6">
            <ErrorState message={error} onRetry={refreshProjects} />
          </div>
        ) : projects.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <CheckSquare className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-700">No projects yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Create a project first, then add tasks to it.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm text-left">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Project</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Tasks</th>
                  <th className="px-4 py-3.5 min-w-[180px]">Progress</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {projects.map((project) => {
                  const pct =
                    project.totalTasks > 0
                      ? Math.round((project.completedTasks / project.totalTasks) * 100)
                      : 0;
                  return (
                    <tr
                      key={project.id}
                      onClick={() => onSelectProject(project)}
                      className="group hover:bg-indigo-50/40 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {project.name}
                        </p>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <ProjectStatusBadge status={project.status} size="sm" />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-slate-600">
                        <span className="flex items-center gap-1 text-xs font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500" />
                          {project.completedTasks} / {project.totalTasks} done
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-slate-600">
                            <span>{pct}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => onSelectProject(project)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-indigo-300 hover:text-indigo-700 transition-colors shadow-sm"
                        >
                          View Tasks
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
