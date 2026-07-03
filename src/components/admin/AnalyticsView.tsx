import React from "react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  Cell, 
  PieChart, 
  Pie, 
  LineChart, 
  Line 
} from "recharts";
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Home, 
  GraduationCap, 
  AlertTriangle, 
  Bell, 
  Briefcase 
} from "lucide-react";

interface AnalyticsViewProps {
  analytics: any;
  students: any[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ analytics, students }) => {
  // Metric variables
  const totalStudents = students.length || analytics?.totalStudents || 1205;
  const facultyCount = 142;
  const avgAttendance = analytics?.avgAttendance || 85.4;
  const feesCollected = analytics?.totalFeesCollected || 2840000;
  const hostelPercent = analytics?.hostelOccupancyPercent || 68.2;
  const pendingScholarships = 8;
  const pendingFines = students.reduce((acc, s) => {
    const unfines = s.fines?.filter((f: any) => f.paymentStatus !== "Paid") || [];
    return acc + unfines.reduce((sum: number, f: any) => sum + f.amount, 0);
  }, 0) || 12400;
  
  const alertCount = 45;

  // Visualizers structures
  const attendanceTrendData = [
    { month: "Jan", rate: 82 },
    { month: "Feb", rate: 84 },
    { month: "Mar", rate: 87 },
    { month: "Apr", rate: 85 },
    { month: "May", rate: 89 },
    { month: "Jun", rate: avgAttendance }
  ];

  const feeMonthlyData = [
    { name: "Jan", Collected: 450000, Pending: 120000 },
    { name: "Feb", Collected: 600000, Pending: 90000 },
    { name: "Mar", Collected: 720005, Pending: 40000 },
    { name: "Apr", Collected: 512000, Pending: 15000 },
    { name: "May", Collected: 320000, Pending: 80000 },
    { name: "Jun", Collected: feesCollected % 500000, Pending: 24000 }
  ];

  const scholarshipDistribution = [
    { name: "State Grants", value: 35, color: "#3B82F6" },
    { name: "STEM Merit", value: 25, color: "#10B981" },
    { name: "Alumni Aid", value: 20, color: "#F59E0B" },
    { name: "Need-Based", value: 20, color: "#EF4444" }
  ];

  const hostelOccupancyData = [
    { block: "Block Alpha", Occupied: 120, Vacant: 30 },
    { block: "Block Beta", Occupied: 95, Vacant: 55 },
    { block: "Block Gamma", Occupied: 140, Vacant: 10 },
    { block: "Block Delta", Occupied: 80, Vacant: 70 }
  ];

  const fineDepartmentData = [
    { dept: "CS", Issued: 4200, Paid: 3800 },
    { dept: "EE", Issued: 2500, Paid: 1800 },
    { dept: "ME", Issued: 3100, Paid: 2100 },
    { dept: "CE", Issued: 1200, Paid: 900 }
  ];

  const studentGrowthData = [
    { year: "2022", students: 850 },
    { year: "2023", students: 980 },
    { year: "2024", students: 1120 },
    { year: "2025", students: 1190 },
    { year: "2026", students: totalStudents }
  ];

  const statCards = [
    { id: "s1", title: "Total Students", value: `${totalStudents} Active`, icon: Users, desc: "Enrolled this term", color: "from-blue-600/20 to-blue-500/5", border: "border-blue-500/20", iconColor: "text-blue-400" },
    { id: "s2", title: "Faculty Members", value: `${facultyCount} Staff`, icon: Briefcase, desc: "Full-time academics", color: "from-indigo-600/20 to-indigo-500/5", border: "border-indigo-500/20", iconColor: "text-indigo-400" },
    { id: "s3", title: "Class Attendance %", value: `${avgAttendance}%`, icon: TrendingUp, desc: "Institutional average", color: "from-emerald-600/20 to-emerald-500/5", border: "border-emerald-500/20", iconColor: "text-emerald-400" },
    { id: "s4", title: "Fees Collected", value: `₹${feesCollected.toLocaleString()}`, icon: DollarSign, desc: "Core tuition ledger", color: "from-cyan-600/20 to-cyan-500/5", border: "border-cyan-500/20", iconColor: "text-cyan-400" },
    { id: "s5", title: "Hostel Occupancy", value: `${hostelPercent}%`, icon: Home, desc: "Shared dorm spaces", color: "from-orange-600/20 to-orange-500/5", border: "border-orange-500/20", iconColor: "text-orange-400" },
    { id: "s6", title: "Pending Scholarships", value: `${pendingScholarships} Applications`, icon: GraduationCap, desc: "Awaiting board approval", color: "from-purple-600/20 to-purple-500/5", border: "border-purple-500/20", iconColor: "text-purple-400" },
    { id: "s7", title: "Outstanding Fines", value: `₹${pendingFines.toLocaleString()}`, icon: AlertTriangle, desc: "Unpaid violations", color: "from-rose-600/20 to-rose-500/5", border: "border-rose-500/20", iconColor: "text-rose-400" },
    { id: "s8", title: "Dispatched Notice Logs", value: `${alertCount} Issued`, icon: Bell, desc: "Push notification counter", color: "from-slate-600/20 to-slate-500/5", border: "border-slate-500/20", iconColor: "text-slate-400" },
  ];

  return (
    <div className="space-y-6" id="analytics-overview-dashboard">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">ERP Analytics Command Console</h2>
          <p className="text-xs text-slate-400">Real-time synchronized key performance indicators & visual trends.</p>
        </div>
      </div>

      {/* Top 8 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <div 
              key={card.id}
              className={`bg-slate-900/40 backdrop-blur-md border ${card.border} rounded-2xl p-5 shadow-lg bg-gradient-to-br ${card.color} transition-all duration-300 hover:-translate-y-1 hover:shadow-cyan-950/10`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{card.title}</span>
                <div className={`p-2.5 rounded-xl bg-slate-950/60 ${card.iconColor}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-white tracking-tight">{card.value}</span>
                <span className="text-[10px] text-slate-400 font-medium block mt-1">{card.desc}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 6 Recharts Sub-grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Attendance Trend */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm">
          <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
            📊 Attendance Trend (Term to Date)
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceTrendData}>
                <defs>
                  <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818CF8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#818CF8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" domain={[60, 100]} fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155" }} />
                <Area type="monotone" dataKey="rate" stroke="#818CF8" strokeWidth={2} fillOpacity={1} fill="url(#colorAtt)" name="Attendance %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Monthly Fee Collection */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm">
          <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
            💰 Tuition ledger flows (INR)
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feeMonthlyData}>
                <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155" }} />
                <Bar dataKey="Collected" fill="#10B981" radius={[3, 3, 0, 0]} name="Collected" />
                <Bar dataKey="Pending" fill="#F59E0B" radius={[3, 3, 0, 0]} name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Scholarship Distribution */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              🎓 Scholarships Board Apportionment
            </h3>
            <div className="h-44 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={scholarshipDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {scholarshipDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-black text-white">{pendingScholarships}</span>
                <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Awaiting board</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400 font-medium">
            {scholarshipDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 px-1">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                <span className="truncate">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 4: Hostel Occupancies Block-by-Block */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm">
          <h3 className="text-xs font-bold text-orange-300 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
            🏠 Hostel Bed Occupancies Tower Standing
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hostelOccupancyData} layout="vertical">
                <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis dataKey="block" type="category" stroke="#64748B" fontSize={10} tickLine={false} width={80} />
                <Tooltip contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155" }} />
                <Bar dataKey="Occupied" fill="#EA580C" stackId="a" radius={[0, 0, 0, 0]} name="Occupied" />
                <Bar dataKey="Vacant" fill="#4B5563" stackId="a" radius={[0, 3, 3, 0]} name="Vacant" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Fine Collection Standing */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm">
          <h3 className="text-xs font-bold text-rose-300 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
            ⚠️ Fine Collection Performance By Dept.
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fineDepartmentData}>
                <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="dept" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155" }} />
                <Bar dataKey="Issued" fill="#EF4444" radius={[3, 3, 0, 0]} name="Issued" />
                <Bar dataKey="Paid" fill="#10B981" radius={[3, 3, 0, 0]} name="Paid" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: Student Growth (5-year progression) */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm">
          <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
            📈 Institutional Student Body Growth
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={studentGrowthData}>
                <defs>
                  <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155" }} />
                <Area type="monotone" dataKey="students" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#colorGrowth)" name="Enrolled Body" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
