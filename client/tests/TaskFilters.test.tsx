import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskFilters } from '../src/components/tasks/TaskFilters';

describe('TaskFilters Component', () => {
  it('renders all filter controls properly', () => {
    render(
      <TaskFilters
        search=""
        sortBy="createdAt"
        sortDescending={false}
        onSearchChange={vi.fn()}
        onStatusChange={vi.fn()}
        onPriorityChange={vi.fn()}
        onSortByChange={vi.fn()}
        onSortDescendingToggle={vi.fn()}
        onClearFilters={vi.fn()}
      />
    );

    expect(screen.getByPlaceholderText(/Search tasks by title or description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Filter by status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Filter by priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Sort by/i)).toBeInTheDocument();
  });

  it('triggers onSearchChange when user types search keyword', () => {
    const handleSearchChange = vi.fn();
    render(
      <TaskFilters
        search=""
        sortBy="createdAt"
        sortDescending={false}
        onSearchChange={handleSearchChange}
        onStatusChange={vi.fn()}
        onPriorityChange={vi.fn()}
        onSortByChange={vi.fn()}
        onSortDescendingToggle={vi.fn()}
        onClearFilters={vi.fn()}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Search tasks by title or description/i);
    fireEvent.change(searchInput, { target: { value: 'Kubernetes' } });

    expect(handleSearchChange).toHaveBeenCalledWith('Kubernetes');
  });

  it('triggers onStatusChange and onPriorityChange when dropdowns are changed', () => {
    const handleStatusChange = vi.fn();
    const handlePriorityChange = vi.fn();

    render(
      <TaskFilters
        search=""
        sortBy="createdAt"
        sortDescending={false}
        onSearchChange={vi.fn()}
        onStatusChange={handleStatusChange}
        onPriorityChange={handlePriorityChange}
        onSortByChange={vi.fn()}
        onSortDescendingToggle={vi.fn()}
        onClearFilters={vi.fn()}
      />
    );

    const statusSelect = screen.getByLabelText(/Filter by status/i);
    fireEvent.change(statusSelect, { target: { value: 'InProgress' } });
    expect(handleStatusChange).toHaveBeenCalledWith('InProgress');

    const prioritySelect = screen.getByLabelText(/Filter by priority/i);
    fireEvent.change(prioritySelect, { target: { value: 'High' } });
    expect(handlePriorityChange).toHaveBeenCalledWith('High');
  });

  it('shows active filters and calls onClearFilters when clicked', () => {
    const handleClearFilters = vi.fn();

    render(
      <TaskFilters
        search="Terraform"
        status="InProgress"
        priority="High"
        sortBy="dueDate"
        sortDescending={true}
        onSearchChange={vi.fn()}
        onStatusChange={vi.fn()}
        onPriorityChange={vi.fn()}
        onSortByChange={vi.fn()}
        onSortDescendingToggle={vi.fn()}
        onClearFilters={handleClearFilters}
      />
    );

    expect(screen.getByText(/Active Filters:/i)).toBeInTheDocument();
    expect(screen.getByText('Terraform')).toBeInTheDocument();
    expect(screen.getByText('InProgress')).toBeInTheDocument();
    expect(screen.getAllByText('High').length).toBeGreaterThanOrEqual(1);

    const clearAllBtn = screen.getByRole('button', { name: /Clear All/i });
    fireEvent.click(clearAllBtn);
    expect(handleClearFilters).toHaveBeenCalledTimes(1);
  });
});
