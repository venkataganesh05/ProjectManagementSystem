using FluentValidation;
using ProjectTaskManager.DTOs.Tasks;

namespace ProjectTaskManager.Validators;

public class CreateTaskValidator : AbstractValidator<CreateTaskDto>
{
    public CreateTaskValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Task title is required.")
            .MaximumLength(200).WithMessage("Task title cannot exceed 200 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(2000).WithMessage("Description cannot exceed 2000 characters.");

        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("A valid task status must be provided.");

        RuleFor(x => x.Priority)
            .IsInEnum().WithMessage("A valid task priority must be provided.");

        RuleFor(x => x.AssigneeName)
            .MaximumLength(100).WithMessage("Assignee name cannot exceed 100 characters.");

        RuleFor(x => x.AssigneeEmail)
            .EmailAddress().When(x => !string.IsNullOrWhiteSpace(x.AssigneeEmail))
            .WithMessage("Assignee email must be a valid email address.")
            .MaximumLength(255).WithMessage("Assignee email cannot exceed 255 characters.");
    }
}
