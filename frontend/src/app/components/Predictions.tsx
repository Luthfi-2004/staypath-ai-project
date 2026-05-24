import { useState, useEffect, useRef } from "react";
import {
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Brain,
  ShieldAlert,
  TrendingUp,
  Clock,
  CheckCircle2,
  MessageSquare,
  BookOpen,
  DollarSign,
  Users,
  BarChart2,
  Briefcase,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RiskFactor {
  label: string;
  severity: "high" | "medium" | "low";
}

interface Prediction {
  id: number;
  name: string;
  role: string;
  department: string;
  avatar: string;
  riskProbability: number;
  riskFactors: RiskFactor[];
  recommendedAction: {
    icon: React.ReactNode;
    text: string;
  };
  lastUpdated: string;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const BASE_PREDICTIONS: Omit<Prediction, "lastUpdated">[] = [
  {
    id: 1,
    name: "Daniel Brooks",
    role: "Sales Executive",
    department: "Sales",
    avatar: "DB",
    riskProbability: 91,
    riskFactors: [
      { label: "Below-market pay", severity: "high" },
      { label: "Missed promotions", severity: "high" },
      { label: "Low engagement", severity: "medium" },
    ],
    recommendedAction: { icon: <DollarSign size={13} />, text: "Initiate compensation review immediately" },
  },
  {
    id: 2,
    name: "Sarah Mitchell",
    role: "Senior Engineer",
    department: "Engineering",
    avatar: "SM",
    riskProbability: 84,
    riskFactors: [
      { label: "Excessive workload", severity: "high" },
      { label: "No growth path", severity: "high" },
      { label: "Burnout signals", severity: "medium" },
    ],
    recommendedAction: { icon: <MessageSquare size={13} />, text: "Schedule urgent 1:1 with engineering lead" },
  },
  {
    id: 3,
    name: "Tobias Müller",
    role: "DevOps Engineer",
    department: "Engineering",
    avatar: "TM",
    riskProbability: 79,
    riskFactors: [
      { label: "On-call fatigue", severity: "high" },
      { label: "Team friction", severity: "medium" },
      { label: "Stagnant skills", severity: "medium" },
    ],
    recommendedAction: { icon: <BookOpen size={13} />, text: "Offer L&D budget + reduce on-call rotation" },
  },
  {
    id: 4,
    name: "James Okafor",
    role: "Product Manager",
    department: "Product",
    avatar: "JO",
    riskProbability: 72,
    riskFactors: [
      { label: "Role ambiguity", severity: "high" },
      { label: "Low autonomy", severity: "medium" },
      { label: "Mood decline", severity: "medium" },
    ],
    recommendedAction: { icon: <Briefcase size={13} />, text: "Clarify scope and set 6-month growth milestones" },
  },
  {
    id: 5,
    name: "Carlos Rivera",
    role: "Data Analyst",
    department: "Analytics",
    avatar: "CR",
    riskProbability: 65,
    riskFactors: [
      { label: "Competing offers", severity: "high" },
      { label: "Limited tooling", severity: "medium" },
      { label: "Isolation", severity: "low" },
    ],
    recommendedAction: { icon: <DollarSign size={13} />, text: "Counter-offer + upgrade analytics toolstack" },
  },
  {
    id: 6,
    name: "Priya Nair",
    role: "UX Designer",
    department: "Design",
    avatar: "PN",
    riskProbability: 58,
    riskFactors: [
      { label: "Unclear feedback", severity: "medium" },
      { label: "Cross-team conflicts", severity: "medium" },
      { label: "Portfolio stagnation", severity: "low" },
    ],
    recommendedAction: { icon: <Users size={13} />, text: "Align on design process with product team" },
  },
  {
    id: 7,
    name: "Aisha Patel",
    role: "HR Specialist",
    department: "Human Resources",
    avatar: "AP",
    riskProbability: 47,
    riskFactors: [
      { label: "Heavy admin load", severity: "medium" },
      { label: "Limited impact", severity: "medium" },
      { label: "Low recognition", severity: "low" },
    ],
    recommendedAction: { icon: <TrendingUp size={13} />, text: "Assign strategic HR project to increase impact" },
  },
  {
    id: 8,
    name: "Emily Chen",
    role: "Marketing Lead",
    department: "Marketing",
    avatar: "EC",
    riskProbability: 41,
    riskFactors: [
      { label: "Budget constraints", severity: "medium" },
      { label: "Mood variability", severity: "low" },
      { label: "Remote isolation", severity: "low" },
    ],
    recommendedAction: { icon: <MessageSquare size={13} />, text: "Monthly check-in + budget planning session" },
  },
  {
    id: 9,
    name: "Maya Johnson",
    role: "Content Strategist",
    department: "Marketing",
    avatar: "MJ",
    riskProbability: 33,
    riskFactors: [
      { label: "Repetitive tasks", severity: "medium" },
      { label: "Low pay growth", severity: "low" },
    ],
    recommendedAction: { icon: <BookOpen size={13} />, text: "Rotate to new content domain + skills training" },
  },
  {
    id: 10,
    name: "Luca Ferrari",
    role: "Finance Analyst",
    department: "Finance",
    avatar: "LF",
    riskProbability: 24,
    riskFactors: [
      { label: "Minor pay gap", severity: "low" },
      { label: "Work-life dip", severity: "low" },
    ],
    recommendedAction: { icon: <CheckCircle2 size={13} />, text: "Continue regular pulse checks — low risk" },
  },
  {
    id: 11,
    name: "Nora Andersen",
    role: "Frontend Developer",
    department: "Engineering",
    avatar: "NA",
    riskProbability: 18,
    riskFactors: [
      { label: "Slightly low mood", severity: "low" },
    ],
    recommendedAction: { icon: <CheckCircle2 size={13} />, text: "No action needed — monitor quarterly" },
  },
  {
    id: 12,
    name: "Kenji Tanaka",
    role: "Backend Developer",
    department: "Engineering",
    avatar: "KT",
    riskProbability: 11,
    riskFactors: [
      { label: "Stable and engaged", severity: "low" },
    ],
    recommendedAction: { icon: <CheckCircle2 size={13} />, text: "Recognize performance — retention is strong" },
  },
];

function withTimestamp(): Prediction[] {
  const now = new Date();
  const fmt = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return BASE_PREDICTIONS.map((p) => ({ ...p, lastUpdated: fmt }));
}

// ─── Refresh steps ──────────────────────────────────────────────────���─────────

const REFRESH_STEPS = [
  { label: "Connecting to model…",     duration: 600 },
  { label: "Analyzing 1,284 records…", duration: 800 },
  { label: "Scoring risk factors…",    duration: 700 },
  { label: "Generating insights…",     duration: 600 },
  { label: "Updating table…",          duration: 400 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

const avatarPalette = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-600",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-cyan-100 text-cyan-700",
  "bg-indigo-100 text-indigo-700",
  "bg-fuchsia-100 text-fuchsia-700",
];

// ─── Risk probability bar ─────────────────────────────────────────────────────

function RiskBar({ probability }: { probability: number }) {
  const isHigh   = probability >= 70;
  const isMed    = probability >= 40 && probability < 70;

  const barColor  = isHigh ? "bg-red-400"    : isMed ? "bg-amber-400"    : "bg-emerald-400";
  const textColor = isHigh ? "text-red-600"  : isMed ? "text-amber-600"  : "text-emerald-600";
  const bgTrack   = isHigh ? "bg-red-100"    : isMed ? "bg-amber-100"    : "bg-emerald-100";

  return (
    <div className="flex items-center gap-3 min-w-[160px]">
      <div className={`flex-1 h-1.5 rounded-full ${bgTrack} overflow-hidden`}>
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-700`}
          style={{ width: `${probability}%` }}
        />
      </div>
      <span className={`text-sm font-semibold tabular-nums w-9 text-right ${textColor}`}>
        {probability}%
      </span>
    </div>
  );
}

// ─── Risk factor chips ────────────────────────────────────────────────────────

const factorStyle: Record<RiskFactor["severity"], string> = {
  high:   "bg-red-50 text-red-500 border border-red-100",
  medium: "bg-amber-50 text-amber-600 border border-amber-100",
  low:    "bg-gray-50 text-gray-400 border border-gray-200",
};

function FactorChip({ factor }: { factor: RiskFactor }) {
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${factorStyle[factor.severity]}`}>
      {factor.label}
    </span>
  );
}

// ─── Sort helper ──────────────────────────────────────────────────────────────

type SortKey = "name" | "riskProbability" | "department";
type SortDir = "asc" | "desc";

function sortPredictions(rows: Prediction[], key: SortKey, dir: SortDir) {
  return [...rows].sort((a, b) => {
    if (key === "riskProbability") {
      return dir === "asc"
        ? a.riskProbability - b.riskProbability
        : b.riskProbability - a.riskProbability;
    }
    const av = a[key].toLowerCase();
    const bv = b[key].toLowerCase();
    return dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
  });
}

// ─── Summary stat card ────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-400 text-xs mb-0.5">{label}</p>
        <p className="text-gray-900 font-semibold text-lg leading-tight">{value}</p>
        <p className="text-gray-400 text-xs mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
function getRiskFactors(emp: any): RiskFactor[] {
  const factors: RiskFactor[] = [];
  if (emp.burnout_score > 7)          factors.push({ label: "High burnout score", severity: "high" });
  if (emp.job_satisfaction_1_5 < 2.5) factors.push({ label: "Low job satisfaction", severity: "high" });
  if (emp.fear_of_ai_replacement === "High") factors.push({ label: "AI replacement fear", severity: "high" });
  if (emp.burnout_score > 5)          factors.push({ label: "Moderate burnout", severity: "medium" });
  if (emp.weekly_ai_upskilling_hrs > 8) factors.push({ label: "Upskilling overload", severity: "medium" });
  if (factors.length === 0)           factors.push({ label: "Low overall risk", severity: "low" });
  return factors.slice(0, 3);
}

function getRecommendedAction(emp: any): { icon: React.ReactNode; text: string } {
  if (emp.burnout_score > 7)
    return { icon: <MessageSquare size={13} />, text: "Schedule urgent 1:1 with HR" };
  if (emp.job_satisfaction_1_5 < 2.5)
    return { icon: <TrendingUp size={13} />, text: "Review growth and compensation" };
  if (emp.fear_of_ai_replacement === "High")
    return { icon: <BookOpen size={13} />, text: "Offer AI upskilling program" };
  return { icon: <CheckCircle2 size={13} />, text: "Continue regular check-ins" };
}
export function Predictions() {
  const [predictions, setPredictions] = useState<Prediction[]>(withTimestamp);
  const [refreshStep, setRefreshStep] = useState<number>(-1); // -1 = idle
  const [sortKey, setSortKey]         = useState<SortKey>("riskProbability");
  const [sortDir, setSortDir]         = useState<SortDir>("desc");
  const [filterRisk, setFilterRisk]   = useState<"All" | "High" | "Medium" | "Low">("All");
  const [lastRefreshed, setLastRefreshed] = useState<string>(() => {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  });
  const stepTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const isRefreshing = refreshStep >= 0;

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

// Tambahkan state ini di atas (setelah state yang sudah ada):
const [isLoadingFromDB, setIsLoadingFromDB] = useState(true);

// Tambahkan useEffect ini untuk load data saat pertama buka halaman:
useEffect(() => {
  const loadPredictions = async () => {
    try {
      const res = await fetch(`${API_URL}/api/employees`);
      const data = await res.json();
      const mapped = data
        .filter((emp: any) => emp.attrition_risk)
        .map((emp: any) => ({
          id: emp.id,
          name: emp.name,
          role: emp.role,
          department: emp.department,
          avatar: emp.name.substring(0, 2).toUpperCase(),
          riskProbability: Math.round((emp.risk_score || 0) * 100),
          riskFactors: getRiskFactors(emp),
          recommendedAction: getRecommendedAction(emp),
          lastUpdated: emp.last_predicted_at
            ? new Date(emp.last_predicted_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "-",
        }));
      if (mapped.length > 0) setPredictions(mapped);
    } catch (err) {
      console.error("Gagal load predictions:", err);
    } finally {
      setIsLoadingFromDB(false);
    }
  };
  loadPredictions();
}, []);

// Ganti handleRefresh dengan ini:
const handleRefresh = async () => {
  if (isRefreshing) return;
  setRefreshStep(0);

  try {
    const res = await fetch(`${API_URL}/api/ai/predict-all`, {
      method: "POST",
    });

    setRefreshStep(2);
    const result = await res.json();
    setRefreshStep(4);

    // Reload data terbaru dari employees
    const empRes = await fetch(`${API_URL}/api/employees`);
    const empData = await empRes.json();
    const mapped = empData
      .filter((emp: any) => emp.attrition_risk)
      .map((emp: any) => ({
        id: emp.id,
        name: emp.name,
        role: emp.role,
        department: emp.department,
        avatar: emp.name.substring(0, 2).toUpperCase(),
        riskProbability: Math.round((emp.risk_score || 0) * 100),
        riskFactors: getRiskFactors(emp),
        recommendedAction: getRecommendedAction(emp),
        lastUpdated: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }));

    if (mapped.length > 0) setPredictions(mapped);
    setLastRefreshed(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  } catch (err) {
    console.error("Refresh gagal:", err);
  } finally {
    setRefreshStep(-1);
  }
};

  useEffect(() => () => stepTimers.current.forEach(clearTimeout), []);

  // Sort + filter
  const display = sortPredictions(
    predictions.filter((p) => {
      if (filterRisk === "All")    return true;
      if (filterRisk === "High")   return p.riskProbability >= 70;
      if (filterRisk === "Medium") return p.riskProbability >= 40 && p.riskProbability < 70;
      return p.riskProbability < 40;
    }),
    sortKey,
    sortDir
  );

  const highCount = predictions.filter((p) => p.riskProbability >= 70).length;
  const avgProb   = Math.round(predictions.reduce((s, p) => s + p.riskProbability, 0) / predictions.length);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className="inline-flex flex-col ml-1 opacity-40 align-middle">
      <ChevronUp   size={10} className={sortKey === col && sortDir === "asc"  ? "opacity-100 text-blue-600" : ""} />
      <ChevronDown size={10} className={sortKey === col && sortDir === "desc" ? "opacity-100 text-blue-600" : ""} style={{ marginTop: -3 }} />
    </span>
  );

  const currentStepLabel = refreshStep >= 0 ? REFRESH_STEPS[refreshStep]?.label : "";
  const thCls = "px-5 py-3.5 text-left text-xs text-gray-400 uppercase tracking-wider font-medium select-none";

  return (
    <div className="space-y-5">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-gray-900 font-semibold text-lg">Attrition Predictions</h1>
          <div className="flex items-center gap-1.5 mt-1">
            <Clock size={12} className="text-gray-400" />
            <p className="text-gray-400 text-xs">
              Last refreshed at <span className="text-gray-500 font-medium">{lastRefreshed}</span>
              &nbsp;·&nbsp;Model accuracy&nbsp;
              <span className="text-blue-600 font-medium">91.4%</span>
            </p>
          </div>
        </div>

        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-150 min-w-[196px] justify-center ${
            isRefreshing
              ? "bg-blue-50 border-blue-200 text-blue-500 cursor-default"
              : "bg-blue-600 border-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md active:scale-[0.98]"
          }`}
        >
          {isRefreshing ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse flex-shrink-0" />
              <span className="truncate">{currentStepLabel}</span>
            </>
          ) : (
            <>
              <RefreshCw size={14} />
              Refresh AI Predictions
            </>
          )}
        </button>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<ShieldAlert size={18} className="text-red-500" />}
          label="High-Risk Employees"
          value={String(highCount)}
          sub="Risk probability ≥ 70%"
          accent="bg-red-50"
        />
        <StatCard
          icon={<BarChart2 size={18} className="text-blue-600" />}
          label="Avg Resignation Probability"
          value={`${avgProb}%`}
          sub="Across all monitored staff"
          accent="bg-blue-50"
        />
        <StatCard
          icon={<Brain size={18} className="text-violet-500" />}
          label="Model Confidence"
          value="91.4%"
          sub="14 behavioural signals used"
          accent="bg-violet-50"
        />
      </div>

      {/* ── Filter pills ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-400 mr-1">Filter:</span>
        {(["All", "High", "Medium", "Low"] as const).map((lvl) => {
          const count =
            lvl === "All"    ? predictions.length :
            lvl === "High"   ? predictions.filter((p) => p.riskProbability >= 70).length :
            lvl === "Medium" ? predictions.filter((p) => p.riskProbability >= 40 && p.riskProbability < 70).length :
                               predictions.filter((p) => p.riskProbability < 40).length;
          return (
            <button
              key={lvl}
              onClick={() => setFilterRisk(lvl)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors duration-150 ${
                filterRisk === lvl
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {lvl}{" "}
              <span className={`ml-1 ${filterRisk === lvl ? "text-blue-200" : "text-gray-400"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Predictions table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead className="border-b border-gray-100 bg-gray-50/50">
              <tr>
                {/* Employee Name */}
                <th
                  className={`${thCls} cursor-pointer hover:text-gray-600 w-[22%]`}
                  onClick={() => handleSort("name")}
                >
                  Employee <SortIcon col="name" />
                </th>

                {/* Risk Probability */}
                <th
                  className={`${thCls} cursor-pointer hover:text-gray-600 w-[20%]`}
                  onClick={() => handleSort("riskProbability")}
                >
                  Resignation Risk <SortIcon col="riskProbability" />
                </th>

                {/* Key Risk Factors */}
                <th className={`${thCls} w-[30%]`}>Key Risk Factors</th>

                {/* Recommended Action */}
                <th className={`${thCls} w-[28%]`}>Recommended Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {display.map((p, idx) => {
                const isHigh = p.riskProbability >= 70;
                const isMed  = p.riskProbability >= 40 && p.riskProbability < 70;
                const rowHighlight = isHigh ? "hover:bg-red-50/20" : isMed ? "hover:bg-amber-50/20" : "hover:bg-emerald-50/10";

                return (
                  <tr
                    key={p.id}
                    className={`transition-colors duration-100 group ${rowHighlight}`}
                  >
                    {/* Employee */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold ${avatarPalette[idx % avatarPalette.length]}`}
                        >
                          {getInitials(p.name)}
                        </div>
                        <div>
                          <p className="text-sm text-gray-800 font-medium leading-tight">{p.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{p.role}</p>
                        </div>
                      </div>
                    </td>

                    {/* Risk probability */}
                    <td className="px-5 py-4">
                      <RiskBar probability={p.riskProbability} />
                    </td>

                    {/* Risk factors */}
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {p.riskFactors.map((f) => (
                          <FactorChip key={f.label} factor={f} />
                        ))}
                      </div>
                    </td>

                    {/* Recommended action */}
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-2">
                        <span
                          className={`mt-0.5 flex-shrink-0 ${
                            isHigh ? "text-red-400" : isMed ? "text-amber-500" : "text-emerald-500"
                          }`}
                        >
                          {p.recommendedAction.icon}
                        </span>
                        <span className="text-sm text-gray-600 leading-snug">
                          {p.recommendedAction.text}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        <div className="px-5 py-3.5 border-t border-gray-50 flex items-center justify-between flex-wrap gap-2">
          <p className="text-xs text-gray-400">
            Showing{" "}
            <span className="text-gray-500 font-medium">{display.length}</span> of{" "}
            <span className="text-gray-500 font-medium">{predictions.length}</span> predictions
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-violet-400" />
            <p className="text-xs text-gray-400">
              Powered by PeopleIQ ML engine · Next scheduled run in{" "}
              <span className="text-gray-500 font-medium">6 hrs</span>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
