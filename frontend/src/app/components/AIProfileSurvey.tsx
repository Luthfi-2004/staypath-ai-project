import { useState, useEffect } from "react";
import { Loader2, CheckCircle, Save } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

// ─── Constants ────────────────────────────────────────────────────────────────
const AI_TOOLS = ["ChatGPT", "Copilot", "Claude", "Gemini", "None", "Other"];
const ADOPTION_STAGES = ["Beginner", "Intermediate", "Advanced", "None"];
const FEAR_LEVELS = ["Low", "Medium", "High"];

interface AIProfileState {
  primary_ai_tool: string;
  ai_adoption_stage: string;
  fear_of_ai_replacement: string;
  productivity_score: number;
  ai_tools_used_per_day: number;
  hours_with_ai_assistance_daily: number;
  ai_replaces_my_tasks_pct: number;
  weekly_ai_upskilling_hrs: number;
}

export function AIProfileSurvey() {
  const employeeId = localStorage.getItem("employee_id");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [form, setForm] = useState<AIProfileState>({
    primary_ai_tool: "ChatGPT",
    ai_adoption_stage: "Intermediate",
    fear_of_ai_replacement: "Low",
    productivity_score: 50,
    ai_tools_used_per_day: 1,
    hours_with_ai_assistance_daily: 1,
    ai_replaces_my_tasks_pct: 10,
    weekly_ai_upskilling_hrs: 1,
  });

  useEffect(() => {
    if (!employeeId) return;
    fetch(`${API_URL}/api/auth/me/${employeeId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setForm({
            primary_ai_tool: data.primary_ai_tool || "ChatGPT",
            ai_adoption_stage: data.ai_adoption_stage || "Intermediate",
            fear_of_ai_replacement: data.fear_of_ai_replacement || "Low",
            productivity_score: data.productivity_score || 50,
            ai_tools_used_per_day: data.ai_tools_used_per_day || 1,
            hours_with_ai_assistance_daily: data.hours_with_ai_assistance_daily || 1,
            ai_replaces_my_tasks_pct: data.ai_replaces_my_tasks_pct || 10,
            weekly_ai_upskilling_hrs: data.weekly_ai_upskilling_hrs || 1,
          });
        }
      })
      .catch((err) => console.error("Gagal load data profil AI:", err))
      .finally(() => setLoading(false));
  }, [employeeId]);

  const set = (field: keyof AIProfileState, value: any) => {
    setForm((f) => ({ ...f, [field]: value }));
    setStatusMsg(null);
  };

  const handleSave = async () => {
    if (!employeeId) return;
    setSaving(true);
    setStatusMsg(null);

    try {
      const res = await fetch(`${API_URL}/api/employees/${employeeId}/ai-profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Gagal menyimpan");

      setStatusMsg({ type: "success", text: "Profil AI berhasil diperbarui!" });
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: "error", text: "Gagal menyimpan perubahan. Coba lagi." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const inputCls = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition bg-white";
  const labelCls = "block text-xs font-medium text-gray-600 mb-1.5";

  return (
    <div>
      <div className="space-y-6">
        {/* Section 1: Tools & Adoption */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
          <div>
            <label className={labelCls}>Tool AI Utama yang sering dipakai</label>
            <select value={form.primary_ai_tool} onChange={(e) => set("primary_ai_tool", e.target.value)} className={inputCls}>
              {AI_TOOLS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Tingkat Penguasaan/Adopsi AI</label>
            <select value={form.ai_adoption_stage} onChange={(e) => set("ai_adoption_stage", e.target.value)} className={inputCls}>
              {ADOPTION_STAGES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Section 2: Habit Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Jumlah Tools AI yang dipakai per hari</label>
            <input type="number" min="0" step="1" value={form.ai_tools_used_per_day} onChange={(e) => set("ai_tools_used_per_day", Number(e.target.value))} className={inputCls} />
            <p className="text-[10px] text-gray-400 mt-1">Berapa macam AI yang Anda buka hari ini?</p>
          </div>
          <div>
            <label className={labelCls}>Jam kerja dengan bantuan AI (Jam/Hari)</label>
            <input type="number" min="0" step="0.5" value={form.hours_with_ai_assistance_daily} onChange={(e) => set("hours_with_ai_assistance_daily", Number(e.target.value))} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Persentase tugas yang digantikan AI (%)</label>
            <input type="number" min="0" max="100" step="1" value={form.ai_replaces_my_tasks_pct} onChange={(e) => set("ai_replaces_my_tasks_pct", Number(e.target.value))} className={inputCls} />
            <p className="text-[10px] text-gray-400 mt-1">Misal: 20 berarti 20% tugas harian beres pakai AI.</p>
          </div>
          <div>
            <label className={labelCls}>Jam belajar/eksplorasi AI (Jam/Minggu)</label>
            <input type="number" min="0" step="0.5" value={form.weekly_ai_upskilling_hrs} onChange={(e) => set("weekly_ai_upskilling_hrs", Number(e.target.value))} className={inputCls} />
          </div>
        </div>

        {/* Section 3: Sentiment & Perception */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-50 mt-4">
          <div>
            <label className={labelCls}>Skor Produktivitas Saat Ini (0 - 100)</label>
            <input type="number" min="0" max="100" step="1" value={form.productivity_score} onChange={(e) => set("productivity_score", Number(e.target.value))} className={inputCls} />
            <p className="text-[10px] text-gray-400 mt-1">100 = Sangat Produktif</p>
          </div>
          <div>
            <label className={labelCls}>Kekhawatiran pekerjaan digantikan AI</label>
            <select value={form.fear_of_ai_replacement} onChange={(e) => set("fear_of_ai_replacement", e.target.value)} className={inputCls}>
              {FEAR_LEVELS.map((t) => <option key={t} value={t}>{t === "Low" ? "Low (Tidak Takut)" : t === "High" ? "High (Sangat Takut)" : "Medium (Biasa Saja)"}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
        <div className="flex-1">
          {statusMsg && (
            <p className={`text-sm font-medium flex items-center gap-1.5 ${statusMsg.type === "success" ? "text-emerald-600" : "text-red-500"}`}>
              {statusMsg.type === "success" && <CheckCircle size={15} />}
              {statusMsg.text}
            </p>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium rounded-xl transition-all shadow-sm"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Simpan Profil
        </button>
      </div>

    </div>
  );
}
