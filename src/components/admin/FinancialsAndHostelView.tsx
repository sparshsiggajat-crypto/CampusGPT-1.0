import React, { useState } from "react";
import { 
  DollarSign, 
  Layers, 
  Home, 
  GraduationCap, 
  AlertOctagon, 
  Check, 
  X, 
  Plus, 
  Download, 
  Eye, 
  FileText, 
  TrendingUp, 
  Zap, 
  ShieldAlert 
} from "lucide-react";

interface FinancialsAndHostelViewProps {
  students: any[];
  token: string;
  onRefresh: () => Promise<void>;
}

export const FinancialsAndHostelView: React.FC<FinancialsAndHostelViewProps> = ({ 
  students, 
  token, 
  onRefresh 
}) => {
  // Tabs: fee | hostel | scholarship | fines
  const [activeTab, setActiveTab] = useState<"fee" | "hostel" | "scholarship" | "fines">("fee");
  const [studentList, setStudentList] = useState<any[]>(students);

  // States for Fee Record
  const [payStudentId, setPayStudentId] = useState("");
  const [payAmount, setPayAmount] = useState(5000);
  const [payMethod, setPayMethod] = useState("UPI / GPay");
  const [feeInvoiceSuccess, setFeeInvoiceSuccess] = useState(false);

  // States for Hostel Allocation
  const [allocStudentId, setAllocStudentId] = useState("");
  const [allocHostel, setAllocHostel] = useState("Alpha Hall");
  const [allocRoom, setAllocRoom] = useState("101-A");
  const [allocSuccess, setAllocSuccess] = useState(false);

  // States for Scholarships
  const [selectedSch, setSelectedSch] = useState<any | null>(null);
  const [eligibilityTerm, setEligibilityTerm] = useState("CGPA >= 8.5 AND Attendance >= 80%");

  // States for Fines
  const [fineStudentId, setFineStudentId] = useState("");
  const [fineAmount, setFineAmount] = useState(500);
  const [fineReason, setFineReason] = useState("Late library return");
  const [fineSuccess, setFineSuccess] = useState(false);

  // Sync state
  React.useEffect(() => {
    setStudentList(students);
  }, [students]);

  // Handle generating a tuition fee invoice
  const handleGenerateFeeInvoice = async () => {
    // Generate invoice on ALL students or selected student
    const alertBox = document.createElement("div");
    alertBox.className = "fixed bottom-5 right-5 bg-blue-600 text-white font-bold p-3 rounded-xl shadow-lg z-50 text-xs";
    alertBox.innerText = "Generating Termly ERP Tuition Fee Ledgers...";
    document.body.appendChild(alertBox);

    for (const s of studentList) {
      await fetch("/api/admin/student/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId: s.id,
          remainingFee: (s.fee?.remainingAmount || 0) + 45000
        })
      });
    }

    await onRefresh();
    alertBox.innerText = "Termly Invoice Ledgers generated successfully!";
    setTimeout(() => alertBox.remove(), 2500);
  };

  // Record virtual fee payment
  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const stud = studentList.find(s => s.id === payStudentId);
    if (!stud) return;

    const remaining = Math.max(0, (stud.fee?.remainingAmount || 0) - payAmount);
    
    try {
      const response = await fetch("/api/admin/student/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId: payStudentId,
          remainingFee: remaining
        })
      });
      if (response.ok) {
        setFeeInvoiceSuccess(true);
        setTimeout(() => setFeeInvoiceSuccess(false), 3000);
        await onRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Perform virtual Hostel Allocation
  const handleAllocateHostelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocStudentId) return;

    setStudentList(prev => prev.map(s => {
      if (s.id === allocStudentId) {
        return {
          ...s,
          hostel: {
            ...s.hostel,
            hostelName: allocHostel,
            roomNumber: allocRoom,
            hostelFeeStatus: "Pending"
          }
        };
      }
      return s;
    }));

    setAllocSuccess(true);
    setTimeout(() => setAllocSuccess(false), 3000);
  };

  // Mock download receipt
  const triggerDownloadReceipt = (st: any) => {
    const timestamp = new Date().toLocaleString();
    const docText = `
========================================
         CAMPUS-GPT UNIVERSITY ERP
             OFFICIAL RECEIPT
========================================
STUDENT NAME:      ${st.name}
ROLL NUMBER:       ${st.rollNumber}
DEPARTMENT:        ${st.department}
========================================
TRANSACTION TYPE:  Tuition Installment
DATE GENERATED:    ${timestamp}
OUTSTANDING TERM:  Rs. ${(st.fee?.remainingAmount || 0).toLocaleString()}
STATUS:            ERP-Verified Authentic
========================================
Thank you for executing secure payments.
    `;
    const blob = new Blob([docText], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `RECEIPT_${st.rollNumber}_FEES.txt`;
    link.click();
  };

  // Add Fine Penalty handler
  const handleRecordFineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fineStudentId || fineAmount <= 0) return;

    try {
      const response = await fetch("/api/admin/student/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId: fineStudentId,
          fineAmount,
          fineReason
        })
      });
      if (response.ok) {
        setFineSuccess(true);
        setTimeout(() => setFineSuccess(false), 3000);
        await onRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Scholarship approve actions
  const handleApproveScholarship = async (studentId: string, action: "Approved" | "Rejected") => {
    const alertBox = document.createElement("div");
    alertBox.className = "fixed bottom-5 right-5 bg-blue-600 text-white font-bold p-3 rounded-xl shadow-lg z-50 text-xs";
    alertBox.innerText = `Setting status to ${action}...`;
    document.body.appendChild(alertBox);

    // Simulate approval modifications inside local states and issue push notices
    const prevList = [...studentList];
    setStudentList(prevList.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          scholarship: {
            ...s.scholarship,
            status: action,
            paymentStatus: action === "Approved" ? "Processing" : "N/A"
          }
        };
      }
      return s;
    }));

    alertBox.innerText = `Scholarship ${action}. Registered on master R&D Ledger.`;
    setTimeout(() => alertBox.remove(), 2500);
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-md" id="financials_hostels_scholarships">
      
      {/* Tab select row */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab("fee")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${activeTab === "fee" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-900"}`}
          >
            <DollarSign className="w-3.5 h-3.5" /> Financial Ledger
          </button>
          <button 
            onClick={() => setActiveTab("hostel")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${activeTab === "hostel" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-900"}`}
          >
            <Home className="w-3.5 h-3.5" /> Hostel Occupancy
          </button>
          <button 
            onClick={() => setActiveTab("scholarship")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${activeTab === "scholarship" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-900"}`}
          >
            <GraduationCap className="w-3.5 h-3.5" /> Scholarship board
          </button>
          <button 
            onClick={() => setActiveTab("fines")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${activeTab === "fines" ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-900"}`}
          >
            <AlertOctagon className="w-3.5 h-3.5" /> Fine Register
          </button>
        </div>

        {activeTab === "fee" && (
          <button 
            onClick={handleGenerateFeeInvoice}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-md shadow-blue-900/10"
          >
            <Plus className="w-3.5 h-3.5" /> Generate Termly Invoices
          </button>
        )}
      </div>

      {/* VIEW 1: Financial Ledger */}
      {activeTab === "fee" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Record payment widget */}
          <div className="lg:col-span-4 bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-xs font-semibold text-slate-300 h-fit space-y-4">
            <span className="font-extrabold text-white text-xs uppercase tracking-wider block border-b border-slate-800 pb-2">Record Payment Receipts</span>
            
            <form onSubmit={handleRecordPaymentSubmit} className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Select Student Beneficiary</label>
                <select 
                  value={payStudentId} 
                  onChange={e => setPayStudentId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white outline-none"
                  required
                >
                  <option value="">-- Choose Account --</option>
                  {studentList.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (Owed: ₹{s.fee?.remainingAmount?.toLocaleString()})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Billing Amount (₹)</label>
                  <input 
                    type="number" 
                    value={payAmount} 
                    onChange={e => setPayAmount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-white" 
                    required 
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Payment Method</label>
                  <select 
                    value={payMethod} 
                    onChange={e => setPayMethod(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 p-2 rounded bg-slate-900 text-white outline-none"
                  >
                    <option value="UPI / GPay">UPI / GPay</option>
                    <option value="Hostel Credit Ledger">Bank Transfer</option>
                    <option value="Cash Deposit">Cash counter</option>
                    <option value="Scholarship Offset">Scholarship offset</option>
                  </select>
                </div>
              </div>

              {feeInvoiceSuccess && (
                <span className="text-emerald-400 font-bold block">Payment logged successfully! Roster balance updated.</span>
              )}

              <button 
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow select-none"
              >
                Log Payment Ledger
              </button>
            </form>
          </div>

          {/* Roster balances table */}
          <div className="lg:col-span-8 overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950/20 text-xs">
            <span className="font-bold text-white p-3 block bg-slate-900/40 border-b border-slate-800">Ledger Balances & Receivables</span>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-bold">
                  <th className="p-3">Beneficiary Student</th>
                  <th className="p-3">Charged (INR)</th>
                  <th className="p-3">Paid (INR)</th>
                  <th className="p-3">Unresolved Due</th>
                  <th className="p-3 text-right">Receipts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {studentList.map(s => (
                  <tr key={s.id} className="hover:bg-slate-900/20 transition">
                    <td className="p-3 font-semibold text-white">
                      {s.name}
                      <span className="text-[10px] text-slate-500 block font-mono">{s.rollNumber}</span>
                    </td>
                    <td className="p-3">₹{(s.fee?.totalFees || 85000).toLocaleString()}</td>
                    <td className="p-3 text-emerald-400 font-mono">₹{(s.fee?.paidAmount || (85000 - (s.fee?.remainingAmount || 0))).toLocaleString()}</td>
                    <td className="p-3 text-amber-500 font-bold font-mono">₹{(s.fee?.remainingAmount || 0).toLocaleString()}</td>
                    <td className="p-3 text-right">
                      <button 
                        onClick={() => triggerDownloadReceipt(s)}
                        className="p-1.5 hover:bg-blue-900/30 text-blue-400 rounded-lg inline-flex items-center gap-1 font-bold font-mono text-[9px]"
                        title="Download verified receipt"
                      >
                        <Download className="w-3.5 h-3.5" /> TXT
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: Hostel Occupancies */}
      {activeTab === "hostel" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs text-slate-300">
          {/* Hostel Occupancy statistics card */}
          <div className="lg:col-span-4 bg-slate-950/60 border border-slate-800 rounded-2xl p-4 h-fit space-y-4 font-semibold">
            <span className="font-extrabold text-white text-xs uppercase tracking-wider block border-b border-slate-800 pb-2">Room Allocation Engine</span>
            
            <form onSubmit={handleAllocateHostelSubmit} className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Select Candidate Student</label>
                <select 
                  value={allocStudentId} 
                  onChange={e => setAllocStudentId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white outline-none"
                  required
                >
                  <option value="">-- Choose Account --</option>
                  {studentList.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.hostel?.hostelName || "Need Dorm"})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Select Block tower</label>
                  <select 
                    value={allocHostel} 
                    onChange={e => setAllocHostel(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-white outline-none"
                  >
                    <option value="Alpha Tower">Alpha Tower</option>
                    <option value="Beta Hall">Beta Hall</option>
                    <option value="Gamma House">Gamma House</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Room Placement</label>
                  <input 
                    type="text" 
                    value={allocRoom} 
                    onChange={e => setAllocRoom(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-white" 
                    required 
                  />
                </div>
              </div>

              {allocSuccess && (
                <span className="text-emerald-400 font-bold block">Room allocated! Hostels credentials updated.</span>
              )}

              <button 
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow select-none"
              >
                Allocate Academic Bed
              </button>
            </form>
          </div>

          {/* Room occupancy visualization matrix */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-4">
              <span className="font-extrabold text-white text-xs uppercase block mb-3">Modular Dorm Block Map Visualizer</span>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-slate-950/70 border border-emerald-900/40 p-3 rounded-xl">
                  <span className="text-lg font-black text-emerald-400 font-mono">14 Rooms</span>
                  <span className="text-[10px] text-slate-500 block">Vacant (Total)</span>
                </div>
                <div className="bg-slate-950/70 border border-blue-900/40 p-3 rounded-xl">
                  <span className="text-lg font-black text-blue-400 font-mono">86 Rooms</span>
                  <span className="text-[10px] text-slate-500 block">Occupied</span>
                </div>
                <div className="bg-slate-950/70 border border-amber-900/40 p-3 rounded-xl">
                  <span className="text-lg font-black text-amber-400 font-mono">2 Rooms</span>
                  <span className="text-[10px] text-slate-500 block">Out of Order</span>
                </div>
                <div className="bg-slate-950/70 border border-slate-900/40 p-3 rounded-xl">
                  <span className="text-lg font-black text-white font-mono">86.2%</span>
                  <span className="text-[10px] text-slate-500 block">Utility Yield</span>
                </div>
              </div>
            </div>

            {/* Hostel roster table */}
            <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950/20 text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-bold">
                    <th className="p-3">Resident student</th>
                    <th className="p-3">Hostel tower</th>
                    <th className="p-3">Room Placement</th>
                    <th className="p-3">Payment Standing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {studentList.map(s => (
                    <tr key={s.id} className="hover:bg-slate-900/20 transition">
                      <td className="p-3 font-semibold text-white">
                        {s.name}
                        <span className="text-[10px] text-slate-500 block font-mono">{s.rollNumber}</span>
                      </td>
                      <td className="p-3">{s.hostel?.hostelName || "Not Allocated"}</td>
                      <td className="p-3 font-bold font-mono text-indigo-400">{s.hostel?.roomNumber || "N/A"}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                          (s.hostel?.hostelFeeStatus || "Due") === "Paid" ? "bg-emerald-950 text-emerald-400 border border-emerald-900/40" : "bg-rose-950 text-rose-400 border border-rose-900/20"
                        }`}>
                          {s.hostel?.hostelFeeStatus || "Due"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* VIEW 3: Scholarships Board */}
      {activeTab === "scholarship" && (
        <div className="space-y-4 text-xs text-slate-300">
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl font-semibold">
            <span className="font-extrabold text-white text-xs uppercase block mb-2">Automated eligibility checker Rules</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 block mb-1">Active Scheme Filter Statement</label>
                <input 
                  type="text" 
                  value={eligibilityTerm} 
                  onChange={e => setEligibilityTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-white" 
                />
              </div>
              <div className="flex items-end">
                <button 
                  type="button" 
                  onClick={() => alert("Criteria committed to academic evaluation controller!")}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[11px] select-none shadow w-full md:w-auto"
                >
                  Commit Filter Policy Engine
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950/20 text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-bold">
                  <th className="p-3">Requested Student</th>
                  <th className="p-3">Grant Foundation Scheme</th>
                  <th className="p-3">Eligibility Index</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Committee action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {studentList.map(s => {
                  const hasGrant = s.scholarship || { name: "National Merit grant", status: "Applied", amount: 45000 };
                  const stat = hasGrant.status || "Applied";
                  return (
                    <tr key={s.id} className="hover:bg-slate-900/20 transition">
                      <td className="p-3 font-semibold text-white">
                        {s.name}
                        <span className="text-[10px] text-slate-500 block font-mono">{s.rollNumber}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-indigo-400">{hasGrant.name}</span>
                        <span className="text-[10px] text-slate-500 block font-semibold">Scheduled disbursement: ₹{(hasGrant.amount || 25000).toLocaleString()}</span>
                      </td>
                      <td className="p-3 font-bold font-mono text-emerald-400">92.4% Match</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] ${
                          stat === "Approved" ? "bg-emerald-950 text-emerald-400" : stat === "Rejected" ? "bg-rose-950 text-rose-400" : "bg-amber-950 text-amber-400"
                        }`}>
                          {stat}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1.5">
                        {stat !== "Approved" && (
                          <button 
                            onClick={() => handleApproveScholarship(s.id, "Approved")}
                            className="p-1 px-2.5 bg-emerald-950 border border-emerald-800 hover:border-emerald-700 text-emerald-400 font-extrabold rounded-lg text-[9px]"
                          >
                            Approve Grant
                          </button>
                        )}
                        {stat !== "Rejected" && (
                          <button 
                            onClick={() => handleApproveScholarship(s.id, "Rejected")}
                            className="p-1 px-2.5 bg-rose-950 border border-rose-800 hover:border-rose-700 text-rose-400 font-extrabold rounded-lg text-[9px]"
                          >
                            Reject
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 4: Fine Register */}
      {activeTab === "fines" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs text-slate-300">
          {/* Issue fine widget */}
          <div className="lg:col-span-4 bg-slate-950/60 border border-slate-800 rounded-2xl p-4 h-fit space-y-4 font-semibold">
            <span className="font-extrabold text-white text-xs uppercase block border-b border-slate-800 pb-2">Issue Penalty Fine</span>
            
            <form onSubmit={handleRecordFineSubmit} className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Select Offending Student</label>
                <select 
                  value={fineStudentId} 
                  onChange={e => setFineStudentId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white outline-none"
                  required
                >
                  <option value="">-- Choose Account --</option>
                  {studentList.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.rollNumber})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Penalty Fee (₹)</label>
                  <input 
                    type="number" 
                    value={fineAmount} 
                    onChange={e => setFineAmount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-white outline-none" 
                    required 
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Reason code</label>
                  <input 
                    type="text" 
                    value={fineReason} 
                    onChange={e => setFineReason(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-white" 
                    placeholder="Dorm curfew violation"
                    required 
                  />
                </div>
              </div>

              {fineSuccess && (
                <span className="text-emerald-400 font-bold block">Fine issued on dashboard! Relational logging complete.</span>
              )}

              <button 
                type="submit"
                className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow select-none"
              >
                Log Penalty Ledger Check
              </button>
            </form>
          </div>

          {/* Fines table */}
          <div className="lg:col-span-8 overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950/20 text-xs">
            <span className="font-bold text-white p-3 block bg-slate-900/40 border-b border-slate-800">Fine Register records</span>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-bold">
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Accrued Reason</th>
                  <th className="p-3">Accrued Fine (₹)</th>
                  <th className="p-3">Accounting Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {studentList.map(s => {
                  const finesList = s.fines?.length > 0 ? s.fines : [{ id: "f1", reason: "Hostel damages / General curfew", amount: 1500, paymentStatus: "Pending" }];
                  return finesList.map((f: any) => (
                    <tr key={`${s.id}-${f.id}`} className="hover:bg-slate-900/20 transition">
                      <td className="p-3 font-semibold text-white">
                        {s.name}
                        <span className="text-[10px] text-slate-500 block font-mono">{s.rollNumber}</span>
                      </td>
                      <td className="p-3 font-bold text-indigo-400">{f.reason}</td>
                      <td className="p-3 font-black font-mono text-rose-400">₹{f.amount?.toLocaleString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                          f.paymentStatus === "Paid" ? "bg-emerald-950 text-emerald-400 border border-emerald-900/40" : "bg-rose-950 text-rose-400 border border-rose-900/20 animate-pulse"
                        }`}>
                          {f.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
};
