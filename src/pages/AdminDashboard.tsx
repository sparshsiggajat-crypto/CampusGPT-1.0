import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { 
  BarChart, 
  Users, 
  User, 
  GraduationCap, 
  DollarSign, 
  Home, 
  AlertOctagon, 
  FileText, 
  Bell, 
  Cpu, 
  Settings, 
  Database, 
  Menu, 
  X, 
  Search, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw,
  FileSpreadsheet,
  CalendarDays
} from "lucide-react";

// Import modular subviews
import { AnalyticsView } from "../components/admin/AnalyticsView";
import { StudentAndAttendanceView } from "../components/admin/StudentAndAttendanceView";
import { FinancialsAndHostelView } from "../components/admin/FinancialsAndHostelView";
import { PolicyAndAIView } from "../components/admin/PolicyAndAIView";
import { DeskAndReportsView } from "../components/admin/DeskAndReportsView";

interface SidebarItem {
  id: string;
  label: string;
  desc: string;
  icon: any;
  category: "DASHBOARD" | "PORTALS" | "FINANCIALS" | "UTILITIES" | "SETTINGS";
  badge?: number;
}

export const AdminDashboard: React.FC = () => {
  const { auth, logout } = useAuth();
  
  // Dashboard Core State
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sidebar Controls State
  const [activeTab, setActiveTab] = useState<string>("analytics");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchSidebarQuery, setSearchSidebarQuery] = useState("");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Keyboard navigation through sidebar menu list
  const [keyboardIndex, setKeyboardIndex] = useState(-1);
  const sidebarContainerRef = useRef<HTMLDivElement>(null);

  // Database Connection Live State
  const [dbConnected, setDbConnected] = useState(true);
  const [checkingDb, setCheckingDb] = useState(false);

  useEffect(() => {
    fetchAdminData();
    // Auto-ping relational db status every 12 seconds
    const interval = setInterval(() => {
      pingDbConnection();
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      if (!auth.token) return;
      const dbResponse = await fetch("/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      if (dbResponse.ok && dbResponse.headers.get("content-type")?.includes("json")) {
        const dbData = await dbResponse.json();
        setAnalytics(dbData);
      } else {
        setDbConnected(false);
        return;
      }

      const stuResponse = await fetch("/api/admin/students", {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      if (stuResponse.ok && stuResponse.headers.get("content-type")?.includes("json")) {
        const stuData = await stuResponse.json();
        setStudents(stuData);
        setDbConnected(true);
      } else {
        setDbConnected(false);
      }
    } catch (e) {
      console.error(e);
      setDbConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const pingDbConnection = async () => {
    setCheckingDb(true);
    try {
      const response = await fetch("/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      if (response.ok) {
        setDbConnected(true);
      } else {
        setDbConnected(false);
      }
    } catch {
      setDbConnected(false);
    } finally {
      setCheckingDb(false);
    }
  };

  const sidebarItems: SidebarItem[] = [
    { id: "analytics", label: "Office Analytics", desc: "Main administrative graphs & KPIs", icon: BarChart, category: "DASHBOARD" },
    { id: "students", label: "Student Roster", desc: "CRMs, roster additions & imports", icon: Users, category: "PORTALS" },
    { id: "attendance", label: "Class Attendance", desc: "Marking logs & bulk sheets", icon: CalendarDays, category: "PORTALS" },
    { id: "fees", label: "Financial Ledger", desc: "Tuition dues, receipts & collections", icon: DollarSign, category: "FINANCIALS" },
    { id: "hostel", label: "Hostel Occupancy", desc: "Dorm assignments & vacant stats", icon: Home, category: "FINANCIALS" },
    { id: "scholarship", label: "Scholarship Board", desc: "Grant applications & approvals", icon: GraduationCap, category: "FINANCIALS", badge: 8 },
    { id: "fines", label: "Fine Register", desc: "Dorm/curfew damages & penalties", icon: AlertOctagon, category: "FINANCIALS" },
    { id: "policy", label: "Policy Upload Center", desc: "Markdown guidelines & RAG status", icon: FileText, category: "UTILITIES" },
    { id: "notify", label: "Announcement Desk", desc: "Deliver warning push alerts", icon: Bell, category: "UTILITIES" },
    { id: "ai", label: "AI Control Center", desc: "Persona settings & chat logs", icon: Cpu, category: "UTILITIES" },
    { id: "reports", label: "Reports & Analytics", desc: "Compile spreadsheets to CSV", icon: FileSpreadsheet, category: "UTILITIES" },
    { id: "settings", label: "System Settings", desc: "SMTP, access tokens & DB pools", icon: Settings, category: "SETTINGS" },
    { id: "profile", label: "Admin Profile", desc: "Credentials, passwords & logins", icon: User, category: "SETTINGS" },
  ];

  // Search filtering
  const filteredSidebarItems = sidebarItems.filter(item => 
    item.label.toLowerCase().includes(searchSidebarQuery.toLowerCase()) || 
    item.category.toLowerCase().includes(searchSidebarQuery.toLowerCase())
  );

  // Keyboard navigation logic
  const handleSidebarKeyDown = (e: React.KeyboardEvent) => {
    if (filteredSidebarItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setKeyboardIndex(prev => (prev + 1) % filteredSidebarItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setKeyboardIndex(prev => (prev - 1 + filteredSidebarItems.length) % filteredSidebarItems.length);
    } else if (e.key === "Enter" && keyboardIndex >= 0) {
      e.preventDefault();
      setActiveTab(filteredSidebarItems[keyboardIndex].id);
      setIsMobileOpen(false);
    }
  };

  // Group items by category
  const categories: ("DASHBOARD" | "PORTALS" | "FINANCIALS" | "UTILITIES" | "SETTINGS")[] = [
    "DASHBOARD", "PORTALS", "FINANCIALS", "UTILITIES", "SETTINGS"
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans antialiased text-slate-200" id="campus-gpt-admin-panel-viewport" onKeyDown={handleSidebarKeyDown}>
      
      {/* 1. SIDEBAR: Desktop Sidebar (xl viewport scale) */}
      <aside 
        ref={sidebarContainerRef}
        className={`hidden xl:flex flex-col bg-slate-900 border-r border-slate-800 shrink-0 transition-all duration-300 relative select-none z-10 ${
          isSidebarCollapsed ? "w-20" : "w-[280px]"
        }`}
      >
        {/* Toggle Collapse Bar Button */}
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-12 p-1.5 bg-slate-900 border border-slate-700 text-slate-400 hover:text-white rounded-full transition shadow-md hover:shadow-cyan-900/10 hover:border-slate-500 z-20 focus:outline-none"
        >
          {isSidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {/* Sidebar Header Block */}
        <div className="p-5 border-b border-slate-800/80 bg-slate-950/40">
          {!isSidebarCollapsed ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-900/30 px-2 py-0.5 rounded border border-blue-800/40 animate-pulse">
                  ADMIN PANEL ACTIVE
                </span>
                <span className="text-[10px] font-black text-slate-500 font-mono">ERP-M1</span>
              </div>
              <div>
                <h2 className="text-sm font-black text-white hover:text-blue-400 transition cursor-default">admin@School Office</h2>
                <div 
                  onClick={pingDbConnection}
                  className={`inline-flex items-center gap-1.5 mt-2 cursor-pointer text-[10px] sm:text-[11px] font-semibold p-1 px-2.5 rounded-lg border leading-none transition-all ${
                    dbConnected 
                      ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/40 hover:bg-emerald-950/60" 
                      : "bg-rose-950/40 text-rose-400 border-rose-800/40 hover:bg-rose-950/60"
                  }`}
                  title="Click to check dynamic query integrity"
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    dbConnected ? "bg-emerald-400 animate-pulse" : "bg-rose-500"
                  }`} />
                  <span>{dbConnected ? "Relational database Connected" : "Relational database Disconnected"}</span>
                  {checkingDb && <RefreshCw className="w-3 h-3 text-slate-400 animate-spin" />}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-md">
                AD
              </div>
              <span className={`w-2 h-2 rounded-full ${dbConnected ? "bg-emerald-400" : "bg-rose-500"}`} />
            </div>
          )}
        </div>

        {/* Quick search input */}
        {!isSidebarCollapsed && (
          <div className="p-3 border-b border-slate-800/40">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Search Admin Features..."
                value={searchSidebarQuery}
                onChange={e => setSearchSidebarQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 placeholder-slate-500 text-[11px] outline-none focus:border-slate-700 font-semibold"
              />
              {searchSidebarQuery && (
                <button onClick={() => setSearchSidebarQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white font-bold text-[9px]">
                  ESC
                </button>
              )}
            </div>
          </div>
        )}

        {/* Sidebar Nav Items List Scroll Area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
          {categories.map(cat => {
            const catItems = filteredSidebarItems.filter(i => i.category === cat);
            if (catItems.length === 0) return null;

            return (
              <div key={cat} className="space-y-1.5">
                {!isSidebarCollapsed && (
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block px-2 mb-1">
                    {cat}
                  </span>
                )}
                {catItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const globalIdx = filteredSidebarItems.findIndex(i => i.id === item.id);
                  const isKeyboardSelected = globalIdx === keyboardIndex;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setKeyboardIndex(globalIdx);
                      }}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all duration-200 select-none cursor-pointer focus:outline-none relative group ${
                        isActive 
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/10 font-bold border-l-4 border-blue-400" 
                          : isKeyboardSelected
                            ? "bg-slate-800 text-slate-200"
                            : "text-slate-400 hover:text-white hover:bg-slate-800/35"
                      }`}
                      title={isSidebarCollapsed ? `${item.label} - ${item.desc}` : ""}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"}`} />
                      
                      {!isSidebarCollapsed && (
                        <div className="flex-1 min-w-0">
                          <span className="text-xs block leading-none font-bold">{item.label}</span>
                          <span className="text-[9px] text-slate-500 font-semibold block leading-none mt-1 truncate group-hover:text-slate-400 font-medium">
                            {item.desc}
                          </span>
                        </div>
                      )}

                      {/* Tooltip on Collapsed Side hovered */}
                      {isSidebarCollapsed && (
                        <div className="absolute left-16 bg-slate-950 border border-slate-800 p-2 rounded-xl text-[10px] w-48 shadow-2xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-50">
                          <span className="font-extrabold text-white block">{item.label}</span>
                          <span className="text-slate-400 block mt-1 leading-normal">{item.desc}</span>
                        </div>
                      )}

                      {item.badge && (!isSidebarCollapsed) && (
                        <span className="px-1.5 py-0.5 bg-blue-500 text-white font-black text-[9px] rounded-full shrink-0 animate-bounce">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer Logout button */}
        <div className="p-3 border-t border-slate-800 mt-auto bg-slate-950/10">
          <button 
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center justify-center gap-2 p-2.5 bg-slate-950/40 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800/60 rounded-xl transition"
          >
            <LogOut className="w-4 h-4" />
            {!isSidebarCollapsed && <span className="text-xs font-bold">Logout terminal</span>}
          </button>
        </div>
      </aside>

      {/* 2. MOBILE SIDEDRAWER (Triggered by menu toggler button) */}
      <div className={`xl:hidden fixed inset-0 z-40 transition-all duration-300 select-none ${
        isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}>
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
        
        <aside className={`fixed top-0 bottom-0 left-0 w-80 bg-slate-900 border-r border-slate-800 flex flex-col p-4 shadow-2xl transform transition-transform duration-300 z-50 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-900/30 px-2.5 py-1 rounded">
              ADMIN SERVICES MOBILE
            </span>
            <button onClick={() => setIsMobileOpen(false)} className="p-1.5 bg-slate-950 border border-slate-800 rounded-full text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 mb-4 text-xs font-semibold">
            <span className="text-white block font-bold">admin@School Office</span>
            <span className="text-emerald-400 text-[10px] flex items-center gap-1 mt-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Relational db Connected
            </span>
          </div>

          {/* Nav list on Mobile */}
          <div className="flex-1 overflow-y-auto space-y-4">
            {sidebarItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition ${
                    isActive ? "bg-blue-600 text-white font-bold" : "text-slate-400 hover:bg-slate-800/30"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <div>
                    <span className="text-xs font-extrabold block leading-none">{item.label}</span>
                    <span className="text-[9px] text-slate-500 block leading-none mt-1">{item.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <button 
            onClick={() => {
              setIsMobileOpen(false);
              setShowLogoutModal(true);
            }}
            className="w-full mt-4 p-3 bg-rose-950/40 text-rose-400 border border-rose-900/10 rounded-xl font-bold text-xs"
          >
            Logout Terminal
          </button>
        </aside>
      </div>

      {/* 3. MAIN CENTER SCREEN CONTROLS SECTION */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Top Header Toolbar */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between select-none shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="xl:hidden p-1.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block shadow shadow-blue-500" />
                CampusGPT ERP Nerve Center
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hidden sm:block">
                Academia Warden Management Suite
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col text-right font-mono text-[10px] font-bold text-slate-500 shrink-0">
              <span>SECURITY: HIGH CLEARED</span>
              <span>UTC TRACE: {new Date().toISOString().substring(11, 19)}</span>
            </div>
            
            <button
              onClick={fetchAdminData}
              className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-750 rounded-xl text-slate-400 hover:text-white transition"
              title="Click to pull master datasets"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* Profile badge top right */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-950 border border-slate-800 rounded-xl">
              <div className="w-6 h-6 rounded-lg bg-indigo-650 flex items-center justify-center font-bold text-white text-xs select-none">
                AW
              </div>
              <span className="text-slate-300 font-bold text-[10px] pr-1.5 hidden sm:inline-block">Academic Warden</span>
            </div>
          </div>
        </header>

        {/* Scrollable Contents Section wrapper */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-800 bg-slate-950">
          
          {isLoading ? (
            <div className="min-h-[400px] flex flex-col items-center justify-center text-slate-500 font-bold font-mono tracking-widest text-[11px] select-none">
              <RefreshCw className="w-6 h-6 text-slate-600 animate-spin mb-4" />
              <span>SYNCING ADMINISTRATIVE DATASET NODES...</span>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Core tabs conditional routing dispatcher */}
              {activeTab === "analytics" && (
                <AnalyticsView analytics={analytics} students={students} />
              )}

              {(activeTab === "students" || activeTab === "attendance") && (
                <StudentAndAttendanceView 
                  students={students} 
                  token={auth.token!} 
                  onRefresh={fetchAdminData} 
                />
              )}

              {(activeTab === "fees" || activeTab === "hostel" || activeTab === "scholarship" || activeTab === "fines") && (
                <FinancialsAndHostelView 
                  students={students} 
                  token={auth.token!} 
                  onRefresh={fetchAdminData} 
                />
              )}

              {(activeTab === "policy" || activeTab === "ai") && (
                <PolicyAndAIView 
                  analytics={analytics} 
                  token={auth.token!} 
                  onRefresh={fetchAdminData} 
                />
              )}

              {(activeTab === "notify" || activeTab === "reports" || activeTab === "settings" || activeTab === "profile") && (
                <DeskAndReportsView 
                  students={students} 
                  token={auth.token!} 
                  adminUser={auth.user} 
                  onRefresh={fetchAdminData} 
                />
              )}

            </div>
          )}

        </div>
      </main>

      {/* 4. MODAL: SYSTEM LOGOUT TERMINAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-sm w-full shadow-2xl relative text-center text-xs text-slate-300 space-y-4">
            <div className="w-12 h-12 bg-rose-950/60 border border-rose-800 rounded-full flex items-center justify-center mx-auto text-rose-400 mb-2">
              <LogOut className="w-5 h-5" />
            </div>
            
            <div className="space-y-1">
              <h4 className="text-white text-sm font-black uppercase tracking-wider">Are you sure you want to logout?</h4>
              <p className="text-slate-500 font-semibold leading-normal">
                This will terminate your current administrative session and clear security tokens. You must authenticate again to access the ERP.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 font-bold">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800 rounded-xl transition"
              >
                No, Dismiss
              </button>
              <button 
                onClick={() => {
                  setShowLogoutModal(false);
                  logout();
                }}
                className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow select-none"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
