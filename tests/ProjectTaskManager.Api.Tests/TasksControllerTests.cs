using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Mvc;
using Moq;
using ProjectTaskManager.Common;
using ProjectTaskManager.Controllers;
using ProjectTaskManager.DTOs.Tasks;
using ProjectTaskManager.Models;
using ProjectTaskManager.Services;
using Xunit;

namespace ProjectTaskManager.Api.Tests;

public class TasksControllerTests
{
    private readonly Mock<ITaskService> _taskServiceMock;
    private readonly Mock<IValidator<UpdateTaskDto>> _updateTaskValidatorMock;
    private readonly TasksController _controller;

    public TasksControllerTests()
    {
        _taskServiceMock = new Mock<ITaskService>();
        _updateTaskValidatorMock = new Mock<IValidator<UpdateTaskDto>>();
        _controller = new TasksController(_taskServiceMock.Object, _updateTaskValidatorMock.Object);
    }

    [Fact]
    public async Task GetTaskById_ExistingId_ReturnsOkWithTask()
    {
        // Arrange
        var taskDto = new TaskResponseDto
        {
            Id = 1,
            ProjectId = 10,
            Title = "Implement Unit Tests",
            Status = TaskItemStatus.InProgress,
            Priority = TaskPriority.High
        };

        _taskServiceMock
            .Setup(s => s.GetTaskByIdAsync(1))
            .ReturnsAsync(taskDto);

        // Act
        var result = await _controller.GetTaskById(1);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var apiResponse = Assert.IsType<ApiResponse<TaskResponseDto>>(okResult.Value);
        Assert.True(apiResponse.Success);
        Assert.Equal("Implement Unit Tests", apiResponse.Data?.Title);
    }

    [Fact]
    public async Task GetTaskById_NonExistingId_ReturnsNotFound()
    {
        // Arrange
        _taskServiceMock
            .Setup(s => s.GetTaskByIdAsync(999))
            .ReturnsAsync((TaskResponseDto?)null);

        // Act
        var result = await _controller.GetTaskById(999);

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        var apiResponse = Assert.IsType<ApiResponse<object>>(notFoundResult.Value);
        Assert.False(apiResponse.Success);
        Assert.Equal(404, apiResponse.StatusCode);
    }

    [Fact]
    public async Task UpdateTask_ValidDto_ReturnsOkWithUpdatedTask()
    {
        // Arrange
        var updateDto = new UpdateTaskDto
        {
            Title = "Updated Title",
            Status = TaskItemStatus.Done,
            Priority = TaskPriority.Low
        };

        var responseDto = new TaskResponseDto
        {
            Id = 2,
            ProjectId = 10,
            Title = updateDto.Title,
            Status = updateDto.Status,
            Priority = updateDto.Priority
        };

        _updateTaskValidatorMock
            .Setup(v => v.ValidateAsync(updateDto, default))
            .ReturnsAsync(new ValidationResult());

        _taskServiceMock
            .Setup(s => s.UpdateTaskAsync(2, updateDto))
            .ReturnsAsync(responseDto);

        // Act
        var result = await _controller.UpdateTask(2, updateDto);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var apiResponse = Assert.IsType<ApiResponse<TaskResponseDto>>(okResult.Value);
        Assert.True(apiResponse.Success);
        Assert.Equal(TaskItemStatus.Done, apiResponse.Data?.Status);
    }

    [Fact]
    public async Task UpdateTask_InvalidDto_ReturnsBadRequestWithValidationErrors()
    {
        // Arrange
        var updateDto = new UpdateTaskDto { Title = "" };
        var validationFailures = new List<ValidationFailure>
        {
            new("Title", "Task title is required.")
        };

        _updateTaskValidatorMock
            .Setup(v => v.ValidateAsync(updateDto, default))
            .ReturnsAsync(new ValidationResult(validationFailures));

        // Act
        var result = await _controller.UpdateTask(2, updateDto);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        var apiResponse = Assert.IsType<ApiResponse<object>>(badRequestResult.Value);
        Assert.False(apiResponse.Success);
        Assert.Equal(400, apiResponse.StatusCode);
    }

    [Fact]
    public async Task DeleteTask_ExistingId_ReturnsOk()
    {
        // Arrange
        _taskServiceMock
            .Setup(s => s.DeleteTaskAsync(5))
            .ReturnsAsync(true);

        // Act
        var result = await _controller.DeleteTask(5);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var apiResponse = Assert.IsType<ApiResponse<string>>(okResult.Value);
        Assert.True(apiResponse.Success);
    }

    [Fact]
    public async Task DeleteTask_NonExistingId_ReturnsNotFound()
    {
        // Arrange
        _taskServiceMock
            .Setup(s => s.DeleteTaskAsync(999))
            .ReturnsAsync(false);

        // Act
        var result = await _controller.DeleteTask(999);

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        var apiResponse = Assert.IsType<ApiResponse<object>>(notFoundResult.Value);
        Assert.False(apiResponse.Success);
    }

    [Fact]
    public async Task UpdateTask_NonExistingId_ReturnsNotFound()
    {
        // Arrange
        var updateDto = new UpdateTaskDto
        {
            Title = "Ghost Task",
            Status = TaskItemStatus.Todo,
            Priority = TaskPriority.Low
        };

        _updateTaskValidatorMock
            .Setup(v => v.ValidateAsync(updateDto, default))
            .ReturnsAsync(new FluentValidation.Results.ValidationResult());

        _taskServiceMock
            .Setup(s => s.UpdateTaskAsync(999, updateDto))
            .ReturnsAsync((TaskResponseDto?)null);

        // Act
        var result = await _controller.UpdateTask(999, updateDto);

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        var apiResponse = Assert.IsType<ApiResponse<object>>(notFoundResult.Value);
        Assert.False(apiResponse.Success);
        Assert.Equal(404, apiResponse.StatusCode);
    }
}
