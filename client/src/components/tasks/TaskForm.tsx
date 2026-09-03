import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskSchema, TaskFormData } from '../../schemas/task.schema';
import { TaskItem } from '../../types/task.types';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { X } from 'lucide-react';

interface TaskFormProps {
  isOpen: boolean;
  task?: TaskItem | null;
  projectName?: string;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  isOpen,
  task,
  projectName,
  isLoading = false,
  onClose,
  onSubmit,
}) => {
  const isEdit = !!task;

  const formatDateForInput = (dateStr?: string | null) => {
    if (!dateStr) return '';
    try {
      return dateStr.split('T')[0];
    } catch {
      return '';
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'Todo',
      priority: 'Medium',
      dueDate: '',
      assigneeName: '',
      assigneeEmail: '',
    },
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: formatDateForInput(task.dueDate),
        assigneeName: task.assigneeName || '',
        assigneeEmail: task.assigneeEmail || '',
      });
    } else {
      reset({
        title: '',
        description: '',
        status: 'Todo',
        priority: 'Medium',
        dueDate: '',
        assigneeName: '',
        assigneeEmail: '',
      });
    }
  }, [task, reset, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl transition-all">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {isEdit ? 'Edit Task' : 'Add New Task'}
            </h2>
            {projectName && (
              <p className="text-xs text-slate-500 mt-0.5">Project: {projectName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Close form"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Task Title"
            placeholder="e.g. Implement OAuth token exchange"
            error={errors.title?.message}
            required
            {...register('title')}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Describe the task requirements or steps to accomplish..."
              className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                errors.description
                  ? 'border-rose-300 text-rose-900 focus:border-rose-500 focus:ring-rose-500'
                  : 'border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
              {...register('description')}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-rose-600">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Select
                label="Status"
                options={[
                  { value: 'Todo', label: 'Todo' },
                  { value: 'InProgress', label: 'In Progress' },
                  { value: 'Done', label: 'Done' },
                ]}
                error={errors.status?.message}
                required
                {...register('status')}
              />
            </div>

            <div>
              <Select
                label="Priority"
                options={[
                  { value: 'Low', label: 'Low' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'High', label: 'High' },
                ]}
                error={errors.priority?.message}
                required
                {...register('priority')}
              />
            </div>

            <div>
              <Input
                label="Due Date"
                type="date"
                error={errors.dueDate?.message}
                {...register('dueDate')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Assignee Name"
              placeholder="e.g. Alex Rivera"
              error={errors.assigneeName?.message}
              {...register('assigneeName')}
            />

            <Input
              label="Assignee Email"
              type="email"
              placeholder="e.g. alex@example.com"
              error={errors.assigneeEmail?.message}
              {...register('assigneeEmail')}
            />
          </div>

          <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {isEdit ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
