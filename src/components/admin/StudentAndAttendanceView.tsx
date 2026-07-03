import React, { useState } from "react";
import { 
  Search, 
  UserPlus, 
  Edit3, 
  Trash2, 
  FileSpreadsheet, 
  FileUp, 
  Check, 
  X, 
  Calendar, 
  ListCheck, 
  ChevronRight, 
  User, 
  Info,
  CalendarDays,
  FileCheck2,
  BookmarkCheck
} from "lucide-react";

interface StudentAndAttendanceViewProps {
  students: any[];
  token: string;
  onRefresh: () => Promise<void>;
}

export const StudentAndAttendanceView: React.FC<StudentAndAttendanceViewProps> = ({ 
  students, 
  token, 
  onRefresh 
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [studentList, setStudentList] = useState<any[]>(students);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  
  // New Student data states (simulated locally & updates master array)
  const [newName, setNewName] = useState("");
  const [newRoll, setNewRoll] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newDept, setNewDept] = useState("Computer Science");
  const [newYear, setNewYear] = useState("1st Year");
  
  // Editing states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAttendance, setEditAttendance] = useState(80);
  const [editRemainingFee, setEditRemainingFee] = useState(0);
  const [editHostelStatus, setEditHostelStatus] = useState<"Paid" | "Pending" | "Due">("Due");
  
  // CSV Import States
  const [csvContent, setCsvContent] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState("");

  // Attendance Sub-Section State
  const [activeSubTab, setActiveSubTab] = useState<"mark" | "bulk" | "calendar" | "reports">("mark");
  const [selectedClassTerm, setSelectedClassTerm] = useState("CS-201 Advanced Algorithms");
  const [markedDate, setMarkedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceStateMap, setAttendanceStateMap] = useState<Record<string, boolean>>({});
  const [attendanceCommitSuccess, setAttendanceCommitSuccess] = useState(false);

  // Synced state on refresh
  React.useEffect(() => {
    setStudentList(students);
  }, [students]);

  // Synchronize or update student details with API
  const handleUpdateStudent = async (studentId: string) => {
    try {
      const response = await fetch("/api/admin/student/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId,
          attendanceRate: editAttendance,
          hostelFeeStatus: editHostelStatus,
          remainingFee: editRemainingFee
        })
      });
      if (response.ok) {
        setEditingId(null);
        await onRefresh();
        // Feedback
        const alertBox = document.createElement("div");
        alertBox.className = "fixed bottom-5 right-5 bg-emerald-650 text-white font-bold p-3 rounded-xl shadow-lg z-50 text-xs";
        alertBox.innerText = "Student synced and committed to Relational db!";
        document.body.appendChild(alertBox);
        setTimeout(() => alertBox.remove(), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddNewStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newRoll || !newEmail) return;

    const newStudentObj = {
      id: "stud_" + Date.now().toString().substr(-6),
      name: newName,
      rollNumber: newRoll,
      email: newEmail,
      department: newDept,
      year: newYear,
      attendance: { percentage: 100, attendedClasses: 40, totalClasses: 40 },
      fee: { totalFees: 85000, paidAmount: 85000, remainingAmount: 0 },
      hostel: { hostelName: "Alpha Tower", roomNumber: "A-201", hostelFeeStatus: "Paid", monthlyRent: 4000 },
      fines: []
    };

    setStudentList([newStudentObj, ...studentList]);
    setIsAddingStudent(false);
    setNewName("");
    setNewRoll("");
    setNewEmail("");
    
    // Status visual
    const notification = document.createElement("div");
    notification.className = "fixed bottom-5 right-5 bg-indigo-600 text-white p-3 rounded-lg shadow-xl text-xs font-semibold z-50";
    notification.innerText = `Added student ${newName} successfully!`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2500);
  };

  const handleDeleteStudent = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to void ${name} from the Student Roster?`)) {
      setStudentList(studentList.filter(s => s.id !== id));
    }
  };

  // CSV Import parser
  const handleCSVImport = () => {
    if (!csvContent.trim()) {
      setImportStatus("Empty CSV text content!");
      return;
    }
    try {
      const lines = csvContent.split("\n");
      let parsedCount = 0;
      const parsedStudents: any[] = [];
      
      lines.forEach((line) => {
        const parts = line.split(",").map(p => p.trim());
        if (parts.length >= 4 && parts[0] && parts[1] && parts[2]) {
          parsedStudents.push({
            id: "stud_" + Math.random().toString(36).substr(2, 6),
            rollNumber: parts[0],
            name: parts[1],
            email: parts[2],
            department: parts[3],
            year: parts[4] || "1st Year",
            attendance: { percentage: 85, attendedClasses: 34, totalClasses: 40 },
            fee: { totalFees: 85000, paidAmount: 40000, remainingAmount: 45000 },
            hostel: { hostelName: "Beta Hall", roomNumber: "B-102", hostelFeeStatus: "Pending", monthlyRent: 4500 },
            fines: []
          });
          parsedCount++;
        }
      });

      if (parsedCount > 0) {
        setStudentList([...parsedStudents, ...studentList]);
        setImportStatus(`Successfully registered ${parsedCount} students from CSV batch!`);
        setCsvContent("");
        setTimeout(() => setIsImporting(false), 2000);
      } else {
        setImportStatus("Invalid CSV header layout! Please supply: RollNumber,Name,Email,Department");
      }
    } catch (e) {
      setImportStatus("Parser crashed. Check column formats.");
    }
  };

  // Export to Excel / CSV file
  const handleExportExcel = () => {
    const headers = "Student ID,Roll Number,Name,Email,Department,Year,Attendance %,Tuition Owed,Hostel Fee Status\n";
    const rows = studentList.map(s => 
      `${s.id},${s.rollNumber},${s.name},${s.email},"${s.department}",${s.year},${s.attendance?.percentage || 0},${s.fee?.remainingAmount || 0},${s.hostel?.hostelFeeStatus || "N/A"}`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `CAMPUS_GPT_ROSTER_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mark attendance operations
  const toggleAttendanceStatus = (studId: string) => {
    setAttendanceStateMap(prev => ({
      ...prev,
      [studId]: !prev[studId]
    }));
  };

  const handleBulkAttendanceMark = (status: boolean) => {
    const nextMap: Record<string, boolean> = {};
    studentList.forEach(s => {
      nextMap[s.id] = status;
    });
    setAttendanceStateMap(nextMap);
  };

  const handleCommitAttendance = async () => {
    setAttendanceCommitSuccess(true);
    // Push individual updates inside simulated batch loops
    for (const s of studentList) {
      const isPresent = attendanceStateMap[s.id];
      const prevPercentage = s.attendance?.percentage || 80;
      let nextPercentage = prevPercentage;
      
      if (isPresent) {
        nextPercentage = Math.min(100, prevPercentage + 1.2);
      } else {
        nextPercentage = Math.max(0, prevPercentage - 2.5);
      }

      await fetch("/api/admin/student/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId: s.id,
          attendanceRate: Number(nextPercentage.toFixed(1))
        })
      });
    }

    await onRefresh();
    setTimeout(() => setAttendanceCommitSuccess(false), 4000);
  };

  // Filter students
  const filtered = studentList.filter(s => {
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q) || s.department.toLowerCase().includes(q);
  });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="student_and_attendance_module">
      
      {/* SECTION 1: Student Directory (Takes 7 Cols on Desktop) */}
      <div className="xl:col-span-7 space-y-4">
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
                👥 Student Directory & CRM
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">Record metrics, import CSV lists, or view complete student cards.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsAddingStudent(!isAddingStudent)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-xs text-white rounded-xl font-bold flex items-center gap-1 shadow-md shadow-blue-950/20"
              >
                <UserPlus className="w-3.5 h-3.5" /> Add Student
              </button>
              <button 
                onClick={() => setIsImporting(!isImporting)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-xl font-bold flex items-center gap-1 border border-slate-700"
              >
                <FileUp className="w-3.5 h-3.5" /> CSV Batch
              </button>
              <button 
                onClick={handleExportExcel}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-xs text-white rounded-xl font-bold flex items-center gap-1 shadow-md shadow-emerald-950/20"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Export Excel
              </button>
            </div>
          </div>

          {/* Quick Add Form Drawer */}
          {isAddingStudent && (
            <form onSubmit={handleAddNewStudent} className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 mb-4 space-y-3 text-xs animate-in slide-in-from-top-4 duration-200">
              <span className="font-bold text-slate-100 block">Register New Student Profile</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={newName} 
                    onChange={e => setNewName(e.target.value)}
                    placeholder="e.g. Rachel Green" 
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-blue-500" 
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Roll Number</label>
                  <input 
                    type="text" 
                    value={newRoll} 
                    onChange={e => setNewRoll(e.target.value)}
                    placeholder="e.g. CS26_105" 
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-blue-500" 
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">University Email</label>
                  <input 
                    type="email" 
                    value={newEmail} 
                    onChange={e => setNewEmail(e.target.value)}
                    placeholder="e.g. rachel@school.edu" 
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white outline-none focus:border-blue-500" 
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Department</label>
                  <select 
                    value={newDept} 
                    onChange={e => setNewDept(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white outline-none"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Biotechnology">Biotechnology</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddingStudent(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-lg">Save Student</button>
              </div>
            </form>
          )}

          {/* CSV Paste Drawer */}
          {isImporting && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 mb-4 space-y-3 text-xs animate-in slide-in-from-top-4 duration-200">
              <span className="font-bold text-slate-100 block">Batch CSV Stream Roster Import</span>
              <p className="text-slate-400">Roster format: <code>RollNumber,Name,Email,Department,Year</code>. Consecutively separate students with enters.</p>
              <textarea 
                rows={3}
                value={csvContent}
                onChange={e => setCsvContent(e.target.value)}
                placeholder="EE_892,Monica Geller,monica@school.edu,Electrical Engineering,3rd Year&#10;ME_402,Joey Tribbiani,joey@school.edu,Mechanical Engineering,2nd Year"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono text-[10px] outline-none"
              />
              {importStatus && <span className="text-amber-400 font-bold block">{importStatus}</span>}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsImporting(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
                <button type="button" onClick={handleCSVImport} className="px-4 py-1.5 bg-emerald-600 text-white font-bold rounded-lg">Parse & Import</button>
              </div>
            </div>
          )}

          {/* SEARCH */}
          <div className="relative mb-4">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search Student by Name, Roll, or Department..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950/50 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-blue-500"
            />
          </div>

          {/* Student Grid Table */}
          <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950/20">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-3">Student</th>
                  <th className="p-3">Roster Info</th>
                  <th className="p-3">Attendance</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filtered.map(st => {
                  const isEditing = editingId === st.id;
                  return (
                    <React.Fragment key={st.id}>
                      <tr className="hover:bg-slate-900/30 transition group">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-blue-400 select-none group-hover:bg-blue-900/20 transition-all">
                              {st.name[0]}
                            </div>
                            <div>
                              <button 
                                type="button" 
                                onClick={() => setSelectedStudent(st)}
                                className="font-extrabold text-white hover:underline text-left"
                              >
                                {st.name}
                              </button>
                              <span className="text-[10px] text-slate-400 block">{st.rollNumber}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-300 truncate max-w-[140px]">{st.department}</span>
                            <span className="text-[10px] text-slate-500 font-semibold">{st.year}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full font-black text-[10px] ${
                            (st.attendance?.percentage || 0) < 75 ? "bg-rose-950/60 text-rose-400 border border-rose-800/40" : "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                          }`}>
                            {st.attendance?.percentage || 0}%
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5">
                          <button 
                            onClick={() => {
                              if (isEditing) {
                                setEditingId(null);
                              } else {
                                setEditingId(st.id);
                                setEditAttendance(st.attendance?.percentage || 80);
                                setEditRemainingFee(st.fee?.remainingAmount || 0);
                                setEditHostelStatus(st.hostel?.hostelFeeStatus || "Due");
                              }
                            }}
                            className="p-1 px-2 border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-300 rounded-lg font-bold text-[10px] inline-flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" /> Adj
                          </button>
                          <button 
                            onClick={() => handleDeleteStudent(st.id, st.name)}
                            className="p-1 hover:bg-rose-950/40 text-rose-400 rounded-lg font-bold"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>

                      {isEditing && (
                        <tr className="bg-slate-950/80">
                          <td colSpan={4} className="p-4 border-y border-blue-950">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px] font-semibold text-slate-400">
                              <div>
                                <label className="block mb-1 text-slate-300">Set Attendance (%)</label>
                                <input 
                                  type="number" 
                                  value={editAttendance} 
                                  onChange={e => setEditAttendance(Number(e.target.value))}
                                  className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-white" 
                                />
                              </div>
                              <div>
                                <label className="block mb-1 text-slate-300">Outstanding Tuition Fee (₹)</label>
                                <input 
                                  type="number" 
                                  value={editRemainingFee} 
                                  onChange={e => setEditRemainingFee(Number(e.target.value))}
                                  className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-white" 
                                />
                              </div>
                              <div>
                                <label className="block mb-1 text-slate-300">Hostel Fee Status</label>
                                <select 
                                  value={editHostelStatus} 
                                  onChange={e => setEditHostelStatus(e.target.value as any)}
                                  className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-white bg-slate-900"
                                >
                                  <option value="Paid">Paid</option>
                                  <option value="Pending">Pending</option>
                                  <option value="Due">Due</option>
                                </select>
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-slate-900">
                              <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-slate-800 text-slate-300 rounded text-xs">Dismiss</button>
                              <button onClick={() => handleUpdateStudent(st.id)} className="px-4 py-1 bg-blue-600 text-white font-bold rounded text-xs select-none">Sync ERP Roster</button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 2: Class Attendance Control Pane (Takes 5 Cols on Desktop) */}
      <div className="xl:col-span-5 space-y-4">
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-md">
          <div className="border-b border-slate-800 pb-3 mb-3">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
              📅 Class Attendance Control Center
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">Coordinate attendance logs, calendars, and mark daily sheets.</p>
          </div>

          <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-xl mb-4 text-center text-[10px] font-bold">
            <button 
              onClick={() => setActiveSubTab("mark")}
              className={`py-1.5 rounded-lg transition-all ${activeSubTab === "mark" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-900"}`}
            >
              Mark Roster
            </button>
            <button 
              onClick={() => setActiveSubTab("bulk")}
              className={`py-1.5 rounded-lg transition-all ${activeSubTab === "bulk" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-900"}`}
            >
              Bulk Set
            </button>
            <button 
              onClick={() => setActiveSubTab("calendar")}
              className={`py-1.5 rounded-lg transition-all ${activeSubTab === "calendar" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-900"}`}
            >
              Calendar
            </button>
            <button 
              onClick={() => setActiveSubTab("reports")}
              className={`py-1.5 rounded-lg transition-all ${activeSubTab === "reports" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-900"}`}
            >
              Reports
            </button>
          </div>

          {activeSubTab === "mark" && (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Select Active Lecture</label>
                  <select 
                    value={selectedClassTerm}
                    onChange={e => setSelectedClassTerm(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white outline-none"
                  >
                    <option value="CS-201 Advanced Algorithms">CS-201 Advanced Algorithms</option>
                    <option value="EE-502 Signal Analysis">EE-502 Signal Processing</option>
                    <option value="MA-101 Calculus Principles">MA-101 Engineering Calculus</option>
                    <option value="BIO-305 Molecular Diagnostics">BIO-305 Molecular Diagnostics</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Marking Date</label>
                  <input 
                    type="date"
                    value={markedDate}
                    onChange={e => setMarkedDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-white outline-none"
                  />
                </div>
              </div>

              <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80 max-h-56 overflow-y-auto space-y-2">
                {studentList.map(st => {
                  const isPresent = attendanceStateMap[st.id] !== false;
                  return (
                    <div key={st.id} className="flex items-center justify-between p-1.5 bg-slate-900/40 rounded transition hover:bg-slate-900">
                      <div>
                        <span className="font-bold text-white block">{st.name}</span>
                        <span className="text-[9px] text-slate-500 font-mono block">{st.rollNumber} (Current: {st.attendance?.percentage || 0}%)</span>
                      </div>
                      <button 
                        onClick={() => toggleAttendanceStatus(st.id)}
                        className={`p-1 px-3 rounded-lg font-bold text-[10px] transition ${
                          isPresent ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800" : "bg-rose-950/60 text-rose-400 border border-rose-800"
                        }`}
                      >
                        {isPresent ? "Present (PR)" : "Absent (AB)"}
                      </button>
                    </div>
                  );
                })}
              </div>

              {attendanceCommitSuccess && (
                <div className="p-2 border border-emerald-800 bg-emerald-950/60 text-emerald-400 text-[10px] font-bold rounded-lg flex items-center gap-1.5">
                  <BookmarkCheck className="w-4 h-4 text-emerald-400" /> Attendance recorded! Individual stats computed and synced to Firestore emulator.
                </div>
              )}

              <button 
                onClick={handleCommitAttendance}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl select-none text-[11px] shadow-sm shadow-blue-900"
              >
                Commit Class Attendance
              </button>
            </div>
          )}

          {activeSubTab === "bulk" && (
            <div className="space-y-4 text-xs">
              <span className="font-semibold text-slate-300 block">Bulk Set Lecture Standing</span>
              <p className="text-slate-400 text-[11px]">Automatically sets the checkmarks of all active students in this lecture directory in one click.</p>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleBulkAttendanceMark(true)}
                  className="p-3 bg-emerald-950/40 hover:bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 font-bold rounded-xl flex flex-col items-center justify-center gap-1.5 transition"
                >
                  <Check className="w-5 h-5 text-emerald-400" />
                  <span>Set All Present (PR)</span>
                </button>
                <button 
                  onClick={() => handleBulkAttendanceMark(false)}
                  className="p-3 bg-rose-950/40 hover:bg-rose-950/80 border border-rose-800/60 text-rose-400 font-bold rounded-xl flex flex-col items-center justify-center gap-1.5 transition"
                >
                  <X className="w-5 h-5 text-rose-400" />
                  <span>Set All Absent (AB)</span>
                </button>
              </div>

              <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-900 text-[11px] text-slate-400 leading-normal flex gap-2">
                <Info className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Remember to go back to the <strong>Mark Roster</strong> tab to commit and write adjustments onto database ledger.</span>
              </div>
            </div>
          )}

          {activeSubTab === "calendar" && (
            <div className="space-y-3">
              <span className="font-bold text-slate-200 text-xs block">Attendance Calendar Matrix</span>
              <p className="text-slate-400 text-[11px]">Current academic month scheduled lecture classes:</p>
              
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-[9px] text-slate-400">
                <span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span>
                {Array.from({ length: 30 }, (_, i) => {
                  const day = i + 1;
                  const isWeekend = day % 7 === 6 || day % 7 === 0;
                  const stateColor = isWeekend ? "bg-slate-950/40 text-slate-600" : day % 3 === 0 ? "bg-emerald-950/50 text-emerald-400 border border-emerald-900/30" : "bg-blue-950/30 text-blue-300 border border-blue-900/10";
                  return (
                    <div key={day} className={`p-2 rounded font-mono text-[10px] ${stateColor}`}>
                      {day}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-around text-[9px] font-semibold text-slate-400">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>90%+ Average Class</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  <span>Class Active (Normal)</span>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === "reports" && (
            <div className="space-y-3 font-semibold text-xs text-slate-400">
              <span className="font-bold text-slate-200 block text-xs">Analytics reports Summary</span>
              <p className="text-[11px]">Analysis of total class attendance compiled this term.</p>

              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between items-center bg-slate-950/60 p-2 rounded-lg">
                  <span>Class size tracked</span>
                  <span className="font-bold text-white font-mono">{studentList.length} Students</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950/60 p-2 rounded-lg">
                  <span>Attendance probate criteria</span>
                  <span className="font-bold text-rose-400 font-mono">&lt; 75% rate</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950/60 p-2 rounded-lg">
                  <span>Probation roster flag</span>
                  <span className="font-bold text-amber-400 font-mono">
                    {studentList.filter(s => (s.attendance?.percentage || 0) < 75).length} Students
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* STUDENT DETAILED PROFILE MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-md w-full shadow-2xl relative text-xs text-slate-300 space-y-4">
            <button 
              onClick={() => setSelectedStudent(null)}
              className="absolute top-4 right-4 p-1.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
                {selectedStudent.name[0]}
              </div>
              <div>
                <h4 className="text-sm font-black text-white">{selectedStudent.name}</h4>
                <span className="font-mono text-[10px] text-slate-400">UUID: {selectedStudent.id}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 font-semibold text-[11px]">
              <div>
                <span className="text-slate-500 block">Registration Code</span>
                <span className="text-white block">{selectedStudent.rollNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block">University Email</span>
                <span className="text-white block truncate">{selectedStudent.email}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Department</span>
                <span className="text-white block">{selectedStudent.department}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Semester Standing</span>
                <span className="text-white block">{selectedStudent.year}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Hostel Placement</span>
                <span className="text-white block">{selectedStudent.hostel?.hostelName || "N/A"} ({selectedStudent.hostel?.roomNumber || "N/A"})</span>
              </div>
              <div>
                <span className="text-slate-500 block">Current Attendance</span>
                <span className="text-white block">{selectedStudent.attendance?.percentage || 0}% avg</span>
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1.5 font-semibold">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Financial Accounting Balances</span>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Charged</span>
                <span className="text-white">₹{(selectedStudent.fee?.totalFees || 85000).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Paid Amount</span>
                <span className="text-emerald-400">₹{(selectedStudent.fee?.paidAmount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Outstanding Dues</span>
                <span className="text-amber-500 font-bold">₹{(selectedStudent.fee?.remainingAmount || 0).toLocaleString()}</span>
              </div>
            </div>

            <button 
              onClick={() => setSelectedStudent(null)}
              className="w-full py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold rounded-xl transition"
            >
              Close Profile View
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
