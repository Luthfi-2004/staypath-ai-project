import { useState, useEffect } from "react";
import { ChevronRight, CheckCircle, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export type RiskLevel = "High" | "Medium" | "Low";

export interface Employee {
  id:         number;
  name:       string;
  department: string;
  role:       string;
  status:     string;
  avatar?:    string;
  moodScore?: number;
  riskLevel?: RiskLevel;
}

const riskConfig: Record<RiskLevel, { label: string; className: string; dot: string }> = {
  High:   { label: "High",   className: "bg-red-50 text-red-600 border border-red-100",       dot: "bg-red-500"     },
  Medium: { label: "Medium", className: "bg-amber-50 text-amber-600 border border-amber-100", dot: "bg-amber-400"   },
  Low:    { label: "Low",    className: "bg-emerald-50 text-emerald-600 border border-emerald-100", dot: "bg-emerald-500" },
};

function MoodBar({ score }: { score: number }) {
  const normalized = (score / 5) * 10;
  const pct   = (normalized / 10) * 100;
  const color = normalized < 4 ? "bg-red-400" : normalized < 6 ? "bg-amber-400" : "bg-emerald-400";
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-24 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm text-gray-600 tabular-nums">{normalized.toFixed(1)}</span>
    </div>
  );
}

export function EmployeeTable() {
  const [employees, setEmployees]   = useState<Employee[]>([]);
  const [intervened, setIntervened] = useState<Set<number>>(new Set());
  const [isLoading, setLoading]     = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res  = await fetch(`${API_URL}/api/employees`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // Cari yang statusnya udah Dijadwalkan dari awal
        const intervenedIds = new Set<number>();

        const formatted: Employee[] = data
          .filter((emp: any) => {
            if (emp.status === 'Dijadwalkan') intervenedIds.add(emp.id);
            if (emp.attrition_risk === 'High' || emp.attrition_risk === 'Medium') return true;
            if (!emp.attrition_risk && emp.burnout_score >= 6) return true;
            return false;
          })
          .map((emp: any) => ({
            id:         emp.id,
            name:       emp.name,
            department: emp.department,
            role:       emp.role,
            status:     emp.status,
            avatar:     emp.name.substring(0, 2).toUpperCase(),
            moodScore:  emp.job_satisfaction_1_5 ?? 3.0,
            riskLevel: (emp.attrition_risk as RiskLevel)
              ?? (emp.burnout_score >= 7 ? 'High' : emp.burnout_score >= 5 ? 'Medium' : 'Low'),
          }));

        setEmployees(formatted);
        setIntervened(intervenedIds);
      } catch (err) {
        console.error("Gagal fetch employees:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // 🌟 KODINGAN YANG BENER BUAT UPDATE DATABASE 🌟
  const handleIntervene = async (id: number) => {
    // 1. Ubah tampilan seketika (Biar kerasa responsif)
    setIntervened((prev) => new Set([...prev, id]));

    try {
      // 2. Ambil data asli dari backend dulu
      const getRes = await fetch(`${API_URL}/api/employees`);
      const allEmp = await getRes.json();
      const targetEmp = allEmp.find((e: any) => e.id === id);

      if (!targetEmp) return;

      // 3. Tembak API backend lu buat bener-bener UPDATE STATUS ke database!
      await fetch(`${API_URL}/api/employees/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: targetEmp.name,
          department: targetEmp.department,
          role: targetEmp.role,
          join_date: targetEmp.join_date,
          auth_role: targetEmp.auth_role,
          email: targetEmp.email,
          status: "Dijadwalkan", // 🔴 INI KUNCI SAKTINYA
        }),
      });
      
    } catch (err) {
      console.error("Gagal save intervene ke DB:", err);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 font-semibold">Karyawan Berisiko Tinggi</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            {isLoading ? "Memuat data…" : "Karyawan yang membutuhkan perhatian segera"}
          </p>
        </div>
        {!isLoading && (
          <span className="text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full font-medium border border-blue-100">
            {employees.length} karyawan
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="text-left px-6 py-3.5 text-xs text-gray-400 uppercase tracking-wider font-medium">Karyawan</th>
              <th className="text-left px-6 py-3.5 text-xs text-gray-400 uppercase tracking-wider font-medium">Role</th>
              <th className="text-left px-6 py-3.5 text-xs text-gray-400 uppercase tracking-wider font-medium">Kepuasan Kerja</th>
              <th className="text-left px-6 py-3.5 text-xs text-gray-400 uppercase tracking-wider font-medium">Risk Level</th>
              <th className="text-right px-6 py-3.5 text-xs text-gray-400 uppercase tracking-wider font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-12">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Memuat data…</p>
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400 text-sm">
                  Tidak ada karyawan berisiko tinggi saat ini.
                </td>
              </tr>
            ) : (
              employees.map((employee) => {
                const risk = riskConfig[employee.riskLevel ?? "Low"];
                const done = intervened.has(employee.id);
                return (
                  <tr key={employee.id} className="hover:bg-gray-50/60 transition-colors duration-100">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-700 text-xs font-semibold">{employee.avatar}</span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-800 font-medium">{employee.name}</p>
                          <p className="text-xs text-gray-400">{employee.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{employee.role}</td>
                    <td className="px-6 py-4">
                      <MoodBar score={employee.moodScore ?? 3} />
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${risk.className}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${risk.dot}`} />
                        {risk.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {done ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg font-medium border border-emerald-100">
                          <CheckCircle size={12} />
                          Dijadwalkan
                        </span>
                      ) : (
                        <button
                          onClick={() => handleIntervene(employee.id)}
                          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors duration-150"
                        >
                          Intervene
                          <ChevronRight size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}