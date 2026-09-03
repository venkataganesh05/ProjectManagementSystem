using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using ProjectTaskManager.Common;
using ProjectTaskManager.DTOs.Projects;
using ProjectTaskManager.DTOs.Tasks;
using ProjectTaskManager.Models;
using ProjectTaskManager.Services;

namespace ProjectTaskManager.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;
    private readonly ITaskService _taskService;
    private readonly IValidator<CreateProjectDto> _createProjectValidator;
    private readonly IValidator<UpdateProjectDto> _updateProjectValidator;
    private readonly IValidator<CreateTaskDto> _createTaskValidator;

    public ProjectsController(
        IProjectService projectService,
        ITaskService taskService,
        IValidator<CreateProjectDto> createProjectValidator,
        IValidator<UpdateProjectDto> updateProjectValidator,
        IValidator<CreateTaskDto> createTaskValidator)
    {
        _projectService = projectService;
        _taskService = taskService;
        _createProjectValidator = createProjectValidator;
        _updateProjectValidator = updateProjectValidator;
        _createTaskValidator = createTaskValidator;
    }

    /// <summary>
    /// Gets a paginated list of projects with optional search and status filter.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<ProjectResponseDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProjects(
        [FromQuery] string? search,
        [FromQuery] ProjectStatus? status,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await _projectService.GetProjectsAsync(search, status, pageNumber, pageSize);
        return Ok(ApiResponse<PagedResult<ProjectResponseDto>>.Ok(result, "Projects retrieved successfully."));
    }

    /// <summary>
    /// Gets a single project by ID with its associated tasks.
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<ProjectResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProjectById(int id)
    {
        var project = await _projectService.GetProjectByIdAsync(id);
        if (project == null)
        {
            return NotFound(ApiResponse<object>.Fail($"Project with ID {id} was not found.", null, StatusCodes.Status404NotFound));
        }

        return Ok(ApiResponse<ProjectResponseDto>.Ok(project, "Project retrieved successfully."));
    }

    /// <summary>
    /// Creates a new project.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<ProjectResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateProject([FromBody] CreateProjectDto dto)
    {
        var validation = await _createProjectValidator.ValidateAsync(dto);
        if (!validation.IsValid)
        {
            var errors = validation.Errors.Select(e => e.ErrorMessage).ToList();
            return BadRequest(ApiResponse<object>.Fail("Validation failed.", errors, StatusCodes.Status400BadRequest));
        }

        var created = await _projectService.CreateProjectAsync(dto);
        return CreatedAtAction(
            nameof(GetProjectById),
            new { id = created.Id },
            ApiResponse<ProjectResponseDto>.Ok(created, "Project created successfully.", StatusCodes.Status201Created)
        );
    }

    /// <summary>
    /// Updates an existing project.
    /// </summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<ProjectResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateProject(int id, [FromBody] UpdateProjectDto dto)
    {
        var validation = await _updateProjectValidator.ValidateAsync(dto);
        if (!validation.IsValid)
        {
            var errors = validation.Errors.Select(e => e.ErrorMessage).ToList();
            return BadRequest(ApiResponse<object>.Fail("Validation failed.", errors, StatusCodes.Status400BadRequest));
        }

        var updated = await _projectService.UpdateProjectAsync(id, dto);
        if (updated == null)
        {
            return NotFound(ApiResponse<object>.Fail($"Project with ID {id} was not found.", null, StatusCodes.Status404NotFound));
        }

        return Ok(ApiResponse<ProjectResponseDto>.Ok(updated, "Project updated successfully."));
    }

    /// <summary>
    /// Deletes a project and cascade deletes all its associated tasks.
    /// </summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteProject(int id)
    {
        var deleted = await _projectService.DeleteProjectAsync(id);
        if (!deleted)
        {
            return NotFound(ApiResponse<object>.Fail($"Project with ID {id} was not found.", null, StatusCodes.Status404NotFound));
        }

        return Ok(ApiResponse<string>.Ok($"Project {id} and all its associated tasks were deleted successfully."));
    }

    /// <summary>
    /// Retrieves tasks for a specific project with search, filtering, and sorting.
    /// </summary>
    [HttpGet("{id:int}/tasks")]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<TaskResponseDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProjectTasks(
        int id,
        [FromQuery] string? search,
        [FromQuery] TaskItemStatus? status,
        [FromQuery] TaskPriority? priority,
        [FromQuery] string? sortBy,
        [FromQuery] bool sortDescending = false,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        try
        {
            var result = await _taskService.GetTasksByProjectAsync(
                id, search, status, priority, sortBy, sortDescending, pageNumber, pageSize);

            return Ok(ApiResponse<PagedResult<TaskResponseDto>>.Ok(result, "Tasks retrieved successfully."));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<object>.Fail(ex.Message, null, StatusCodes.Status404NotFound));
        }
    }

    /// <summary>
    /// Creates a task under a specific project.
    /// </summary>
    [HttpPost("{id:int}/tasks")]
    [ProducesResponseType(typeof(ApiResponse<TaskResponseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateTaskForProject(int id, [FromBody] CreateTaskDto dto)
    {
        var validation = await _createTaskValidator.ValidateAsync(dto);
        if (!validation.IsValid)
        {
            var errors = validation.Errors.Select(e => e.ErrorMessage).ToList();
            return BadRequest(ApiResponse<object>.Fail("Validation failed.", errors, StatusCodes.Status400BadRequest));
        }

        var created = await _taskService.CreateTaskAsync(id, dto);
        if (created == null)
        {
            return NotFound(ApiResponse<object>.Fail($"Project with ID {id} was not found.", null, StatusCodes.Status404NotFound));
        }

        return CreatedAtAction(
            "GetTaskById",
            "Tasks",
            new { id = created.Id },
            ApiResponse<TaskResponseDto>.Ok(created, "Task created successfully.", StatusCodes.Status201Created)
        );
    }
}
