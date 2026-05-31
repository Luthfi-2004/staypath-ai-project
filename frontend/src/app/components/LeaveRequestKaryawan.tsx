import { useState, useEffect } from "react";
import { Loader2, Plus, Calendar } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export function LeaveRequestKaryawan() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // form state
  const [showForm, setShowForm] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [leaveType, setLeaveType] = useState("Tahunan");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const employeeId = localStorage.getItem("employee_id") || "";

  useEffect(() => {
    if (employeeId) {
      fetchLeaves();
    }
  }, [employeeId]);

  const fetchLeaves = async () => {
    try {
      const res = await fetch(`${API_URL}/api/leaves/${employeeId}`);
      if (res.ok) {
        const data = await res.json();
        setLeaves(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/leaves`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: employeeId,
          start_date: startDate,
          end_date: endDate,
          leave_type: leaveType,
          reason
        })
      });
      if (res.ok) {
        setShowForm(false);
        setStartDate("");
        setEndDate("");
        setReason("");
        fetchLeaves(); // reload list
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pengajuan Cuti</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola dan pantau status cuti Anda.</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
            <Plus className="w-4 h-4" /> Ajukan Cuti
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Form Pengajuan Cuti</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tgl Mulai</label>
                <input required type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tgl Selesai</label>
                <input required type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Cuti</label>
              <select value={leaveType} onChange={e => setLeaveType(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100">
                <option value="Tahunan">Cuti Tahunan</option>
                <option value="Sakit">Sakit</option>
                <option value="Penting">Keperluan Penting</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alasan</label>
              <textarea required rows={2} value={reason} onChange={e => setReason(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100"></textarea>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Batal</button>
              <button type="submit" disabled={submitting} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Kirim Pengajuan"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-gray-800">Riwayat Cuti</h3>
        </div>
        {loading ? (
          <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
        ) : leaves.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">Belum ada riwayat cuti.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {leaves.map((l: any) => (
              <div key={l.id} className="p-4 px-6 flex justify-between items-center hover:bg-gray-50 transition">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{l.leave_type}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{new Date(l.start_date).toLocaleDateString("id-ID")} - {new Date(l.end_date).toLocaleDateString("id-ID")}</p>
                  <p className="text-xs text-gray-400 mt-1 italic">"{l.reason}"</p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  l.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 
                  l.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {l.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
