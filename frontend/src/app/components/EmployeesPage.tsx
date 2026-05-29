import { useState, useRef, useEffect } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

// ─── Config ───────────────────────────────────────────────────────────────────

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = "Aktif" | "Cuti" | "Nonaktif" | "Dijadwalkan" | string;
type AuthRole = "karyawan" | "hrd";

interface EmployeeRecord {
  id: number;
  employeeId: string;
  name: string;
  department: string;
  role: string;
  email: string;
  status: Status;
  joinDate: string;
  authRole: AuthRole;

  // AI Fields
  education_level?: string;
  country?: string;
  industry?: string;
  company_size?: string;
  remote_work_type?: string;
  primary_ai_tool?: string;
  ai_adoption_stage?: string;
  fear_of_ai_replacement?: string;
  productivity_score?: number;
  burnout_score?: number;
  years_experience?: number;
  team_size?: number;
  salary_usd_k?: number;
  ai_tools_used_per_day?: number;
  hours_with_ai_assistance_daily?: number;
  ai_replaces_my_tasks_pct?: number;
  weekly_ai_upskilling_hrs?: number;
  job_satisfaction_1_5?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEPARTMENTS = [
  "Engineering", "Product", "Design", "Marketing", "Sales",
  "Analytics", "Finance", "Human Resources", "Operations",
];

const STATUSES: Status[] = ["Aktif", "Cuti", "Nonaktif", "Dijadwalkan"];
const AUTH_ROLES: AuthRole[] = ["karyawan", "hrd"];

// Pilihan untuk Dropdown Form AI
const EDUCATION_LEVELS = ["Bachelor", "Master", "PhD", "Bootcamp", "Self-taught"];
const COUNTRIES = ["Indonesia", "Singapore", "Malaysia", "Australia", "United States", "United Kingdom", "India", "France", "Germany"];
const INDUSTRIES = ["Technology", "Finance", "Healthcare", "Education", "Manufacturing", "Retail", "Gaming", "Automotive", "Media", "SaaS"];
const COMPANY_SIZES = ["Startup (<50)", "Small (50-200)", "Mid-size", "Large (1000-5000)", "Enterprise (5000+)"];
const REMOTE_TYPES = ["On-site", "Hybrid", "Fully Remote"];
const AI_TOOLS = ["ChatGPT", "GitHub Copilot", "Claude", "Gemini", "Midjourney", "Perplexity", "Cursor", "None"];
const ADOPTION_STAGES = ["None", "Experimenting", "Integrating", "Optimizing"];
const FEAR_LEVELS = ["Low", "Medium", "High"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  if (!name) return "??";
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function resolveJoinDate(emp: any): string {
  if (emp.join_date)  return emp.join_date;
  if (emp.created_at) return emp.created_at.split("T")[0];
  return new Date().toISOString().split("T")[0];
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const statusStyle: Record<string, string> = {
  Aktif: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  Cuti: "bg-amber-50 text-amber-600 border border-amber-100",
  Nonaktif: "bg-gray-100 text-gray-400 border border-gray-200",
  Dijadwalkan: "bg-blue-50 text-blue-600 border border-blue-100",
};
const statusDot: Record<string, string> = {
  Aktif: "bg-emerald-500",
  Cuti: "bg-amber-400",
  Nonaktif: "bg-gray-400",
  Dijadwalkan: "bg-blue-500",
};

function StatusBadge({ status }: { status: Status }) {
  const style = statusStyle[status] ?? statusStyle["Nonaktif"];
  const dot   = statusDot[status]   ?? statusDot["Nonaktif"];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${style}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}

// ─── Auth role badge ──────────────────────────────────────────────────────────

function AuthRoleBadge({ role }: { role: AuthRole }) {
  return (
    <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-md font-medium ${
      role === "hrd"
        ? "bg-violet-50 text-violet-600 border border-violet-100"
        : "bg-gray-50 text-gray-500 border border-gray-100"
    }`}>
      {role === "hrd" ? "HRD" : "Karyawan"}
    </span>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

const avatarColors = [
  "bg-blue-100 text-blue-700", "bg-violet-100 text-violet-700",
  "bg-rose-100 text-rose-600",  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700","bg-cyan-100 text-cyan-700",
];
function Avatar({ name, index }: { name: string; index: number }) {
  const color = avatarColors[index % avatarColors.length];
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold ${color}`}>
      {getInitials(name)}
    </div>
  );
}

// ─── Form state ───────────────────────────────────────────────────────────────

const emptyForm = {
  // Step 1
  name: "",
  department: DEPARTMENTS[0],
  role: "",
  email: "",
  status: "Aktif" as Status,
  joinDate: new Date().toISOString().split("T")[0],
  authRole: "karyawan" as AuthRole,
  password: "",

  // Step 2
  education_level: "Bachelor",
  country: "Indonesia",
  industry: "Technology",
  company_size: "Mid-size",
  remote_work_type: "Hybrid",
  years_experience: 2.0,
  salary_usd_k: 50.0,
  team_size: 10.0,

  // Step 3
  primary_ai_tool: "ChatGPT",
  ai_adoption_stage: "Intermediate",
  fear_of_ai_replacement: "Low",
  ai_tools_used_per_day: 1.0,
  hours_with_ai_assistance_daily: 2.0,
  ai_replaces_my_tasks_pct: 15.0,
  weekly_ai_upskilling_hrs: 1.0,
  productivity_score: 7.5,
  burnout_score: 50.0,
  job_satisfaction_1_5: 3.0,
};

type FormState  = typeof emptyForm;
type FormErrors = Partial<Record<keyof FormState, string>>;

function validate(
  f: FormState,
  mode: "add" | "edit",
  step: number,
): FormErrors {
  const errors: FormErrors = {};

  if (step === 1 || step === 3) {
    if (!f.name.trim()) errors.name = "Nama wajib diisi.";
    if (!f.role.trim()) errors.role = "Jabatan wajib diisi.";
    if (!f.email.trim()) {
      errors.email = "Email wajib diisi.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) {
      errors.email = "Format email tidak valid.";
    }
    if (!f.joinDate) errors.joinDate = "Tanggal bergabung wajib diisi.";
    if (mode === "add" && !f.password.trim())
      errors.password = "Password awal wajib diisi.";
  }
  return errors;
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      {error && (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

const inputCls = (err?: string) =>
  `w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition text-gray-700 bg-white ${
    err ? "border-red-300 focus:ring-red-100 focus:border-red-400"
        : "border-gray-200 focus:ring-blue-100 focus:border-blue-400"
  }`;

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  const backdropRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div
      ref={backdropRef}
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 backdrop-blur-[2px] px-4"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-gray-900 font-semibold text-sm">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={15} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Employee form (Multi-Step) ───────────────────────────────────────────────

function EmployeeForm({ initial, employeeId, onSave, onClose, mode }: {
  initial: FormState; employeeId?: string;
  onSave: (data: FormState) => void; onClose: () => void; mode: "add" | "edit";
}) {
  const [form, setForm]         = useState<FormState>(initial);
  const [errors, setErrors]     = useState<FormErrors>({});
  const [showPassword, setShowPw] = useState(false);
  const [step, setStep] = useState(1);

  const set = (field: keyof FormState, value: any) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const handleNext = () => {
    const errs = validate(form, mode, step);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setStep(step + 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form, mode, 3);
    if (Object.keys(errs).length) {
      setErrors(errs);
      if (errs.name || errs.email || errs.role) setStep(1);
      return;
    }
    onSave(form);
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} noValidate>
      <div className="px-6 py-5 max-h-[72vh] overflow-y-auto">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-100 -z-10"></div>
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className="flex flex-col items-center gap-1.5 bg-white px-2"
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step >= num
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {num}
              </div>
              <span
                className={`text-[10px] uppercase tracking-wider font-semibold ${step >= num ? "text-blue-600" : "text-gray-400"}`}
              >
                {num === 1 ? "Info" : num === 2 ? "Profil" : "AI"}
              </span>
            </div>
          ))}
        </div>

        {/* ================= STEP 1: INFO DASAR ================= */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            {employeeId && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Employee ID
                </label>
                <input
                  type="text"
                  value={employeeId}
                  readOnly
                  className="w-full px-3 py-2.5 text-sm border border-gray-100 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
                />
              </div>
            )}

            <Field label="Nama Lengkap" required error={errors.name}>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Budi Santoso"
                className={inputCls(errors.name)}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Email Login" required error={errors.email}>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="budi@company.com"
                  className={inputCls(errors.email)}
                />
              </Field>
              <Field label="Tanggal Bergabung" required error={errors.joinDate}>
                <input
                  type="date"
                  value={form.joinDate}
                  onChange={(e) => set("joinDate", e.target.value)}
                  className={inputCls(errors.joinDate)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Departemen" required>
                <select
                  value={form.department}
                  onChange={(e) => set("department", e.target.value)}
                  className={inputCls()}
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Jabatan" required error={errors.role}>
                <input
                  type="text"
                  value={form.role}
                  onChange={(e) => set("role", e.target.value)}
                  placeholder="e.g. Backend Engineer"
                  className={inputCls(errors.role)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Status" required>
                <select
                  value={form.status}
                  onChange={(e) => set("status", e.target.value as Status)}
                  className={inputCls()}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Role Akses" required>
                <select
                  value={form.authRole}
                  onChange={(e) => set("authRole", e.target.value as AuthRole)}
                  className={inputCls()}
                >
                  {AUTH_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r === "hrd" ? "HRD" : "Karyawan"}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field
              label={mode === "add" ? "Password Awal" : "Ganti Password"}
              required={mode === "add"}
              error={errors.password}
            >
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder={
                    mode === "add"
                      ? "Buat password..."
                      : "Kosongkan jika tidak ingin diubah"
                  }
                  className={inputCls(errors.password) + " pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>
          </div>
        )}

        {/* ================= STEP 2: LATAR BELAKANG ================= */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <p className="text-xs text-gray-500 mb-2">
              Informasi ini akan membantu AI memberikan prediksi yang lebih
              akurat.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Pendidikan Terakhir">
                <select
                  value={form.education_level}
                  onChange={(e) => set("education_level", e.target.value)}
                  className={inputCls()}
                >
                  {EDUCATION_LEVELS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Tipe Pekerjaan">
                <select
                  value={form.remote_work_type}
                  onChange={(e) => set("remote_work_type", e.target.value)}
                  className={inputCls()}
                >
                  {REMOTE_TYPES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Industri">
                <select
                  value={form.industry}
                  onChange={(e) => set("industry", e.target.value)}
                  className={inputCls()}
                >
                  {INDUSTRIES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Ukuran Perusahaan">
                <select
                  value={form.company_size}
                  onChange={(e) => set("company_size", e.target.value)}
                  className={inputCls()}
                >
                  {COMPANY_SIZES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Negara">
                <select
                  value={form.country}
                  onChange={(e) => set("country", e.target.value)}
                  className={inputCls()}
                >
                  {COUNTRIES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Ukuran Tim (Jumlah Orang)">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.team_size}
                  onChange={(e) => set("team_size", Number(e.target.value))}
                  className={inputCls()}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Pengalaman Kerja (Tahun)">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={form.years_experience}
                  onChange={(e) =>
                    set("years_experience", Number(e.target.value))
                  }
                  className={inputCls()}
                />
              </Field>
              <Field label="Gaji Tahunan (USD k)">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.salary_usd_k}
                  onChange={(e) => set("salary_usd_k", Number(e.target.value))}
                  className={inputCls()}
                />
              </Field>
            </div>
          </div>
        )}

        {/* ================= STEP 3: METRIK AI ================= */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tools AI Utama">
                <select
                  value={form.primary_ai_tool}
                  onChange={(e) => set("primary_ai_tool", e.target.value)}
                  className={inputCls()}
                >
                  {AI_TOOLS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Tahap Adopsi AI">
                <select
                  value={form.ai_adoption_stage}
                  onChange={(e) => set("ai_adoption_stage", e.target.value)}
                  className={inputCls()}
                >
                  {ADOPTION_STAGES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Ketakutan Diganti AI">
                <select
                  value={form.fear_of_ai_replacement}
                  onChange={(e) =>
                    set("fear_of_ai_replacement", e.target.value)
                  }
                  className={inputCls()}
                >
                  {FEAR_LEVELS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Skor Produktivitas (0-100)">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={form.productivity_score}
                  onChange={(e) =>
                    set("productivity_score", Number(e.target.value))
                  }
                  className={inputCls()}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Jam Pemakaian AI (Per Hari)">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={form.hours_with_ai_assistance_daily}
                  onChange={(e) =>
                    set(
                      "hours_with_ai_assistance_daily",
                      Number(e.target.value),
                    )
                  }
                  className={inputCls()}
                />
              </Field>
              <Field label="Tugas Diganti AI (%)">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={form.ai_replaces_my_tasks_pct}
                  onChange={(e) =>
                    set("ai_replaces_my_tasks_pct", Number(e.target.value))
                  }
                  className={inputCls()}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Jumlah Tools AI Per Hari">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.ai_tools_used_per_day}
                  onChange={(e) =>
                    set("ai_tools_used_per_day", Number(e.target.value))
                  }
                  className={inputCls()}
                />
              </Field>
              <Field label="Jam Belajar AI (Per Minggu)">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={form.weekly_ai_upskilling_hrs}
                  onChange={(e) =>
                    set("weekly_ai_upskilling_hrs", Number(e.target.value))
                  }
                  className={inputCls()}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 mt-2">
              <Field
                label="Estimasi Burnout Awal (0-100)"
                hint="Diupdate via Daily Pulse"
              >
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={form.burnout_score}
                  onChange={(e) => set("burnout_score", Number(e.target.value))}
                  className={inputCls()}
                />
              </Field>
              <Field
                label="Estimasi Kepuasan (1-5)"
                hint="Diupdate via Daily Pulse"
              >
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={form.job_satisfaction_1_5}
                  onChange={(e) =>
                    set("job_satisfaction_1_5", Number(e.target.value))
                  }
                  className={inputCls()}
                />
              </Field>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
        <div>
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            >
              <ChevronLeft size={15} /> Kembali
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            >
              Batal
            </button>
          )}
        </div>

        <div>
          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2 text-sm bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              Lanjut <ChevronRight size={15} />
            </button>
         ) : (
            <button
              type="button"  // 🔴 Ubah dari "submit" menjadi "button"
              onClick={handleSubmit} // 🔴 Panggil fungsinya secara manual di sini
              className="px-6 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              {mode === "add" ? "Simpan Data Karyawan" : "Simpan Perubahan"}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

// ─── Delete dialog ────────────────────────────────────────────────────────────

function DeleteDialog({ employee, onConfirm, onClose }: {
  employee: EmployeeRecord; onConfirm: () => void; onClose: () => void;
}) {
  return (
    <Modal title="Hapus Karyawan" onClose={onClose}>
      <div className="px-6 py-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-5 h-5 text-red-500" />
        </div>
        <p className="text-gray-800 font-medium mb-1">Hapus {employee.name}?</p>
        <p className="text-gray-400 text-sm">
          Data <span className="text-gray-600 font-medium">{employee.name}</span> ({employee.employeeId}) akan dihapus permanen dan tidak dapat dibatalkan.
        </p>
      </div>
      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium">Batal</button>
        <button onClick={onConfirm} className="px-5 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors shadow-sm">Ya, Hapus</button>
      </div>
    </Modal>
  );
}

// ─── Sort ─────────────────────────────────────────────────────────────────────

type SortKey = "employeeId" | "name" | "department" | "role" | "status";
type SortDir = "asc" | "desc";

function sortRecords(rows: EmployeeRecord[], key: SortKey, dir: SortDir) {
  return [...rows].sort((a, b) => {
    const av = String(a[key]).toLowerCase();
    const bv = String(b[key]).toLowerCase();
    return dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
  });
}

// ─── Main page ────────────────────────────────────────────────────────────────

type ModalState =
  | { type: "none" }
  | { type: "add" }
  | { type: "edit";   employee: EmployeeRecord }
  | { type: "delete"; employee: EmployeeRecord };

export function EmployeesPage() {
  const [records, setRecords]         = useState<EmployeeRecord[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | Status>("All");
  const [modal, setModal]             = useState<ModalState>({ type: "none" });
  const [sortKey, setSortKey]         = useState<SortKey>("employeeId");
  const [sortDir, setSortDir]         = useState<SortDir>("asc");
  const [toast, setToast]             = useState<string | null>(null);

  // ── Fetch ──
  useEffect(() => {
    const load = async () => {
      try {
        const res  = await fetch(`${API_URL}/api/employees`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const mapped: EmployeeRecord[] = data.map((emp: any) => ({
          id: emp.id,
          employeeId: `EMP-${String(emp.id).padStart(3, "0")}`,
          name: emp.name,
          department: emp.department,
          role: emp.role,
          status: emp.status ?? "Aktif",
          email:
            emp.email ?? `${emp.name.split(" ")[0].toLowerCase()}@company.com`,
          joinDate: resolveJoinDate(emp),
          authRole: (emp.auth_role as AuthRole) ?? "karyawan",

          // AI Fields
          education_level: emp.education_level,
          country: emp.country,
          industry: emp.industry,
          company_size: emp.company_size,
          remote_work_type: emp.remote_work_type,
          primary_ai_tool: emp.primary_ai_tool,
          ai_adoption_stage: emp.ai_adoption_stage,
          fear_of_ai_replacement: emp.fear_of_ai_replacement,
          productivity_score: emp.productivity_score,
          burnout_score: emp.burnout_score,
          years_experience: emp.years_experience,
          team_size: emp.team_size,
          salary_usd_k: emp.salary_usd_k,
          ai_tools_used_per_day: emp.ai_tools_used_per_day,
          hours_with_ai_assistance_daily: emp.hours_with_ai_assistance_daily,
          ai_replaces_my_tasks_pct: emp.ai_replaces_my_tasks_pct,
          weekly_ai_upskilling_hrs: emp.weekly_ai_upskilling_hrs,
          job_satisfaction_1_5: emp.job_satisfaction_1_5,
        }));

        setRecords(mapped);
      } catch (err) {
        console.error("Gagal fetch karyawan:", err);
        showToast("Gagal mengambil data dari server.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtered = sortRecords(
    records.filter((e) => {
      const q = search.toLowerCase();
      const matchSearch =
        e.name.toLowerCase().includes(q) ||
        e.employeeId.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q);
      const matchStatus = statusFilter === "All" || e.status === statusFilter;
      return matchSearch && matchStatus;
    }),
    sortKey, sortDir,
  );

  // ── CRUD ──

  const handleAdd = async (data: FormState) => {
    try {
      const res = await fetch(`${API_URL}/api/employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const newEmp = await res.json();

      // Pisahkan password supaya tidak masuk ke state React UI (hindari TS Error)
      const { password, ...restData } = data;

      const formatted: EmployeeRecord = {
        id: newEmp.id,
        employeeId: `EMP-${String(newEmp.id).padStart(3, "0")}`,
        ...restData,
        status: newEmp.status ?? "Aktif",
        email: newEmp.email ?? data.email,
        joinDate: resolveJoinDate(newEmp),
        authRole: (newEmp.auth_role as AuthRole) ?? "karyawan",
      };

      setRecords((r) => [formatted, ...r]);
      setModal({ type: "none" });
      showToast(`${data.name} berhasil ditambahkan.`);
    } catch (err) {
      console.error(err);
      showToast("Gagal menambahkan karyawan.");
    }
  };

  const handleEdit = async (data: FormState) => {
    if (modal.type !== "edit") return;
    const { id } = modal.employee;
    try {
      const body: any = { ...data };
      if (!data.password.trim()) delete body.password;

      const res = await fetch(`${API_URL}/api/employees/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated = await res.json();

      // Pisahkan password supaya tidak masuk ke state React UI
      const { password, ...restData } = data;

      setRecords((r) =>
        r.map((e) =>
          e.id === id
            ? {
                ...e,
                ...restData,
                status: updated.status ?? "Aktif",
                email: updated.email ?? data.email,
                joinDate: resolveJoinDate(updated),
                authRole: (updated.auth_role as AuthRole) ?? "karyawan",
              }
            : e,
        ),
      );
      setModal({ type: "none" });
      showToast(`Data ${data.name} berhasil diperbarui.`);
    } catch (err) {
      console.error(err);
      showToast("Gagal memperbarui data.");
    }
  };

  const handleDelete = async () => {
    if (modal.type !== "delete") return;
    const { id, name } = modal.employee;
    try {
      const res = await fetch(`${API_URL}/api/employees/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setRecords((r) => r.filter((e) => e.id !== id));
      setModal({ type: "none" });
      showToast(`${name} telah dihapus.`);
    } catch (err) {
      console.error(err);
      showToast("Gagal menghapus karyawan.");
    }
  };

  // ── UI ──

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className="inline-flex flex-col ml-1 opacity-40">
      <ChevronUp   size={10} className={sortKey === col && sortDir === "asc"  ? "opacity-100 text-blue-600" : ""} />
      <ChevronDown size={10} className={sortKey === col && sortDir === "desc" ? "opacity-100 text-blue-600" : ""} style={{ marginTop: -3 }} />
    </span>
  );

  const thCls    = "px-5 py-3.5 text-left text-xs text-gray-400 uppercase tracking-wider font-medium select-none";
  const totalAktif = records.filter((r) => r.status === "Aktif").length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-gray-900 font-semibold text-lg">Karyawan</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {records.length} total · {totalAktif} aktif
          </p>
        </div>
        <button
          onClick={() => setModal({ type: "add" })}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          <Plus size={15} /> Tambah Karyawan
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-52 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama, ID, jabatan…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white text-gray-700 placeholder-gray-400 transition"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {(["All", "Aktif", "Cuti", "Nonaktif", "Dijadwalkan"] as const).map(
            (s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 text-xs rounded-lg font-medium transition-colors duration-150 whitespace-nowrap ${
                  statusFilter === s
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {s === "All" ? "Semua" : s}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="border-b border-gray-100 bg-gray-50/60">
              <tr>
                <th
                  className={`${thCls} cursor-pointer hover:text-gray-600`}
                  onClick={() => handleSort("employeeId")}
                >
                  ID <SortIcon col="employeeId" />
                </th>
                <th
                  className={`${thCls} cursor-pointer hover:text-gray-600`}
                  onClick={() => handleSort("name")}
                >
                  Nama <SortIcon col="name" />
                </th>
                <th
                  className={`${thCls} cursor-pointer hover:text-gray-600`}
                  onClick={() => handleSort("department")}
                >
                  Departemen <SortIcon col="department" />
                </th>
                <th
                  className={`${thCls} cursor-pointer hover:text-gray-600`}
                  onClick={() => handleSort("role")}
                >
                  Jabatan <SortIcon col="role" />
                </th>
                <th
                  className={`${thCls} cursor-pointer hover:text-gray-600`}
                  onClick={() => handleSort("status")}
                >
                  Status <SortIcon col="status" />
                </th>
                <th className={thCls}>Akses</th>
                <th className={`${thCls} text-right`}>Aksi</th>
              </tr>
            </thead>

            {isLoading ? (
              <tbody>
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-14 text-gray-400 text-sm"
                  >
                    Memuat data dari database…
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody className="divide-y divide-gray-50">
                {filtered.map((emp, idx) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-blue-50/30 transition-colors duration-100"
                  >
                    <td className="px-5 py-4">
                      <span className="text-xs font-mono text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md">
                        {emp.employeeId}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={emp.name} index={idx} />
                        <div>
                          <p className="text-sm text-gray-800 font-medium leading-tight">
                            {emp.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {emp.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {emp.department}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {emp.role}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={emp.status} />
                    </td>
                    <td className="px-5 py-4">
                      <AuthRoleBadge role={emp.authRole} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() =>
                            setModal({ type: "edit", employee: emp })
                          }
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() =>
                            setModal({ type: "delete", employee: emp })
                          }
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>

        {!isLoading && filtered.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm font-medium">
              Tidak ada karyawan ditemukan
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Coba ubah kata kunci atau filter status.
            </p>
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Menampilkan {filtered.length} dari {records.length} karyawan
            </p>
            <p className="text-xs text-gray-400">
              Diurutkan:{" "}
              <span className="text-gray-500 font-medium">{sortKey}</span> (
              {sortDir})
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal.type === "add" && (
        <Modal
          title="Tambah Karyawan Baru"
          onClose={() => setModal({ type: "none" })}
        >
          <EmployeeForm
            mode="add"
            initial={emptyForm}
            onSave={handleAdd}
            onClose={() => setModal({ type: "none" })}
          />
        </Modal>
      )}

      {modal.type === "edit" && (
        <Modal title="Edit Karyawan" onClose={() => setModal({ type: "none" })}>
          <EmployeeForm
            mode="edit"
            employeeId={modal.employee.employeeId}
            initial={{
              name: modal.employee.name,
              department: modal.employee.department,
              role: modal.employee.role,
              email: modal.employee.email,
              status: modal.employee.status,
              joinDate: modal.employee.joinDate,
              authRole: modal.employee.authRole,
              password: "",

              // Map AI fields from employee record (fallback to defaults if undefined)
              education_level: modal.employee.education_level || "Bachelor",
              country: modal.employee.country || "Indonesia",
              industry: modal.employee.industry || "Technology",
              company_size: modal.employee.company_size || "Mid-size",
              remote_work_type: modal.employee.remote_work_type || "Hybrid",
              primary_ai_tool: modal.employee.primary_ai_tool || "ChatGPT",
              ai_adoption_stage:
                modal.employee.ai_adoption_stage || "Intermediate",
              fear_of_ai_replacement:
                modal.employee.fear_of_ai_replacement || "Low",
              productivity_score: modal.employee.productivity_score ?? 7.5,
              burnout_score: modal.employee.burnout_score ?? 50.0,
              years_experience: modal.employee.years_experience ?? 2.0,
              team_size: modal.employee.team_size ?? 10.0,
              salary_usd_k: modal.employee.salary_usd_k ?? 50.0,
              ai_tools_used_per_day:
                modal.employee.ai_tools_used_per_day ?? 1.0,
              hours_with_ai_assistance_daily:
                modal.employee.hours_with_ai_assistance_daily ?? 2.0,
              ai_replaces_my_tasks_pct:
                modal.employee.ai_replaces_my_tasks_pct ?? 15.0,
              weekly_ai_upskilling_hrs:
                modal.employee.weekly_ai_upskilling_hrs ?? 1.0,
              job_satisfaction_1_5: modal.employee.job_satisfaction_1_5 ?? 3.0,
            }}
            onSave={handleEdit}
            onClose={() => setModal({ type: "none" })}
          />
        </Modal>
      )}

      {modal.type === "delete" && (
        <DeleteDialog
          employee={modal.employee}
          onConfirm={handleDelete}
          onClose={() => setModal({ type: "none" })}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="w-4 h-4 rounded-full bg-emerald-400 flex-shrink-0" />
          {toast}
        </div>
      )}
    </div>
  );
}