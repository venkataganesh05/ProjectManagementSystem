using ProjectTaskManager.DTOs.Tasks;
using ProjectTaskManager.Models;

namespace ProjectTaskManager.DTOs.Projects;

public class ProjectResponseDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ProjectStatus Status { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public List<TaskResponseDto> Tasks { get; set; } = new();
}
