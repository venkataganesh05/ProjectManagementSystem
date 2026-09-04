using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using ProjectTaskManager.Models;

namespace ProjectTaskManager.Data;

public static class SeedData
{
    public static async Task InitializeAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // Ensure database is created and schema ready
        if (context.Database.IsNpgsql())
        {
            await context.Database.EnsureCreatedAsync();
        }
        else
        {
            await context.Database.MigrateAsync();
        }

        if (await context.Projects.AnyAsync())
        {
            return; // DB already seeded
        }

        var project1 = new Project
        {
            Name = "Enterprise Cloud Migration",
            Description = "Migrate legacy on-premise application workloads and data pipelines to Azure & AWS multi-cloud architecture.",
            Status = ProjectStatus.Active,
            StartDate = DateTime.UtcNow.AddMonths(-2),
            EndDate = DateTime.UtcNow.AddMonths(4),
            CreatedAt = DateTime.UtcNow.AddMonths(-2),
            Tasks = new List<TaskItem>
            {
                new()
                {
                    Title = "Audit infrastructure dependencies and network topology",
                    Description = "Map out current VPCs, firewall rules, and legacy VM resource allocations.",
                    Status = TaskItemStatus.Done,
                    Priority = TaskPriority.High,
                    DueDate = DateTime.UtcNow.AddDays(-10),
                    AssigneeName = "Alex Rivera",
                    AssigneeEmail = "alex.rivera@example.com",
                    CreatedAt = DateTime.UtcNow.AddMonths(-2)
                },
                new()
                {
                    Title = "Provision Kubernetes clusters via Terraform",
                    Description = "Write Infrastructure as Code scripts for AKS and EKS with zero-trust network policies.",
                    Status = TaskItemStatus.InProgress,
                    Priority = TaskPriority.High,
                    DueDate = DateTime.UtcNow.AddDays(15),
                    AssigneeName = "Devon Vance",
                    AssigneeEmail = "devon.vance@example.com",
                    CreatedAt = DateTime.UtcNow.AddDays(-20)
                },
                new()
                {
                    Title = "Set up database replication and backup failover",
                    Description = "Configure active-passive read replicas and verify Recovery Time Objective (RTO).",
                    Status = TaskItemStatus.Todo,
                    Priority = TaskPriority.Medium,
                    DueDate = DateTime.UtcNow.AddDays(30),
                    AssigneeName = "Sarah Chen",
                    AssigneeEmail = "sarah.chen@example.com",
                    CreatedAt = DateTime.UtcNow.AddDays(-5)
                }
            }
        };

        var project2 = new Project
        {
            Name = "Customer Portal Redesign",
            Description = "Revamp customer-facing self-service dashboard with modern UI/UX, responsive analytics, and notification center.",
            Status = ProjectStatus.Active,
            StartDate = DateTime.UtcNow.AddDays(-25),
            EndDate = DateTime.UtcNow.AddMonths(2),
            CreatedAt = DateTime.UtcNow.AddDays(-25),
            Tasks = new List<TaskItem>
            {
                new()
                {
                    Title = "Conduct user usability research sessions",
                    Description = "Interview 15 enterprise clients and synthesize friction points into journey maps.",
                    Status = TaskItemStatus.Done,
                    Priority = TaskPriority.Medium,
                    DueDate = DateTime.UtcNow.AddDays(-15),
                    AssigneeName = "Maya Patel",
                    AssigneeEmail = "maya.patel@example.com",
                    CreatedAt = DateTime.UtcNow.AddDays(-25)
                },
                new()
                {
                    Title = "Implement dark mode theme & accessibility (WCAG AA)",
                    Description = "Audit contrast ratios and implement system-wide theme toggle using Tailwind CSS.",
                    Status = TaskItemStatus.InProgress,
                    Priority = TaskPriority.Low,
                    DueDate = DateTime.UtcNow.AddDays(7),
                    AssigneeName = "Liam Murphy",
                    AssigneeEmail = "liam.murphy@example.com",
                    CreatedAt = DateTime.UtcNow.AddDays(-10)
                },
                new()
                {
                    Title = "Integrate Stripe billing & subscription tier changes",
                    Description = "Support invoice downloads, payment method updates, and instant plan upgrades.",
                    Status = TaskItemStatus.Todo,
                    Priority = TaskPriority.High,
                    DueDate = DateTime.UtcNow.AddDays(20),
                    AssigneeName = "Sarah Chen",
                    AssigneeEmail = "sarah.chen@example.com",
                    CreatedAt = DateTime.UtcNow.AddDays(-3)
                }
            }
        };

