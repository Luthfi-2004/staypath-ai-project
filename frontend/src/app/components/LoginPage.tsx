import { useState } from "react";
import { useNavigate } from "react-router";
import { Activity, Loader2, AlertCircle, Mail, Lock } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export function LoginPage() {
  const navigate            = useNavigate();
  const [email, setEmail]   = useState("");
  const [password, setPass] = useState("");
  const [error, setError]   = useState("");
  const [loading, setLoad]  = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email dan password wajib diisi.");
      return;
    }

    setLoad(true);
    try {
      const res  = await fetch(`${API_URL}/api/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Email atau password salah.");
        return;
      }

      // Simpan session
      localStorage.setItem("employee_id",    String(data.id));
      localStorage.setItem("employee_name",  data.name);
      localStorage.setItem("employee_email", data.email);
      localStorage.setItem("role",           data.auth_role);

      // Arahkan berdasarkan role dari DB
      if (data.auth_role === "hrd") {
        navigate("/dashboard");
      } else {
        navigate("/dashboard/dailypulse");
      }

    } catch {
      setError("Gagal menghubungi server. Pastikan backend sudah berjalan.");
    } finally {
      setLoad(false);
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
          <p className="text-gray-400 text-sm mb-6">
            Masukkan email dan password yang diberikan oleh HR.
          </p>

          <form onSubmit={handleLogin} noValidate className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Email <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="nama@company.com"
                  autoComplete="email"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-gray-700 bg-white transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPass(e.target.value); setError(""); }}
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-gray-700 bg-white transition"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 px-3 py-2.5 rounded-lg border border-red-100">
                <AlertCircle size={14} className="flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 mt-1"
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Memverifikasi…</>
                : "Masuk"
              }
            </button>
          </form>

          {/* Info */}
          <div className="mt-5 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-xs text-gray-400 font-medium mb-1">Belum punya akun?</p>
            <p className="text-xs text-gray-400">
              Hubungi tim HR untuk mendapatkan email dan password login.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}