import { useState } from "react";
import { Sidebar, AppView } from "./components/layout/Sidebar";
import { Project } from "./types/project.types";
import { DashboardPage } from "./pages/DashboardPage";
import { ProjectListPage } from "./pages/ProjectListPage";
import { AllTasksPage } from "./pages/AllTasksPage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { ProjectForm } from "./components/projects/ProjectForm";
import { useCreateProject } from "./hooks/useCreateProject";
import { ProjectFormData } from "./schemas/project.schema";

export function App() {
  const [currentView, setCurrentView] = useState<AppView>("dashboard");
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { createProject, loading: isCreating } = useCreateProject();

  const handleSelectProject = (project: Project) => {
    setSelectedProjectId(project.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackFromDetail = () => {
    setSelectedProjectId(null);
  };

  const handleProjectDeleted = () => {
    setSelectedProjectId(null);
    setCurrentView("projects");
  };

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
    setSelectedProjectId(null);
  };

  const handleCreateSubmit = async (data: ProjectFormData) => {
    try {
      await createProject({
        name: data.name,
        description: data.description || null,
        status: data.status,
        startDate: data.startDate,
        endDate: data.endDate || null,
      });
      setIsCreateOpen(false);
      setCurrentView("projects");
    } catch {
      // error handled by hook
    }
  };

  const renderContent = () => {
    // Project detail always takes precedence
    if (selectedProjectId !== null) {
      return (
        <ProjectDetailPage
          projectId={selectedProjectId}
          onBack={handleBackFromDetail}
          onProjectDeleted={handleProjectDeleted}
        />
      );
    }

    switch (currentView) {
      case "dashboard":
        return (
          <DashboardPage
            onNavigateToProjects={() => handleNavigate("projects")}
            onSelectProject={handleSelectProject}
            onOpenCreateProject={() => setIsCreateOpen(true)}
          />
        );
      case "projects":
        return <ProjectListPage onSelectProject={handleSelectProject} />;
      case "tasks":
        return <AllTasksPage onSelectProject={handleSelectProject} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Left Sidebar */}
      <Sidebar currentView={currentView} onNavigate={handleNavigate} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile top bar spacer */}
        <div className="h-14 md:hidden" />
        <div className="px-10 py-8">
          {renderContent()}
        </div>
      </main>

      {/* Global Create Project Modal (triggered from Dashboard) */}
      <ProjectForm
        isOpen={isCreateOpen}
        project={null}
        isLoading={isCreating}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
      />
    </div>
  );
}

export default App;
