import React from 'react';
import { TaskItem, TaskStatus } from '../../types/task.types';
import { TaskPriorityBadge } from './TaskPriorityBadge';
import { Calendar, User, CheckCircle2, Circle, Clock, Edit2, Trash2 } from 'lucide-react';

interface TaskRowProps {
  task: TaskItem;
  onStatusChange: (task: TaskItem, newStatus: TaskStatus) => void;
  onEdit: (task: TaskItem) => void;
  onDelete: (task: TaskItem) => void;
}

export const TaskRow: React.FC<TaskRowProps> = ({
  task,
  onStatusChange,
  onEdit,
  onDelete,
}) => {
  const isDone = task.status === 'Done';
  const isInProgress = task.status === 'InProgress';

  const nextStatus: Record<TaskStatus, TaskStatus> = {
    Todo: 'InProgress',
    InProgress: 'Done',
    Done: 'Todo',
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return null;
    }
  };

  const isOverdue =
    task.dueDate &&
    !isDone &&
    new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <div
      className={`group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-slate-100 hover:bg-slate-50/80 transition-colors gap-3 ${
        isDone ? 'bg-slate-50/40' : ''
      }`}
    >
      <div className="flex items-start space-x-3 flex-1 min-w-0">
        <button
          onClick={() => onStatusChange(task, nextStatus[task.status])}
          className="mt-0.5 text-slate-400 hover:text-indigo-600 focus:outline-none transition-colors"
          title={`Status: ${task.status}. Click to change to ${nextStatus[task.status]}`}
          aria-label={`Mark task as ${nextStatus[task.status]}`}
        >
          {isDone ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 fill-emerald-50" />
          ) : isInProgress ? (
            <Clock className="h-5 w-5 text-amber-500" />
          ) : (
            <Circle className="h-5 w-5 text-slate-300 group-hover:text-slate-400" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4
              className={`text-sm font-medium ${
                isDone ? 'line-through text-slate-400' : 'text-slate-900'
              }`}
            >
              {task.title}
            </h4>
            <TaskPriorityBadge priority={task.priority} />
          </div>

          {task.description && (
            <p className="mt-1 text-xs text-slate-500 line-clamp-1">
              {task.description}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            {task.dueDate && (
              <span
                className={`flex items-center gap-1 ${
                  isOverdue ? 'text-rose-600 font-semibold' : ''
                }`}
                title={isOverdue ? 'Task is overdue' : 'Due date'}
              >
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(task.dueDate)} {isOverdue && '(Overdue)'}
              </span>
            )}

            {task.assigneeName && (
              <span
                className="flex items-center gap-1"
                title={task.assigneeEmail ? `Email: ${task.assigneeEmail}` : undefined}
              >
                <User className="h-3.5 w-3.5 text-slate-400" />
                {task.assigneeName}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-1 self-end sm:self-center opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(task)}
          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100 transition-colors"
          title="Edit Task"
          aria-label="Edit Task"
        >
          <Edit2 className="h-4 w-4" />
        </button>
        <button
          onClick={() => onDelete(task)}
          className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 transition-colors"
          title="Delete Task"
          aria-label="Delete Task"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
