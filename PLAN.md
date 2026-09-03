# Project & Task Management System — Architecture & Specification

## 1. Overview
A full-stack CRUD application for managing engineering projects and their associated work items (tasks).
The application is structured into a clean decoupled architecture:
- **Backend**: ASP.NET Core 9 Web API (Controller-based, EF Core Code First, SQL Server, FluentValidation).
- **Database**: SQL Server 2022 (`VENKATAGANESH`), Database: `ProjectManagementDb`.
- **Frontend**: React (Vite) + TypeScript + Tailwind CSS + React Hook Form + Zod + Axios.

---

## 2. Technology Stack & Database Configuration

### Database Connection
- **Server**: `VENKATAGANESH` (localhost)
- **Database**: `ProjectManagementDb`
- **Authentication**: SQL Server Authentication (`sa` / `<your_password>`) with fallback to Windows Authentication (`Integrated Security=True`).
- **Connection String**: `Server=localhost;Database=ProjectManagementDb;Integrated Security=True;TrustServerCertificate=True;MultipleActiveResultSets=True;`

### Backend Stack
- **Framework**: .NET 9.0 (ASP.NET Core Web API)
- **ORM**: Entity Framework Core 9.0 (SQL Server Provider, Code First Migrations)
- **Validation**: FluentValidation 11.x (server-side DTO validation)
- **API Documentation**: OpenAPI / Swagger UI
- **Testing**: xUnit, Moq, FluentAssertions

### Frontend Stack (Phase 2)
- **Build Tool**: Vite
- **UI Library**: React + TypeScript
- **Styling**: Tailwind CSS
- **Forms & Validation**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Testing**: Vitest + React Testing Library

---

## 3. Data Models & Database Schema

### `Projects` Table
| Column | Type | Nullable | Constraints / Details |
|---|---|---|---|
| `Id` | `int` | No | PK, Identity(1,1) |
| `Name` | `nvarchar(150)` | No | Required, Indexed |
| `Description` | `nvarchar(1000)` | Yes | Optional |
| `Status` | `nvarchar(50)` | No | Enum: `Planned`, `Active`, `Completed`, `Archived` |
| `StartDate` | `datetime2` | No | Required |
| `EndDate` | `datetime2` | Yes | Must be >= StartDate if provided |
| `CreatedAt` | `datetime2` | No | Default: UTC Now |
| `UpdatedAt` | `datetime2` | Yes | Audit timestamp |

### `TaskItems` Table
| Column | Type | Nullable | Constraints / Details |
|---|---|---|---|
| `Id` | `int` | No | PK, Identity(1,1) |
| `ProjectId` | `int` | No | FK to `Projects(Id)`, Cascade Delete, Indexed |
| `Title` | `nvarchar(200)` | No | Required, Indexed |
| `Description` | `nvarchar(2000)` | Yes | Optional |
| `Status` | `nvarchar(50)` | No | Enum: `Todo`, `InProgress`, `Done`, Indexed |
| `Priority` | `nvarchar(50)` | No | Enum: `Low`, `Medium`, `High`, Indexed |
| `DueDate` | `datetime2` | Yes | Indexed |
| `AssigneeName` | `nvarchar(100)` | Yes | Optional |
| `AssigneeEmail` | `nvarchar(255)` | Yes | Optional, valid email format |
| `CreatedAt` | `datetime2` | No | Default: UTC Now |
| `UpdatedAt` | `datetime2` | Yes | Audit timestamp |

---

## 4. API Endpoints & Response Contracts

### Common Response Envelope (`ApiResponse<T>`)
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "errors": null,
  "statusCode": 200,
  "timestamp": "2026-09-03T04:00:00Z"
}
```

### Pagination Model (`PagedResult<T>`)
```json
{
  "items": [ ... ],
  "pageNumber": 1,
  "pageSize": 10,
  "totalCount": 25,
  "totalPages": 3,
  "hasPreviousPage": false,
  "hasNextPage": true
}
```

### Endpoints Matrix
| Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| `GET` | `/api/projects` | List projects with search & pagination | Query: `search`, `status`, `pageNumber`, `pageSize` | `ApiResponse<PagedResult<ProjectResponseDto>>` |
| `POST` | `/api/projects` | Create a new project | `CreateProjectDto` | `ApiResponse<ProjectResponseDto>` (201) |
| `GET` | `/api/projects/{id}` | Get project detail with tasks | None | `ApiResponse<ProjectDetailResponseDto>` (200 / 404) |
| `PUT` | `/api/projects/{id}` | Update existing project | `UpdateProjectDto` | `ApiResponse<ProjectResponseDto>` (200 / 404) |
| `DELETE` | `/api/projects/{id}` | Cascade delete project & tasks | None | `ApiResponse<string>` (200 / 404) |
| `GET` | `/api/projects/{id}/tasks`| List project tasks (search/filter/sort) | Query: `search`, `status`, `priority`, `sortBy`, `sortDescending`, `pageNumber`, `pageSize` | `ApiResponse<PagedResult<TaskResponseDto>>` |
| `POST` | `/api/projects/{id}/tasks`| Create task under project | `CreateTaskDto` | `ApiResponse<TaskResponseDto>` (201 / 404) |
| `PUT` | `/api/tasks/{id}` | Update existing task | `UpdateTaskDto` | `ApiResponse<TaskResponseDto>` (200 / 404) |
| `DELETE` | `/api/tasks/{id}` | Delete task | None | `ApiResponse<string>` (200 / 404) |

---

## 5. Implementation Roadmap
1. **Backend Core**: Upgrade to .NET 9, install EF Core & FluentValidation NuGet packages.
2. **Entity & DTO Models**: Implement domain models, enums, DTOs, and FluentValidation rules.
3. **DbContext & Migrations**: Configure DbContext, generate initial migration, and apply to `VENKATAGANESH`.
4. **Seed Data**: Automatic seeding of demo projects and tasks on startup.
5. **Services & Controllers**: Implement clean layered services and controllers with `ExceptionHandlingMiddleware`.
6. **Automated Backend Tests**: Write xUnit unit tests for controllers and validation logic.
7. **Frontend Application**: Scaffold Vite + React + Tailwind app and wire up components.
