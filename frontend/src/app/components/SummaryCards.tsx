import { useEffect, useState } from "react";
import { Users, AlertTriangle, Smile, TrendingUp, TrendingDown, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

interface Stats {
  totalEmployees:  number;
  highRiskCount:   number;
  avgMoodToday:    number | null;
  avgBurnout:      number | null;
  avgSatisfaction: number | null;
  pulseCountToday: number;
}

export function SummaryCards() {
  const [stats, setStats]       = useState<Stats | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/api/dashboard/stats`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setStats(await res.json());
      } catch (err) {
        console.error("Gagal fetch stats:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Mood skala 1-5 dari daily_pulse → tampilkan sebagai X/5
  // Satisfaction skala 1-5 dari DB
  const moodDisplay = stats?.avgMoodToday != null
    ? `${stats.avgMoodToday} / 5`
    : stats?.avgSatisfaction != null
    ? `${stats.avgSatisfaction} / 5`
    : "—";

  const moodTrend = stats?.avgMoodToday != null
    ? stats.avgMoodToday >= 3.5 ? "up" : "down"
    : "down";

  const cards = [
    {
      id:         "total",
      label:      "Total Karyawan",
      value:      isLoading ? "…" : (stats?.totalEmployees ?? 0).toLocaleString(),
      change:     stats ? `${stats.totalEmployees} terdaftar` : "Memuat…",
      trend:      "up" as const,
      icon:       Users,
      iconBg:     "bg-blue-50",
      iconColor:  "text-blue-600",
      trendColor: "text-emerald-600",
      trendBg:    "bg-emerald-50",
    },
    {
      id:         "risk",
      label:      "Risiko Resign Tinggi",
      value:      isLoading ? "…" : (stats?.highRiskCount ?? 0).toString(),
      change:     stats?.highRiskCount
                    ? `${stats.highRiskCount} karyawan High Risk`
                    : "Belum ada prediksi AI",
      trend:      "up" as const,
      icon:       AlertTriangle,
      iconBg:     "bg-red-50",
      iconColor:  "text-red-500",
      trendColor: "text-red-500",
      trendBg:    "bg-red-50",
    },
    {
      id:         "mood",
      label:      "Rata-rata Mood Hari Ini",
      value:      isLoading ? "…" : moodDisplay,
      change:     stats?.pulseCountToday
                    ? `${stats.pulseCountToday} check-in hari ini`
                    : "Belum ada check-in hari ini",
      trend:      moodTrend,
      icon:       Smile,
      iconBg:     "bg-amber-50",
      iconColor:  "text-amber-500",
      trendColor: moodTrend === "up" ? "text-emerald-600" : "text-amber-600",
      trendBg:    moodTrend === "up" ? "bg-emerald-50"    : "bg-amber-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {cards.map((card) => {
        const Icon      = card.icon;
        const TrendIcon = card.trend === "up" ? TrendingUp : TrendingDown;
        return (
          <div
            key={card.id}
            className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${card.trendBg} ${card.trendColor}`}>
                <TrendIcon size={12} />
                {card.change}
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-1">{card.label}</p>
            {isLoading ? (
              <div className="flex items-center gap-2 mt-2">
                <Loader2 size={18} className="text-gray-300 animate-spin" />
                <span className="text-gray-300 text-sm">Memuat…</span>
              </div>
            ) : (
              <p className="text-gray-900 text-3xl font-semibold tracking-tight">{card.value}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}