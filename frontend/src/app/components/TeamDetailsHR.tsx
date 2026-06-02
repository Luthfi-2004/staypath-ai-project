import { useState, useEffect } from "react";
import { Loader2, ArrowLeft, Users, Briefcase, TrendingUp, Target, Mail } from "lucide-react";
import { AddMemberModal } from "./modals/AddMemberModal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export function TeamDetailsHR({ teamId, onBack }: { teamId: string, onBack: () => void }) {
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);

  const fetchTeam = async () => {
    try {
      const res = await fetch(`${API_URL}/api/teams/${teamId}`);
      if (res.ok) setTeam(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [teamId]);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-slate-900 animate-spin" /></div>;
  }

  if (!team) {
    return (
      <div className="py-20 text-center text-slate-500">
        <p>Team not found.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-slate-100 text-slate-900 rounded-lg">Go Back</button>
      </div>
    );
  }

  const membersCount = team.members?.length || 0;
  const openRoles = Math.max(0, team.expected_size - membersCount);

  return (
    <div className="w-full pb-10 fade-in space-y-6">
      
      {/* Back Button & Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <button onClick={onBack} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition shadow-sm mt-1">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-slate-800">{team.name}</h1>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-lg font-bold border border-emerald-200">Active</span>
            </div>
            <p className="text-slate-500 text-sm">{team.department} Department • Created {new Date(team.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition shadow-sm">
            Edit Team
          </button>
          <button onClick={() => setShowAddMember(true)} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition shadow-sm">
            Add Member
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Members", value: membersCount, icon: Users, color: "text-slate-900", bg: "bg-slate-100" },
          { label: "Expected Size", value: team.expected_size, icon: Target, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Open Roles", value: openRoles, icon: Briefcase, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Performance", value: "92%", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
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

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Members List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 text-lg">Team Members</h3>
              <span className="text-sm text-slate-500">{membersCount} employees</span>
            </div>
            
            <div className="space-y-3">
              {team.members?.map((emp: any) => (
                <div key={emp.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-slate-200 transition">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-slate-200 text-blue-700 font-bold flex items-center justify-center text-lg">
                        {(emp.name || "UN").substring(0, 2).toUpperCase()}
                      </div>
                      {emp.status === 'Active' && <div className="absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white bg-emerald-500 rounded-full"></div>}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        {emp.name}
                        {emp.id === team.lead_id && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] rounded-md font-bold">Manager</span>}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">{emp.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-200 transition shadow-sm">
                      <Mail size={16} />
                    </button>
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm">
                      Profile
                    </button>
                  </div>
                </div>
              ))}
              
              {(!team.members || team.members.length === 0) && (
                <div className="text-center py-10">
                  <p className="text-slate-500 text-sm">No members assigned to this team yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 text-lg mb-4">Active Projects</h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-100 border border-slate-200 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-blue-900 text-sm">Q3 Product Launch</h4>
                  <span className="text-xs font-bold text-slate-900">In Progress</span>
                </div>
                <div className="w-full bg-blue-200/50 h-2 rounded-full overflow-hidden mt-3">
                  <div className="bg-slate-900 h-full w-[65%] rounded-full"></div>
                </div>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-slate-700 text-sm">Website Redesign</h4>
                  <span className="text-xs font-bold text-slate-500">Planning</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-3">
                  <div className="bg-slate-400 h-full w-[15%] rounded-full"></div>
                </div>
              </div>
            </div>
            <button className="w-full mt-4 py-2.5 text-sm font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition">
              View All Projects
            </button>
          </div>
        </div>
        
      </div>

      {showAddMember && (
        <AddMemberModal 
          teamId={teamId} 
          onClose={() => setShowAddMember(false)} 
          onSuccess={() => {
            setShowAddMember(false);
            fetchTeam();
          }} 
        />
      )}
    </div>
  );
}
