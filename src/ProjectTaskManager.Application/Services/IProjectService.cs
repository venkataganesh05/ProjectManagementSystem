using ProjectTaskManager.Common;
using ProjectTaskManager.DTOs.Projects;
using ProjectTaskManager.Models;

namespace ProjectTaskManager.Services;

public interface IProjectService
{
    Task<PagedResult<ProjectResponseDto>> GetProjectsAsync(string? search, ProjectStatus? status, int pageNumber, int pageSize);
    Task<ProjectResponseDto?> GetProjectByIdAsync(int id);
    Task<ProjectResponseDto> CreateProjectAsync(CreateProjectDto dto);
    Task<ProjectResponseDto?> UpdateProjectAsync(int id, UpdateProjectDto dto);
    Task<bool> DeleteProjectAsync(int id);
}
