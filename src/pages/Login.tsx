import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Sparkles, User, ShieldCheck, Moon, Sun, ArrowRight, BookOpen } from "lucide-react";

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [role, setRole] = useState<"student" | "admin">("student");
  const [username, setUsername] = useState("CS202601");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleToggle = (selected: "student" | "admin") => {
    setRole(selected);
    setError(null);
    if (selected === "student") {
      setUsername("CS202601");
      setPassword("password");
    } else {
      setUsername("admin@campus.edu");
      setPassword("admin123");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rollOrEmail: username, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Internal Server Failure");
      }

      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" id="login-container">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-150 shadow-xl overflow-hidden flex flex-col p-6 lg:p-8 animate-in fade-in duration-300">
        
        {/* App Title Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-indigo-150 mb-3.5">
            C
          </div>
          <h2 className="text-2xl font-extrabold text-slate-950 tracking-tight">CampusGPT</h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">AI Student Copilot & Management System</p>
        </div>

        {/* Role Segment Selector */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6 border border-slate-200">
          <button
            type="button"
            id="role-switch-student"
            onClick={() => handleRoleToggle("student")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              role === "student"
                ? "bg-white text-indigo-600 shadow-sm border border-slate-150"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Student Login
          </button>
          <button
            type="button"
            id="role-switch-admin"
            onClick={() => handleRoleToggle("admin")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              role === "admin"
                ? "bg-white text-indigo-600 shadow-sm border border-slate-150"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin Office
          </button>
        </div>

        {/* Quick Instructions Hint box */}
        <div className="mb-6 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs">
          <div className="flex items-start gap-2.5 text-indigo-950">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <p className="font-extrabold text-indigo-950 tracking-tight">Use Seed Credentials (Pre-seeded):</p>
              <p className="mt-1 font-medium text-indigo-700">
                {role === "student" ? (
                  <span>
                    Roll: <strong className="text-indigo-900">CS202601</strong> or <strong className="text-indigo-900">EC202602</strong>
                    <br />Password: <strong className="text-indigo-900">password</strong>
                  </span>
                ) : (
                  <span>
                    Email: <strong className="text-indigo-900">admin@campus.edu</strong>
                    <br />Password: <strong className="text-indigo-900">admin123</strong>
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Form elements */}
        <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {role === "student" ? "Roll Number / Email" : "Admin Email ID"}
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                id="login-username-input"
                placeholder={role === "student" ? "e.g., CS202601" : "e.g., admin@campus.edu"}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 font-medium bg-slate-50 hover:bg-slate-50/50 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              id="login-password-input"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 font-medium bg-slate-50 hover:bg-slate-50/50 focus:bg-white transition"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold leading-relaxed border border-rose-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            id="login-submit-btn"
            className="w-full py-3 px-4 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 active:transform active:scale-[0.99] transition shadow-md shadow-indigo-150 disabled:opacity-70 disabled:pointer-events-none mt-2"
          >
            {isLoading ? "Validating Account..." : "Sign Inside Portal"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-4 text-center">
          <p className="text-[10px] text-slate-400 font-medium">
            Protected under secure AES & JWT cryptography algorithms
          </p>
        </div>
      </div>
    </div>
  );
};
