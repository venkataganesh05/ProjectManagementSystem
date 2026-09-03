import React from 'react';
import { Project } from '../../types/project.types';
import { ProjectStatusBadge } from './ProjectStatusBadge';
import { Button } from '../common/Button';
import { Calendar, CheckCircle2, Edit2, Trash2, ArrowRight } from 'lucide-react';

interface ProjectListTableProps {
  projects: Project[];
  onSelect: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export const ProjectListTable: React.FC<ProjectListTableProps> = ({
  projects,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
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

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th scope="col" className="px-6 py-3.5">Project</th>
              <th scope="col" className="px-4 py-3.5">Status</th>
              <th scope="col" className="px-4 py-3.5">Timeline</th>
              <th scope="col" className="px-4 py-3.5 min-w-[180px]">Task Progress</th>
              <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {projects.map((project) => {
              const completionPercentage =
                project.totalTasks > 0
                  ? Math.round((project.completedTasks / project.totalTasks) * 100)
                  : 0;

              return (
                <tr
                  key={project.id}
                  onClick={() => onSelect(project)}
                  className="group hover:bg-indigo-50/40 cursor-pointer transition-colors"
                >
                  {/* Project Name & Description */}
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {project.name}
                    </div>
                    {project.description && (
                      <p className="mt-0.5 text-xs text-slate-500 line-clamp-1 max-w-md">
                        {project.description}
                      </p>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <ProjectStatusBadge status={project.status} size="sm" />
                  </td>

                  {/* Dates / Timeline */}
                  <td className="px-4 py-4 whitespace-nowrap text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{formatDate(project.startDate)}</span>
                      {project.endDate && (
                        <>
                          <span className="text-slate-300">→</span>
                          <span>{formatDate(project.endDate)}</span>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Progress Bar */}
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500" />
                          {project.completedTasks} / {project.totalTasks} tasks
                        </span>
                        <span className="font-semibold text-slate-700">{completionPercentage}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                          style={{ width: `${completionPercentage}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Action Buttons */}
                  <td
                    className="px-6 py-4 whitespace-nowrap text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(project)}
                        aria-label="Edit project"
                        className="text-slate-400 hover:text-indigo-600 hover:bg-white"
                        title="Edit Project"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(project)}
                        aria-label="Delete project"
                        className="text-slate-400 hover:text-rose-600 hover:bg-white"
                        title="Delete Project"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSelect(project)}
                        className="ml-2 text-xs"
                      >
                        Tasks
                        <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
