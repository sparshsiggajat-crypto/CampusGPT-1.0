import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { 
  User, 
  Key, 
  Lock, 
  ShieldCheck, 
  FileText, 
  Settings as SettingsIcon,
  ChevronDown, 
  ChevronUp, 
  CheckCircle,
  AlertCircle
} from "lucide-react";

export const SettingsPage: React.FC = () => {
  const { auth, login } = useAuth();
  
  // Profile state
  const [profileName, setProfileName] = useState(auth.user?.name || "");
  const [profileEmail, setProfileEmail] = useState(auth.user?.email || "");
  const [profilePhone, setProfilePhone] = useState("+91 98765 43210"); // Default simulation if empty
  
  // Passwords state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Status message alerts strings
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");
  const [passError, setPassError] = useState("");

  // Expandable legal sections
  const [rulesOpen, setRulesOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess("");
    setProfileError("");
    
    if (!profileName || !profileEmail) {
      setProfileError("Name and Email must not be empty");
      return;
    }

    try {
      const resp = await fetch("/api/student/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          name: profileName,
          email: profileEmail,
          phone: profilePhone
        })
      });

      const resData = await resp.json();
      if (resp.ok) {
        setProfileSuccess(resData.message || "Profile updated successfully!");
        // Re-authenticate local token context if necessary, simply update session payload values
        if (auth.user) {
          auth.user.name = profileName;
          auth.user.email = profileEmail;
        }
      } else {
        setProfileError(resData.error || "Failed to update profile details");
      }
    } catch (err) {
      setProfileError("Could not connect to database server");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassSuccess("");
    setPassError("");

    if (!currentPassword || !newPassword) {
      setPassError("All password inputs are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError("New and Confirm passwords do not match");
      return;
    }

    try {
      const resp = await fetch("/api/student/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const resData = await resp.json();
      if (resp.ok) {
        setPassSuccess(resData.message || "Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPassError(resData.error || "Incorrect current password");
      }
    } catch (err) {
      setPassError("Could not connect to database server");
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto" id="settings-page-wrapper">
      {/* Title block */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-indigo-550/10 rounded-xl flex items-center justify-center text-indigo-600">
          <SettingsIcon className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Security & Settings</h1>
          <p className="text-xs text-slate-500">Manage your credentials, view platform agreements and configure profile info</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm flex flex-col justify-between" id="profile-details-card">
          <div>
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
              <User className="w-5 h-5 text-indigo-600" />
              <h2 className="font-bold text-slate-900 text-sm">Account Information</h2>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {profileSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}
              {profileError && (
                <div className="p-3 bg-rose-50 border border-rose-150 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Full Authorized Name
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-550 focus:border-indigo-550 transition-all bg-slate-50/50"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Official Email Address
                </label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-550 focus:border-indigo-550 transition-all bg-slate-50/50"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Verified Contact Phone
                </label>
                <input
                  type="text"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-550 focus:border-indigo-550 transition-all bg-slate-50/50"
                />
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-150">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">Authorization Role</span>
                <span className="text-xs font-bold text-indigo-700 capitalize">{auth.user?.role} Account Key</span>
              </div>

              <button
                type="submit"
                id="update-profile-submit-btn"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md shadow-indigo-120 hover:shadow-indigo-150 transition cursor-pointer"
              >
                Save Profile Changes
              </button>
            </form>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm flex flex-col justify-between" id="password-change-card">
          <div>
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
              <Key className="w-5 h-5 text-indigo-600" />
              <h2 className="font-bold text-slate-900 text-sm">Security & Password</h2>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {passSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{passSuccess}</span>
                </div>
              )}
              {passError && (
                <div className="p-3 bg-rose-50 border border-rose-150 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{passError}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-550 focus:border-indigo-550 transition-all bg-slate-50/50"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  New Dynamic Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new strong password"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-550 focus:border-indigo-550 transition-all bg-slate-50/50"
                    required
                  />
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Confirm Password Verification
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Verify password choice"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-550 focus:border-indigo-550 transition-all bg-slate-50/50"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="bg-slate-50 text-[10px] text-slate-500 rounded-xl p-3 border border-slate-150 leading-relaxed">
                Ensure passwords are at least 6 characters in length containing mixed symbols or integers to boost safety indices.
              </div>

              <button
                type="submit"
                id="update-password-submit-btn"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md shadow-indigo-120 hover:shadow-indigo-150 transition cursor-pointer"
              >
                Apply New Security Key
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* Accordion Legal & Terms sections */}
      <div className="space-y-4" id="platform-legalities">
        <h3 className="font-bold text-slate-900 text-sm border-b border-slate-250 pb-2">Academic Portal Agreements</h3>
        
        {/* Terms and Conditions Accordion */}
        <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-sm">
          <button
            onClick={() => setRulesOpen(!rulesOpen)}
            id="terms-conditions-accordion-toggle"
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50/50 transition"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4.5 h-4.5 text-indigo-500 shrink-0" />
              <span className="font-bold text-slate-800 text-xs">Terms & Conditions of CampusGPT Use</span>
            </div>
            {rulesOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>
          
          {rulesOpen && (
            <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/25 text-xs text-slate-600 leading-relaxed space-y-3 prose">
              <p className="font-semibold text-slate-900">Effective Date: June 19, 2026</p>
              <p>
                By logging into CampusGPT AI Student Copilot, you register assent to comply with terms here. The platform offers RAG semantic document querying which interprets university board files. 
              </p>
              <p>
                <strong>1. Academic Honesty:</strong> Students are prohibited from utilizing synthesized response calculations to falsify assignment records. All citations generated from university policies correspond directly to authentic board documents.
              </p>
              <p>
                <strong>2. Automated Payments:</strong> Payments computed in hostel modules or tuition modules correspond to administrative records. All processing simulates external secure UPI grids with zero real finance risk.
              </p>
              <p>
                <strong>3. Usage Limits:</strong> Flooding or scraping backend APIs is prohibited. Any persistent malicious automated probing of the model queries will trigger Warden Security alerting triggers in the Audit Log automatically.
              </p>
            </div>
          )}
        </div>

        {/* Privacy Policy Accordion */}
        <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-sm">
          <button
            onClick={() => setPrivacyOpen(!privacyOpen)}
            id="privacy-policy-accordion-toggle"
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50/50 transition"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4.5 h-4.5 text-indigo-500 shrink-0" />
              <span className="font-bold text-slate-800 text-xs">Privacy Policy & Student Data Shield</span>
            </div>
            {privacyOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>
          
          {privacyOpen && (
            <div className="px-6 py-5 border-t border-slate-100 bg-slate-50/25 text-xs text-slate-600 leading-relaxed space-y-3">
              <p className="font-semibold text-slate-900">Effective Date: June 19, 2026</p>
              <p>
                CampusGPT respects and defends the privacy coordinates of student registry records. This document states exactly how we manage data.
              </p>
              <p>
                <strong>1. Record Security:</strong> Personalized records, including GPA metrics, outstanding fees, lodging details, and attendance, are isolated securely. JWT session tokens encrypt communications server side.
              </p>
              <p>
                <strong>2. System Learning:</strong> Queries loaded to the Gemini API are contextualized using local policy document RAG frameworks. Your queries are checked against strict standard data shields to ensure private student credentials remain local.
              </p>
              <p>
                <strong>3. Audit Tracking:</strong> In-app student chat logs can be purged anytime by utilizing the "Clear History" button on the Personalized Companion page inside the student portal.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
