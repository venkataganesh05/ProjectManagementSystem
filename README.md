# Project & Task Manager

A clean, modern full-stack web app for managing engineering projects and team tasks. Built with **ASP.NET Core 9** on the backend and **React + TypeScript + Tailwind CSS** on the frontend.

Supports both **PostgreSQL** and **SQL Server** out of the box.

---

## Features

- **Project Tracking**: Create, view, update, and archive projects with start/end timelines.
- **Task Management**: Break down projects into actionable tasks with priorities (Low, Medium, High) and statuses (Todo, In Progress, Done).
- **Search & Filters**: Quickly find projects or tasks by keyword, status, priority, or due date.
- **Progress Tracking**: Real-time progress bars showing completed vs remaining tasks for each project.
- **Clean Dashboard**: High-level overview of active, planned, and completed work across your workspace.
- **Responsive UI**: Looks great on both desktop and mobile screens.

---

## Tech Stack

- **Backend**: ASP.NET Core 9 (Clean Architecture — Domain, Application, Infrastructure, API)
- **Database**: PostgreSQL / Microsoft SQL Server with Entity Framework Core 9 (Code-First)
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Deployment**: Docker-ready single container build (deployable to Railway, Render, etc.)

---

## Quick Start (Run Locally)

### Prerequisites
- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js 18+](https://nodejs.org/)

### 1. Clone the repository
```bash
git clone https://github.com/venkataganesh05/ProjectManagementSystem.git
cd ProjectManagementSystem
```

### 2. Install dependencies & run
You can start both the backend API and frontend with a single command from the root directory:

```bash
npm install
npm run dev
```

That’s it! Once started:
- **Web App**: [http://localhost:5173](http://localhost:5173)
- **API & Swagger Docs**: [http://localhost:5184/swagger](http://localhost:5184/swagger)

*(On startup, the database is automatically created and seeded with sample projects and tasks so you can test immediately).*

---

## Database Configuration

The application automatically detects which database you are using:

- **Local SQL Server (Default)**: Uses Windows Authentication or local SQL Server as configured in `appsettings.json`.
- **PostgreSQL (Railway / Cloud)**: Automatically detects `DATABASE_URL` or standard PostgreSQL connection strings, connects with SSL, and sets up tables automatically.

---

## API Summary

The backend exposes a clean RESTful API:

| Method | Endpoint | What it does |
|---|---|---|
| `GET` | `/api/projects` | List all projects (with search, filter, pagination) |
| `POST` | `/api/projects` | Create a new project |
| `GET` | `/api/projects/{id}` | Get project details and its tasks |
| `PUT` | `/api/projects/{id}` | Edit a project |
| `DELETE` | `/api/projects/{id}` | Delete a project and its tasks |
| `GET` | `/api/projects/{id}/tasks` | Get tasks for a specific project |
| `POST` | `/api/projects/{id}/tasks` | Add a task to a project |
| `PUT` | `/api/tasks/{id}` | Update task status, priority, or assignee |
| `DELETE` | `/api/tasks/{id}` | Delete a task |

Interactive API documentation and request testing is available at `/swagger`.

---

## Running Tests

### Backend Tests (22 unit tests)
```bash
dotnet test
```

### Frontend Tests (8 UI tests)
```bash
cd client
npm test
```

---

## Deployment (Docker)

The project includes a multi-stage `Dockerfile` that packages both the frontend and backend into a single lightweight container.

- In platforms like **Railway**, simply connect this repository and add a **PostgreSQL** database.
- Port: `8080` (or Railway dynamic `$PORT`).
