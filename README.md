# Project & Task Management System — Full Stack Application

A production-minded, full-stack application for managing engineering projects and their associated work items (tasks). Built with an **ASP.NET Core 9** Web API backend, **Entity Framework Core 9 (Code First)**, **SQL Server**, and a modern **React 18 + TypeScript + Vite + Tailwind CSS** frontend.

---

## 1. Project Overview
This service provides full CRUD workflows for managing projects and project tasks for an engineering team.
Key features include:
- Complete **Project CRUD**: Name, description, status (`Planned`, `Active`, `Completed`, `Archived`), start date, and optional end date.
- Complete **Task CRUD**: Title, description, status (`Todo`, `InProgress`, `Done`), priority (`Low`, `Medium`, `High`), due date, and optional assignee name/email.
- **Relational Integrity & Cascade Deletion**: Tasks are strictly tied to existing projects (`ProjectId` foreign key). Deleting a project automatically cascade-deletes its associated tasks.
- **Search, Filtering & Sorting**: Search tasks by title or description, filter by status and priority, and sort by due date, priority, or creation date.
- **Standardized Response Envelope**: All endpoints return a uniform `ApiResponse<T>` wrapper and `PagedResult<T>` for paginated collections.
- **Centralized Error Handling**: Unhandled exceptions and validation errors are intercepted by `ExceptionHandlingMiddleware` without leaking sensitive server internals.
- **Automated Testing**: Comprehensive unit tests covering controllers, validation errors, and business edge cases.

---

### 2. Technology Stack

### Backend
| Layer | Technology | Details |
|---|---|---|
| Framework | ASP.NET Core 9.0 | Web API (Controller-based) |
| ORM | Entity Framework Core 9.0.2 | Code First, Migrations, Fluent API |
| Database | Microsoft SQL Server 2022 | Local instance / SQL Server Express |
| Validation | FluentValidation 11.3.0 | Server-side request model validation |
| API Docs | Swagger / OpenAPI | Swashbuckle 6.6.2 |
| Testing | xUnit 2.9.2, Moq 4.20.72 | 22 automated unit tests |

### Frontend
| Layer | Technology | Details |
|---|---|---|
| Framework | React 18.3.1 | Single Page Application (SPA) |
| Language | TypeScript 5.5.3 | Strict typing with no unused locals |
| Build Tool | Vite 5.4.2 | Fast HMR and optimized bundling |
| Styling | Tailwind CSS 3.4.1 | Utility-first responsive design |
| Form & Validation | React Hook Form + Zod | Schema-based client validation |
| HTTP Client | Axios 1.7.9 | Centralized client with response typing |
| Icons | Lucide React 0.441.0 | Accessible vector icons |
| Testing | Vitest 2.1.1, RTL | 8 automated component & interaction tests |

---

