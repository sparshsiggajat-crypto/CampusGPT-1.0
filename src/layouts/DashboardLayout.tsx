import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useThemeLayout } from "../contexts/ThemeAndLayoutContext";
import { ThemeCustomizer } from "../components/ThemeCustomizer";
import { CommandSpotlight } from "../components/CommandSpotlight";
import { InteractiveTour } from "../components/InteractiveTour";
import { CampusNotification } from "../types";
import { 
  LayoutDashboard, 
  BookOpen, 
  MessageSquareCode, 
  ShieldAlert, 
  LogOut, 
  Bell, 
  RefreshCw, 
  User, 
  Menu, 
  X,
  Sparkles,
  Info,
  Settings,
  HelpCircle,
  Palette,
  Search,
  Activity
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  notifications: CampusNotification[];
  onRefreshNotifications: () => Promise<void>;
  setQuickAskText?: (text: string) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  notifications,
  onRefreshNotifications,
  setQuickAskText
}) => {
  const { auth, logout } = useAuth();
  const { 
    theme, 
    density, 
    fontScale, 
    isSpotlightOpen, 
    setIsSpotlightOpen 
  } = useThemeLayout();

  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [pollCountdown, setPollCountdown] = useState(60);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Poll notifications from the server every 60 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setPollCountdown((prev) => {
        if (prev <= 1) {
          // Trigger polling
          handlePollUpdate();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handlePollUpdate = async () => {
    setIsRefreshing(true);
    await onRefreshNotifications();
    setIsRefreshing(false);
  };

  // Browser Notifications API Handler
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Watch for new notifications to trigger a Browser Notification
  const [lastNotificationCount, setLastNotificationCount] = useState(notifications.length);
  useEffect(() => {
    if (notifications.length > lastNotificationCount) {
      const latest = notifications[notifications.length - 1];
      if ("Notification" in window && Notification.permission === "granted") {
        new window.Notification("CampusGPT Copilot Alert", {
          body: `${latest.title}: ${latest.message}`,
          icon: "/favicon.ico"
        });
      }
      setLastNotificationCount(notifications.length);
    }
  }, [notifications]);

  const markAllRead = async () => {
    try {
      await fetch("/api/student/notifications/read-all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`
        }
      });
      await onRefreshNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const navItems = [
    { id: "dashboard", label: "Copilot Dashboard", icon: LayoutDashboard, role: "student" },
    { id: "policy", label: "Campus Policies", icon: BookOpen, role: "student" },
    { id: "pharmacy", label: "Campus Pharmacy", icon: Activity, role: "student" },
    { id: "chat", label: "Personalized Copilot", icon: MessageSquareCode, role: "student" },
    { id: "settings", label: "Security & Settings", icon: Settings, role: "student" },
    { id: "help", label: "Help & Feedback", icon: HelpCircle, role: "student" },
    { id: "admin", label: "Admin Nerve Center", icon: ShieldAlert, role: "admin" }
  ];

  const filteredNavItems = navItems.filter(item => item.role === auth.user?.role || item.role === "student");

  const unreadCount = notifications.filter(n => !n.read).length;

  // Unified Theme styling look-up tables
  const wrapperThemeClass = {
    "classic-light": "bg-slate-50 text-slate-800",
    "slate-dark": "bg-slate-950 text-slate-100 dark",
    "sepia-cozy": "bg-[#FAF4E8] text-[#3c2f1f]",
    "forest-fresh": "bg-[#0b140f] text-emerald-100 dark"
  }[theme];

  const sidebarThemeClass = {
    "classic-light": "bg-white border-slate-150 text-slate-800",
    "slate-dark": "bg-slate-900 border-slate-800 text-slate-200",
    "sepia-cozy": "bg-[#f5ebd5] border-[#dfd4be] text-[#3c2f1f]",
    "forest-fresh": "bg-[#142318] border-[#25392b] text-[#e6f4ea]"
  }[theme];

  const headerThemeClass = {
    "classic-light": "bg-white border-slate-150 text-slate-900",
    "slate-dark": "bg-slate-900 border-slate-850 text-slate-100",
    "sepia-cozy": "bg-[#f3e6cd] border-[#dfd4be] text-[#3c2f1f]",
    "forest-fresh": "bg-[#16271c] border-[#25392b] text-emerald-100"
  }[theme];

  const badgeThemeClass = {
    "classic-light": "bg-indigo-50 border-indigo-105 text-indigo-700",
    "slate-dark": "bg-indigo-950/60 border-indigo-900 text-indigo-300",
    "sepia-cozy": "bg-[#ebe0cb] border-[#dfd4be] text-amber-900",
    "forest-fresh": "bg-[#111c14] border-[#2a4531] text-[#9ccd9b]"
  }[theme];

  const subHeaderBg = {
    "classic-light": "bg-gradient-to-r from-blue-50 to-indigo-50/50 text-slate-950",
    "slate-dark": "bg-slate-950/40 text-white border-b border-slate-800/80",
    "sepia-cozy": "bg-[#ebe0cb] text-[#3c2f1f]",
    "forest-fresh": "bg-[#111c14] text-emerald-100"
  }[theme];

  const scaleClass = {
    "sm": "text-xs select-text font-medium leading-relaxed [--base-sz:0.875rem]",
    "base": "text-sm select-text font-medium leading-normal [--base-sz:1rem]",
    "lg": "text-base select-text font-medium leading-loose [--base-sz:1.125rem]"
  }[fontScale];

  const borderThemeClass = {
    "classic-light": "border-slate-150",
    "slate-dark": "border-slate-800",
    "sepia-cozy": "border-[#dfd4be]",
    "forest-fresh": "border-[#25392b]"
  }[theme];

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-200 ${wrapperThemeClass} ${scaleClass}`} id="campus-root-layout">
      
      {/* Sidebar for Desktop */}
      <aside className={`hidden lg:flex flex-col w-64 border-r shadow-sm shrink-0 transition-all duration-200 ${sidebarThemeClass} ${borderThemeClass}`}>
        <div className={`h-16 flex items-center px-6 border-b shrink-0 transition-colors ${subHeaderBg} ${borderThemeClass}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-150">
              C
            </div>
            <div>
              <h1 className="font-extrabold tracking-tight leading-none text-base">CampusGPT</h1>
              <span className="text-[9px] uppercase tracking-wider font-extrabold block mt-0.5 opacity-80">AI Student Copilot</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isTabActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  isTabActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200/50"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white text-slate-500 dark:text-slate-400"
                }`}
              >
                <Icon className="w-4.5 h-4.5 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className={`p-4 border-t ${borderThemeClass}`}>
          <div className={`flex items-center gap-3 p-2 rounded-xl border mb-3 shadow-sm ${sidebarThemeClass} ${borderThemeClass}`}>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm shrink-0">
              {auth.user?.name[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold truncate leading-tight">{auth.user?.name}</p>
              <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest block leading-relaxed mt-0.5">{auth.user?.role}</p>
            </div>
          </div>

          <button
            onClick={logout}
            id="sidebar-logout-btn"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-950/40 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-bold transition"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-950/50 z-50 lg:hidden flex">
          <div className={`w-64 h-full flex flex-col shadow-xl animate-in slide-in-from-left duration-200 ${sidebarThemeClass}`}>
            <div className={`h-16 flex items-center justify-between px-6 border-b shrink-0 ${borderThemeClass}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-base">
                  C
                </div>
                <div>
                  <h1 className="font-extrabold text-sm tracking-tight">CampusGPT</h1>
                  <span className="text-[9px] uppercase tracking-widest font-extrabold opacity-80 block">AI Copilot</span>
                </div>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isTabActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`mobile-nav-${item.id}`}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold transition ${
                      isTabActive
                        ? "bg-indigo-600 text-white shadow"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className={`p-4 border-t ${borderThemeClass}`}>
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-rose-250 text-rose-600 text-xs font-bold hover:bg-rose-50"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsSidebarOpen(false)} />
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className={`h-16 flex items-center justify-between px-4 lg:px-8 border-b shadow-xs shrink-0 z-30 transition-all ${headerThemeClass} ${borderThemeClass}`}>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm font-black tracking-tight uppercase border-l-4 border-indigo-600 pl-3">
              {activeTab === "dashboard" && "Copilot Overview"}
              {activeTab === "policy" && "Policy Document Navigator"}
              {activeTab === "pharmacy" && "Campus Pharmacy & Digital Medical Store"}
              {activeTab === "chat" && "Personalized AI Copilot"}
              {activeTab === "settings" && "Security & Core Settings"}
              {activeTab === "help" && "Help Desk & Portal FAQ"}
              {activeTab === "admin" && "Administrative Center"}
            </h2>
          </div>

          {/* Timers, Alerts and Profiles */}
          <div className="flex items-center gap-2.5">
            
            {/* Spotlight CMD Trigger Bar */}
            <button
              onClick={() => setIsSpotlightOpen(true)}
              className={`py-1.5 px-3 border rounded-full hover:shadow-xs transition flex items-center gap-1.5 focus:outline-none cursor-pointer bg-slate-50/50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 ${borderThemeClass}`}
              title="Open Command Spotlight (Ctrl+K)"
              id="header-spotlight-button"
            >
              <Search className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-[10px] font-bold max-sm:hidden">Spotlight</span>
              <kbd className="text-[8px] bg-white dark:bg-slate-800 border dark:border-slate-750 rounded px-1 text-slate-400 font-mono tracking-tighter leading-none hidden md:inline-block">Ctrl+K</kbd>
            </button>

            {/* Appearance settings selector option */}
            <button
              onClick={() => setIsCustomizerOpen(true)}
              className={`p-2 rounded-full border hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer bg-slate-50/50 dark:bg-slate-900/40 ${borderThemeClass}`}
              title="Appearance & Accessibility"
              id="header-theme-toggle-button"
            >
              <Palette className="w-4 h-4 text-indigo-500" />
            </button>

            {/* Polling Timer Countdown Badge */}
            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold ${badgeThemeClass} ${borderThemeClass} select-none`}>
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-600"></span>
              </span>
              <span>Syncing in {pollCountdown}s</span>
              <button 
                onClick={handlePollUpdate} 
                className={`p-0.5 rounded-md hover:opacity-80 transition-transform ${isRefreshing ? "animate-spin" : ""}`}
                title="Refresh Portal State"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>

            {/* Notifications Tray */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} 
                id="header-notification-bell"
                className={`p-2 rounded-full border hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs relative transition cursor-pointer bg-slate-50/50 dark:bg-slate-900/40 ${borderThemeClass}`}
              >
                <Bell className="w-4 h-4 text-indigo-500" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-600 text-white font-extrabold text-[8px] rounded-full h-4.5 w-4.5 flex items-center justify-center border-1.5 border-white dark:border-slate-900 shadow animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Drawer */}
              {isNotificationsOpen && (
                <div className={`absolute right-0 mt-3 w-80 lg:w-96 border rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-850 animate-in fade-in slide-in-from-top-3 duration-150 bg-white dark:bg-slate-900 ${borderThemeClass}`}>
                  <div className={`px-4 py-3 flex items-center justify-between border-b ${subHeaderBg} ${borderThemeClass}`}>
                    <span className="font-extrabold text-xs flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Notifications Drawer
                    </span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllRead} 
                        className="text-[10px] text-indigo-600 dark:text-indigo-400 font-extrabold hover:underline bg-transparent border-0 outline-none"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold">No notifications recorded</p>
                      </div>
                    ) : (
                      notifications.map((note) => (
                        <div 
                          key={note.id} 
                          className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition border-l-4 ${
                            note.read ? "border-transparent opacity-80" : "border-indigo-600 bg-slate-50/20 dark:bg-slate-850/20"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-extrabold text-slate-900 dark:text-white text-[11px]">{note.title}</span>
                            <span className="text-[8px] font-extrabold text-slate-400 uppercase">
                              {note.type}
                            </span>
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 text-[10px] mt-1 line-clamp-2 leading-relaxed font-semibold">{note.message}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[8px] text-slate-400">
                              {new Date(note.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {note.emailSent && (
                              <span className="text-[8px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border border-emerald-200 dark:border-emerald-900 px-1.5 py-0.5 rounded-full font-semibold">
                                Email Alert Sent
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-2.5 bg-slate-50/50 dark:bg-slate-950/20 text-center">
                    <p className="text-[9px] text-slate-400 font-bold flex items-center justify-center gap-1">
                      <Info className="w-3 h-3 text-indigo-500" />
                      React Query polling synced automatically
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Portal */}
        <main className={`flex-1 overflow-y-auto transition-all ${
          density === "compact" ? "p-3 lg:p-4 gap-4 space-y-4" : 
          density === "spacious" ? "p-6 lg:p-12 gap-8 space-y-8" : 
          "p-4 lg:p-8 gap-6 space-y-6"
        }`}>
          {children}
        </main>
      </div>

      {/* Accessibility Overlays & Guide Tours */}
      <ThemeCustomizer 
        isOpen={isCustomizerOpen} 
        onClose={() => setIsCustomizerOpen(false)} 
        userRole={auth.user?.role} 
      />

      <CommandSpotlight 
        isOpen={isSpotlightOpen} 
        onClose={() => setIsSpotlightOpen(false)} 
        setActiveTab={setActiveTab}
        setQuickAskText={setQuickAskText}
        userRole={auth.user?.role} 
      />

      <InteractiveTour userRole={auth.user?.role} />

    </div>
  );
};
