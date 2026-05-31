import { useState, useEffect } from "react";
import { Loader2, Calendar, FileText, Download } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export function MyAttendances() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [leaveType, setLeaveType] = useState("Tahunan");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const employeeId = localStorage.getItem("employee_id") || "";

  useEffect(() => {
    if (!employeeId) return;
    
    const fetchData = async () => {
      try {
        const [leavesRes, attRes] = await Promise.all([
          fetch(`${API_URL}/api/leaves/${employeeId}`),
          fetch(`${API_URL}/api/attendance/history/${employeeId}`)
        ]);
        
        if (leavesRes.ok) setLeaves(await leavesRes.json());
        if (attRes.ok) setAttendances(await attRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [employeeId]);

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/leaves`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee_id: employeeId, start_date: startDate, end_date: endDate, leave_type: leaveType, reason })
      });
      if (res.ok) {
        setShowForm(false); setStartDate(""); setEndDate(""); setReason("");
        // Refresh leaves
        const refresh = await fetch(`${API_URL}/api/leaves/${employeeId}`);
        if (refresh.ok) setLeaves(await refresh.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto pb-10 fade-in px-4 md:px-0">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Attendances</h1>
          <p className="text-slate-500 text-sm">Track your attendance records and manage leave</p>
        </div>
      </div>

      {/* Banner */}
      <div className="w-full h-32 md:h-40 bg-slate-900 rounded-3xl mb-6 relative overflow-hidden flex flex-col md:flex-row justify-between items-center p-8">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white backdrop-blur-md border border-white/20">
            <Calendar size={24} />
          </div>
          <div className="text-white">
            <h2 className="text-2xl font-bold">Attendance Overview</h2>
            <p className="text-slate-300 text-sm hidden md:block">Track your daily presence and manage leave requests efficiently</p>
          </div>
        </div>
        <div className="relative z-10 flex gap-3 mt-4 md:mt-0">
          <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium backdrop-blur-md border border-white/20 transition flex items-center gap-2">
            <Download size={16} /> Export
          </button>
          <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-lg shadow-blue-900/50">
            + Request Leave
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-6 animate-in slide-in-from-top-4 fade-in">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Request New Leave</h2>
          <form onSubmit={handleLeaveSubmit} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Start Date</label>
                <input required type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">End Date</label>
                <input required type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Leave Type</label>
              <select value={leaveType} onChange={e => setLeaveType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                <option value="Tahunan">Annual Leave</option>
                <option value="Sakit">Sick Leave</option>
                <option value="Penting">Personal Leave</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Reason</label>
              <textarea required rows={2} value={reason} onChange={e => setReason(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"></textarea>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-sm text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition">Cancel</button>
              <button type="submit" disabled={submitting} className="px-5 py-2.5 text-sm bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Request"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Attendance */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Calendar size={20} /></div>
            <div>
              <h3 className="font-bold text-slate-800 leading-tight">Recent Attendance</h3>
              <p className="text-xs text-slate-500">Last 7 days</p>
            </div>
          </div>
          <div className="p-6 flex-1 bg-slate-50/50">
            {loading ? <div className="flex justify-center p-4"><Loader2 className="animate-spin text-blue-500"/></div> : 
              attendances.length === 0 ? <p className="text-slate-500 text-sm text-center">No attendance records yet.</p> :
              <div className="space-y-3">
                {attendances.slice(0, 5).map(att => (
                  <div key={att.id} className="bg-white border border-slate-100 p-4 rounded-2xl flex justify-between items-center shadow-sm">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{new Date(att.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                      <div className="flex gap-3 text-xs text-slate-500 mt-1">
                        <span>In: {att.clock_in_time ? new Date(att.clock_in_time).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'}) : '-'}</span>
                        <span>Out: {att.clock_out_time ? new Date(att.clock_out_time).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'}) : '-'}</span>
                      </div>
                    </div>
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">Present</span>
                  </div>
                ))}
              </div>
            }
          </div>
        </div>

        {/* Leave Requests */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><FileText size={20} /></div>
            <div>
              <h3 className="font-bold text-slate-800 leading-tight">My Leave Requests</h3>
              <p className="text-xs text-slate-500">Recent requests</p>
            </div>
          </div>
          <div className="p-6 flex-1 bg-slate-50/50">
            {loading ? <div className="flex justify-center p-4"><Loader2 className="animate-spin text-blue-500"/></div> : 
              leaves.length === 0 ? <p className="text-slate-500 text-sm text-center">No leave requests yet.</p> :
              <div className="space-y-3">
                {leaves.slice(0, 5).map(lv => (
                  <div key={lv.id} className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><Calendar size={16}/></div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{lv.leave_type}</p>
                          <p className="text-xs text-slate-500">{lv.reason}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        lv.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                        lv.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {lv.status}
                      </span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500">
                      <span>{new Date(lv.start_date).toLocaleDateString('en-US', {month:'short', day:'numeric'})} - {new Date(lv.end_date).toLocaleDateString('en-US', {month:'short', day:'numeric'})}</span>
                      <span>Requested: {new Date(lv.created_at).toLocaleDateString('en-US', {month:'short', day:'numeric'})}</span>
                    </div>
                  </div>
                ))}
              </div>
            }
          </div>
        </div>

      </div>
    </div>
  );
}