## 3. Architecture & Folder Structure (Clean Architecture)
```
ProjectTaskManager/
├── src/
│   ├── ProjectTaskManager.Domain/           # Core Domain Layer (Pure C#, zero external dependencies)
│   │   ├── Entities/                        # Project, TaskItem
│   │   ├── Enums/                           # ProjectStatus, TaskItemStatus, TaskPriority
│   │   └── ProjectTaskManager.Domain.csproj
│   │
│   ├── ProjectTaskManager.Application/      # Application Layer (Use Cases, DTOs, Business Rules)
│   │   ├── Common/
│   │   │   ├── ApiResponse.cs               # Standardized JSON response envelope
│   │   │   ├── PagedResult.cs               # Pagination metadata container
│   │   │   └── Interfaces/
│   │   │       └── IAppDbContext.cs         # Database abstraction interface
│   │   ├── DTOs/
│   │   │   ├── Projects/                    # CreateProjectDto, UpdateProjectDto, ProjectResponseDto
│   │   │   └── Tasks/                       # CreateTaskDto, UpdateTaskDto, TaskResponseDto
│   │   ├── Services/
│   │   │   ├── IProjectService.cs & ProjectService.cs  # Project business logic & pagination
│   │   │   └── ITaskService.cs & TaskService.cs        # Task business logic, filters, & sorting
│   │   ├── Validators/                      # FluentValidation rules for projects and tasks
│   │   └── ProjectTaskManager.Application.csproj
│   │
│   ├── ProjectTaskManager.Infrastructure/   # Infrastructure Layer (Data Access, Migrations)
│   │   ├── Data/
│   │   │   ├── AppDbContext.cs              # EF Core context implementing IAppDbContext
│   │   │   └── SeedData.cs                  # Realistic seed dataset (4 projects, 10 tasks)
│   │   ├── Migrations/                      # EF Core Code First migrations
│   │   └── ProjectTaskManager.Infrastructure.csproj
│   │
│   └── ProjectTaskManager.Api/              # Presentation / API Layer (ASP.NET Core Web API)
│       ├── Controllers/
│       │   ├── ProjectsController.cs        # Endpoints for project CRUD and nested tasks
│       │   └── TasksController.cs           # Endpoints for task update and deletion
│       ├── Middleware/
│       │   └── ExceptionHandlingMiddleware.cs # Global error interception & JSON response
│       ├── Properties/
│       │   └── launchSettings.json          # Development profiles (Port 5184)
│       ├── Program.cs                       # DI composition root, Swagger, CORS, pipeline
│       ├── appsettings.json                 # Active configuration
│       ├── appsettings.Development.json.example
│       └── ProjectTaskManager.Api.csproj
│
├── tests/
│   └── ProjectTaskManager.Api.Tests/        # Unit Test Suite (xUnit + Moq)
│       ├── ProjectsControllerTests.cs       # 14 unit tests for ProjectsController
│       ├── TasksControllerTests.cs          # 8 unit tests for TasksController
│       └── ProjectTaskManager.Api.Tests.csproj
│
├── client/                                  # Client Presentation Layer (React + Vite + Tailwind)
│   ├── src/
│   │   ├── api/                             # Centralized Axios client and typed API calls
│   │   ├── components/
│   │   │   ├── common/                      # Button, Input, Select, Modal, ConfirmDialog,
│   │   │   │                                # EmptyState, ErrorState, LoadingSpinner, Pagination
│   │   │   ├── projects/                    # ProjectCard, ProjectForm, ProjectList
│   │   │   └── tasks/                       # TaskCard, TaskFilters, TaskForm, TaskList
│   │   ├── hooks/                           # Custom React hooks (useProjects, useProject, useTasks, etc.)
│   │   ├── pages/
│   │   │   ├── ProjectListPage.tsx          # Project dashboard with metrics, search, filters
│   │   │   └── ProjectDetailPage.tsx        # Project detail view with full task management
│   │   ├── schemas/                         # Zod validation schemas matching backend rules
│   │   ├── types/                           # TypeScript models for Project, Task, API envelope
│   │   ├── App.tsx                          # Top-level application routing
│   │   └── main.tsx
│   ├── tests/
│   │   ├── ProjectForm.test.tsx             # 4 form validation & submission tests
│   │   └── TaskFilters.test.tsx             # 4 filter state, badge counter, and search tests
│   ├── .env.example                         # Template for VITE_API_BASE_URL
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── ProjectTaskManager.sln                   # Visual Studio Solution containing all 5 projects
└── README.md
```

---

## 4. Prerequisites
- **.NET 9.0 SDK** (`9.0.304` or later)
- **Node.js** (v18.0.0 or later, with `npm`)
- **Microsoft SQL Server 2022** (or SQL Server Express / Developer edition)
- **PowerShell 7+** or Windows PowerShell / Terminal

---

## 5. Environment Variables & Configuration

### Backend (`src/ProjectTaskManager.Api/appsettings.json`)
The application defaults to Windows Authentication (no passwords stored in configuration):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=ProjectManagementDb;Integrated Security=True;TrustServerCertificate=True;MultipleActiveResultSets=True;"
  },
  "CorsOrigins": [
    "http://localhost:5173",
    "http://localhost:3000"
  ]
}
```
For SQL Server Authentication, copy `appsettings.Development.json.example` to `appsettings.Development.json` (which is `.gitignore`d) and fill in your credentials:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=ProjectManagementDb;User Id=sa;Password=<your_password>;TrustServerCertificate=True;MultipleActiveResultSets=True;"
  }
}
```

### Frontend (`frontend/.env`)
The frontend uses Vite environment variables:
```env
VITE_API_BASE_URL=http://localhost:5184/api
```
A template is provided in `frontend/.env.example`.

---

## 6. Database Setup & Migrations
The database schema is managed via Entity Framework Core Code First migrations.

> **Automatic Migration & Seeding**: When the backend starts up, it automatically calls `Database.MigrateAsync()` and `SeedData.InitializeAsync()`. This creates `ProjectManagementDb` on your SQL Server instance, applies the table schema with indexes, and seeds 4 realistic projects with 10 tasks.

To apply migrations manually via CLI:
```bash
dotnet ef database update
```

---

## 7. Running Locally

### Single-Command Dev Orchestration (Recommended)
You can start both the ASP.NET Core backend and the Vite frontend dev server together in a single terminal:
```bash
npm run dev
```
This runs `concurrently`, launching both processes in parallel with color-coded, labeled log outputs:
- **`[API]`**: Starts ASP.NET Core API at `http://localhost:5184` (Swagger: `http://localhost:5184/swagger`)
- **`[CLIENT]`**: Starts Vite frontend dev server at `http://localhost:5173`

---

### Alternative: Running Each Service Separately

