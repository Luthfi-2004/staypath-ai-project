import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

interface ChartPoint {
  month:       string;
  burnout:     number;
  satisfaction:number;
  pulseCount:  number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3">
      <p className="text-xs text-gray-400 mb-2 font-medium">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm mb-1">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="text-gray-900 font-semibold">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function ResignationChart() {
  const [data, setData]         = useState<ChartPoint[]>([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/api/employees`);
        if (!res.ok) throw new Error();
        const employees = await res.json();

        // Kelompokkan karyawan per departemen sebagai proxy "trend"
        const deptMap: Record<string, { burnout: number[]; satisfaction: number[]; count: number }> = {};

        for (const emp of employees) {
          const dept = emp.department || "Other";
          if (!deptMap[dept]) deptMap[dept] = { burnout: [], satisfaction: [], count: 0 };
          if (emp.burnout_score != null)         deptMap[dept].burnout.push(emp.burnout_score);
          if (emp.job_satisfaction_1_5 != null)  deptMap[dept].satisfaction.push(emp.job_satisfaction_1_5);
          deptMap[dept].count++;
        }

        const avg = (arr: number[]) =>
          arr.length > 0 ? parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1)) : 0;

        const chartData: ChartPoint[] = Object.entries(deptMap).map(([dept, vals]) => ({
          month:        dept,
          burnout:      avg(vals.burnout),
          satisfaction: avg(vals.satisfaction),
          pulseCount:   vals.count,
        }));

        setData(chartData);
      } catch {
        console.error("Gagal load chart data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-gray-900 font-semibold">Burnout & Kepuasan per Departemen</h2>
          <p className="text-gray-400 text-sm mt-0.5">Rata-rata berdasarkan data karyawan saat ini</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded-full bg-red-400 inline-block" />
            Burnout (1–10)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded-full bg-blue-500 inline-block" />
            Kepuasan (1–5)
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-60">
          <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-60 text-gray-400 text-sm">
          Belum ada data karyawan.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data} margin={{ top: 4, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} domain={[0, 10]} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }} />
            <Line type="monotone" dataKey="burnout" name="Burnout" stroke="#f87171" strokeWidth={2.5}
              dot={{ r: 3.5, fill: "#f87171", strokeWidth: 0 }} activeDot={{ r: 5, fill: "#f87171", stroke: "#fff", strokeWidth: 2 }} />
            <Line type="monotone" dataKey="satisfaction" name="Kepuasan" stroke="#3b82f6" strokeWidth={2}
              dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }} activeDot={{ r: 4, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}