using Microsoft.EntityFrameworkCore;
using ProjectTaskManager.Domain.Entities;

namespace ProjectTaskManager.Application.Common.Interfaces;

public interface IAppDbContext
{
    DbSet<Project> Projects { get; }
    DbSet<TaskItem> Tasks { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

