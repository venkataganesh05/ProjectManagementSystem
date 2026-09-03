using ProjectTaskManager.Models;

namespace ProjectTaskManager.DTOs.Tasks;

public class UpdateTaskDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public TaskItemStatus Status { get; set; }
    public TaskPriority Priority { get; set; }
    public DateTime? DueDate { get; set; }
    public string? AssigneeName { get; set; }
    public string? AssigneeEmail { get; set; }
}
