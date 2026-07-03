import React, { useState } from "react";
import { Student, Attendance, Fee, Hostel, Scholarship, Fine } from "../types";
import { downloadAsExcel, downloadAsPDF } from "../utils/reportGenerator";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar,
  Cell
} from "recharts";
import { 
  Award, 
  BookOpen, 
  Calculator, 
  Calendar, 
  CreditCard, 
  GraduationCap, 
  Home, 
  Info, 
  Library, 
  Receipt,
  Sparkles, 
  TrendingUp, 
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Download
} from "lucide-react";

interface StudentDashboardProps {
  data: {
    student: Student;
    attendance: Attendance;
    fee: Fee;
    hostel: Hostel;
    scholarships: Scholarship[];
    fines: Fine[];
  };
  onRefreshData: () => Promise<void>;
  setActiveTab: (tab: string) => void;
  setQuickAskText: (text: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  data,
  onRefreshData,
  setActiveTab,
  setQuickAskText
}) => {
  const { student, attendance, fee, hostel, scholarships, fines } = data;
  const [isPayFeeOpen, setIsPayFeeOpen] = useState(false);
  const [isPayHostelOpen, setIsPayHostelOpen] = useState(false);
  const [feeAmount, setFeeAmount] = useState(25000); // Sample installment size
  const [feeMethod, setFeeMethod] = useState("UPI");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const triggerDownload = (type: "attendance" | "fee" | "scholarship" | "hostel" | "fine", format: "excel" | "pdf") => {
    let reportTitle = "";
    let headers: string[] = [];
    let rows: string[][] = [];

    if (type === "attendance" && attendance) {
      reportTitle = `Attendance Standings Report - ${student.name}`;
      headers = ["Subject Course", "Attended Hours", "Total Hours", "Percentage Rate", "Exam Eligibility"];
      rows = attendance.subjects.map(sub => [
        sub.subject,
        sub.attended.toString(),
        sub.total.toString(),
        `${sub.percentage}%`,
        sub.percentage >= 75 ? "Eligible" : "Attendance Deficit Warned"
      ]);
      rows.push([
        "SYSTEM CURRENT AVERAGE",
        attendance.attendedClasses.toString(),
        attendance.totalClasses.toString(),
        `${attendance.percentage}%`,
        attendance.percentage >= 75 ? "SAFE STATUS" : "ATTENDANCE DEFICIT ACTION REQUIRED"
      ]);
    } else if (type === "fee" && fee) {
      reportTitle = `Financial Ledger Statement - ${student.name}`;
      headers = ["Transaction Receipt ID", "Payment Method", "Date Credited", "Amount Cleared", "Verification Status"];
      rows = fee.paymentHistory.map(hist => [
        hist.id,
        hist.paymentMethod,
        hist.date,
        `₹${hist.amountPaid.toLocaleString()}`,
        hist.status
      ]);
      rows.push(["TOTAL RECORDED TUITION FEES", "Total Outstanding Left", "Installment Plan Left", `₹${fee.totalFees.toLocaleString()}`, `Remaining: ₹${fee.remainingAmount.toLocaleString()}`]);
    } else if (type === "scholarship") {
      reportTitle = `Scholarship Fellowships Ledger - ${student.name}`;
      headers = ["Fellowship Key", "Grant Amount", "Official Deadline", "Application Status", "Disbursement Status"];
      rows = scholarships.map(sch => [
        sch.name,
        `₹${sch.amount.toLocaleString()}`,
        sch.deadline,
        sch.status,
        sch.paymentStatus
      ]);
    } else if (type === "hostel" && hostel) {
      reportTitle = `Lodging Allocation Manifest - ${student.name}`;
      headers = ["Hostel Residence", "Room Number", "Room Arrangement Type", "Monthly Rentals", "Account Standing"];
      rows = [[
        hostel.hostelName,
        hostel.roomNumber,
        hostel.roomType,
        `₹${hostel.monthlyRent.toLocaleString()}`,
        hostel.hostelFeeStatus
      ]];
    } else if (type === "fine") {
      reportTitle = `Official Administrative Penalty List - ${student.name}`;
      headers = ["Fine Incident ID", "Registered Date", "Infraction / Cause Descriptor", "Amount Levied", "Settle Status"];
      rows = fines.length > 0 ? fines.map(f => [
        f.id,
        f.date,
        f.reason,
        `₹${f.amount}`,
        f.paymentStatus
      ]) : [["N/A", "N/A", "No active infraction fines logged on record", "₹0", "Cleared"]];
    } else {
      reportTitle = "Academic Index Status";
      headers = ["Property", "Value"];
      rows = [["Student Name", student.name]];
    }

    const payload = { title: reportTitle, headers, rows };
    if (format === "excel") {
      downloadAsExcel(payload, `${type}_report_${student.rollNumber}`);
    } else {
      downloadAsPDF(payload, `${type}_report_${student.rollNumber}`);
    }
  };

  // Dynamic calculations for attendance shortage suggestions
  const calculateAttendanceShortage = () => {
    if (!attendance) return null;
    const { totalClasses, attendedClasses, percentage } = attendance;
    if (percentage >= 75) {
      return {
        isSafe: true,
        message: `Your current attendance is ${percentage}%. You are safe for end-semester exam clearance.`
      };
    }
    // Calculate how many subsequent classes student must attend continuously to hit 75%+
    let additionalAttended = 0;
    let currentTotal = totalClasses;
    let currentAttended = attendedClasses;
    while ((currentAttended / currentTotal) < 0.75) {
      additionalAttended++;
      currentTotal++;
      currentAttended++;
    }
    return {
      isSafe: false,
      deficit: additionalAttended,
      message: `Your attendance is ${percentage}%. Attend the next ${additionalAttended} classes continuously to reach 75%.`
    };
  };

  const attendanceInfo = calculateAttendanceShortage();

  // Handle pay increments
  const handlePayFee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/student/pay-fee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("campus_token")}`
        },
        body: JSON.stringify({ amount: feeAmount, method: feeMethod })
      });
      if (response.ok) {
        await onRefreshData();
        setIsPayFeeOpen(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayHostel = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/student/pay-hostel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("campus_token")}`
        }
      });
      if (response.ok) {
        await onRefreshData();
        setIsPayHostelOpen(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyScholarship = async (scholarshipId: string) => {
    try {
      const response = await fetch("/api/student/apply-scholarship", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("campus_token")}`
        },
        body: JSON.stringify({ scholarshipId })
      });
      if (response.ok) {
        await onRefreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePayFine = async (fineId: string) => {
    try {
      const response = await fetch("/api/student/pay-fine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("campus_token")}`
        },
        body: JSON.stringify({ fineId })
      });
      if (response.ok) {
        await onRefreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const triggerAskCopilot = (query: string) => {
    setQuickAskText(query);
    setActiveTab("chat");
  };

  return (
    <div className="space-y-6 flex flex-col" id="student-dashboard-root">
      
      {/* Welcome Banner */}
      <div className="p-6 bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 rounded-3xl text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-44 h-44 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-100 text-xs font-bold uppercase tracking-wider bg-white/15 px-3 py-1 rounded-full w-max">
              <Sparkles className="w-3.5 h-3.5" /> AI Companion Synced
            </div>
            <h1 className="text-2xl font-black mt-2.5 tracking-tight">Welcome, {student?.name}!</h1>
            <p className="text-indigo-150 text-sm mt-1 font-medium">{student?.department} | Roll No: {student?.rollNumber}</p>
          </div>
          <div className="flex gap-2.5 max-md:w-full">
            <button 
              onClick={() => triggerAskCopilot("Compare my attendance to exam prerequisites")}
              className="px-4 py-2 bg-white/15 backdrop-blur-md rounded-xl text-xs font-bold hover:bg-white/20 transition-all border border-white/10 flex-1 whitespace-nowrap text-center"
            >
              Analyze Records
            </button>
            <button 
              onClick={() => setActiveTab("chat")}
              className="px-4 py-2 bg-white text-indigo-600 rounded-xl text-xs font-bold hover:bg-slate-50 shadow-md flex items-center justify-center gap-1.5 transition flex-1 whitespace-nowrap text-center"
            >
              Chat with Copilot
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Attendance KPI Card */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm hover:shadow transition flex items-start justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Academic Attendance</span>
            <span className="text-3xl font-black text-slate-900 mt-2 block">
              {attendance ? `${attendance.percentage}%` : "--"}
            </span>
            <span className={`text-[10px] mt-2.5 px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1 border ${
              attendance && attendance.percentage < 75 
                ? "bg-rose-50 text-rose-600 border-rose-200" 
                : "bg-emerald-50 text-emerald-600 border-emerald-200"
            }`}>
              {attendance && attendance.percentage < 75 ? (
                <> <AlertTriangle className="w-3 h-3" /> Shortage </>
              ) : (
                <> <CheckCircle className="w-3 h-3" /> Good Standing </>
              )}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Fees KPI Card */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm hover:shadow transition flex items-start justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Outstanding Fees</span>
            <span className="text-3xl font-black text-slate-900 mt-2 block">
              {fee ? `₹${fee.remainingAmount.toLocaleString()}` : "₹0"}
            </span>
            <span className={`text-[10px] mt-2.5 px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1 border ${
              fee && fee.remainingAmount > 0 
                ? "bg-amber-50 text-amber-600 border-amber-200" 
                : "bg-emerald-50 text-emerald-600 border-emerald-200"
            }`}>
              {fee && fee.remainingAmount > 0 ? (
                <> <Clock className="w-3 h-3" /> Due Soon </>
              ) : (
                <> <CheckCircle className="w-3 h-3" /> Fully Paid </>
              )}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        {/* Hostel Rent KPI Card */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm hover:shadow transition flex items-start justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Hostel Room</span>
            <span className="text-3xl font-black text-slate-900 mt-2 block">
              {hostel ? `${hostel.hostelName}` : "Unallocated"}
            </span>
            <span className="text-[10px] mt-2.5 px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1 bg-slate-50 text-slate-500 border border-slate-200">
              Room {hostel?.roomNumber || "--"} | {hostel?.roomType || "--"}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-orange-50 text-orange-600 shrink-0">
            <Home className="w-6 h-6" />
          </div>
        </div>

        {/* Active Fines KPI Card */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm hover:shadow transition flex items-start justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Active Penalty Fines</span>
            <span className="text-3xl font-black text-slate-900 mt-2 block">
              ₹{fines.reduce((sum, f) => f.paymentStatus === "Pending" ? sum + f.amount : sum, 0).toLocaleString()}
            </span>
            <span className="text-[10px] mt-2.5 px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1 bg-slate-50 text-slate-500 border border-slate-200">
              {fines.filter(f => f.paymentStatus === "Pending").length} pending penalties
            </span>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600 shrink-0">
            <Library className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Attendance Details Card */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm lg:col-span-2 space-y-5 flex flex-col" id="student_attendance_bento">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-950 text-sm flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" /> Subject-wise Class Attendance
            </h3>
            <span className="text-[11px] font-bold text-slate-500">
              Total Classes Audited: {attendance?.totalClasses}
            </span>
          </div>

          {/* AI recommendations highlight */}
          {attendanceInfo && (
            <div className={`p-4 rounded-xl border leading-relaxed text-xs relative ${
              attendanceInfo.isSafe 
                ? "bg-emerald-50 text-emerald-950 border-emerald-100" 
                : "bg-amber-50 text-amber-950 border-amber-100 animate-pulse"
            }`}>
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-slate-950">AI Copilot Attendance Recommendation:</h4>
                  <p className="mt-1 font-medium">{attendanceInfo.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Recharts graph for attendance trend */}
          <div className="h-60 rounded-xl bg-slate-50 border border-slate-150 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendance?.trend || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} domain={[50, 100]} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="rate" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Percentage" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed subjects progress bar */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Course Registries</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {attendance?.subjects.map((subj, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-slate-150 bg-slate-50/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-900 truncate pr-2">{subj.subject}</span>
                    <span className="font-bold text-indigo-600">{subj.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${subj.percentage >= 75 ? "bg-indigo-600" : "bg-rose-500"}`}
                      style={{ width: `${subj.percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1.5 font-medium">
                    <span>{subj.attended} attended / {subj.total} total</span>
                    <span>{subj.percentage < 75 ? "Needs Attention" : "Passing"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Sidebar with Tuition, Scholar, Fines */}
        <div className="space-y-6">

          {/* Fee Management Quick Card */}
          <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm flex flex-col space-y-4">
            <h3 className="font-bold text-slate-950 text-sm flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" /> Outstanding Fees & Dues
            </h3>
            
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-150 grid grid-cols-2 gap-4 text-center">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wide">Paid Amount</span>
                <span className="text-lg font-black text-emerald-600 mt-1 block">
                  ₹{fee?.paidAmount.toLocaleString()}
                </span>
              </div>
              <div className="border-l border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wide">Remaining Due</span>
                <span className="text-lg font-black text-rose-600 mt-1 block">
                  ₹{fee?.remainingAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {fee && fee.remainingAmount > 0 && (
              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <span>Instalments: 3 Payment Plans</span>
                  <span>Next Due: {fee.dueDate}</span>
                </div>
                <button 
                  onClick={() => setIsPayFeeOpen(true)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-150 transition"
                >
                  Pay Tuition Installment
                </button>
              </div>
            )}

            {/* Quick Ask Suggestion Triggers */}
            <div className="border-t border-slate-100 pt-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Suggested AI Queries</span>
              <div className="flex flex-col gap-1.5">
                <button 
                  onClick={() => triggerAskCopilot("How much fee is remaining")}
                  className="w-full text-left p-2 hover:bg-slate-50 text-xs text-indigo-600 font-bold border border-slate-150 rounded-xl flex items-center justify-between"
                >
                  "How much fee is remaining?" <span className="text-[9px] text-slate-400 font-medium">Ask Assistant</span>
                </button>
                <button 
                  onClick={() => triggerAskCopilot("Tell me my next payment plans")}
                  className="w-full text-left p-2 hover:bg-slate-50 text-xs text-indigo-600 font-bold border border-slate-150 rounded-xl flex items-center justify-between"
                >
                  "When is my next tuition due?" <span className="text-[9px] text-slate-400 font-medium">Ask Assistant</span>
                </button>
              </div>
            </div>
          </div>

          {/* Hostel Occupancy Quick Card */}
          {hostel && (
            <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm flex flex-col space-y-4">
              <h3 className="font-bold text-slate-950 text-sm flex items-center gap-2">
                <Home className="w-5 h-5 text-indigo-600" /> Hostel Room Status
              </h3>
              
              <div className="p-3 border border-slate-150 bg-slate-50/50 rounded-xl divide-y divide-slate-150 space-y-2.5 text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-500">Hostel Entity</span>
                  <span className="text-slate-900 font-bold">{hostel.hostelName}</span>
                </div>
                <div className="flex justify-between font-medium pt-2.5">
                  <span className="text-slate-500">Room Allocation</span>
                  <span className="text-slate-900 font-bold">No {hostel.roomNumber} ({hostel.roomType})</span>
                </div>
                <div className="flex justify-between font-medium pt-2.5">
                  <span className="text-slate-500">Rent Status</span>
                  <span className={`font-bold ${hostel.hostelFeeStatus === 'Paid' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {hostel.hostelFeeStatus} {hostel.hostelFeeStatus !== 'Paid' && `(₹${hostel.monthlyRent.toLocaleString()})`}
                  </span>
                </div>
              </div>

              {hostel.hostelFeeStatus !== "Paid" && (
                <button 
                  onClick={() => setIsPayHostelOpen(true)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition"
                >
                  Settle Hostel Rent
                </button>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Scholarships Section */}
      <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm flex flex-col space-y-5" id="scholarships-bento">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-950 text-sm flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" /> Personalized Financial Scholarships
          </h3>
          <button 
            onClick={() => triggerAskCopilot("Which scholarship can I qualify for")}
            className="text-xs text-indigo-600 font-bold flex items-center gap-1 hover:underline"
          >
            Check AI Eligibility <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scholarships.map((sch) => (
            <div key={sch.id} className="p-4 border border-slate-200 bg-slate-50/25 rounded-2xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-950 text-sm leading-tight">{sch.name}</h4>
                    <p className="text-slate-500 text-[11px] mt-1 line-clamp-2 leading-relaxed">{sch.description}</p>
                  </div>
                  <span className="text-xs font-black text-indigo-600 shrink-0 bg-indigo-50 px-2.5 py-1 rounded-lg">
                    ₹{sch.amount.toLocaleString()}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-2.5">
                  <strong>Criteria:</strong> {sch.eligibleCriteria}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-[10px] text-slate-400">
                  Deadline: {sch.deadline}
                </span>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                    sch.status === "Eligible" ? "bg-blue-50 text-blue-600 border-blue-200" :
                    sch.status === "Applied" ? "bg-amber-50 text-amber-600 border-amber-200" :
                    sch.status === "Approved" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                    "bg-slate-50 text-slate-600 border-slate-200"
                  }`}>
                    {sch.status}
                  </span>

                  {sch.status === "Eligible" && (
                    <button 
                      onClick={() => handleApplyScholarship(sch.id)}
                      className="px-3 py-1 bg-indigo-600 text-white font-bold rounded-lg text-[10px] shadow"
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fines Section */}
      {fines.length > 0 && (
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm flex flex-col space-y-4" id="fines-bento">
          <h3 className="font-bold text-slate-950 text-sm flex items-center gap-2">
            <Library className="w-5 h-5 text-indigo-600" /> Core Penalty Fines & Adjustments
          </h3>
          <div className="divide-y divide-slate-100">
            {fines.map((fine) => (
              <div key={fine.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs leading-relaxed">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-extrabold text-slate-950">{fine.reason}</span>
                    <span className="text-[9px] text-slate-400 font-medium">Issued: {fine.date}</span>
                  </div>
                  <p className="text-slate-500 font-medium mt-0.5">Please clear the fine to remove library registration blocks.</p>
                </div>
                <div className="flex items-center gap-3 self-start sm:self-center shrink-0">
                  <span className="font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg">
                    ₹{fine.amount}
                  </span>
                  {fine.paymentStatus === "Pending" ? (
                    <button 
                      onClick={() => handlePayFine(fine.id)}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow"
                    >
                      Settle Balance
                    </button>
                  ) : (
                    <span className="text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 border border-emerald-150 px-2.5 py-1 rounded-xl">
                      <CheckCircle className="w-3.5 h-3.5" /> Settle
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Official Report Export Center Hub */}
      <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm flex flex-col space-y-4" id="report-download-center-panel">
        <div>
          <h3 className="font-bold text-slate-950 text-sm flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-600" /> Administrative Report & Transcript Center
          </h3>
          <p className="text-xs text-slate-500 mt-1">Export official authenticated PDFs or layout CSV matrices compatible with Microsoft Excel for your student dossiers.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Card 1: Attendance */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-150 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Section Recurrent</span>
              <h4 className="font-bold text-slate-800 text-xs mt-0.5">Attendance Standing Report</h4>
              <p className="text-[11px] text-slate-500 mt-1">Individual classes log with aggregate deficits & attendance safety indicators.</p>
            </div>
            <div className="flex gap-2 mt-4 pt-2 border-t border-slate-200">
              <button
                onClick={() => triggerDownload("attendance", "pdf")}
                className="flex-1 py-1 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-650 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-3 h-3" /> PDF
              </button>
              <button
                onClick={() => triggerDownload("attendance", "excel")}
                className="flex-1 py-1 px-2.5 bg-slate-150 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-3 h-3" /> Excel
              </button>
            </div>
          </div>

          {/* Card 2: Fee Ledger */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-150 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Financial Ledger</span>
              <h4 className="font-bold text-slate-800 text-xs mt-0.5">Fee & Payment Receipts</h4>
              <p className="text-[11px] text-slate-500 mt-1">Outstanding tuition balances and complete UPI / Debit payment history receipts.</p>
            </div>
            <div className="flex gap-2 mt-4 pt-2 border-t border-slate-200">
              <button
                onClick={() => triggerDownload("fee", "pdf")}
                className="flex-1 py-1 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-650 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-3 h-3" /> PDF
              </button>
              <button
                onClick={() => triggerDownload("fee", "excel")}
                className="flex-1 py-1 px-2.5 bg-slate-150 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-3 h-3" /> Excel
              </button>
            </div>
          </div>

          {/* Card 3: Scholarships */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-150 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Fellowship Logs</span>
              <h4 className="font-bold text-slate-800 text-xs mt-0.5">Scholarships Fellowship Report</h4>
              <p className="text-[11px] text-slate-500 mt-1">Status index of active endowments, applied minority programs, and grants.</p>
            </div>
            <div className="flex gap-2 mt-4 pt-2 border-t border-slate-200">
              <button
                onClick={() => triggerDownload("scholarship", "pdf")}
                className="flex-1 py-1 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-650 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-3 h-3" /> PDF
              </button>
              <button
                onClick={() => triggerDownload("scholarship", "excel")}
                className="flex-1 py-1 px-2.5 bg-slate-150 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-3 h-3" /> Excel
              </button>
            </div>
          </div>

          {/* Card 4: Hostel Lodging */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-150 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Accommodation Status</span>
              <h4 className="font-bold text-slate-800 text-xs mt-0.5">Hostel Allocation Certificate</h4>
              <p className="text-[11px] text-slate-500 mt-1">Room verification, hostel wing allocation keys, and rental ledger details.</p>
            </div>
            <div className="flex gap-2 mt-4 pt-2 border-t border-slate-200">
              <button
                onClick={() => triggerDownload("hostel", "pdf")}
                className="flex-1 py-1 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-650 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-3 h-3" /> PDF
              </button>
              <button
                onClick={() => triggerDownload("hostel", "excel")}
                className="flex-1 py-1 px-2.5 bg-slate-150 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-3 h-3" /> Excel
              </button>
            </div>
          </div>

          {/* Card 5: Penalty Fines */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-150 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Infractions register</span>
              <h4 className="font-bold text-slate-800 text-xs mt-0.5">Penalties & Fines Certificate</h4>
              <p className="text-[11px] text-slate-500 mt-1">Official certificate of administrative pending infraction fine records.</p>
            </div>
            <div className="flex gap-2 mt-4 pt-2 border-t border-slate-200">
              <button
                onClick={() => triggerDownload("fine", "pdf")}
                className="flex-1 py-1 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-650 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-3 h-3" /> PDF
              </button>
              <button
                onClick={() => triggerDownload("fine", "excel")}
                className="flex-1 py-1 px-2.5 bg-slate-150 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-3 h-3" /> Excel
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Pay Tuition Fee Dialog */}
      {isPayFeeOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-150 rounded-3xl p-6 w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <h3 className="font-bold text-slate-955 text-base text-center"> tuition fee payment plan</h3>
            <p className="text-xs text-slate-500 text-center mt-1">Settle your Tuition installments directly via secure UPI routing</p>
            
            <form onSubmit={handlePayFee} className="space-y-4 mt-5">
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl text-center">
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Remaining Outstanding</span>
                <span className="text-2xl font-black text-slate-950 mt-1 block">
                  ₹{fee?.remainingAmount.toLocaleString()}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Payment Installment Amount (₹)</label>
                <input 
                  type="number" 
                  value={feeAmount}
                  onChange={(e) => setFeeAmount(Math.min(fee?.remainingAmount || 0, parseFloat(e.target.value) || 0))}
                  className="w-full px-4 py-2.5 border border-slate-200 text-xs font-bold rounded-xl focus:outline-none focus:border-indigo-500 bg-slate-55"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Payment Method Routing</label>
                <select 
                  value={feeMethod}
                  onChange={(e) => setFeeMethod(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 text-xs font-semibold rounded-xl bg-slate-55 focus:outline-none"
                >
                  <option value="UPI">Secure UPI Wallet</option>
                  <option value="Card">Visa / MasterCard Credit</option>
                  <option value="NetBanking">Campus Netbanking Portal</option>
                </select>
              </div>

              <div className="flex gap-2.5 pt-3">
                <button 
                  type="button" 
                  onClick={() => setIsPayFeeOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold"
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || feeAmount <= 0}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                >
                  {isSubmitting ? "Routing..." : "Confirm Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Hostel Dialog */}
      {isPayHostelOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-150 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="font-bold text-slate-950 text-base text-center">Settle Hostel Rental Fees</h3>
            <p className="text-xs text-slate-500 text-center mt-1">Pay the outstanding rent balance for room {hostel?.roomNumber}</p>
            
            <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl text-center mt-4">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">{hostel?.hostelName} Rent</span>
              <span className="text-2xl font-black text-rose-600 mt-1 block">
                ₹{hostel?.monthlyRent.toLocaleString()}
              </span>
            </div>

            <p className="text-[10px] text-slate-500 leading-relaxed text-center mt-4 bg-slate-50 p-2.5 rounded-xl border border-slate-150">
              This payments settles your lodging dues and updates your warden logs instantly.
            </p>

            <div className="flex gap-2.5 mt-5">
              <button 
                onClick={() => setIsPayHostelOpen(false)}
                className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button 
                onClick={handlePayHostel}
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md"
              >
                {isSubmitting ? "Routing..." : `Settle ₹${hostel?.monthlyRent}`}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
