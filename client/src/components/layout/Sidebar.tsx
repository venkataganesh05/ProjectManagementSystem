import React, { useState } from "react";
import { Layers, LayoutDashboard, FolderKanban, CheckSquare, Menu, X } from "lucide-react";

export type AppView = "dashboard" | "projects" | "tasks";

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

const navItems: { view: AppView; label: string; icon: React.ReactNode }[] = [
  {
    view: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    view: "projects",
    label: "Projects",
    icon: <FolderKanban className="h-4 w-4" />,
  },
  {
    view: "tasks",
    label: "Tasks",
    icon: <CheckSquare className="h-4 w-4" />,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (view: AppView) => {
    onNavigate(view);
    setMobileOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Brand — largest text in sidebar */}
      <div className="flex items-start gap-3 px-4 py-6 border-b border-slate-800">
        <div className="rounded-lg bg-indigo-600 p-2 text-white shadow-sm flex-shrink-0 mt-0.5">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <p className="text-base font-extrabold text-white leading-tight">
            Project &amp; Task Manager
          </p>
          <p className="text-[11px] uppercase font-semibold tracking-widest text-indigo-400 mt-1">
            Engineering Workspace
          </p>
        </div>
      </div>

      {/* Navigation — smaller than brand */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 pt-1 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Menu
        </p>
        {navItems.map((item) => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => handleNav(item.view)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 flex-shrink-0 bg-slate-900 min-h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between bg-slate-900 px-4 py-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-indigo-600 p-1.5 text-white">
            <Layers className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold text-white">Project &amp; Task Manager</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-slate-300 hover:text-white"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Sidebar Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 flex">
          <div className="w-64 bg-slate-900 min-h-screen pt-14">
            <SidebarContent />
          </div>
          <div
            className="flex-1 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}
    </>
  );
};
