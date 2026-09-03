using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Mvc;
using Moq;
using ProjectTaskManager.Common;
using ProjectTaskManager.Controllers;
using ProjectTaskManager.DTOs.Projects;
using ProjectTaskManager.DTOs.Tasks;
using ProjectTaskManager.Models;
using ProjectTaskManager.Services;
using Xunit;

namespace ProjectTaskManager.Api.Tests;

public class ProjectsControllerTests
{
    private readonly Mock<IProjectService> _projectServiceMock;
    private readonly Mock<ITaskService> _taskServiceMock;
    private readonly Mock<IValidator<CreateProjectDto>> _createProjectValidatorMock;
    private readonly Mock<IValidator<UpdateProjectDto>> _updateProjectValidatorMock;
    private readonly Mock<IValidator<CreateTaskDto>> _createTaskValidatorMock;
    private readonly ProjectsController _controller;

    public ProjectsControllerTests()
    {
        _projectServiceMock = new Mock<IProjectService>();
        _taskServiceMock = new Mock<ITaskService>();
        _createProjectValidatorMock = new Mock<IValidator<CreateProjectDto>>();
        _updateProjectValidatorMock = new Mock<IValidator<UpdateProjectDto>>();
        _createTaskValidatorMock = new Mock<IValidator<CreateTaskDto>>();

        _controller = new ProjectsController(
            _projectServiceMock.Object,
            _taskServiceMock.Object,
            _createProjectValidatorMock.Object,
            _updateProjectValidatorMock.Object,
            _createTaskValidatorMock.Object
        );
    }

    [Fact]
    public async Task GetProjects_ReturnsOkWithPagedResult()
    {
        // Arrange
        var pagedResult = new PagedResult<ProjectResponseDto>(
            new List<ProjectResponseDto>
            {
                new() { Id = 1, Name = "Test Project", Status = ProjectStatus.Active }
            },
            1, 1, 10
        );

        _projectServiceMock
            .Setup(s => s.GetProjectsAsync(null, null, 1, 10))
            .ReturnsAsync(pagedResult);

        // Act
        var result = await _controller.GetProjects(null, null, 1, 10);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var apiResponse = Assert.IsType<ApiResponse<PagedResult<ProjectResponseDto>>>(okResult.Value);
        Assert.True(apiResponse.Success);
        Assert.NotNull(apiResponse.Data);
        Assert.Single(apiResponse.Data.Items);
        Assert.Equal("Test Project", apiResponse.Data.Items[0].Name);
    }

    [Fact]
    public async Task GetProjectById_ExistingId_ReturnsOkWithProject()
    {
        // Arrange
        var project = new ProjectResponseDto
        {
            Id = 1,
            Name = "Apollo Project",
            Status = ProjectStatus.Active,
            Tasks = new List<TaskResponseDto>
            {
                new() { Id = 10, Title = "Initial Setup", Status = TaskItemStatus.Done }
            }
        };

        _projectServiceMock
            .Setup(s => s.GetProjectByIdAsync(1))
            .ReturnsAsync(project);

        // Act
        var result = await _controller.GetProjectById(1);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var apiResponse = Assert.IsType<ApiResponse<ProjectResponseDto>>(okResult.Value);
        Assert.True(apiResponse.Success);
        Assert.Equal(1, apiResponse.Data?.Id);
        Assert.Single(apiResponse.Data!.Tasks);
    }

    [Fact]
    public async Task GetProjectById_NonExistingId_ReturnsNotFound()
    {
        // Arrange
        _projectServiceMock
            .Setup(s => s.GetProjectByIdAsync(999))
            .ReturnsAsync((ProjectResponseDto?)null);

        // Act
        var result = await _controller.GetProjectById(999);

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        var apiResponse = Assert.IsType<ApiResponse<object>>(notFoundResult.Value);
        Assert.False(apiResponse.Success);
        Assert.Equal(404, apiResponse.StatusCode);
    }

    [Fact]
    public async Task CreateProject_ValidModel_ReturnsCreatedAtAction()
    {
        // Arrange
        var createDto = new CreateProjectDto
        {
            Name = "New Initiative",
            Description = "A brand new project",
            Status = ProjectStatus.Planned,
            StartDate = DateTime.UtcNow
        };

        var createdDto = new ProjectResponseDto
        {
            Id = 5,
            Name = createDto.Name,
            Description = createDto.Description,
            Status = createDto.Status,
            StartDate = createDto.StartDate
        };

        _createProjectValidatorMock
            .Setup(v => v.ValidateAsync(createDto, default))
            .ReturnsAsync(new ValidationResult());

        _projectServiceMock
            .Setup(s => s.CreateProjectAsync(createDto))
            .ReturnsAsync(createdDto);

        // Act
        var result = await _controller.CreateProject(createDto);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(result);
        var apiResponse = Assert.IsType<ApiResponse<ProjectResponseDto>>(createdResult.Value);
        Assert.True(apiResponse.Success);
        Assert.Equal(201, apiResponse.StatusCode);
        Assert.Equal(5, apiResponse.Data?.Id);
    }

