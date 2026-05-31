import { useState, useEffect } from "react";
import { Loader2, Users, Folder, TrendingUp, User, Calendar, BookOpen, AlertCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export function MyTeam() {
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("members");
  
  const employeeId = localStorage.getItem("employee_id");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch current employee to get their team_id
        const empRes = await fetch(`${API_URL}/api/employees`);
        if (empRes.ok) {
          const employees = await empRes.json();
          const me = employees.find((e: any) => e.id === employeeId);
          
          if (me && me.team_id) {
            // 2. Fetch team details
            const teamRes = await fetch(`${API_URL}/api/teams/${me.team_id}`);
            if (teamRes.ok) {
              const teamData = await teamRes.json();
              // map team lead name
              const lead = employees.find((e: any) => e.id === teamData.lead_id);
              teamData.lead_name = lead ? lead.name : "Unassigned";
              setTeam(teamData);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [employeeId]);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>;
  }

  if (!team) {
    return (
      <div className="w-full max-w-6xl pb-10 fade-in">
        <h1 className="text-2xl font-bold text-slate-800">My Team</h1>
        <p className="text-slate-500 text-sm mb-6">See your team members</p>
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm flex flex-col items-center">
          <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-6">
            <Users size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">No Team Assigned</h2>
          <p className="text-slate-500 mb-6 max-w-md">You haven't been assigned to any team yet. Please contact your HR Manager or wait for an assignment.</p>
        </div>
      </div>
    );
  }

  const teamCreatedDate = new Date(team.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="w-full max-w-6xl mx-auto pb-10 fade-in px-4 md:px-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">My Team</h1>
        <p className="text-slate-500 text-sm">See your team members</p>
      </div>

      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 mb-6 shadow-sm flex items-center gap-6">
        <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-600/30">
          <Users size={40} />
        </div>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-slate-800">{team.name}</h2>
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-xs font-bold">active</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 font-medium">
            <div className="flex items-center gap-1.5"><Users size={16} className="text-slate-400"/> {team.members?.length || 0} members</div>
            <div className="flex items-center gap-1.5"><BookOpen size={16} className="text-slate-400"/> {team.department}</div>
            <div className="flex items-center gap-1.5"><Calendar size={16} className="text-slate-400"/> {teamCreatedDate}</div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div>
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-semibold text-slate-700">Active Members</p>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Users size={18} /></div>
            </div>
            <h3 className="text-3xl font-bold text-slate-800">{team.members?.length || 0}</h3>
          </div>
          <p className="text-emerald-500 text-xs font-bold mt-4">Growing</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div>
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-semibold text-slate-700">Projects Assigned</p>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Folder size={18} /></div>
            </div>
            <h3 className="text-3xl font-bold text-slate-800">0</h3>
          </div>
          <p className="text-emerald-500 text-xs font-bold mt-4">Active projects</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div>
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-semibold text-slate-700">Expected Size</p>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><TrendingUp size={18} /></div>
            </div>
            <h3 className="text-3xl font-bold text-slate-800">{team.expected_size}</h3>
          </div>
          <p className="text-emerald-500 text-xs font-bold mt-4">Team capacity</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div>
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-semibold text-slate-700">Team Lead</p>
              <div className="p-2 bg-orange-50 text-orange-600 rounded-xl"><User size={18} /></div>
            </div>
            <h3 className="text-lg font-bold text-slate-800 truncate" title={team.lead_name}>{team.lead_name}</h3>
          </div>
          <p className="text-emerald-500 text-xs font-bold mt-4">Leader</p>
        </div>

      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <button 
          onClick={() => setActiveTab("members")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition ${activeTab === 'members' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
        >
          <Users size={16} /> Members
        </button>
        <button 
          onClick={() => setActiveTab("projects")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition ${activeTab === 'projects' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
        >
          <Folder size={16} /> Projects
        </button>
        <button 
          onClick={() => setActiveTab("description")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition ${activeTab === 'description' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
        >
          <BookOpen size={16} /> Description
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-slate-50/50 rounded-3xl border border-slate-100 p-6 min-h-[400px]">
        
        {activeTab === "members" && (
          <div className="animate-in fade-in">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><Users size={16} /></div>
                <h3 className="text-lg font-bold text-slate-800">Team Members</h3>
              </div>
              <p className="text-sm text-slate-500 ml-9">Current team composition</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {team.members?.map((member: any) => (
                <div key={member.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-lg border border-slate-200">
                      {member.name.substring(0, 2).toUpperCase()}
                    </div>
                    {/* Dummy online status */}
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm" title="Online"></span>
                  </div>
                  <h4 className="font-bold text-slate-800 truncate" title={member.name}>{member.name}</h4>
                  <p className="text-xs font-semibold text-blue-600 mt-1">{member.role || "Team Member"}</p>
                </div>
              ))}
              {(!team.members || team.members.length === 0) && (
                <p className="text-slate-500 text-sm">No members found in this team.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "projects" && (
          <div className="animate-in fade-in h-full flex flex-col items-center justify-center text-center py-20">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
              <Folder size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Projects under {team.name}</h3>
            <p className="text-slate-500 max-w-md text-sm">This team currently has 1 active project running. Detailed project tracking will be available soon.</p>
          </div>
        )}

        {activeTab === "description" && (
          <div className="animate-in fade-in py-6">
             <h3 className="text-lg font-bold text-slate-800 mb-4">About {team.name}</h3>
             <p className="text-slate-600 leading-relaxed text-sm max-w-3xl">
                This team operates under the <span className="font-bold text-slate-800">{team.department}</span> department. 
                Led by <span className="font-bold text-slate-800">{team.lead_name}</span>, the primary focus of this team is to ensure all departmental deliverables are met efficiently.
                Expected to grow to a capacity of {team.expected_size} members.
             </p>
          </div>
        )}

      </div>

    </div>
  );
}
