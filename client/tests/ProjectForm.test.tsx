import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProjectForm } from '../src/components/projects/ProjectForm';

describe('ProjectForm Component', () => {
  it('renders form elements correctly when open', () => {
    render(
      <ProjectForm
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByText('Create New Project')).toBeInTheDocument();
    expect(screen.getByLabelText(/Project Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Start Date/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Project/i })).toBeInTheDocument();
  });

  it('displays validation error when project name is empty', async () => {
    const handleSubmit = vi.fn();
    const { container } = render(
      <ProjectForm
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={handleSubmit}
      />
    );

    // The Input component sets the HTML required attribute which causes JSDOM native
    // constraint validation to swallow click events on the submit button before
    // react-hook-form can run. Dispatch submit directly on the form element to
    // bypass native constraint validation and let RHF + Zod handle it.
    const form = container.querySelector('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(screen.getByText(/Project name is required/i)).toBeInTheDocument();
    });
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('displays validation error when end date is before start date', async () => {
    const handleSubmit = vi.fn();
    const { container } = render(
      <ProjectForm
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={handleSubmit}
      />
    );

    const nameInput = screen.getByLabelText(/Project Name/i);
    const startDateInput = screen.getByLabelText(/Start Date/i);
    const endDateInput = screen.getByLabelText(/End Date/i);

    fireEvent.change(nameInput, { target: { value: 'Valid Project Name' } });
    fireEvent.change(startDateInput, { target: { value: '2026-09-10' } });
    fireEvent.change(endDateInput, { target: { value: '2026-09-01' } });

    const form = container.querySelector('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(
        screen.getByText(/End date must be greater than or equal to start date/i)
      ).toBeInTheDocument();
    });
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with valid form data', async () => {
    const handleSubmit = vi.fn();
    const { container } = render(
      <ProjectForm
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={handleSubmit}
      />
    );

    const nameInput = screen.getByLabelText(/Project Name/i);
    const startDateInput = screen.getByLabelText(/Start Date/i);
    const endDateInput = screen.getByLabelText(/End Date/i);

    fireEvent.change(nameInput, { target: { value: 'Valid Project Name' } });
    fireEvent.change(startDateInput, { target: { value: '2026-09-01' } });
    fireEvent.change(endDateInput, { target: { value: '2026-09-30' } });

    const form = container.querySelector('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });
  });
});