#### Step 1: Start the Backend API
In the repository root:
```bash
dotnet run --project src/ProjectTaskManager.Api --launch-profile http
```
The backend starts at:
- **API Base**: `http://localhost:5184`
- **Swagger UI**: [http://localhost:5184/swagger](http://localhost:5184/swagger)

#### Step 2: Start the Frontend Application
In a separate terminal window:
```bash
cd client
npm install
npm run dev
```
The frontend starts at:
- **Web App**: [http://localhost:5173](http://localhost:5173)

---

## 8. Running Automated Tests

### Backend Unit Tests (xUnit + Moq)
Covers all controller endpoints, service logic, input validation, and not-found/error handling:
```bash
dotnet test
```
- **Tests**: 22 passed
- **Coverage**: `ProjectsControllerTests` (14 tests), `TasksControllerTests` (8 tests)

### Frontend Component & Interaction Tests (Vitest + React Testing Library)
Covers form validation (empty fields, date ordering), client-side schema constraints, active filters, search inputs, and badge updates:
```bash
cd client
npx vitest run
```
- **Tests**: 8 passed
- **Coverage**: `ProjectForm.test.tsx` (4 tests), `TaskFilters.test.tsx` (4 tests)

### Total Automated Tests: **30 passed (0 failed)**

---

## 9. API Overview

### Common Response Envelope (`ApiResponse<T>`)
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... },
  "errors": null,
  "statusCode": 200,
  "timestamp": "2026-09-03T04:20:00Z"
}
```

### Endpoints Matrix
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/projects` | List projects with search (`search`), status filter (`status`), and pagination (`pageNumber`, `pageSize`) |
| `POST` | `/api/projects` | Create a new project (validates required fields, date order) |
| `GET` | `/api/projects/{id}` | Get project details including task summary and task items |
| `PUT` | `/api/projects/{id}` | Update existing project details |
| `DELETE` | `/api/projects/{id}` | Delete project (cascade deletes all related tasks) |
| `GET` | `/api/projects/{id}/tasks`| List project tasks with search, status/priority filters, and sort options |
| `POST` | `/api/projects/{id}/tasks`| Create a task under a project (validates project existence) |
| `GET` | `/api/tasks/{id}` | Get a single task item by ID |
| `PUT` | `/api/tasks/{id}` | Update an existing task |
| `DELETE` | `/api/tasks/{id}` | Delete an individual task |

---

## 10. Design Decisions & Trade-offs

1. **Database Selection (SQL Server vs PostgreSQL)**:
   - The assignment recommended PostgreSQL or MySQL. SQL Server 2022 was chosen to leverage first-class, idiomatic tooling with .NET 9 and Entity Framework Core 9 (e.g., native execution strategies, snapshot isolation, and resilient connection pooling).
   - Because all persistence is encapsulated behind EF Core `AppDbContext` using standard relational abstractions (fluent configurations, foreign keys, indexes), switching to PostgreSQL (`Npgsql.EntityFrameworkCore.PostgreSQL`) requires changing only the connection string and provider registration in `Program.cs`.

2. **Cascade Deletion**:
   - When a project is deleted, its child tasks are automatically cascade deleted (`DeleteBehavior.Cascade`). The UI explicitly warns the user of this impact in a `ConfirmDialog` before proceeding. This guarantees referential integrity without leaving orphaned task records.

3. **Layered Validation (Server & Client)**:
   - **Client-Side**: React Hook Form combined with Zod schemas (`project.schema.ts`, `task.schema.ts`) provides immediate, accessible inline validation feedback before network requests.
   - **Server-Side**: FluentValidation validators run automatically on incoming DTOs to enforce domain invariants (e.g., end date must be on or after start date; task priority must be valid enum; strings trimmed and length-bounded).

4. **Response Envelope Pattern**:
   - All endpoints return a uniform `ApiResponse<T>` with consistent status codes, timestamps, and error bags. Paginated lists wrap data in `PagedResult<T>` with current page, total pages, total count, and navigation flags (`hasPreviousPage`, `hasNextPage`).

5. **Performance & Indexing**:
   - Explicit database indexes are applied on high-cardinality and frequent query paths: `ProjectId` (foreign key join performance), `Name`/`Title` (search queries), and `Status`/`Priority`/`DueDate`/`CreatedAt` (filters and sorting).

6. **Frontend State & Reusable Components**:
   - Custom React hooks (`useProjects`, `useProject`, `useTasks`) decouple UI presentation from API communication and state synchronization.
   - Reusable component primitives (`Button`, `Input`, `Select`, `Modal`, `ConfirmDialog`, `EmptyState`, `ErrorState`, `LoadingSpinner`, `Pagination`) guarantee visual and behavioral consistency.

---

## 11. Known Limitations & Future Improvements
- **Authentication & Authorization**: Core requirements focused on CRUD and business logic; JWT or OAuth2 bearer tokens can be integrated cleanly into the ASP.NET Core middleware pipeline.
- **Audit Logging**: An event table or temporal tables to track history of task status changes and assignment transitions.
- **Dockerization**: A multi-stage `Dockerfile` and `docker-compose.yml` for zero-configuration containerized execution.

