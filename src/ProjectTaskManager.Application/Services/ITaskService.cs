using ProjectTaskManager.Common;
using ProjectTaskManager.DTOs.Tasks;
using ProjectTaskManager.Models;

namespace ProjectTaskManager.Services;

public interface ITaskService
{
    Task<PagedResult<TaskResponseDto>> GetTasksByProjectAsync(
        int projectId,
        string? search,
        TaskItemStatus? status,
        TaskPriority? priority,
        string? sortBy,
        bool sortDescending,
        int pageNumber,
        int pageSize);

    Task<TaskResponseDto?> GetTaskByIdAsync(int id);
    Task<TaskResponseDto?> CreateTaskAsync(int projectId, CreateTaskDto dto);
    Task<TaskResponseDto?> UpdateTaskAsync(int id, UpdateTaskDto dto);
    Task<bool> DeleteTaskAsync(int id);
}
