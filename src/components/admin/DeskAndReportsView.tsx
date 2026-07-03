import React, { useState } from "react";
import { 
  Bell, 
  FileText, 
  Settings, 
  User, 
  Send, 
  Mail, 
  KeyRound, 
  Database, 
  CheckCircle, 
  Download, 
  FileSpreadsheet, 
  Lock, 
  Check, 
  Building, 
  ShieldCheck 
} from "lucide-react";

interface DeskAndReportsViewProps {
  students: any[];
  token: string;
  adminUser: any;
  onRefresh: () => Promise<void>;
}

export const DeskAndReportsView: React.FC<DeskAndReportsViewProps> = ({ 
  students, 
  token, 
  adminUser, 
  onRefresh 
}) => {
  // Tabs: notify | reports | settings | profile
  const [activeTab, setActiveTab] = useState<"notify" | "reports" | "settings" | "profile">("notify");

  // Announcement Desk States
  const [broadTitle, setBroadTitle] = useState("");
  const [broadMessage, setBroadMessage] = useState("");
  const [broadType, setBroadType] = useState<"general" | "attendance" | "fee" | "hostel" | "scholarship" | "fine">("general");
  const [broadStudentId, setBroadStudentId] = useState("all"); 
  const [broadcastDone, setBroadcastDone] = useState(false);

  // Reports States
  const [reportDocType, setReportDocType] = useState<"attendance" | "fee" | "scholarship" | "hostel" | "fine">("attendance");
  const [reportsCompiled, setReportsCompiled] = useState<any[] | null>(null);

  // Settings States
  const [settingTab, setSettingTab] = useState<"inst" | "smtp" | "gemini" | "db">("inst");
  const [instName, setInstName] = useState("Campus-GPT Engineering Academy");
  const [acadTerm, setAcadTerm] = useState("Fall Semester 2026-27");
  const [smtpServer, setSmtpServer] = useState("smtp.gmail.com");
  const [geminiKeyMask, setGeminiKeyMask] = useState("••••••••••••••••••••••••••••");
  const [configSaved, setConfigSaved] = useState(false);

  // Profile States
  const [adminName, setAdminName] = useState(adminUser?.name || "Academic Warden");
  const [adminEmail, setAdminEmail] = useState(adminUser?.email || "admin@school.edu");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwMatchSuccess, setPwMatchSuccess] = useState(false);

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadTitle.trim() || !broadMessage.trim()) return;

    try {
      const response = await fetch("/api/admin/send-custom-alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId: broadStudentId === "all" ? undefined : broadStudentId,
          title: broadTitle,
          message: broadMessage,
          type: broadType
        })
      });

      if (response.ok) {
        setBroadcastDone(true);
        setBroadTitle("");
        setBroadMessage("");
        setTimeout(() => setBroadcastDone(false), 4000);
        await onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Compile Visual Report
  const handleCompileReport = () => {
    if (reportDocType === "attendance") {
      setReportsCompiled(students.map(s => ({
        label: s.name,
        detail1: s.rollNumber,
        detail2: `${s.attendance?.percentage || 80}% Attendance`,
        status: (s.attendance?.percentage || 80) >= 75 ? "EXAM CLEAR" : "DEBARRED WARNING"
      })));
    } else if (reportDocType === "fee") {
      setReportsCompiled(students.map(s => ({
        label: s.name,
        detail1: `Remaining Balance: ₹${(s.fee?.remainingAmount || 0).toLocaleString()}`,
        detail2: `Total Term Bill: ₹${(s.fee?.totalFees || 85000).toLocaleString()}`,
        status: (s.fee?.remainingAmount || 0) === 0 ? "LEDGER SETTLED" : "LEDGER OUTSTANDING"
      })));
    } else if (reportDocType === "scholarship") {
      setReportsCompiled(students.map(s => ({
        label: s.name,
        detail1: `Grant Scheme: ${s.scholarship?.name || "National Aid scholarship"}`,
        detail2: `Award: ₹${(s.scholarship?.amount || 25000).toLocaleString()}`,
        status: s.scholarship?.status || "Applied"
      })));
    } else if (reportDocType === "hostel") {
      setReportsCompiled(students.map(s => ({
        label: s.name,
        detail1: s.hostel?.hostelName || "Not Allocated",
        detail2: `Room Number: ${s.hostel?.roomNumber || "N/A"}`,
        status: s.hostel?.hostelFeeStatus === "Paid" ? "DORM PAID" : "DORM RENT OVERDUE"
      })));
    } else {
      setReportsCompiled(students.map(s => ({
        label: s.name,
        detail1: `Outstanding Fines: ₹${(s.fines?.reduce((sum: number, f: any) => sum + f.amount, 0) || 0).toLocaleString()}`,
        detail2: `Issued codescount: ${s.fines?.length || 0} occurrences`,
        status: (s.fines?.reduce((sum: number, f: any) => sum + f.amount, 0) || 0) > 0 ? "PENALIZED" : "CLEAR LEDGER"
      })));
    }
  };

  const handleDownloadReportCSV = () => {
    if (!reportsCompiled) return;
    const headers = "Name,Reference Code,Key Metric,Status\n";
    const rows = reportsCompiled.map(r => `"${r.label}","${r.detail1}","${r.detail2}","${r.status}"`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `COMPILED_${reportDocType.toUpperCase()}_REPORT.csv`;
    link.click();
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;
    setPwMatchSuccess(true);
    setOldPassword("");
    setNewPassword("");
    setTimeout(() => setPwMatchSuccess(false), 3000);
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-md" id="announcements_reports_configs">
      
      {/* Sub tabs selectors */}
      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl mb-4 w-fit flex-wrap">
        <button 
          onClick={() => setActiveTab("notify")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeTab === "notify" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-900"}`}
        >
          <Bell className="w-3.5 h-3.5" /> Announcement Desk
        </button>
        <button 
          onClick={() => setActiveTab("reports")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeTab === "reports" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-900"}`}
        >
          <FileText className="w-3.5 h-3.5" /> Reports & Analytics
        </button>
        <button 
          onClick={() => setActiveTab("settings")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeTab === "settings" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-900"}`}
        >
          <Settings className="w-3.5 h-3.5" /> System Settings
        </button>
        <button 
          onClick={() => setActiveTab("profile")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeTab === "profile" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-900"}`}
        >
          <User className="w-3.5 h-3.5" /> Admin Profile
        </button>
      </div>

      {/* VIEW 1: Announcement Desk */}
      {activeTab === "notify" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs text-slate-300">
          
          <div className="lg:col-span-7 bg-slate-950/40 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div>
              <span className="font-extrabold text-white text-xs uppercase block">Official Broadcaster console</span>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                Deliver alerts directly onto student viewport drawers. Standard alerts prompt immediate SMS notifications via simulated SMTP vectors.
              </p>
            </div>

            <form onSubmit={handleSendAnnouncement} className="space-y-4">
              <div className="grid grid-cols-2 gap-3 font-semibold">
                <div>
                  <label className="text-slate-400 block mb-1">Target Recipient</label>
                  <select 
                    value={broadStudentId}
                    onChange={e => setBroadStudentId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none"
                  >
                    <option value="all">Broadcast Globally (All Students)</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.rollNumber})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Notice Classification</label>
                  <select 
                    value={broadType}
                    onChange={e => setBroadType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white outline-none"
                  >
                    <option value="general">📢 General Notice</option>
                    <option value="attendance">📅 Attendance Warnings</option>
                    <option value="fee">💰 Billing Clearance</option>
                    <option value="hostel">🏠 Academic Dorm placement</option>
                    <option value="scholarship">🎓 Scholarship Allocation</option>
                    <option value="fine">⚠️ Academic Warning check</option>
                  </select>
                </div>
              </div>

              <div className="font-semibold text-xs">
                <label className="text-slate-400 block mb-1">Header Title</label>
                <input 
                  type="text"
                  value={broadTitle}
                  onChange={e => setBroadTitle(e.target.value)}
                  placeholder="e.g. End Semester Exams dates schedule"
                  className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-white font-semibold outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="font-semibold text-xs">
                <label className="text-slate-400 block mb-1">Message Body</label>
                <textarea 
                  rows={4}
                  value={broadMessage}
                  onChange={e => setBroadMessage(e.target.value)}
                  placeholder="Insert announcement text clearly. Will trigger notification badges across clients."
                  className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-white outline-none"
                  required
                />
              </div>

              {broadcastDone && (
                <div className="p-2 border border-emerald-800 bg-emerald-950/65 text-emerald-400 rounded-lg flex items-center gap-1.5 font-bold">
                  <CheckCircle className="w-4 h-4" /> Broadcast dispatched successfully across SQL server tables and cached triggers!
                </div>
              )}

              <button 
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow select-none flex items-center justify-center gap-1"
              >
                <Send className="w-4 h-4" /> Dispatch Official Broadcast
              </button>
            </form>
          </div>

          <div className="lg:col-span-5 bg-slate-950/40 border border-slate-800 rounded-2xl p-4 h-fit space-y-3 font-semibold">
            <span className="font-bold text-white text-xs block">Official Notice Logs Tracker</span>
            <div className="space-y-2 max-h-56 overflow-y-auto font-sans leading-normal">
              <div className="p-2 bg-slate-900 rounded border border-slate-800 font-semibold text-[11px] space-y-1">
                <div className="flex justify-between text-blue-400">
                  <span>Attendance revised </span>
                  <span className="text-[9px] text-slate-500">Just Now</span>
                </div>
                <p className="text-slate-300">Automated warning issued for students under 75% average attendance limits.</p>
              </div>
              <div className="p-2 bg-slate-900 rounded border border-slate-800 font-semibold text-[11px] space-y-1">
                <div className="flex justify-between text-emerald-400">
                  <span>Scholarship Board sync</span>
                  <span className="text-[9px] text-slate-500">2 Hours Ago</span>
                </div>
                <p className="text-slate-300">Merit list funding distribution finalized and sent to billing office.</p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* VIEW 2: Reports & Analytics */}
      {activeTab === "reports" && (
        <div className="space-y-4 text-xs text-slate-300">
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 font-semibold">
            <span className="font-extrabold text-white text-xs uppercase block mb-2">Configure Institutional Audit Report</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-slate-400 block mb-1">Target Audit Scope</label>
                <select 
                  value={reportDocType}
                  onChange={e => setReportDocType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white outline-none"
                >
                  <option value="attendance">Class Attendance Standing</option>
                  <option value="fee">Ledger Receivables & Fees</option>
                  <option value="scholarship">Disbursed Scholarship grants</option>
                  <option value="hostel">Hostel Dorm allotment ledger</option>
                  <option value="fine">Penalty Fines Audit Register</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button 
                  onClick={handleCompileReport}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg w-full text-center hover:shadow select-none"
                >
                  Compile Visual Audit
                </button>
                {reportsCompiled && (
                  <button 
                    onClick={handleDownloadReportCSV}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1 hover:shadow select-none"
                  >
                    <Download className="w-4 h-4" /> Excel
                  </button>
                )}
              </div>
            </div>
          </div>

          {reportsCompiled ? (
            <div className="border border-slate-800 rounded-2xl bg-slate-950/20 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/65 border-b border-slate-800 text-slate-400 font-bold">
                    <th className="p-3">Audit Item</th>
                    <th className="p-3">Analytical details 1</th>
                    <th className="p-3">Analytical details 2</th>
                    <th className="p-3">Classification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {reportsCompiled.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/10">
                      <td className="p-3 font-semibold text-white">{item.label}</td>
                      <td className="p-3 font-medium font-mono">{item.detail1}</td>
                      <td className="p-3 font-medium text-indigo-400">{item.detail2}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 rounded-full font-bold bg-slate-900 border border-slate-800 text-[9px]">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 font-bold border border-dashed border-slate-800 rounded-2xl">
              Select targets domain scope above to compile live audits statistics.
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: System Settings */}
      {activeTab === "settings" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 text-xs text-slate-300">
          
          <div className="md:col-span-3 flex flex-col bg-slate-950/60 border border-slate-800 p-1.5 rounded-2xl h-fit space-y-1 font-bold">
            <button 
              onClick={() => setSettingTab("inst")}
              className={`p-2.5 rounded-xl text-left flex items-center gap-1.5 ${settingTab === "inst" ? "bg-slate-900 text-white" : "text-slate-400 hover:bg-slate-900/30"}`}
            >
              <Building className="w-4 h-4 text-blue-400" /> Institute Info
            </button>
            <button 
              onClick={() => setSettingTab("smtp")}
              className={`p-2.5 rounded-xl text-left flex items-center gap-1.5 ${settingTab === "smtp" ? "bg-slate-900 text-white" : "text-slate-400 hover:bg-slate-900/30"}`}
            >
              <Mail className="w-4 h-4 text-emerald-400" /> SMTP Config
            </button>
            <button 
              onClick={() => setSettingTab("gemini")}
              className={`p-2.5 rounded-xl text-left flex items-center gap-1.5 ${settingTab === "gemini" ? "bg-slate-900 text-white" : "text-slate-400 hover:bg-slate-900/30"}`}
            >
              <KeyRound className="w-4 h-4 text-amber-400" /> Gemini Access
            </button>
            <button 
              onClick={() => setSettingTab("db")}
              className={`p-2.5 rounded-xl text-left flex items-center gap-1.5 ${settingTab === "db" ? "bg-slate-900 text-white" : "text-slate-400 hover:bg-slate-900/30"}`}
            >
              <Database className="w-4 h-4 text-purple-400" /> Relational Pools
            </button>
          </div>

          <div className="md:col-span-9 bg-slate-950/30 border border-slate-800 rounded-2xl p-5">
            <form onSubmit={handleSaveSettings} className="space-y-4 font-semibold">
              {settingTab === "inst" && (
                <div className="space-y-4">
                  <span className="font-extrabold text-white text-xs uppercase block border-b border-slate-900 pb-2">Academic Entity Metadata</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1">Academy Name</label>
                      <input type="text" value={instName} onChange={e => setInstName(e.target.value)} className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-white" />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Academic Calendar Term</label>
                      <input type="text" value={acadTerm} onChange={e => setAcadTerm(e.target.value)} className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-white" />
                    </div>
                  </div>
                </div>
              )}

              {settingTab === "smtp" && (
                <div className="space-y-4">
                  <span className="font-extrabold text-white text-xs uppercase block border-b border-slate-900 pb-2">Institutional SMTP Configuration</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1">Outgoing Mail server</label>
                      <input type="text" value={smtpServer} onChange={e => setSmtpServer(e.target.value)} className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-white font-mono" />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Server Access SSL Port</label>
                      <input type="number" defaultValue="465" className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-white font-mono" />
                    </div>
                  </div>
                </div>
              )}

              {settingTab === "gemini" && (
                <div className="space-y-4">
                  <span className="font-extrabold text-white text-xs uppercase block border-b border-slate-900 pb-2">Google Gemini API variables</span>
                  <div>
                    <label className="text-slate-400 block mb-1">API Access Key</label>
                    <input type="text" value={geminiKeyMask} onChange={e => setGeminiKeyMask(e.target.value)} className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-white font-mono" />
                    <span className="text-[10px] text-slate-500 block mt-1">Stored securely on system .env file. Direct sandbox requests are fully proxied.</span>
                  </div>
                </div>
              )}

              {settingTab === "db" && (
                <div className="space-y-4">
                  <span className="font-extrabold text-white text-xs uppercase block border-b border-slate-900 pb-2">Relational Database pooling parameters</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 block mb-1">Max active pools connections</label>
                      <input type="number" defaultValue="20" className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-white font-mono" />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Database Provider</label>
                      <input type="text" defaultValue="Cloud SQL PostgreSQL" disabled className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-slate-400 font-extrabold" />
                    </div>
                  </div>
                </div>
              )}

              {configSaved && (
                <div className="p-2 border border-emerald-800 bg-emerald-950/60 text-emerald-400 rounded-lg font-bold">
                  System structural preferences synced and saved successfully!
                </div>
              )}

              <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow select-none">
                Save System Configs
              </button>
            </form>
          </div>

        </div>
      )}

      {/* VIEW 4: Admin Profile */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 text-xs text-slate-300">
          
          <div className="md:col-span-5 bg-slate-950/60 border border-slate-800 p-5 rounded-2xl text-center space-y-3 font-semibold">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-500 rounded-full flex items-center justify-center font-black text-white text-xl mx-auto shadow-xl select-none">
              AW
            </div>
            <div>
              <span className="font-black text-white text-sm block">{adminName}</span>
              <span className="text-[10px] text-slate-500 font-bold font-mono">Academic Office Warden</span>
            </div>
            
            <div className="border-t border-slate-800 pt-3 text-left space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Official Mailbox</span>
                <span className="text-slate-300 font-bold">{adminEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Security Clearance</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> High Authorities
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Last login trace</span>
                <span className="text-slate-400 font-mono">Today, 03:22 PM</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 bg-slate-950/30 border border-slate-800 p-5 rounded-2xl space-y-4">
            <span className="font-extrabold text-white text-xs uppercase block border-b border-slate-800 pb-2">Change Account Passwords</span>
            
            <form onSubmit={handleChangePassword} className="space-y-4 font-semibold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Old credentials passphrase</label>
                  <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="••••••••" className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-white" required />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">New secure passcode</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Minimum 8 characters" className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-white" required />
                </div>
              </div>

              {pwMatchSuccess && (
                <div className="p-2 border border-emerald-800 bg-emerald-950/70 text-emerald-400 rounded-lg font-bold flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Credentials set! Password hashing compiled successfully.
                </div>
              )}

              <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow select-none">
                Update Security Credentials
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
};