    [Fact]
    public async Task CreateProject_InvalidModel_ReturnsBadRequestWithValidationErrors()
    {
        // Arrange
        var createDto = new CreateProjectDto { Name = "" };
        var validationFailures = new List<ValidationFailure>
        {
            new("Name", "Project name is required.")
        };

        _createProjectValidatorMock
            .Setup(v => v.ValidateAsync(createDto, default))
            .ReturnsAsync(new ValidationResult(validationFailures));

        // Act
        var result = await _controller.CreateProject(createDto);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        var apiResponse = Assert.IsType<ApiResponse<object>>(badRequestResult.Value);
        Assert.False(apiResponse.Success);
        Assert.Equal(400, apiResponse.StatusCode);
        Assert.Contains("Project name is required.", apiResponse.Errors!);
    }

    [Fact]
    public async Task DeleteProject_ExistingId_ReturnsOk()
    {
        // Arrange
        _projectServiceMock
            .Setup(s => s.DeleteProjectAsync(1))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.DeleteProject(1);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var apiResponse = Assert.IsType<ApiResponse<string>>(okResult.Value);
        Assert.True(apiResponse.Success);
    }

    [Fact]
    public async Task DeleteProject_NonExistingId_ReturnsNotFound()
    {
        // Arrange
        _projectServiceMock
            .Setup(s => s.DeleteProjectAsync(999))
            .ReturnsAsync(false);

        // Act
        var result = await _controller.DeleteProject(999);

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        var apiResponse = Assert.IsType<ApiResponse<object>>(notFoundResult.Value);
        Assert.False(apiResponse.Success);
    }

    [Fact]
    public async Task UpdateProject_ValidDto_ReturnsOkWithUpdatedProject()
    {
        // Arrange
        var updateDto = new UpdateProjectDto
        {
            Name = "Renamed Project",
            Status = ProjectStatus.Active,
            StartDate = DateTime.UtcNow
        };

        var updatedDto = new ProjectResponseDto
        {
            Id = 1,
            Name = updateDto.Name,
            Status = updateDto.Status,
            StartDate = updateDto.StartDate
        };

        _updateProjectValidatorMock
            .Setup(v => v.ValidateAsync(updateDto, default))
            .ReturnsAsync(new FluentValidation.Results.ValidationResult());

        _projectServiceMock
            .Setup(s => s.UpdateProjectAsync(1, updateDto))
            .ReturnsAsync(updatedDto);

        // Act
        var result = await _controller.UpdateProject(1, updateDto);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var apiResponse = Assert.IsType<ApiResponse<ProjectResponseDto>>(okResult.Value);
        Assert.True(apiResponse.Success);
        Assert.Equal("Renamed Project", apiResponse.Data?.Name);
    }

    [Fact]
    public async Task UpdateProject_InvalidDto_ReturnsBadRequest()
    {
        // Arrange
        var updateDto = new UpdateProjectDto { Name = "" };
        var validationFailures = new List<FluentValidation.Results.ValidationFailure>
        {
            new("Name", "Project name is required.")
        };

        _updateProjectValidatorMock
            .Setup(v => v.ValidateAsync(updateDto, default))
            .ReturnsAsync(new FluentValidation.Results.ValidationResult(validationFailures));

        // Act
        var result = await _controller.UpdateProject(1, updateDto);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        var apiResponse = Assert.IsType<ApiResponse<object>>(badRequestResult.Value);
        Assert.False(apiResponse.Success);
        Assert.Equal(400, apiResponse.StatusCode);
    }

    [Fact]
    public async Task UpdateProject_NonExistingId_ReturnsNotFound()
    {
        // Arrange
        var updateDto = new UpdateProjectDto
        {
            Name = "Ghost Project",
            Status = ProjectStatus.Planned,
            StartDate = DateTime.UtcNow
        };

        _updateProjectValidatorMock
            .Setup(v => v.ValidateAsync(updateDto, default))
            .ReturnsAsync(new FluentValidation.Results.ValidationResult());

        _projectServiceMock
            .Setup(s => s.UpdateProjectAsync(999, updateDto))
            .ReturnsAsync((ProjectResponseDto?)null);

        // Act
        var result = await _controller.UpdateProject(999, updateDto);

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        var apiResponse = Assert.IsType<ApiResponse<object>>(notFoundResult.Value);
        Assert.False(apiResponse.Success);
        Assert.Equal(404, apiResponse.StatusCode);
    }

