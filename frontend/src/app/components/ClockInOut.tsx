import { useState, useEffect } from "react";
import { Loader2, MapPin, User, Clock, CheckCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export function ClockInOut() {
  const [time, setTime] = useState(new Date());
  const [attendanceState, setAttendanceState] = useState<"loading" | "needs_clock_in" | "needs_clock_out" | "done">("loading");
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [clockOutTime, setClockOutTime] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Pulse Form (shown when clocking out)
  const [showPulseForm, setShowPulseForm] = useState(false);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState("");

  const employeeId = localStorage.getItem("employee_id") || "";

  // Realtime clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch today's status
  useEffect(() => {
    if (!employeeId) return;
    const fetchAttendance = async () => {
      try {
        const res = await fetch(`${API_URL}/api/attendance/history/${employeeId}`);
        if (res.ok) {
          const data = await res.json();
          const todayStr = new Date().toISOString().split('T')[0];
          const todayAtt = data.find((a: any) => a.date === todayStr);

          if (!todayAtt) {
            setAttendanceState("needs_clock_in");
          } else if (!todayAtt.clock_out_time) {
            setAttendanceState("needs_clock_out");
            setClockInTime(new Date(todayAtt.clock_in_time).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }));
          } else {
            setAttendanceState("done");
            setClockInTime(new Date(todayAtt.clock_in_time).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }));
            setClockOutTime(new Date(todayAtt.clock_out_time).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }));
          }
        }
      } catch (err) {
        setAttendanceState("needs_clock_in");
      }
    };
    fetchAttendance();
  }, [employeeId]);

  const handleClockIn = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/attendance/clock-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee_id: employeeId })
      });
      if (res.ok) {
        const data = await res.json();
        setClockInTime(new Date(data.clock_in_time).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }));
        setAttendanceState("needs_clock_out");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClockOutSubmit = async () => {
    if (!selectedMood) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/attendance/clock-out`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: employeeId,
          mood_score: selectedMood,
          notes: note.trim()
        })
      });
      if (res.ok) {
        const data = await res.json();
        setClockOutTime(new Date(data.clock_out_time).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }));
        setAttendanceState("done");
        setShowPulseForm(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (attendanceState === "loading") {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-slate-900 animate-spin" /></div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto pb-10 fade-in px-4 md:px-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Clock In/Out</h1>
        <p className="text-slate-500 text-sm">Record your working time</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Col: Clock */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center flex flex-col items-center">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-slate-100 text-slate-900 rounded-lg"><Clock size={20} /></div>
            <div className="text-left">
              <p className="font-bold text-slate-800 leading-tight">Current Time</p>
              <p className="text-xs text-slate-500">Jakarta, Indonesia</p>
            </div>
          </div>
          
          <div className="bg-slate-900 w-full rounded-3xl py-12 px-6 text-white shadow-md relative overflow-hidden mb-6">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>
            
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-2 drop-shadow-sm font-mono tabular-nums">
              {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </h2>
            <p className="text-blue-100 font-medium text-sm">
              {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          
          <p className="text-sm text-slate-500 flex items-center gap-2">
            <MapPin size={14} /> GMT+7 (Western Indonesia Time)
          </p>
        </div>

        {/* Right Col: Status & Form */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><User size={20} /></div>
              <div>
                <p className="font-bold text-slate-800 leading-tight">Today's Status</p>
                <p className="text-xs text-slate-500">Your attendance for today</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-600 font-medium">Status</span>
                {attendanceState === "needs_clock_in" && <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">Not Clocked In</span>}
                {attendanceState === "needs_clock_out" && <span className="bg-slate-200 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">Clocked In</span>}
                {attendanceState === "done" && <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">Completed</span>}
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-600 font-medium">Clock In</span>
                <span className="text-slate-800 font-bold">{clockInTime || "--:--"}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-600 font-medium">Clock Out</span>
                <span className="text-slate-800 font-bold">{clockOutTime || "--:--"}</span>
              </div>
              {clockInTime && clockOutTime && (
                <div className="flex justify-between items-center p-3 bg-slate-100/50 rounded-xl border border-slate-200">
                  <span className="text-blue-700 font-medium">Working Hours</span>
                  <span className="text-blue-800 font-bold">
                    {(() => {
                      const parseTime = (timeStr: string) => {
                        const [hrs, mins] = timeStr.split('.').map(Number); // id-ID uses dot
                        return (hrs * 60) + (mins || 0);
                      };
                      try {
                        const inMins = parseTime(clockInTime);
                        const outMins = parseTime(clockOutTime);
                        const diffMins = outMins - inMins;
                        if (diffMins <= 0) return "--:--";
                        const h = Math.floor(diffMins / 60);
                        const m = diffMins % 60;
                        return `${h}h ${m}m`;
                      } catch {
                        return "--:--";
                      }
                    })()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {!showPulseForm ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center">
              {attendanceState === "needs_clock_in" && (
                <>
                  <div className="w-12 h-12 bg-slate-100 text-slate-900 rounded-full flex items-center justify-center mx-auto mb-4"><Clock size={24} /></div>
                  <h3 className="font-bold text-slate-800 text-lg mb-1">Ready to Clock In?</h3>
                  <p className="text-slate-500 text-sm mb-6">Mark your attendance to start your day.</p>
                  <button onClick={handleClockIn} disabled={submitting} className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2">
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Clock In"}
                  </button>
                </>
              )}
              
              {attendanceState === "needs_clock_out" && (
                <>
                  <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4"><Clock size={24} /></div>
                  <h3 className="font-bold text-slate-800 text-lg mb-1">Done for the day?</h3>
                  <p className="text-slate-500 text-sm mb-6">Clock out to end your session.</p>
                  <button onClick={() => setShowPulseForm(true)} className="w-full py-3.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2">
                    Clock Out
                  </button>
                </>
              )}

              {attendanceState === "done" && (
                <>
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={24} /></div>
                  <h3 className="font-bold text-slate-800 text-lg mb-1">Attendance Completed</h3>
                  <p className="text-slate-500 text-sm">Have a great rest! See you tomorrow.</p>
                </>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm animate-in zoom-in-95">
              <h3 className="font-bold text-slate-800 mb-4">Daily Pulse (Before Clock Out)</h3>
              <p className="text-sm text-slate-600 mb-3">How was your day?</p>
              <div className="flex gap-2 justify-between mb-4">
                {[
                  {emoji: "😞", val: 1}, {emoji: "😕", val: 2}, {emoji: "😐", val: 3}, {emoji: "🙂", val: 4}, {emoji: "😄", val: 5}
                ].map(m => (
                  <button 
                    key={m.val} 
                    onClick={() => setSelectedMood(m.val)}
                    className={`flex-1 py-3 text-2xl rounded-xl border-2 transition ${selectedMood === m.val ? 'border-blue-500 bg-slate-100 scale-105' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'}`}
                  >
                    {m.emoji}
                  </button>
                ))}
              </div>
              <textarea 
                placeholder="Any notes for today? (Optional)" 
                value={note} onChange={e => setNote(e.target.value)}
                className="w-full p-3 text-sm border border-slate-200 rounded-xl mb-4 bg-slate-50 focus:outline-none focus:border-blue-400"
                rows={2}
              ></textarea>
              <div className="flex gap-2">
                <button onClick={() => setShowPulseForm(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200">Cancel</button>
                <button onClick={handleClockOutSubmit} disabled={!selectedMood || submitting} className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50">
                  {submitting ? '...' : 'Submit & Clock Out'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
