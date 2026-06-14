import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { ToastProvider, useToast } from "./context/ToastContext";
import DashboardPage from "./pages/DashboardPage";
import LeadsPage from "./pages/LeadsPage";
import AddLeadPage from "./pages/AddLeadPage";
import LeadDetailPage from "./pages/LeadDetailPage";
import SettingsPage from "./pages/SettingsPage";
import { AnimatePresence, motion } from "motion/react";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Settings,
  Sun,
  Moon,
  Menu,
  X,
  KeyRound
} from "lucide-react";

function CRMAppContent() {
  const { isAuthenticated, loading, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [activePage, setActivePage] = useState<string>("dashboard");
  const [navigationExtra, setNavigationExtra] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigateTo = (page: string, extra?: any) => {
    setActivePage(page);
    setNavigationExtra(extra || null);
    setMobileMenuOpen(false); // Close mobile drawer
  };

  // Full-screen Boot Spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">Decrypting Credentials...</h4>
            <p className="text-xs text-slate-400 mt-1">Establishing link with sandbox hybrid DB...</p>
          </div>
        </div>
      </div>
    );
  }

  // Route Active Page Switching
  const renderActivePage = () => {
    switch (activePage) {
      case "dashboard":
        return <DashboardPage onNavigate={navigateTo} />;
      case "leads":
        return <LeadsPage onNavigate={navigateTo} />;
      case "add-lead":
        return <AddLeadPage onNavigate={navigateTo} />;
      case "lead-detail":
        return (
          <LeadDetailPage 
            leadId={navigationExtra?.leadId} 
            onNavigate={navigateTo} 
          />
        );
      case "settings":
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigate={navigateTo} />;
    }
  };

  // Nav metadata mapping
  const navItems = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "leads", label: "Lead Registry", icon: Users },
    { id: "add-lead", label: "Ingest Lead", icon: UserPlus },
    { id: "settings", label: "Configurations", icon: Settings }
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* =======================================================================
          A. DESKTOP SIDEBAR RAIL (MD AND ABOVE)
          ======================================================================= */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 sticky top-0 h-screen shrink-0 z-30">
        
        {/* Sidebar Banner Branding */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white font-sans">
              LeadEngine CRM
            </span>
            <span className="block text-[10px] uppercase font-bold tracking-widest text-indigo-600 dark:text-indigo-400">
              Admin Suite
            </span>
          </div>
        </div>

        {/* Sidebar Middle Links list */}
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`w-full px-3 py-2 flex items-center gap-3 text-sm rounded-md font-medium transition-colors cursor-pointer ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                    : "text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Bottom Profile/Actions Container */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
          
          {/* User badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-extrabold shrink-0">
              {user?.name ? user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "AD"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {user?.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Theme Toggle Button w-full */}
          <div className="pt-1">
            
            <button
              onClick={toggleTheme}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-md text-slate-600 dark:text-slate-350 flex items-center justify-center cursor-pointer transition-colors"
              title="Toggle application look"
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4 mr-2" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400 mr-2" />
              )}
              <span className="text-xs font-semibold">Toggle Theme</span>
            </button>

          </div>
        </div>

      </aside>

      {/* =======================================================================
          B. MOBILE LAYOUT WRAPPER & HAMBURGER BAR (UNDER MD)
          ======================================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile Header bar */}
        <header className="md:hidden h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 flex items-center justify-between px-6 z-40">
          
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-indigo-600 rounded-lg text-white">
              <KeyRound className="w-4 h-4" />
            </span>
            <span className="font-bold text-base tracking-tight text-slate-950 dark:text-white">
              LeadEngine CRM
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
            >
              {theme === "light" ? <Moon className="w-4.5 h-4.5" /> : <Sun className="w-4.5 h-4.5 text-amber-400" />}
            </button>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 border border-slate-250 dark:border-slate-850 rounded-lg text-slate-500 active:scale-95 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
            </button>
          </div>

        </header>

        {/* Floating Mobile Hamburger Drawer overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden fixed inset-x-0 top-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-lg z-35 py-4 px-6 flex flex-col gap-3.5"
            >
              <div className="flex flex-col gap-1 px-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigateTo(item.id)}
                      className={`w-full px-3 py-2 flex items-center gap-3 text-sm rounded-md font-medium transition-colors cursor-pointer ${
                        isActive
                          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
                          : "text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-semibold text-slate-900 dark:text-white leading-none">
                    {user?.name}
                  </h5>
                  <span className="text-xs text-slate-500 dark:text-slate-400 leading-none mt-1 block">
                    {user?.email}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =======================================================================
            C. DYNAMIC MAIN ANNOTATED AREA with Frame transitions
            ======================================================================= */}
        <main className="flex-grow p-6 md:p-10 max-w-7xl w-full mx-auto self-stretch">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {renderActivePage()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer info branding line */}
        <footer className="py-6 px-10 border-t border-slate-150 dark:border-slate-900/60 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-400 dark:text-slate-500 self-stretch">
          <span>LeadEngine Suite version 1.1 · Secure Terminal</span>
          <span>© 2026 Admin Portal · Hybrid DB Active</span>
        </footer>

      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <CRMAppContent />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
