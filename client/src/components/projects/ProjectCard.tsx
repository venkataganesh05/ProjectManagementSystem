import React from 'react';
import { Project } from '../../types/project.types';
import { ProjectStatusBadge } from './ProjectStatusBadge';
import { Button } from '../common/Button';
import { Calendar, CheckCircle2, Edit2, Trash2, ArrowRight } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const completionPercentage =
    project.totalTasks > 0
      ? Math.round((project.completedTasks / project.totalTasks) * 100)
      : 0;

  const formatDate = (dateStr: string) => {
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
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div>
        <div className="flex items-start justify-between gap-2">
          <h3
            onClick={() => onSelect(project)}
            className="text-lg font-semibold text-slate-900 hover:text-indigo-600 cursor-pointer transition-colors line-clamp-1"
            title={project.name}
          >
            {project.name}
          </h3>
          <ProjectStatusBadge status={project.status} size="sm" />
        </div>

        <p className="mt-2 text-sm text-slate-600 line-clamp-2 min-h-[2.5rem]">
          {project.description || 'No description provided.'}
        </p>

        <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(project.startDate)}</span>
            {project.endDate && (
              <>
                <span>→</span>
                <span>{formatDate(project.endDate)}</span>
              </>
            )}
          </div>
        </div>

        {/* Task completion progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500" />
              Tasks: {project.completedTasks}/{project.totalTasks}
            </span>
            <span>{completionPercentage}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(project)}
            aria-label="Edit project"
            className="text-slate-500 hover:text-indigo-600"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(project)}
            aria-label="Delete project"
            className="text-slate-500 hover:text-rose-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelect(project)}
          className="text-xs"
        >
          View Tasks
          <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
};
