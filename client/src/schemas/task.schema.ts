import { z } from 'zod';

export const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Task title is required')
    .max(200, 'Task title cannot exceed 200 characters'),
  description: z
    .string()
    .trim()
    .max(2000, 'Description cannot exceed 2000 characters')
    .optional()
    .or(z.literal('')),
  status: z.enum(['Todo', 'InProgress', 'Done'], {
    required_error: 'Task status is required',
  }),
  priority: z.enum(['Low', 'Medium', 'High'], {
    required_error: 'Task priority is required',
  }),
  dueDate: z.string().optional().or(z.literal('')),
  assigneeName: z
    .string()
    .trim()
    .max(100, 'Assignee name cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),
  assigneeEmail: z
    .string()
    .trim()
    .email('Assignee email must be a valid email address')
    .max(255, 'Email cannot exceed 255 characters')
    .optional()
    .or(z.literal('')),
});

export type TaskFormData = z.infer<typeof taskSchema>;
