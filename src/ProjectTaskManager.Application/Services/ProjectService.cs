using Microsoft.EntityFrameworkCore;
using ProjectTaskManager.Application.Common.Interfaces;
using ProjectTaskManager.Common;
using ProjectTaskManager.DTOs.Projects;
using ProjectTaskManager.DTOs.Tasks;
using ProjectTaskManager.Models;

namespace ProjectTaskManager.Services;

public class ProjectService : IProjectService
{
    private readonly IAppDbContext _context;

    public ProjectService(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<ProjectResponseDto>> GetProjectsAsync(string? search, ProjectStatus? status, int pageNumber, int pageSize)
    {
        pageNumber = Math.Max(1, pageNumber);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _context.Projects
            .Include(p => p.Tasks)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.Trim().ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(searchLower) ||
                                     (p.Description != null && p.Description.ToLower().Contains(searchLower)));
        }

        if (status.HasValue)
        {
            query = query.Where(p => p.Status == status.Value);
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new ProjectResponseDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Status = p.Status,
                StartDate = p.StartDate,
                EndDate = p.EndDate,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt,
                TotalTasks = p.Tasks.Count,
                CompletedTasks = p.Tasks.Count(t => t.Status == TaskItemStatus.Done)
            })
            .ToListAsync();

        return new PagedResult<ProjectResponseDto>(items, totalCount, pageNumber, pageSize);
    }

    public async Task<ProjectResponseDto?> GetProjectByIdAsync(int id)
    {
        var project = await _context.Projects
            .Include(p => p.Tasks)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project == null)
            return null;

        return new ProjectResponseDto
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            Status = project.Status,
            StartDate = project.StartDate,
            EndDate = project.EndDate,
            CreatedAt = project.CreatedAt,
            UpdatedAt = project.UpdatedAt,
            TotalTasks = project.Tasks.Count,
            CompletedTasks = project.Tasks.Count(t => t.Status == TaskItemStatus.Done),
            Tasks = project.Tasks
                .OrderBy(t => t.Status == TaskItemStatus.Done)
                .ThenBy(t => t.DueDate ?? DateTime.MaxValue)
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
                .ToList()
        };
    }

    public async Task<ProjectResponseDto> CreateProjectAsync(CreateProjectDto dto)
    {
        var project = new Project
        {
            Name = dto.Name.Trim(),
            Description = dto.Description?.Trim(),
            Status = dto.Status,
            StartDate = DateTime.SpecifyKind(dto.StartDate, DateTimeKind.Utc),
            EndDate = dto.EndDate.HasValue ? DateTime.SpecifyKind(dto.EndDate.Value, DateTimeKind.Utc) : null,
            CreatedAt = DateTime.UtcNow
        };

        _context.Projects.Add(project);
        await _context.SaveChangesAsync();

        return new ProjectResponseDto
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            Status = project.Status,
            StartDate = project.StartDate,
            EndDate = project.EndDate,
            CreatedAt = project.CreatedAt,
            UpdatedAt = project.UpdatedAt,
            TotalTasks = 0,
            CompletedTasks = 0,
            Tasks = new List<TaskResponseDto>()
        };
    }

    public async Task<ProjectResponseDto?> UpdateProjectAsync(int id, UpdateProjectDto dto)
    {
        var project = await _context.Projects
            .Include(p => p.Tasks)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project == null)
            return null;

        project.Name = dto.Name.Trim();
        project.Description = dto.Description?.Trim();
        project.Status = dto.Status;
        project.StartDate = DateTime.SpecifyKind(dto.StartDate, DateTimeKind.Utc);
        project.EndDate = dto.EndDate.HasValue ? DateTime.SpecifyKind(dto.EndDate.Value, DateTimeKind.Utc) : null;
        project.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new ProjectResponseDto
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            Status = project.Status,
            StartDate = project.StartDate,
            EndDate = project.EndDate,
            CreatedAt = project.CreatedAt,
            UpdatedAt = project.UpdatedAt,
            TotalTasks = project.Tasks.Count,
            CompletedTasks = project.Tasks.Count(t => t.Status == TaskItemStatus.Done)
        };
    }

    public async Task<bool> DeleteProjectAsync(int id)
    {
        var project = await _context.Projects.FindAsync(id);
        if (project == null)
            return false;

        _context.Projects.Remove(project);
        await _context.SaveChangesAsync();
        return true;
    }
}
