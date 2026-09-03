import React from 'react';
import { TaskStatus, TaskPriority } from '../../types/task.types';
import { Search, X, ArrowUpDown, Filter } from 'lucide-react';
import { Button } from '../common/Button';

interface TaskFiltersProps {
  search: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  sortBy: 'dueDate' | 'priority' | 'title' | 'status' | 'createdAt';
  sortDescending: boolean;
  onSearchChange: (val: string) => void;
  onStatusChange: (val?: TaskStatus) => void;
  onPriorityChange: (val?: TaskPriority) => void;
  onSortByChange: (val: 'dueDate' | 'priority' | 'title' | 'status' | 'createdAt') => void;
  onSortDescendingToggle: () => void;
  onClearFilters: () => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  search,
  status,
  priority,
  sortBy,
  sortDescending,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onSortByChange,
  onSortDescendingToggle,
  onClearFilters,
}) => {
  const hasActiveFilters = !!search || !!status || !!priority || sortBy !== 'createdAt' || sortDescending;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search Input */}
        <div className="lg:col-span-2 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks by title or description..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 pl-9 pr-8 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            aria-label="Search tasks"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={status || ''}
            onChange={(e) => onStatusChange((e.target.value as TaskStatus) || undefined)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            <option value="Todo">Todo</option>
            <option value="InProgress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <select
            value={priority || ''}
            onChange={(e) => onPriorityChange((e.target.value as TaskPriority) || undefined)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            aria-label="Filter by priority"
          >
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center space-x-2">
          <select
            value={sortBy}
            onChange={(e) =>
              onSortByChange(
                e.target.value as 'dueDate' | 'priority' | 'title' | 'status' | 'createdAt'
              )
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            aria-label="Sort by"
          >
            <option value="createdAt">Date Created</option>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="title">Title</option>
            <option value="status">Status</option>
          </select>

          <Button
            variant="secondary"
            size="sm"
            onClick={onSortDescendingToggle}
            className="h-9 px-2.5 flex-shrink-0"
            title={sortDescending ? 'Sort Descending' : 'Sort Ascending'}
            aria-label="Toggle sort direction"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <span className="flex items-center font-medium text-slate-700 mr-1">
            <Filter className="h-3.5 w-3.5 mr-1 text-slate-400" />
            Active Filters:
          </span>

          {search && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 border border-slate-200">
              Keyword: <strong className="text-slate-800 font-semibold">{search}</strong>
              <button
                onClick={() => onSearchChange('')}
                className="hover:text-slate-900"
                aria-label="Remove search filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {status && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 border border-slate-200">
              Status: <strong className="text-slate-800 font-semibold">{status}</strong>
              <button
                onClick={() => onStatusChange(undefined)}
                className="hover:text-slate-900"
                aria-label="Remove status filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {priority && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 border border-slate-200">
              Priority: <strong className="text-slate-800 font-semibold">{priority}</strong>
              <button
                onClick={() => onPriorityChange(undefined)}
                className="hover:text-slate-900"
                aria-label="Remove priority filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs text-indigo-600 hover:text-indigo-800 py-0.5 px-2"
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
};