        var project3 = new Project
        {
            Name = "Mobile Payment SDK v2",
            Description = "Next-generation iOS and Android SDK for biometric checkout, digital wallet passes, and offline transaction queues.",
            Status = ProjectStatus.Planned,
            StartDate = DateTime.UtcNow.AddDays(10),
            EndDate = DateTime.UtcNow.AddMonths(6),
            CreatedAt = DateTime.UtcNow.AddDays(-2),
            Tasks = new List<TaskItem>
            {
                new()
                {
                    Title = "Define cryptographic token exchange protocol",
                    Description = "Design JWT payload encryption and replay attack mitigation mechanisms.",
                    Status = TaskItemStatus.Todo,
                    Priority = TaskPriority.High,
                    DueDate = DateTime.UtcNow.AddDays(25),
                    AssigneeName = "Marcus Thorne",
                    AssigneeEmail = "marcus.thorne@example.com",
                    CreatedAt = DateTime.UtcNow.AddDays(-2)
                },
                new()
                {
                    Title = "Draft developer documentation & SDK quickstart guide",
                    Description = "Create interactive guides for Swift and Kotlin integration with sample applications.",
                    Status = TaskItemStatus.Todo,
                    Priority = TaskPriority.Low,
                    DueDate = DateTime.UtcNow.AddDays(45),
                    AssigneeName = "Elena Gomez",
                    AssigneeEmail = "elena.gomez@example.com",
                    CreatedAt = DateTime.UtcNow.AddDays(-1)
                }
            }
        };

        var project4 = new Project
        {
            Name = "Legacy SSO Deprecation",
            Description = "Successfully decommissioned legacy SAML 1.1 identity provider and migrated all organizations to OIDC / Okta.",
            Status = ProjectStatus.Completed,
            StartDate = DateTime.UtcNow.AddMonths(-6),
            EndDate = DateTime.UtcNow.AddDays(-10),
            CreatedAt = DateTime.UtcNow.AddMonths(-6),
            Tasks = new List<TaskItem>
            {
                new()
                {
                    Title = "Notify enterprise tenants of deprecation timeline",
                    Description = "Sent 90, 60, and 30 day warnings with migration guides.",
                    Status = TaskItemStatus.Done,
                    Priority = TaskPriority.High,
                    DueDate = DateTime.UtcNow.AddMonths(-3),
                    AssigneeName = "Liam Murphy",
                    AssigneeEmail = "liam.murphy@example.com",
                    CreatedAt = DateTime.UtcNow.AddMonths(-6)
                },
                new()
                {
                    Title = "Cut over authentication endpoints and decommission servers",
                    Description = "Terminated DNS routing to old SAML proxy clusters.",
                    Status = TaskItemStatus.Done,
                    Priority = TaskPriority.High,
                    DueDate = DateTime.UtcNow.AddDays(-12),
                    AssigneeName = "Alex Rivera",
                    AssigneeEmail = "alex.rivera@example.com",
                    CreatedAt = DateTime.UtcNow.AddMonths(-2)
                }
            }
        };

        context.Projects.AddRange(project1, project2, project3, project4);
        await context.SaveChangesAsync();
    }
}
