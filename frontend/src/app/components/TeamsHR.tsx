import { useState, useEffect, useMemo } from "react";
import { Loader2, Users, Search, Folder, Briefcase, Plus, MoreVertical, Building2, Target, TrendingUp, BarChart2 } from "lucide-react";
import { TeamFormModal } from "./modals/TeamFormModal";
import { TeamDetailsHR } from "./TeamDetailsHR";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export function TeamsHR() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [sortOrder, setSortOrder] = useState("Sort by: Performance");
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const fetchOverview = async () => {
    try {
      const res = await fetch(`${API_URL}/api/teams/overview`);
      if (res.ok) setData(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const filteredTeams = useMemo(() => {
    if (!data?.teams) return [];
    let filtered = [...data.teams];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.name?.toLowerCase().includes(q) || 
        t.department?.toLowerCase().includes(q) ||
        t.managerName?.toLowerCase().includes(q)
      );
    }

    if (deptFilter !== "All Departments") {
      filtered = filtered.filter(t => t.department === deptFilter);
    }

    if (sortOrder === "Sort by: Performance") {
      filtered.sort((a, b) => b.performance - a.performance);
    } else if (sortOrder === "Sort by: Size") {
      filtered.sort((a, b) => b.membersCount - a.membersCount);
    }

    return filtered;
  }, [data, searchQuery, deptFilter, sortOrder]);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-slate-900 animate-spin" /></div>;
  }

  if (selectedTeamId) {
    return <TeamDetailsHR teamId={selectedTeamId} onBack={() => setSelectedTeamId(null)} />;
  }

  return (
    <>
    <div className="w-full pb-10 fade-in space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Our Teams</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and monitor departmental team structures</p>
        </div>
        <button onClick={() => setShowAddTeam(true)} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition flex items-center gap-2">
          <Plus size={16} /> Create New Team
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Teams", value: data?.totalTeams || 0, icon: Building2, color: "text-slate-900", bg: "bg-slate-100" },
          { label: "Total Employees", value: data?.totalEmployees || 0, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Open Roles", value: data?.openRoles || 0, icon: Briefcase, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Active Projects", value: data?.activeProjects || 0, icon: Folder, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
              <p className="text-sm font-semibold text-slate-700">{stat.label}</p>
              <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={18} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search teams by name, department, or manager..." 
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
        </div>
        <div className="flex gap-3">
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-900">
            <option value="All Departments">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Product">Product</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
            <option value="Sales">Sales</option>
            <option value="Human Resources">Human Resources</option>
          </select>
          <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-900">
            <option value="Sort by: Performance">Sort by: Performance</option>
            <option value="Sort by: Size">Sort by: Size</option>
          </select>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTeams.map((team: any) => (
          <div key={team.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            
            {/* Card Header */}
            <div className="p-6 border-b border-slate-50 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-900 flex items-center justify-center flex-shrink-0 border border-slate-200">
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800 leading-tight">{team.name}</h3>
                  <p className="text-slate-500 text-sm mt-0.5">{team.department}</p>
                </div>
              </div>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition">
                <MoreVertical size={18} />
              </button>
            </div>

            {/* Content & Metrics */}
            <div className="p-6 grid grid-cols-2 gap-y-6 gap-x-4">
              
              {/* Stats column 1 */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1 flex items-center gap-1.5"><Users size={14} /> Employees & Roles</p>
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-slate-800">{team.membersCount}</span>
                    <span className="text-xs text-slate-400">members</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-semibold text-amber-600">{team.openRoles}</span>
                    <span className="text-xs text-amber-500">open</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1 flex items-center gap-1.5"><Folder size={14} /> Projects & Budget</p>
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-slate-800">{team.projects}</span>
                    <span className="text-xs text-slate-400">active</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-semibold text-slate-800">{team.budget}%</span>
                    <span className="text-xs text-slate-400">budget</span>
                  </div>
                </div>
              </div>

              {/* Stats column 2 */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1 flex items-center gap-1.5"><TrendingUp size={14} /> Performance</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${team.performance}%` }}></div>
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{team.performance}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1 flex items-center gap-1.5"><BarChart2 size={14} /> Attendance</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-slate-1000 rounded-full" style={{ width: `${team.attendance}%` }}></div>
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{team.attendance}%</span>
                  </div>
                </div>
              </div>
              
              {/* Bottom full width info */}
              <div className="col-span-2 pt-4 border-t border-slate-50 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-0.5">Next Milestone</p>
                  <p className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <Target size={14} className="text-slate-900" />
                    Q3 Product Launch
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-0.5">Manager</p>
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-5 h-5 rounded-full bg-slate-200 text-[9px] font-bold flex items-center justify-center text-slate-600">
                      {(team.managerName || "UN").substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-slate-700">{team.managerName}</span>
                  </div>
                </div>
              </div>

            </div>
            
            {/* Action Bar */}
            <div className="mt-auto bg-slate-50 p-4 border-t border-slate-100 flex justify-end">
              <button onClick={() => setSelectedTeamId(team.id)} className="px-5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition shadow-sm">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTeams.length === 0 && (
        <div className="py-20 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
          <Building2 size={40} className="mx-auto text-slate-300 mb-3" />
          <p>No teams found.</p>
        </div>
      )}

    </div>
      {showAddTeam && (
        <TeamFormModal 
          onClose={() => setShowAddTeam(false)} 
          onSuccess={() => { 
            setShowAddTeam(false); 
            fetchOverview(); // Refresh data
          }} 
        />
      )}
    </>
  );
}
