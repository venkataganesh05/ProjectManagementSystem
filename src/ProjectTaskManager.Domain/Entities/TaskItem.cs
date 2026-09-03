using System.ComponentModel.DataAnnotations;
using ProjectTaskManager.Domain.Enums;

namespace ProjectTaskManager.Domain.Entities;

public class TaskItem
{
    public int Id { get; set; }

    public int ProjectId { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    public TaskItemStatus Status { get; set; } = TaskItemStatus.Todo;

    public TaskPriority Priority { get; set; } = TaskPriority.Medium;

    public DateTime? DueDate { get; set; }

    [MaxLength(100)]
    public string? AssigneeName { get; set; }

    [MaxLength(255)]
    [EmailAddress]
    public string? AssigneeEmail { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    // Navigation property
    public Project? Project { get; set; }
}

