import { useState, useEffect, useRef } from "react";
import {
  RefreshCw, ChevronUp, ChevronDown, Brain, ShieldAlert,
  TrendingUp, Clock, CheckCircle2, MessageSquare, BookOpen,
  DollarSign, Users, BarChart2,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RiskFactor {
  label:    string;
  severity: "high" | "medium" | "low";
}

interface Prediction {
  id:              number;
  name:            string;
  role:            string;
  department:      string;
  avatar:          string;
  riskProbability: number;
  riskFactors:     RiskFactor[];
  recommendedAction: { icon: React.ReactNode; text: string };
  lastUpdated:     string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

// Derive risk factors dari data DB
function buildRiskFactors(emp: any): RiskFactor[] {
  const factors: RiskFactor[] = [];
  if (emp.burnout_score >= 7)              factors.push({ label: "Burnout score tinggi",      severity: "high"   });
  if (emp.job_satisfaction_1_5 <= 2)       factors.push({ label: "Kepuasan kerja rendah",     severity: "high"   });
  if (emp.fear_of_ai_replacement === "High") factors.push({ label: "Takut digantikan AI",     severity: "high"   });
  if (emp.burnout_score >= 5 && emp.burnout_score < 7) factors.push({ label: "Burnout sedang", severity: "medium" });
  if (emp.weekly_ai_upskilling_hrs >= 8)   factors.push({ label: "Beban upskilling tinggi",   severity: "medium" });
  if (emp.ai_replaces_my_tasks_pct >= 50)  factors.push({ label: "Banyak tugas diganti AI",   severity: "medium" });
  if (emp.job_satisfaction_1_5 <= 3 && emp.job_satisfaction_1_5 > 2) factors.push({ label: "Kepuasan kerja sedang", severity: "medium" });
  if (factors.length === 0)                factors.push({ label: "Risiko rendah",              severity: "low"    });
  return factors.slice(0, 3);
}

function buildRecommendation(emp: any): { icon: React.ReactNode; text: string } {
  if (emp.burnout_score >= 7)
    return { icon: <MessageSquare size={13} />, text: "Jadwalkan 1:1 segera dengan HR" };
  if (emp.job_satisfaction_1_5 <= 2)
    return { icon: <TrendingUp size={13} />, text: "Tinjau jalur karir dan kompensasi" };
  if (emp.fear_of_ai_replacement === "High")
    return { icon: <BookOpen size={13} />, text: "Tawarkan program upskilling AI" };
  if (emp.risk_score >= 0.7)
    return { icon: <ShieldAlert size={13} />, text: "Lakukan intervensi segera" };
  return { icon: <CheckCircle2 size={13} />, text: "Lanjutkan pemantauan rutin" };
}

function mapEmployeeToPrediction(emp: any): Prediction {
  const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return {
    id:              emp.id,
    name:            emp.name,
    role:            emp.job_title || emp.role || "—",
    department:      emp.department,
    avatar:          getInitials(emp.name),
    riskProbability: emp.risk_score ? Math.round(emp.risk_score * 100) : (
      emp.attrition_risk === "High" ? 75 : emp.attrition_risk === "Medium" ? 50 : 20
    ),
    riskFactors:       buildRiskFactors(emp),
    recommendedAction: buildRecommendation(emp),
    lastUpdated:       emp.last_predicted_at
      ? new Date(emp.last_predicted_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : now,
  };
}

// ─── UI components ────────────────────────────────────────────────────────────

const avatarPalette = [
  "bg-blue-100 text-blue-700", "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-600",  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700","bg-cyan-100 text-cyan-700",
];

function RiskBar({ probability }: { probability: number }) {
  const isHigh = probability >= 70;
  const isMed  = probability >= 40;
  const color  = isHigh ? "bg-red-500" : isMed ? "bg-amber-400" : "bg-emerald-400";
  const text   = isHigh ? "text-red-600" : isMed ? "text-amber-600" : "text-emerald-600";
  return (
    <div className="flex items-center gap-3 min-w-[140px]">
      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${probability}%` }} />
      </div>
      <span className={`text-sm font-semibold tabular-nums ${text}`}>{probability}%</span>
    </div>
  );
}

const severityStyle = {
  high:   "bg-red-50 text-red-600 border border-red-100",
  medium: "bg-amber-50 text-amber-600 border border-amber-100",
  low:    "bg-gray-50 text-gray-500 border border-gray-100",
};

function FactorChip({ factor }: { factor: RiskFactor }) {
  return (
    <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md ${severityStyle[factor.severity]}`}>
      {factor.label}
    </span>
  );
}

const REFRESH_STEPS = [
  { label: "Menghubungkan ke model…",  duration: 600 },
  { label: "Menganalisis data…",       duration: 800 },
  { label: "Menghitung skor risiko…",  duration: 700 },
  { label: "Menghasilkan insight…",    duration: 600 },
  { label: "Memperbarui tabel…",       duration: 400 },
];

// ─── Main component ───────────────────────────────────────────────────────────

type SortCol = "name" | "riskProbability" | "department";
type SortDir = "asc" | "desc";
type FilterTab = "all" | "high" | "medium" | "low";

export function Predictions() {
  const [predictions,   setPredictions]   = useState<Prediction[]>([]);
  const [isLoading,     setIsLoading]     = useState(true);
  const [refreshStep,   setRefreshStep]   = useState(-1);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);
  const [sortCol,       setSortCol]       = useState<SortCol>("riskProbability");
  const [sortDir,       setSortDir]       = useState<SortDir>("desc");
  const [filterTab,     setFilterTab]     = useState<FilterTab>("all");
  const stepTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const isRefreshing = refreshStep >= 0 && refreshStep < REFRESH_STEPS.length;

  // Load data awal dari DB
  useEffect(() => {
    const load = async () => {
      try {
        const res  = await fetch(`${API_URL}/api/employees`);
        if (!res.ok) throw new Error();
        const data = await res.json();

        const mapped = data
          .filter((e: any) => e.attrition_risk || e.burnout_score >= 5)
          .map(mapEmployeeToPrediction)
          .sort((a: Prediction, b: Prediction) => b.riskProbability - a.riskProbability);

        setPredictions(mapped);
        setLastRefreshed(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      } catch {
        console.error("Gagal load predictions");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleSort = (col: SortCol) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir(col === "riskProbability" ? "desc" : "asc"); }
  };

  // Simulasi refresh step — reload dari DB setelah selesai
  const handleRefresh = () => {
    if (isRefreshing) return;
    stepTimers.current.forEach(clearTimeout);
    stepTimers.current = [];
    setRefreshStep(0);

    let elapsed = 0;
    REFRESH_STEPS.forEach((step, i) => {
      elapsed += step.duration;
      const t = setTimeout(async () => {
        setRefreshStep(i + 1);
        if (i === REFRESH_STEPS.length - 1) {
          // Reload data dari DB
          try {
            const res  = await fetch(`${API_URL}/api/employees`);
            const data = await res.json();
            const mapped = data
              .filter((e: any) => e.attrition_risk || e.burnout_score >= 5)
              .map(mapEmployeeToPrediction)
              .sort((a: Prediction, b: Prediction) => b.riskProbability - a.riskProbability);
            setPredictions(mapped);
            setLastRefreshed(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
          } catch { /* tetap tampilkan data lama */ }
          setTimeout(() => setRefreshStep(-1), 400);
        }
      }, elapsed);
      stepTimers.current.push(t);
    });
  };

  // Filter & sort
  const filtered = predictions.filter((p) => {
    if (filterTab === "high")   return p.riskProbability >= 70;
    if (filterTab === "medium") return p.riskProbability >= 40 && p.riskProbability < 70;
    if (filterTab === "low")    return p.riskProbability < 40;
    return true;
  });

  const display = [...filtered].sort((a, b) => {
    if (sortCol === "name")            return sortDir === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    if (sortCol === "department")      return sortDir === "asc" ? a.department.localeCompare(b.department) : b.department.localeCompare(a.department);
    return sortDir === "asc" ? a.riskProbability - b.riskProbability : b.riskProbability - a.riskProbability;
  });

  const SortIcon = ({ col }: { col: SortCol }) => (
    <span className="inline-flex flex-col ml-1 opacity-40">
      <ChevronUp   size={10} className={sortCol === col && sortDir === "asc"  ? "opacity-100 text-blue-600" : ""} />
      <ChevronDown size={10} className={sortCol === col && sortDir === "desc" ? "opacity-100 text-blue-600" : ""} style={{ marginTop: -3 }} />
    </span>
  );

  const thCls = "px-5 py-3.5 text-left text-xs text-gray-400 uppercase tracking-wider font-medium select-none";

  const tabCounts = {
    all:    predictions.length,
    high:   predictions.filter((p) => p.riskProbability >= 70).length,
    medium: predictions.filter((p) => p.riskProbability >= 40 && p.riskProbability < 70).length,
    low:    predictions.filter((p) => p.riskProbability < 40).length,
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-gray-900 font-semibold text-lg flex items-center gap-2">
            <Brain size={20} className="text-violet-500" /> Prediksi Risiko Attrisi
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {isLoading ? "Memuat data…" : `${predictions.length} karyawan dianalisis`}
            {lastRefreshed && !isLoading && <span className="ml-2 text-gray-300">· Diperbarui {lastRefreshed}</span>}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
          {isRefreshing ? REFRESH_STEPS[Math.min(refreshStep, REFRESH_STEPS.length - 1)].label : "Refresh Data"}
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["all", "high", "medium", "low"] as FilterTab[]).map((tab) => {
          const labels = { all: "Semua", high: "High Risk", medium: "Medium", low: "Low Risk" };
          const colors = {
            all:    filterTab === tab ? "bg-blue-600 text-white" : "bg-white text-gray-500 border border-gray-200 hover:border-blue-300 hover:text-blue-600",
            high:   filterTab === tab ? "bg-red-500 text-white"  : "bg-white text-red-500 border border-red-100 hover:border-red-300",
            medium: filterTab === tab ? "bg-amber-500 text-white": "bg-white text-amber-600 border border-amber-100 hover:border-amber-300",
            low:    filterTab === tab ? "bg-emerald-500 text-white": "bg-white text-emerald-600 border border-emerald-100 hover:border-emerald-300",
          };
          return (
            <button key={tab} onClick={() => setFilterTab(tab)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors duration-150 whitespace-nowrap ${colors[tab]}`}>
              {labels[tab]} <span className="ml-1 opacity-70">({tabCounts[tab]})</span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead className="border-b border-gray-100 bg-gray-50/50">
              <tr>
                <th className={`${thCls} cursor-pointer hover:text-gray-600 w-[22%]`} onClick={() => handleSort("name")}>
                  Karyawan <SortIcon col="name" />
                </th>
                <th className={`${thCls} cursor-pointer hover:text-gray-600 w-[20%]`} onClick={() => handleSort("riskProbability")}>
                  Risiko Resign <SortIcon col="riskProbability" />
                </th>
                <th className={`${thCls} w-[30%]`}>Faktor Risiko</th>
                <th className={`${thCls} w-[28%]`}>Rekomendasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={4} className="text-center py-16 text-gray-400 text-sm">Memuat data dari database…</td></tr>
              ) : display.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-16 text-gray-400 text-sm">Tidak ada data untuk filter ini.</td></tr>
              ) : display.map((p, idx) => {
                const isHigh = p.riskProbability >= 70;
                const isMed  = p.riskProbability >= 40 && p.riskProbability < 70;
                const rowBg  = isHigh ? "hover:bg-red-50/20" : isMed ? "hover:bg-amber-50/20" : "hover:bg-emerald-50/10";
                return (
                  <tr key={p.id} className={`transition-colors duration-100 ${rowBg}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold ${avatarPalette[idx % avatarPalette.length]}`}>
                          {p.avatar}
                        </div>
                        <div>
                          <p className="text-sm text-gray-800 font-medium leading-tight">{p.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{p.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4"><RiskBar probability={p.riskProbability} /></td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {p.riskFactors.map((f) => <FactorChip key={f.label} factor={f} />)}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-2">
                        <span className={`mt-0.5 flex-shrink-0 ${isHigh ? "text-red-400" : isMed ? "text-amber-500" : "text-emerald-500"}`}>
                          {p.recommendedAction.icon}
                        </span>
                        <span className="text-sm text-gray-600 leading-snug">{p.recommendedAction.text}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3.5 border-t border-gray-50 flex items-center justify-between flex-wrap gap-2">
          <p className="text-xs text-gray-400">
            Menampilkan <span className="text-gray-500 font-medium">{display.length}</span> dari <span className="text-gray-500 font-medium">{predictions.length}</span> karyawan
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-violet-400" />
            <p className="text-xs text-gray-400">Data dari Supabase · Fallback burnout score jika AI belum dijalankan</p>
          </div>
        </div>
      </div>
    </div>
  );
}