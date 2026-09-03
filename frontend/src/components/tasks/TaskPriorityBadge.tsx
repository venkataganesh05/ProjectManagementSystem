import React from 'react';
import { TaskPriority } from '../../types/task.types';

interface TaskPriorityBadgeProps {
  priority: TaskPriority;
}

export const TaskPriorityBadge: React.FC<TaskPriorityBadgeProps> = ({ priority }) => {
  const styles: Record<TaskPriority, { bg: string; text: string }> = {
    High: {
      bg: 'bg-rose-50 border-rose-200',
      text: 'text-rose-700',
    },
    Medium: {
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-700',
    },
    Low: {
      bg: 'bg-sky-50 border-sky-200',
      text: 'text-sky-700',
    },
  };

  const current = styles[priority] || styles.Medium;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${current.bg} ${current.text}`}
    >
      {priority}
    </span>
  );
};
