# ----------------------------------------------------
# Stage 1: Build React Frontend
# ----------------------------------------------------
FROM node:20-alpine AS frontend-build
WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# ----------------------------------------------------
# Stage 2: Build .NET 9 Backend
# ----------------------------------------------------
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS backend-build
WORKDIR /src

COPY src/ProjectTaskManager.Domain/*.csproj src/ProjectTaskManager.Domain/
COPY src/ProjectTaskManager.Application/*.csproj src/ProjectTaskManager.Application/
COPY src/ProjectTaskManager.Infrastructure/*.csproj src/ProjectTaskManager.Infrastructure/
COPY src/ProjectTaskManager.Api/*.csproj src/ProjectTaskManager.Api/
RUN dotnet restore src/ProjectTaskManager.Api/ProjectTaskManager.Api.csproj

COPY src/ src/
RUN dotnet publish src/ProjectTaskManager.Api/ProjectTaskManager.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

# ----------------------------------------------------
# Stage 3: Final Production Runtime (Single Container)
# ----------------------------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

COPY --from=backend-build /app/publish .
COPY --from=frontend-build /app/client/dist ./wwwroot

ENTRYPOINT ["dotnet", "ProjectTaskManager.Api.dll"]
