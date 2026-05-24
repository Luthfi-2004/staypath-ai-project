import { useState } from "react";
import { useNavigate } from "react-router";
import { Activity, Loader2, AlertCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

type Role = "hrd" | "karyawan";

export function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole]         = useState<Role>("karyawan");
  const [employeeId, setEmpId]  = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // HRD: pakai password master (simpel untuk capstone)
    if (role === "hrd") {
      if (password !== "hrd123") {
        setError("Password HRD salah.");
        return;
      }
      localStorage.setItem("role",          "hrd");
      localStorage.setItem("employee_name", "HR Manager");
      localStorage.setItem("employee_id",   "0");
      navigate("/dashboard");
      return;
    }

    // Karyawan: cek employee ID di database
    if (!employeeId.trim()) {
      setError("Employee ID wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      // Cari karyawan berdasarkan ID
      const numId = parseInt(employeeId.replace(/[^0-9]/g, ""));
      const res   = await fetch(`${API_URL}/api/employees`);
      if (!res.ok) throw new Error("Gagal menghubungi server");
      const employees = await res.json();

      const found = employees.find((e: any) => e.id === numId);
      if (!found) {
        setError("Employee ID tidak ditemukan. Hubungi HR.");
        return;
      }

      localStorage.setItem("role",          "karyawan");
      localStorage.setItem("employee_id",   String(found.id));
      localStorage.setItem("employee_name", found.name);
      navigate("/dashboard/dailypulse");
    } catch (err) {
      setError("Gagal menghubungi server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
            <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-gray-900 font-bold text-lg leading-tight tracking-tight">StayPath AI</p>
            <p className="text-gray-400 text-xs">HR Analytics Platform</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h1 className="text-gray-900 font-semibold text-xl mb-1">Masuk ke Dashboard</h1>
          <p className="text-gray-400 text-sm mb-6">Pilih role dan masukkan kredensial kamu.</p>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {(["karyawan", "hrd"] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => { setRole(r); setError(""); }}
                className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all duration-150 ${
                  role === r
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {r === "karyawan" ? "👤 Karyawan" : "🏢 HRD"}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} noValidate className="space-y-4">
            {role === "karyawan" ? (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Employee ID <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmpId(e.target.value)}
                  placeholder="Contoh: 1 atau EMP-001"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-gray-700 bg-white transition"
                />
                <p className="text-xs text-gray-400 mt-1">Minta Employee ID kamu ke tim HR.</p>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Password HRD <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password HRD"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-gray-700 bg-white transition"
                />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 px-3 py-2.5 rounded-lg border border-red-100">
                <AlertCircle size={14} className="flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Memverifikasi…</> : "Masuk"}
            </button>
          </form>

          {/* Info box */}
          <div className="mt-5 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-xs text-gray-400 font-medium mb-1">Info Login</p>
            <p className="text-xs text-gray-400">
              {role === "karyawan"
                ? "Karyawan hanya dapat mengakses halaman Daily Pulse."
                : "HRD dapat mengakses seluruh dashboard, data karyawan, dan prediksi AI."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}