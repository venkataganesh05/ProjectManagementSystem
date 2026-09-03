using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using ProjectTaskManager.Common;
using ProjectTaskManager.DTOs.Tasks;
using ProjectTaskManager.Services;

namespace ProjectTaskManager.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;
    private readonly IValidator<UpdateTaskDto> _updateTaskValidator;

    public TasksController(ITaskService taskService, IValidator<UpdateTaskDto> updateTaskValidator)
    {
        _taskService = taskService;
        _updateTaskValidator = updateTaskValidator;
    }

    /// <summary>
    /// Gets a single task by ID.
    /// </summary>
    [HttpGet("{id:int}", Name = "GetTaskById")]
    [ProducesResponseType(typeof(ApiResponse<TaskResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTaskById(int id)
    {
        var task = await _taskService.GetTaskByIdAsync(id);
        if (task == null)
        {
            return NotFound(ApiResponse<object>.Fail($"Task with ID {id} was not found.", null, StatusCodes.Status404NotFound));
        }

        return Ok(ApiResponse<TaskResponseDto>.Ok(task, "Task retrieved successfully."));
    }

    /// <summary>
    /// Updates an existing task.
    /// </summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<TaskResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateTask(int id, [FromBody] UpdateTaskDto dto)
    {
        var validation = await _updateTaskValidator.ValidateAsync(dto);
        if (!validation.IsValid)
        {
            var errors = validation.Errors.Select(e => e.ErrorMessage).ToList();
            return BadRequest(ApiResponse<object>.Fail("Validation failed.", errors, StatusCodes.Status400BadRequest));
        }

        var updated = await _taskService.UpdateTaskAsync(id, dto);
        if (updated == null)
        {
            return NotFound(ApiResponse<object>.Fail($"Task with ID {id} was not found.", null, StatusCodes.Status404NotFound));
        }

        return Ok(ApiResponse<TaskResponseDto>.Ok(updated, "Task updated successfully."));
    }

    /// <summary>
    /// Deletes a task.
    /// </summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var deleted = await _taskService.DeleteTaskAsync(id);
        if (!deleted)
        {
            return NotFound(ApiResponse<object>.Fail($"Task with ID {id} was not found.", null, StatusCodes.Status404NotFound));
        }

        return Ok(ApiResponse<string>.Ok($"Task {id} was deleted successfully."));
    }
}
