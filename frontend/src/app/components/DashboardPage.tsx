import { useState, useEffect } from "react";
import { Loader2, Users, Calendar, AlertTriangle, Smile, Plus, FileText, Search, Clock, ArrowRight } from "lucide-react";
import { ResignationChart } from "./ResignationChart";
import { EmployeeTable } from "./EmployeeTable";
import { Modal, EmployeeForm, emptyForm, FormState, DEPARTMENTS } from "./EmployeesPage";
import { TeamFormModal } from "./modals/TeamFormModal";
import { MeetingFormModal } from "./modals/MeetingFormModal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export function DashboardPage({ onNavigate }: { onNavigate?: (path: string) => void }) {
  const [stats, setStats] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAddEmp, setShowAddEmp] = useState(false);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [showMeeting, setShowMeeting] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resStats, resEmp] = await Promise.all([
          fetch(`${API_URL}/api/dashboard/stats`),
          fetch(`${API_URL}/api/employees`)
        ]);
        if (resStats.ok) setStats(await resStats.json());
        if (resEmp.ok) setEmployees(await resEmp.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddEmployee = async (data: FormState) => {
    try {
      const res = await fetch(`${API_URL}/api/employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to add employee");
      setShowAddEmp(false);
      setToast("Employee successfully added!");
      // Optionally refresh stats here
    } catch (err) {
      console.error(err);
      alert("Failed to add employee");
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>;
  }

  const filteredEmployees = stats?.latestEmployees?.filter((emp: any) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = emp.name?.toLowerCase().includes(q) || emp.role?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "All Status" || emp.status === statusFilter;
    return matchSearch && matchStatus;
  }) || [];

  const filteredTeams = stats?.latestTeams?.filter((team: any) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = team.name?.toLowerCase().includes(q) || team.department?.toLowerCase().includes(q);
    const matchDept = deptFilter === "All Departments" || team.department === deptFilter;
    return matchSearch && matchDept;
  }) || [];

  return (
    <div className="w-full pb-10 fade-in space-y-6 relative">
      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-2xl z-50 animate-in slide-in-from-bottom-5">
          {toast}
        </div>
      )}


      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
        <p className="text-slate-500 text-sm">Monitor your team performance and key metrics</p>
      </div>

      {/* Top Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Our Employees Card */}
        <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-blue-200 mb-6 border border-white/10">
              <TrendingUpIcon /> +12 this month
            </div>
            <p className="text-slate-300 text-sm mb-1">Our Employees</p>
            <h3 className="text-6xl font-bold mb-2 tracking-tight">{stats?.totalEmployees || 0}</h3>
            <div className="text-slate-400 text-sm flex items-center justify-between">
              Active team members
              <div className="p-3 bg-white/10 rounded-2xl"><Users size={24} /></div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-300 mt-6">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Active Status</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Top Performers</span>
          </div>
        </div>

        {/* 2x2 Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <p className="text-sm font-semibold text-slate-700">Total Teams</p>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Users size={18} /></div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-800">{stats?.totalTeams || 0}</h3>
              <p className="text-emerald-500 text-xs font-medium mt-1">+{stats?.totalTeams || 0} new teams</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <p className="text-sm font-semibold text-slate-700">Attendance Rate</p>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Calendar size={18} /></div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-800">{stats?.attendanceRate || 0}%</h3>
              <p className="text-emerald-500 text-xs font-medium mt-1">+5.2% from last week</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <p className="text-sm font-semibold text-slate-700">High Risk (Resignation)</p>
              <div className="p-2 bg-red-50 text-red-500 rounded-xl"><AlertTriangle size={18} /></div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-800">{stats?.highRiskCount || 0}</h3>
              <p className="text-red-500 text-xs font-medium mt-1">Requires immediate attention</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <p className="text-sm font-semibold text-slate-700">Average Mood Today</p>
              <div className="p-2 bg-amber-50 text-amber-500 rounded-xl"><Smile size={18} /></div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-800">
                {stats?.avgMoodToday != null
                  ? `${stats.avgMoodToday} / 5`
                  : stats?.avgSatisfaction != null
                    ? `${stats.avgSatisfaction} / 5`
                    : "—"}
              </h3>
              <p className="text-emerald-500 text-xs font-medium mt-1">
                {stats?.pulseCountToday
                  ? `${stats.pulseCountToday} check-ins today`
                  : "No check-ins today"}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-800 mb-4">Quick Actions</h3>
          <div className="space-y-3 flex-1">
            <button onClick={() => setShowAddEmp(true)} className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
              <Plus size={16} /> Add Employee
            </button>
            <button onClick={() => setShowAddTeam(true)} className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-100 transition">
              <Users size={16} /> Create New Team
            </button>
            {/* <button onClick={() => onNavigate && onNavigate("payroll")} className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-100 transition">
              <FileText size={16} /> Process Payroll
            </button> */}
            <button onClick={() => setShowMeeting(true)} className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-100 transition">
              <Calendar size={16} /> Schedule Meeting
            </button>
          </div>
        </div>
      </div>


      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employees or teams..."
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-3">
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="All Departments">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="All Status">All Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Cuti">Cuti</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>
        </div>
      </div>

      {/* Bottom Grid: Latest Employees & Teams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Latest Employees */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6 text-lg">Latest Employees</h3>
          <div className="space-y-4">
            {filteredEmployees.map((emp: any) => (
              <div key={emp.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
                      {(emp.name || "").substring(0, 2).toUpperCase()}
                    </div>
                    {emp.status === 'Aktif' && <div className="absolute bottom-0 right-0 w-3 h-3 border-2 border-white bg-emerald-500 rounded-full"></div>}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      {emp.name}
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded-md font-bold">{emp.role}</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      {emp.role} •
                      {(() => {
                        const days = Math.floor((new Date().getTime() - new Date(emp.created_at).getTime()) / (1000 * 3600 * 24));
                        return days === 0 ? "Today" : `${days} days ago`;
                      })()}
                    </p>
                  </div>
                </div>
                <button onClick={() => onNavigate && onNavigate("employees")} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Details
                </button>
              </div>
            ))}
            {filteredEmployees.length === 0 && (
              <p className="text-center text-slate-500 text-sm py-4">No employees found.</p>
            )}
          </div>
        </div>

        {/* Latest Teams */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6 text-lg">Latest Teams</h3>
          <div className="space-y-4">
            {filteredTeams.map((team: any, i: number) => {
              const colors = ["bg-blue-600", "bg-indigo-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500"];
              const colorClass = colors[i % colors.length];
              return (
                <div key={team.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${colorClass}`}>
                      <Users size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        {team.name}
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] rounded-md font-bold">Active</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {team.expected_size} members • {team.department}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => onNavigate && onNavigate("ourteams")} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    Details
                  </button>
                </div>
              );
            })}
            {filteredTeams.length === 0 && (
              <p className="text-center text-slate-500 text-sm py-4">No teams found.</p>
            )}
          </div>
        </div>

      </div>

      {/* Legacy Dashboard Components Below */}
      <div className="pt-8 border-t border-slate-200 mt-8 space-y-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Deep Analytics (Legacy)</h2>
        <ResignationChart />
        <EmployeeTable employees={employees} onIntervene={() => { }} />
      </div>

      {showAddEmp && (
        <Modal title="Add New Employee" onClose={() => setShowAddEmp(false)}>
          <EmployeeForm initial={emptyForm} mode="add" onClose={() => setShowAddEmp(false)} onSave={handleAddEmployee} />
        </Modal>
      )}

      {showAddTeam && (
        <TeamFormModal onClose={() => setShowAddTeam(false)} onSuccess={() => { setShowAddTeam(false); setToast("Team successfully created!"); }} />
      )}

      {showMeeting && (
        <MeetingFormModal onClose={() => setShowMeeting(false)} onSuccess={() => { setShowMeeting(false); setToast("Meeting scheduled successfully!"); }} />
      )}

    </div>
  );
}

function TrendingUpIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
      <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
  );
}
