import { useState, useId } from "react";
import { User, SlidersHorizontal, Check, Mail, UserCircle2, Lock, Loader2, Eye, EyeOff } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

type SaveState = "idle" | "saving" | "saved";

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ id, checked, onChange, label, description }: {
  id: string; checked: boolean; onChange: (v: boolean) => void;
  label: string; description: string;
}) {
  return (
    <label htmlFor={id} className="flex items-start justify-between gap-8 cursor-pointer group py-1">
      <div className="flex-1">
        <p className="text-sm text-gray-800 font-medium leading-snug group-hover:text-gray-900 transition-colors">
          {label}
        </p>
        <p className="text-sm text-gray-400 mt-1 leading-relaxed">{description}</p>
      </div>
      <div className="relative flex-shrink-0 mt-0.5">
        <input id={id} type="checkbox" checked={checked}
          onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
        <div className={`w-12 h-6 rounded-full border-2 transition-all duration-200 ${
          checked ? "bg-blue-600 border-blue-600" : "bg-gray-100 border-gray-200 group-hover:border-gray-300"
        }`} />
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md
          transition-transform duration-200 ease-in-out ${checked ? "translate-x-6" : "translate-x-0"}`}>
          {checked && (
            <div className="flex items-center justify-center w-full h-full">
              <Check size={10} className="text-blue-600 stroke-[3]" />
            </div>
          )}
        </div>
      </div>
    </label>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({ label, hint, children }: {
  label: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

const inputCls = (readOnly?: boolean) =>
  `w-full px-4 py-3 text-sm rounded-xl border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 ${
    readOnly
      ? "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed"
      : "bg-white border-gray-200 text-gray-800 hover:border-gray-300"
  }`;

// ─── Section card ─────────────────────────────────────────────────────────────

function Section({ title, description, icon, children }: {
  title: string; description: string;
  icon: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-100 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-base font-semibold text-gray-900">{title}</p>
          <p className="text-sm text-gray-400 mt-0.5">{description}</p>
        </div>
      </div>
      {/* Body */}
      <div className="px-8 py-7">{children}</div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function SettingsPage() {
  const uid = useId();

  const employeeId    = localStorage.getItem("employee_id")    || "";
  const employeeName  = localStorage.getItem("employee_name")  || "";
  const employeeEmail = localStorage.getItem("employee_email") || "";

  const [name, setName] = useState(employeeName);

  const [newPass, setNewPass]     = useState("");
  const [confPass, setConfPass]   = useState("");
  const [showNew, setShowNew]     = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [passError, setPassError] = useState("");

  const [pulseReminder, setPulseReminder] = useState(true);
  const [riskAlerts,    setRiskAlerts]    = useState(true);

  const [saveProfile, setSaveProfile] = useState<SaveState>("idle");
  const [savePass,    setSavePass]    = useState<SaveState>("idle");

  const initials = name.split(" ").map((w) => w[0] ?? "").join("").slice(0, 2).toUpperCase() || "??";

  const handleSaveProfile = () => {
    if (saveProfile !== "idle") return;
    setSaveProfile("saving");
    localStorage.setItem("employee_name", name);
    setTimeout(() => {
      setSaveProfile("saved");
      setTimeout(() => setSaveProfile("idle"), 2000);
    }, 600);
  };

  const handleSavePass = async () => {
    setPassError("");
    if (!newPass.trim())        { setPassError("Password baru wajib diisi."); return; }
    if (newPass.length < 6)     { setPassError("Password minimal 6 karakter."); return; }
    if (newPass !== confPass)   { setPassError("Konfirmasi password tidak cocok."); return; }

    setSavePass("saving");
    try {
      const res = await fetch(`${API_URL}/api/employees/${employeeId}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPass }),
      });
      if (!res.ok) throw new Error();
      setNewPass(""); setConfPass("");
      setSavePass("saved");
      setTimeout(() => setSavePass("idle"), 2500);
    } catch {
      setPassError("Gagal menyimpan password. Coba lagi.");
      setSavePass("idle");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Page title */}
      <div className="pb-2">
        <h1 className="text-gray-900 font-semibold text-xl">Pengaturan</h1>
        <p className="text-gray-400 text-sm mt-1">Kelola akun dan preferensi notifikasi kamu.</p>
      </div>

      {/* ── Profil ── */}
      <Section
        icon={<User size={18} className="text-blue-600" />}
        title="Informasi Profil"
        description="Nama tampilan dan detail akun kamu"
      >
        {/* Avatar row */}
        <div className="flex items-center gap-5 mb-8 pb-7 border-b border-gray-100">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-blue-700 font-bold text-lg">{initials}</span>
          </div>
          <div>
            <p className="text-base font-semibold text-gray-800">{name || "Nama Kamu"}</p>
            <p className="text-sm text-gray-400 mt-0.5">{employeeEmail}</p>
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-5">
          <Field label="Nama Lengkap">
            <div className="relative">
              <UserCircle2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              <input
                id={`${uid}-name`} type="text" value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap kamu"
                className={`${inputCls()} pl-10`}
              />
            </div>
          </Field>

          <Field label="Email Login" hint="Email tidak dapat diubah. Hubungi HR jika perlu.">
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              <input
                id={`${uid}-email`} type="email" value={employeeEmail}
                readOnly className={`${inputCls(true)} pl-10`}
              />
            </div>
          </Field>
        </div>

        <div className="mt-7 flex justify-end">
          <button
            onClick={handleSaveProfile}
            disabled={saveProfile !== "idle"}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            {saveProfile === "saving" && <Loader2 size={15} className="animate-spin" />}
            {saveProfile === "saved"  && <Check size={15} />}
            {saveProfile === "idle" ? "Simpan" : saveProfile === "saving" ? "Menyimpan…" : "Tersimpan!"}
          </button>
        </div>
      </Section>

      {/* ── Ganti Password ── */}
      <Section
        icon={<Lock size={18} className="text-blue-600" />}
        title="Ganti Password"
        description="Perbarui password login kamu"
      >
        <div className="space-y-5">
          <Field label="Password Baru">
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              <input
                id={`${uid}-newpass`}
                type={showNew ? "text" : "password"}
                value={newPass}
                onChange={(e) => { setNewPass(e.target.value); setPassError(""); }}
                placeholder="Minimal 6 karakter"
                className={`${inputCls()} pl-10 pr-10`}
              />
              <button type="button" onClick={() => setShowNew((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>

          <Field label="Konfirmasi Password">
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              <input
                id={`${uid}-confpass`}
                type={showConf ? "text" : "password"}
                value={confPass}
                onChange={(e) => { setConfPass(e.target.value); setPassError(""); }}
                placeholder="Ulangi password baru"
                className={`${inputCls()} pl-10 pr-10`}
              />
              <button type="button" onClick={() => setShowConf((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>

          {passError && (
            <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-lg border border-red-100">
              {passError}
            </p>
          )}
        </div>

        <div className="mt-7 flex justify-end">
          <button
            onClick={handleSavePass}
            disabled={savePass !== "idle"}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            {savePass === "saving" && <Loader2 size={15} className="animate-spin" />}
            {savePass === "saved"  && <Check size={15} />}
            {savePass === "idle" ? "Ganti Password" : savePass === "saving" ? "Menyimpan…" : "Berhasil!"}
          </button>
        </div>
      </Section>

      {/* ── Preferensi ── */}
      <Section
        icon={<SlidersHorizontal size={18} className="text-blue-600" />}
        title="Preferensi Notifikasi"
        description="Atur notifikasi yang kamu terima"
      >
        <div className="space-y-0 divide-y divide-gray-100">
          <div className="pb-6">
            <Toggle
              id={`${uid}-pulse`}
              checked={pulseReminder}
              onChange={setPulseReminder}
              label="Pengingat Daily Pulse"
              description="Terima pengingat harian untuk mengisi check-in mood kamu setiap pagi."
            />
          </div>
          <div className="pt-6">
            <Toggle
              id={`${uid}-alerts`}
              checked={riskAlerts}
              onChange={setRiskAlerts}
              label="Alert Risiko Tinggi"
              description="Dapatkan notifikasi saat ada karyawan yang masuk kategori risiko resign tinggi."
            />
          </div>
        </div>
      </Section>

    </div>
  );
}