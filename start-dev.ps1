# start-dev.ps1
# Opens the backend API and frontend Vite dev server in two separate PowerShell windows.

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition

# ── [API] Backend ──────────────────────────────────────────────────
Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-Command',
    "Set-Location '$root'; Write-Host '[API] Starting ASP.NET Core backend on http://localhost:5184 ...' -ForegroundColor Cyan; dotnet run --project src/ProjectTaskManager.Api --launch-profile http"
) -WindowStyle Normal

Start-Sleep -Milliseconds 500

# ── [CLIENT] Frontend ──────────────────────────────────────────────
Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-Command',
    "Set-Location '$root\client'; Write-Host '[CLIENT] Starting Vite frontend on http://localhost:5173 ...' -ForegroundColor Green; npm run dev"
) -WindowStyle Normal

Write-Host ""
Write-Host "Both servers are starting in separate windows:" -ForegroundColor Yellow
Write-Host "  API      -> http://localhost:5184  (Swagger: http://localhost:5184/swagger)" -ForegroundColor Cyan
Write-Host "  Frontend -> http://localhost:5173" -ForegroundColor Green
Write-Host ""
