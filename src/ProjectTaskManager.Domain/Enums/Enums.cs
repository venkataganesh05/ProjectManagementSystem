using System.Text.Json.Serialization;

namespace ProjectTaskManager.Domain.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ProjectStatus
{
    Planned = 0,
    Active = 1,
    Completed = 2,
    Archived = 3
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum TaskItemStatus
{
    Todo = 0,
    InProgress = 1,
    Done = 2
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum TaskPriority
{
    Low = 0,
    Medium = 1,
    High = 2
}

