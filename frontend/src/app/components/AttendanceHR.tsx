import { useState, useEffect } from "react";
import { Loader2, Users, Calendar, Clock, MapPin, Search, Filter, CheckCircle2, XCircle, MoreVertical, Building } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export function AttendanceHR() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState<any>(null);

  const fetchOverview = async () => {
    try {
      const res = await fetch(`${API_URL}/api/attendance/hr-overview`);
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

  const handleUpdateLeaveStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`${API_URL}/api/leaves/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchOverview();
      } else {
        console.error("Gagal update leave status");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-slate-900 animate-spin" /></div>;
  }

  return (
    <div className="w-full pb-10 fade-in space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Attendance & Leaves</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor daily presence, remote work, and manage time-off requests</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition flex items-center gap-2">
            <Calendar size={16} /> Select Date: Today
          </button>
          <button className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition flex items-center gap-2">
            Export Report
          </button>
        </div>
      </div>

      {/* Top Main Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Present Today (Blue Card) */}
        <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden flex flex-col justify-between h-44">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-medium text-white mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Live Status
            </div>
            <p className="text-blue-100 text-sm mb-1">Present Today</p>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-5xl font-bold tracking-tight">{data?.presentToday || 0}</h3>
              <p className="text-blue-200 text-sm mt-1">out of {data?.totalEmployees || 0} employees</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <Users size={24} className="text-white" />
            </div>
          </div>
        </div>

        {/* Small Stats Grid 2x2 */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Absent Today", value: data?.absentToday || 0, icon: Users, color: "text-rose-600", bg: "bg-rose-50" },
            { label: "On Leave", value: data?.onLeave || 0, icon: Calendar, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Late Arrivals", value: data?.lateArrivals || 0, icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
            { label: "Remote Workers", value: data?.remoteWorkers || 0, icon: MapPin, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "Pending Requests", value: data?.pendingRequests || 0, icon: Clock, color: "text-slate-900", bg: "bg-slate-100" },
            { label: "Attendance Rate", value: `${data?.attendanceRate || 0}%`, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          ].map((stat, i) => (
            <div key={i} className={`bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between ${i >= 4 ? 'hidden md:flex' : ''}`}>
              <div className="flex justify-between items-start">
                <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon size={16} />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Latest Leave Requests */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-lg">Leave Requests</h3>
            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg">{data?.pendingRequests || 0} Pending</span>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {data?.latestLeaveRequests?.map((req: any) => {
              const start = new Date(req.start_date);
              const end = new Date(req.end_date);
              const diffTime = Math.abs(end.getTime() - start.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

              return (
              <div key={req.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 text-blue-700 font-bold flex items-center justify-center flex-shrink-0">
                    {(req.employees?.name || "UN").substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 text-sm truncate">{req.employees?.name}</h4>
                    <p className="text-xs text-slate-500 truncate mb-2">{req.leave_type} • {req.start_date} to {req.end_date}</p>
                    <div className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-200/50 text-slate-700 border border-slate-200">
                      Total Leave: {diffDays} Days
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => setSelectedLeave(req)} className="px-3 py-2 bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-200 transition">
                    Details
                  </button>
                  {req.status === 'Pending' ? (
                    <>
                      <button onClick={() => handleUpdateLeaveStatus(req.id, "Approved")} className="flex-1 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold hover:bg-emerald-100 transition flex items-center justify-center gap-1">
                        <CheckCircle2 size={14} /> Approve
                      </button>
                      <button onClick={() => handleUpdateLeaveStatus(req.id, "Rejected")} className="flex-1 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold hover:bg-rose-100 transition flex items-center justify-center gap-1">
                        <XCircle size={14} /> Reject
                      </button>
                    </>
                  ) : (
                    <div className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 ${
                      req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {req.status === 'Approved' ? <CheckCircle2 size={14} /> : <XCircle size={14} />} {req.status}
                    </div>
                  )}
                </div>
              </div>
            )})}
            {(!data?.latestLeaveRequests || data.latestLeaveRequests.length === 0) && (
              <p className="text-center text-slate-500 text-sm py-10">No leave requests found.</p>
            )}
          </div>
        </div>

        {/* Right: Today's Attendance List */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-lg">Today's Attendance</h3>
            <div className="flex gap-2">
              <button className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-lg"><Search size={16} /></button>
              <button className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-lg"><Filter size={16} /></button>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
                  <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Time In</th>
                  <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Time Out</th>
                  <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Work Type</th>
                  <th className="px-5 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.todaysAttendance?.map((att: any, i: number) => {
                  const timeIn = new Date(att.clock_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const timeOut = att.clock_out_time ? new Date(att.clock_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—";
                  
                  // Mocking status and work type based on index for UI presentation
                  const isLate = i % 3 === 0;
                  const isRemote = i % 2 === 0;

                  return (
                    <tr key={i} className="hover:bg-slate-50/50 transition">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 text-blue-700 font-bold flex items-center justify-center text-xs">
                            {(att.employees?.name || "UN").substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">{att.employees?.name}</p>
                            <p className="text-xs text-slate-500">{att.employees?.department}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm font-medium text-slate-700">{timeIn}</td>
                      <td className="px-5 py-3 text-sm font-medium text-slate-700">{timeOut}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${isLate ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {isLate ? 'Late' : 'On Time'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                          {isRemote ? <MapPin size={14} className="text-indigo-500" /> : <Building size={14} className="text-slate-900" />}
                          {isRemote ? 'Remote' : 'Office'}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button className="text-slate-400 hover:text-slate-600"><MoreVertical size={16} /></button>
                      </td>
                    </tr>
                  )
                })}
                {(!data?.todaysAttendance || data.todaysAttendance.length === 0) && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-500 text-sm">
                      No attendance records for today yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Modal Details Leave Request */}
      {selectedLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden scale-in">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">Leave Request Details</h2>
              <button onClick={() => setSelectedLeave(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition">
                <XCircle size={20} />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Employee</p>
                <p className="font-semibold text-slate-800">{selectedLeave.employees?.name}</p>
                <p className="text-sm text-slate-500">{selectedLeave.employees?.department} • {selectedLeave.employees?.role}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Type</p>
                  <p className="font-semibold text-slate-800">{selectedLeave.leave_type}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Date Range</p>
                  <p className="font-semibold text-slate-800 text-sm">{selectedLeave.start_date} to {selectedLeave.end_date}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Days</p>
                  <p className="font-semibold text-slate-800 text-sm">
                    {Math.ceil(Math.abs(new Date(selectedLeave.end_date).getTime() - new Date(selectedLeave.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1} Days
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Reason</p>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-700 whitespace-pre-wrap">
                  {selectedLeave.reason || "No reason provided."}
                </div>
              </div>

              {/* Actions */}
              {selectedLeave.status === 'Pending' ? (
                <div className="pt-4 flex gap-3 border-t border-slate-100 mt-6">
                  <button 
                    onClick={() => {
                      handleUpdateLeaveStatus(selectedLeave.id, "Rejected");
                      setSelectedLeave(null);
                    }} 
                    className="flex-1 py-3 bg-white text-rose-600 border border-rose-200 rounded-xl text-sm font-bold hover:bg-rose-50 transition flex items-center justify-center gap-2"
                  >
                    <XCircle size={16} /> Reject
                  </button>
                  <button 
                    onClick={() => {
                      handleUpdateLeaveStatus(selectedLeave.id, "Approved");
                      setSelectedLeave(null);
                    }} 
                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <CheckCircle2 size={16} /> Approve
                  </button>
                </div>
              ) : (
                <div className="pt-4 flex gap-3 border-t border-slate-100 mt-6">
                  <div className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 ${
                      selectedLeave.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {selectedLeave.status === 'Approved' ? <CheckCircle2 size={16} /> : <XCircle size={16} />} 
                      Status: {selectedLeave.status}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
