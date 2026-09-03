import React from 'react';
import { TaskItem, TaskStatus } from '../../types/task.types';
import { TaskRow } from './TaskRow';
import { EmptyState } from '../common/EmptyState';
import { Pagination } from '../common/Pagination';
import { CheckSquare } from 'lucide-react';

interface TaskListProps {
  tasks: TaskItem[];
  totalCount: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onStatusChange: (task: TaskItem, newStatus: TaskStatus) => void;
  onEdit: (task: TaskItem) => void;
  onDelete: (task: TaskItem) => void;
  onAddTask: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  totalCount,
  totalPages,
  pageNumber,
  pageSize,
  onPageChange,
  onStatusChange,
  onEdit,
  onDelete,
  onAddTask,
}) => {
  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No tasks found"
        description="There are no tasks matching your current filter criteria or no tasks have been created yet."
        actionLabel="Add New Task"
        onAction={onAddTask}
        icon={<CheckSquare className="h-8 w-8 text-slate-400" />}
      />
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="divide-y divide-slate-100">
        {tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onStatusChange={onStatusChange}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      <Pagination
        currentPage={pageNumber}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    </div>
  );
};
