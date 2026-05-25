import { useState, useId, useEffect } from "react";
import { User, SlidersHorizontal, Check, Mail, Briefcase, UserCircle2, Lock, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

interface ProfileForm {
  fullName: string;
  email:    string;
  role:     string;
}

interface Preferences {
  dailyPulseReminders: boolean;
  highRiskAlerts:      boolean;
}

type SaveState = "idle" | "saving" | "saved";

function Toggle({ id, checked, onChange, label, description }: {
  id: string; checked: boolean; onChange: (v: boolean) => void;
  label: string; description: string;
}) {
  return (
    <label htmlFor={id} className="flex items-center justify-between gap-6 cursor-pointer group">
      <div className="flex-1">
        <p className="text-sm text-gray-800 font-medium group-hover:text-gray-900 transition-colors">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{description}</p>
      </div>
      <div className="relative flex-shrink-0">
        <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
        <div className={`w-11 h-6 rounded-full border transition-all duration-200 ${checked ? "bg-blue-600 border-blue-600" : "bg-gray-100 border-gray-200 group-hover:border-gray-300"}`} />
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`}>
          {checked && <div className="flex items-center justify-center w-full h-full"><Check size={10} className="text-blue-600 stroke-[3]" /></div>}
        </div>
      </div>
    </label>
  );
}

function InputField({ id, label, type = "text", value, placeholder, icon, onChange, hint, readOnly }: {
  id: string; label: string; type?: string; value: string;
  placeholder?: string; icon: React.ReactNode;
  onChange: (v: string) => void; hint?: string; readOnly?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">{icon}</span>
        <input
          id={id} type={type} value={value} readOnly={readOnly}
          onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-3 text-sm text-gray-800 placeholder-gray-300 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 hover:border-gray-300 transition-all duration-150 ${readOnly ? "bg-gray-50 cursor-not-allowed text-gray-400" : ""}`}
        />
      </div>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function Card({ icon, title, description, children }: {
  icon: React.ReactNode; title: string; description: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-7 py-5 border-b border-gray-100 flex items-center gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">{icon}</div>
        <div>
          <p className="text-sm text-gray-900 font-semibold">{title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="px-7 py-6">{children}</div>
    </div>
  );
}

export function SettingsPage() {
  const uid = useId();

  // ── Ambil dari localStorage yang diset saat login ──
  const employeeId   = localStorage.getItem("employee_id")    || "";
  const employeeName = localStorage.getItem("employee_name")  || "";
  const employeeEmail= localStorage.getItem("employee_email") || "";

  const [profile, setProfile] = useState<ProfileForm>({
    fullName: employeeName,
    email:    employeeEmail,
    role:     localStorage.getItem("job_title") || "",
  });

  const [newPassword, setNewPassword]   = useState("");
  const [confirmPass, setConfirmPass]   = useState("");
  const [passError,   setPassError]     = useState("");

  const [prefs, setPrefs] = useState<Preferences>({
    dailyPulseReminders: true,
    highRiskAlerts:      true,
  });

  const [saveState,     setSaveState]     = useState<SaveState>("idle");
  const [savePassState, setSavePassState] = useState<SaveState>("idle");

  const setField = (field: keyof ProfileForm) => (value: string) =>
    setProfile((p) => ({ ...p, [field]: value }));

  const setPref = (key: keyof Preferences) => (checked: boolean) =>
    setPrefs((p) => ({ ...p, [key]: checked }));

  // Simpan nama (update localStorage)
  const handleSave = () => {
    if (saveState !== "idle") return;
    setSaveState("saving");
    // Update localStorage agar nama di topbar ikut berubah
    localStorage.setItem("employee_name", profile.fullName);
    setTimeout(() => {
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    }, 600);
  };

  // Ganti password
  const handleChangePassword = async () => {
    setPassError("");
    if (!newPassword.trim()) { setPassError("Password baru wajib diisi."); return; }
    if (newPassword.length < 6) { setPassError("Password minimal 6 karakter."); return; }
    if (newPassword !== confirmPass) { setPassError("Konfirmasi password tidak cocok."); return; }

    setSavePassState("saving");
    try {
      const res = await fetch(`${API_URL}/api/employees/${employeeId}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      if (!res.ok) throw new Error();
      setNewPassword("");
      setConfirmPass("");
      setSavePassState("saved");
      setTimeout(() => setSavePassState("idle"), 2000);
    } catch {
      setPassError("Gagal mengubah password. Coba lagi.");
      setSavePassState("idle");
    }
  };

  const initials = profile.fullName
    .split(" ").map((w) => w[0] ?? "").join("").slice(0, 2).toUpperCase() || "??";

  return (
    <div className="max-w-2xl space-y-5">

      <div>
        <h1 className="text-gray-900 font-semibold text-lg">Pengaturan</h1>
        <p className="text-gray-400 text-sm mt-0.5">Kelola detail akun dan preferensi notifikasi kamu.</p>
      </div>

      {/* Card 1 — Profil */}
      <Card icon={<User size={17} className="text-blue-600" />} title="Informasi Profil" description="Detail akun kamu">
        <div className="flex items-center gap-4 mb-7 pb-6 border-b border-gray-50">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span className="text-blue-700 font-semibold text-base">{initials}</span>
          </div>
          <div>
            <p className="text-sm text-gray-800 font-medium">{profile.fullName || "Nama Kamu"}</p>
            <p className="text-xs text-gray-400 mt-0.5">{profile.email}</p>
          </div>
        </div>
        <div className="space-y-5">
          <InputField
            id={`${uid}-name`} label="Nama Lengkap" value={profile.fullName}
            placeholder="Nama kamu" icon={<UserCircle2 size={15} />} onChange={setField("fullName")}
          />
          <InputField
            id={`${uid}-email`} label="Email" type="email" value={profile.email}
            placeholder="email@company.com" icon={<Mail size={15} />} onChange={setField("email")}
            hint="Email digunakan untuk login." readOnly
          />
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave} disabled={saveState !== "idle"}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {saveState === "saving" && <Loader2 size={14} className="animate-spin" />}
            {saveState === "saved"  && <Check size={14} />}
            {saveState === "idle"   ? "Simpan Perubahan" : saveState === "saving" ? "Menyimpan…" : "Tersimpan!"}
          </button>
        </div>
      </Card>

      {/* Card 2 — Ganti Password */}
      <Card icon={<Lock size={17} className="text-blue-600" />} title="Ganti Password" description="Perbarui password login kamu">
        <div className="space-y-4">
          <InputField
            id={`${uid}-newpass`} label="Password Baru" type="password"
            value={newPassword} placeholder="Minimal 6 karakter"
            icon={<Lock size={15} />} onChange={setNewPassword}
          />
          <InputField
            id={`${uid}-confirmpass`} label="Konfirmasi Password" type="password"
            value={confirmPass} placeholder="Ulangi password baru"
            icon={<Lock size={15} />} onChange={setConfirmPass}
          />
          {passError && <p className="text-xs text-red-500">{passError}</p>}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleChangePassword} disabled={savePassState !== "idle"}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {savePassState === "saving" && <Loader2 size={14} className="animate-spin" />}
            {savePassState === "saved"  && <Check size={14} />}
            {savePassState === "idle"   ? "Ganti Password" : savePassState === "saving" ? "Menyimpan…" : "Berhasil!"}
          </button>
        </div>
      </Card>

      {/* Card 3 — Preferensi */}
      <Card icon={<SlidersHorizontal size={17} className="text-blue-600" />} title="Preferensi Notifikasi" description="Atur notifikasi yang kamu terima">
        <div className="space-y-6">
          <Toggle
            id={`${uid}-pulse`} checked={prefs.dailyPulseReminders}
            onChange={setPref("dailyPulseReminders")}
            label="Pengingat Daily Pulse"
            description="Terima pengingat harian untuk mengisi check-in mood kamu."
          />
          <div className="border-t border-gray-50" />
          <Toggle
            id={`${uid}-alerts`} checked={prefs.highRiskAlerts}
            onChange={setPref("highRiskAlerts")}
            label="Alert Risiko Tinggi"
            description="Notifikasi saat ada karyawan yang masuk kategori risiko resign tinggi."
          />
        </div>
      </Card>

    </div>
  );
}