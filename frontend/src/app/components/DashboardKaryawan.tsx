import { useState, useEffect } from "react";
import { Loader2, Calendar, Clock, Activity, CheckCircle, Folder, FileText, Briefcase } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export function DashboardEmployee({ onNavigate }: { onNavigate?: (path: string) => void }) {
  const employeeName = localStorage.getItem("employee_name") || "Employee";
  const employeeId = localStorage.getItem("employee_id");

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    attendanceRate: 0, daysPresent: 0, hoursWorked: 0, leaveBalance: 12,
    tasksDone: 0, activeProjects: 0, upcomingTasks: [], recentActivities: []
  });

  useEffect(() => {
    if (!employeeId) return;
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/api/dashboard/karyawan/${employeeId}`);
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [employeeId]);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-slate-900 animate-spin" /></div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto pb-10 fade-in px-4 md:px-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
        <p className="text-slate-500 text-sm">Monitor your team performance and key metrics</p>
      </div>

      <h2 className="text-xl font-bold text-slate-800 mb-4">Welcome back, {employeeName}! 👋</h2>
      <p className="text-slate-500 text-sm mb-6">Here's your performance overview</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Attendance Rate */}
        <div className="col-span-1 md:col-span-1 bg-slate-900 rounded-2xl p-6 text-white flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-4 bg-slate-800 w-max px-3 py-1 rounded-full text-xs font-semibold">
              <TrendingUpIcon /> This Month
            </div>
            <p className="text-slate-400 text-sm mb-1">Attendance Rate</p>
            <h3 className="text-5xl font-bold mb-2">{stats.attendanceRate}%</h3>
            <p className="text-slate-400 text-xs">{stats.daysPresent} of 20 days</p>
          </div>
          <div className="flex justify-between items-center mt-6 text-xs text-slate-400">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> On Track</span>
            <span>⭐ Great Performance</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <p className="text-sm font-semibold text-slate-700">Hours Worked</p>
              <div className="p-2 bg-slate-100 rounded-lg text-slate-900"><Clock size={18} /></div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-800">{stats.hoursWorked}h</h3>
              <p className="text-emerald-500 text-xs font-medium mt-1">This month</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <p className="text-sm font-semibold text-slate-700">Leave Balance</p>
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><Calendar size={18} /></div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-800">{stats.leaveBalance}</h3>
              <p className="text-slate-500 text-xs mt-1">Days remaining</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <p className="text-sm font-semibold text-slate-700">Tasks Done</p>
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><CheckCircle size={18} /></div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-800">{stats.tasksDone}</h3>
              <p className="text-slate-500 text-xs mt-1">Recently completed</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <p className="text-sm font-semibold text-slate-700">Active Projects</p>
              <div className="p-2 bg-orange-50 rounded-lg text-orange-600"><Folder size={18} /></div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-800">{stats.activeProjects}</h3>
              <p className="text-slate-500 text-xs mt-1">Assigned to you</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-sm font-bold text-slate-800 mb-4">Quick Actions</p>
          <div className="space-y-3">
            <button 
              onClick={() => onNavigate && onNavigate("myattendances")}
              className="w-full bg-slate-900 text-white font-medium text-sm py-2.5 rounded-xl hover:bg-slate-800 transition shadow-sm"
            >
              + Request Leave
            </button>
            <button className="w-full bg-slate-50 text-slate-700 font-medium text-sm py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 transition">
              View Schedule
            </button>
            <button className="w-full bg-slate-50 text-slate-700 font-medium text-sm py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 transition">
              My Profile
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800">Upcoming Tasks</h3>
            <button className="text-slate-900 text-xs font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center"><FileText size={18} /></div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">Complete Q3 Report</p>
                <p className="text-xs text-slate-500">Due today, 5:00 PM</p>
              </div>
              <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-md">High Priority</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center"><Briefcase size={18} /></div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">Client Meeting Prep</p>
                <p className="text-xs text-slate-500">Tomorrow, 10:00 AM</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><Activity size={18} /></div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">Update Dashboard UI</p>
                <p className="text-xs text-slate-500">In 2 days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800">Recent Activities</h3>
            <button className="text-slate-900 text-xs font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">

            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-50 text-emerald-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <CheckCircle size={16} />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 bg-slate-50/50 shadow-sm">
                <p className="text-sm font-bold text-slate-800">Completed task: User Authentication Flow</p>
                <p className="text-xs text-slate-500 mt-1">2 hours ago</p>
              </div>
            </div>

            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-50 text-slate-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <FileText size={16} />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 bg-slate-50/50 shadow-sm">
                <p className="text-sm font-bold text-slate-800">Commented on PR: Add dark mode</p>
                <p className="text-xs text-slate-500 mt-1">4 hours ago</p>
              </div>
            </div>

            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-50 text-purple-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <Clock size={16} />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-100 bg-slate-50/50 shadow-sm">
                <p className="text-sm font-bold text-slate-800">Checked in at 08:30 AM</p>
                <p className="text-xs text-slate-500 mt-1">6 hours ago</p>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}

function TrendingUpIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>;
}