    [Fact]
    public async Task GetProjectTasks_ExistingProject_ReturnsOkWithPagedTasks()
    {
        // Arrange
        var pagedResult = new PagedResult<TaskResponseDto>(
            new List<TaskResponseDto>
            {
                new() { Id = 1, Title = "Fix CI pipeline", Status = TaskItemStatus.Todo, Priority = TaskPriority.High }
            },
            1, 1, 10
        );

        _taskServiceMock
            .Setup(s => s.GetTasksByProjectAsync(1, null, null, null, null, false, 1, 10))
            .ReturnsAsync(pagedResult);

        // Act
        var result = await _controller.GetProjectTasks(1, null, null, null, null, false, 1, 10);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var apiResponse = Assert.IsType<ApiResponse<PagedResult<TaskResponseDto>>>(okResult.Value);
        Assert.True(apiResponse.Success);
        Assert.Single(apiResponse.Data!.Items);
        Assert.Equal("Fix CI pipeline", apiResponse.Data.Items[0].Title);
    }

    [Fact]
    public async Task GetProjectTasks_NonExistingProject_ReturnsNotFound()
    {
        // Arrange
        _taskServiceMock
            .Setup(s => s.GetTasksByProjectAsync(999, null, null, null, null, false, 1, 10))
            .ThrowsAsync(new KeyNotFoundException("Project with ID 999 was not found."));

        // Act
        var result = await _controller.GetProjectTasks(999, null, null, null, null, false, 1, 10);

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        var apiResponse = Assert.IsType<ApiResponse<object>>(notFoundResult.Value);
        Assert.False(apiResponse.Success);
        Assert.Equal(404, apiResponse.StatusCode);
    }

    [Fact]
    public async Task CreateTaskForProject_ValidDto_ReturnsCreatedAtAction()
    {
        // Arrange
        var createDto = new CreateTaskDto
        {
            Title = "Deploy to staging",
            Status = TaskItemStatus.Todo,
            Priority = TaskPriority.Medium
        };

        var createdDto = new TaskResponseDto
        {
            Id = 7,
            ProjectId = 1,
            Title = createDto.Title,
            Status = createDto.Status,
            Priority = createDto.Priority
        };

        _createTaskValidatorMock
            .Setup(v => v.ValidateAsync(createDto, default))
            .ReturnsAsync(new FluentValidation.Results.ValidationResult());

        _taskServiceMock
            .Setup(s => s.CreateTaskAsync(1, createDto))
            .ReturnsAsync(createdDto);

        // Act
        var result = await _controller.CreateTaskForProject(1, createDto);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(result);
        var apiResponse = Assert.IsType<ApiResponse<TaskResponseDto>>(createdResult.Value);
        Assert.True(apiResponse.Success);
        Assert.Equal(201, apiResponse.StatusCode);
        Assert.Equal(7, apiResponse.Data?.Id);
    }

    [Fact]
    public async Task CreateTaskForProject_InvalidDto_ReturnsBadRequest()
    {
        // Arrange
        var createDto = new CreateTaskDto { Title = "" };
        var validationFailures = new List<FluentValidation.Results.ValidationFailure>
        {
            new("Title", "Task title is required.")
        };

        _createTaskValidatorMock
            .Setup(v => v.ValidateAsync(createDto, default))
            .ReturnsAsync(new FluentValidation.Results.ValidationResult(validationFailures));

        // Act
        var result = await _controller.CreateTaskForProject(1, createDto);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        var apiResponse = Assert.IsType<ApiResponse<object>>(badRequestResult.Value);
        Assert.False(apiResponse.Success);
        Assert.Equal(400, apiResponse.StatusCode);
        Assert.Contains("Task title is required.", apiResponse.Errors!);
    }

    [Fact]
    public async Task CreateTaskForProject_NonExistingProject_ReturnsNotFound()
    {
        // Arrange
        var createDto = new CreateTaskDto
        {
            Title = "Orphan task",
            Status = TaskItemStatus.Todo,
            Priority = TaskPriority.Low
        };

        _createTaskValidatorMock
            .Setup(v => v.ValidateAsync(createDto, default))
            .ReturnsAsync(new FluentValidation.Results.ValidationResult());

        _taskServiceMock
            .Setup(s => s.CreateTaskAsync(999, createDto))
            .ReturnsAsync((TaskResponseDto?)null);

        // Act
        var result = await _controller.CreateTaskForProject(999, createDto);

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        var apiResponse = Assert.IsType<ApiResponse<object>>(notFoundResult.Value);
        Assert.False(apiResponse.Success);
        Assert.Equal(404, apiResponse.StatusCode);
    }
}
