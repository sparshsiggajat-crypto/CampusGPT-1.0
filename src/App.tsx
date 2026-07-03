import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeAndLayoutProvider } from "./contexts/ThemeAndLayoutContext";
import { Login } from "./pages/Login";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { StudentDashboard } from "./pages/StudentDashboard";
import { PolicyNavigator } from "./pages/PolicyNavigator";
import { AICompanion } from "./pages/AICompanion";
import { AdminDashboard } from "./pages/AdminDashboard";
import { SettingsPage } from "./pages/SettingsPage";
import { HelpDesk } from "./pages/HelpDesk";
import { PharmacyStore } from "./pages/PharmacyStore";
import { Student, Attendance, Fee, Hostel, Scholarship, Fine, CampusNotification } from "./types";

// Inner application wrapper that has access to the authentication context
const AppContent: React.FC = () => {
  const { auth, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [initialQuickAsk, setInitialQuickAsk] = useState("");
  const [notifications, setNotifications] = useState<CampusNotification[]>([]);
  const [studentData, setStudentData] = useState<{
    student: Student;
    attendance: Attendance;
    fee: Fee;
    hostel: Hostel;
    scholarships: Scholarship[];
    fines: Fine[];
  } | null>(null);

  // Load student dashboard data
  const fetchStudentData = async () => {
    if (!auth.token || auth.user?.role !== "student") return;
    try {
      const response = await fetch("/api/student/dashboard", {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStudentData(data);
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error("Error fetching student records:", e);
    }
  };

  // Synchronize notifications on demand (polled by layout timer!)
  const fetchNotificationsOnly = async () => {
    if (!auth.token) return;
    try {
      if (auth.user?.role === "student") {
        await fetchStudentData();
      } else {
        // Admin notifications list matches general collections or mock
        const response = await fetch("/api/student/notifications", {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setNotifications(data || []);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (auth.token) {
      fetchStudentData();
      fetchNotificationsOnly();
      // Re-route to admin if role is admin
      if (auth.user?.role === "admin") {
        setActiveTab("admin");
      } else {
        setActiveTab("dashboard");
      }
    }
  }, [auth.token, auth.user?.role]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500 font-semibold uppercase tracking-widest text-xs select-none">
        <div className="relative flex h-3 w-3 mb-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-650"></span>
        </div>
        <span>Syncing Campus Portal...</span>
      </div>
    );
  }

  if (!auth.token) {
    return <Login />;
  }

  return (
    <DashboardLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      notifications={notifications}
      onRefreshNotifications={fetchNotificationsOnly}
    >
      {activeTab === "dashboard" && studentData && (
        <StudentDashboard
          data={studentData}
          onRefreshData={fetchStudentData}
          setActiveTab={setActiveTab}
          setQuickAskText={setInitialQuickAsk}
        />
      )}
      {activeTab === "dashboard" && !studentData && auth.user?.role === "student" && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-150 shadow-sm font-semibold text-slate-500 text-xs">
          Syncing student directories...
        </div>
      )}
      {activeTab === "dashboard" && auth.user?.role === "admin" && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-150 shadow-sm font-semibold text-indigo-600 text-xs select-none">
          Welcome Warden Admin! Please open the Admin Nerve Center tab above to manage directories.
        </div>
      )}
      {activeTab === "policy" && <PolicyNavigator />}
      {activeTab === "pharmacy" && <PharmacyStore />}
      {activeTab === "chat" && (
        <AICompanion
          initialQuickAsk={initialQuickAsk}
          setInitialQuickAsk={setInitialQuickAsk}
        />
      )}
      {activeTab === "settings" && <SettingsPage />}
      {activeTab === "help" && <HelpDesk />}
      {activeTab === "admin" && auth.user?.role === "admin" && <AdminDashboard />}
    </DashboardLayout>
  );
};

export default function App() {
  return (
    <ThemeAndLayoutProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeAndLayoutProvider>
  );
}
