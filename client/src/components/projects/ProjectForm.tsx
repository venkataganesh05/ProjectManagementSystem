import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema, ProjectFormData } from '../../schemas/project.schema';
import { Project } from '../../types/project.types';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { X } from 'lucide-react';

interface ProjectFormProps {
  isOpen: boolean;
  project?: Project | null;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  isOpen,
  project,
  isLoading = false,
  onClose,
  onSubmit,
}) => {
  const isEdit = !!project;

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
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'Planned',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
    },
  });

  useEffect(() => {
    if (project) {
      reset({
        name: project.name,
        description: project.description || '',
        status: project.status,
        startDate: formatDateForInput(project.startDate),
        endDate: formatDateForInput(project.endDate),
      });
    } else {
      reset({
        name: '',
        description: '',
        status: 'Planned',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
      });
    }
  }, [project, reset, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl transition-all">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEdit ? 'Edit Project' : 'Create New Project'}
          </h2>
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
            label="Project Name"
            placeholder="e.g. Cloud Infrastructure Migration"
            error={errors.name?.message}
            required
            {...register('name')}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Describe the scope and objective of this project..."
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
            <div className="sm:col-span-1">
              <Select
                label="Status"
                options={[
                  { value: 'Planned', label: 'Planned' },
                  { value: 'Active', label: 'Active' },
                  { value: 'Completed', label: 'Completed' },
                  { value: 'Archived', label: 'Archived' },
                ]}
                error={errors.status?.message}
                required
                {...register('status')}
              />
            </div>

            <div className="sm:col-span-1">
              <Input
                label="Start Date"
                type="date"
                error={errors.startDate?.message}
                required
                {...register('startDate')}
              />
            </div>

            <div className="sm:col-span-1">
              <Input
                label="End Date"
                type="date"
                error={errors.endDate?.message}
                {...register('endDate')}
              />
            </div>
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
              {isEdit ? 'Save Changes' : 'Create Project'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
