using Microsoft.EntityFrameworkCore;
using ProjectTaskManager.Application.Common.Interfaces;
using ProjectTaskManager.Common;
using ProjectTaskManager.DTOs.Tasks;
using ProjectTaskManager.Models;

namespace ProjectTaskManager.Services;

public class TaskService : ITaskService
{
    private readonly IAppDbContext _context;

    public TaskService(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<TaskResponseDto>> GetTasksByProjectAsync(
        int projectId,
        string? search,
        TaskItemStatus? status,
        TaskPriority? priority,
        string? sortBy,
        bool sortDescending,
        int pageNumber,
        int pageSize)
    {
        // Verify project exists
        var projectExists = await _context.Projects.AnyAsync(p => p.Id == projectId);
        if (!projectExists)
        {
            throw new KeyNotFoundException($"Project with ID {projectId} was not found.");
        }

        pageNumber = Math.Max(1, pageNumber);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _context.Tasks
            .AsNoTracking()
            .Where(t => t.ProjectId == projectId)
            .AsQueryable();

        // Search filtering
        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.Trim().ToLower();
            query = query.Where(t => t.Title.ToLower().Contains(searchLower) ||
                                     (t.Description != null && t.Description.ToLower().Contains(searchLower)));
        }

        // Status filtering
        if (status.HasValue)
        {
            query = query.Where(t => t.Status == status.Value);
        }

        // Priority filtering
        if (priority.HasValue)
        {
            query = query.Where(t => t.Priority == priority.Value);
        }

        var totalCount = await query.CountAsync();

        // Sorting
        query = (sortBy?.ToLower()) switch
        {
            "duedate" => sortDescending
                ? query.OrderByDescending(t => t.DueDate ?? DateTime.MinValue)
                : query.OrderBy(t => t.DueDate ?? DateTime.MaxValue),
            "priority" => sortDescending
                ? query.OrderByDescending(t => t.Priority)
                : query.OrderBy(t => t.Priority),
            "title" => sortDescending
                ? query.OrderByDescending(t => t.Title)
                : query.OrderBy(t => t.Title),
            "status" => sortDescending
                ? query.OrderByDescending(t => t.Status)
                : query.OrderBy(t => t.Status),
            _ => sortDescending
                ? query.OrderByDescending(t => t.CreatedAt)
                : query.OrderBy(t => t.CreatedAt)
        };

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new TaskResponseDto
            {
                Id = t.Id,
                ProjectId = t.ProjectId,
                Title = t.Title,
                Description = t.Description,
                Status = t.Status,
                Priority = t.Priority,
                DueDate = t.DueDate,
                AssigneeName = t.AssigneeName,
                AssigneeEmail = t.AssigneeEmail,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt
            })
            .ToListAsync();

        return new PagedResult<TaskResponseDto>(items, totalCount, pageNumber, pageSize);
    }

    public async Task<TaskResponseDto?> GetTaskByIdAsync(int id)
    {
        var task = await _context.Tasks
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task == null)
            return null;

        return new TaskResponseDto
        {
            Id = task.Id,
            ProjectId = task.ProjectId,
            Title = task.Title,
            Description = task.Description,
            Status = task.Status,
            Priority = task.Priority,
            DueDate = task.DueDate,
            AssigneeName = task.AssigneeName,
            AssigneeEmail = task.AssigneeEmail,
            CreatedAt = task.CreatedAt,
            UpdatedAt = task.UpdatedAt
        };
    }

    public async Task<TaskResponseDto?> CreateTaskAsync(int projectId, CreateTaskDto dto)
    {
        var projectExists = await _context.Projects.AnyAsync(p => p.Id == projectId);
        if (!projectExists)
        {
            return null;
        }

        var task = new TaskItem
        {
            ProjectId = projectId,
            Title = dto.Title.Trim(),
            Description = dto.Description?.Trim(),
            Status = dto.Status,
            Priority = dto.Priority,
            DueDate = dto.DueDate.HasValue ? DateTime.SpecifyKind(dto.DueDate.Value, DateTimeKind.Utc) : null,
            AssigneeName = dto.AssigneeName?.Trim(),
            AssigneeEmail = dto.AssigneeEmail?.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        return new TaskResponseDto
        {
            Id = task.Id,
            ProjectId = task.ProjectId,
            Title = task.Title,
            Description = task.Description,
            Status = task.Status,
            Priority = task.Priority,
            DueDate = task.DueDate,
            AssigneeName = task.AssigneeName,
            AssigneeEmail = task.AssigneeEmail,
            CreatedAt = task.CreatedAt,
            UpdatedAt = task.UpdatedAt
        };
    }

    public async Task<TaskResponseDto?> UpdateTaskAsync(int id, UpdateTaskDto dto)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null)
            return null;

        task.Title = dto.Title.Trim();
        task.Description = dto.Description?.Trim();
        task.Status = dto.Status;
        task.Priority = dto.Priority;
        task.DueDate = dto.DueDate.HasValue ? DateTime.SpecifyKind(dto.DueDate.Value, DateTimeKind.Utc) : null;
        task.AssigneeName = dto.AssigneeName?.Trim();
        task.AssigneeEmail = dto.AssigneeEmail?.Trim();
        task.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new TaskResponseDto
        {
            Id = task.Id,
            ProjectId = task.ProjectId,
            Title = task.Title,
            Description = task.Description,
            Status = task.Status,
            Priority = task.Priority,
            DueDate = task.DueDate,
            AssigneeName = task.AssigneeName,
            AssigneeEmail = task.AssigneeEmail,
            CreatedAt = task.CreatedAt,
            UpdatedAt = task.UpdatedAt
        };
    }

    public async Task<bool> DeleteTaskAsync(int id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null)
            return false;

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();
        return true;
    }
}
