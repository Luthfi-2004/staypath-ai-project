import { useState, useId } from "react";
import { User, SlidersHorizontal, Check, Mail, Briefcase, UserCircle2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileForm {
  fullName: string;
  email: string;
  role: string;
}

interface Preferences {
  dailyPulseReminders: boolean;
  highRiskAlerts: boolean;
}

// ─── Save state ───────────────────────────────────────────────────────────────

type SaveState = "idle" | "saving" | "saved";

// ─── Toggle (native checkbox styled with Tailwind peer) ───────────────────────

interface ToggleProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
}

function Toggle({ id, checked, onChange, label, description }: ToggleProps) {
  return (
    <label
      htmlFor={id}
      className="flex items-center justify-between gap-6 cursor-pointer group"
    >
      <div className="flex-1">
        <p className="text-sm text-gray-800 font-medium group-hover:text-gray-900 transition-colors">
          {label}
        </p>
        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{description}</p>
      </div>

      {/* Native checkbox hidden; track + thumb rendered below */}
      <div className="relative flex-shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        {/* Track */}
        <div
          className={`
            w-11 h-6 rounded-full border transition-all duration-200
            ${checked
              ? "bg-blue-600 border-blue-600"
              : "bg-gray-100 border-gray-200 group-hover:border-gray-300"
            }
          `}
        />
        {/* Thumb */}
        <div
          className={`
            absolute top-0.5 left-0.5
            w-5 h-5 rounded-full bg-white shadow-sm
            transition-transform duration-200 ease-in-out
            ${checked ? "translate-x-5" : "translate-x-0"}
          `}
        >
          {/* Inner check mark when active */}
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

// ─── Input field ──────────────────────────────────────────────────────────────

interface InputFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  placeholder?: string;
  icon: React.ReactNode;
  onChange: (v: string) => void;
  hint?: string;
}

function InputField({
  id, label, type = "text", value, placeholder, icon, onChange, hint,
}: InputFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">
          {icon}
        </span>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="
            w-full pl-10 pr-4 py-3
            text-sm text-gray-800 placeholder-gray-300
            bg-white border border-gray-200 rounded-xl
            focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400
            hover:border-gray-300
            transition-all duration-150
          "
        />
      </div>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

// ─── Card wrapper ─────────────────────────────────────────────────────────────

function Card({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="px-7 py-5 border-b border-gray-100 flex items-center gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-900 font-semibold">{title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        </div>
      </div>
      {/* Card body */}
      <div className="px-7 py-6">{children}</div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SettingsPage() {
  const uid = useId();

  const [profile, setProfile] = useState<ProfileForm>({
    fullName: "Jane Doe",
    email:    "jane.doe@company.com",
    role:     "HR Analytics Manager",
  });

  const [prefs, setPrefs] = useState<Preferences>({
    dailyPulseReminders: true,
    highRiskAlerts:      true,
  });

  const [saveState, setSaveState] = useState<SaveState>("idle");

  const setField = (field: keyof ProfileForm) => (value: string) =>
    setProfile((p) => ({ ...p, [field]: value }));

  const setPref = (key: keyof Preferences) => (checked: boolean) =>
    setPrefs((p) => ({ ...p, [key]: checked }));

  const handleSave = () => {
    if (saveState !== "idle") return;
    setSaveState("saving");
    setTimeout(() => {
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    }, 900);
  };

  // Derive initials from name
  const initials = profile.fullName
    .split(" ")
    .map((w) => w[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase() || "JD";

  return (
    <div className="max-w-2xl space-y-5">

      {/* ── Page title ── */}
      <div>
        <h1 className="text-gray-900 font-semibold text-lg">Settings</h1>
        <p className="text-gray-400 text-sm mt-0.5">
          Manage your account details and notification preferences.
        </p>
      </div>

      {/* ── Card 1 — Profile Information ── */}
      <Card
        icon={<User size={17} className="text-blue-600" />}
        title="Profile Information"
        description="Update your personal details and display name"
      >
        {/* Avatar row */}
        <div className="flex items-center gap-4 mb-7 pb-6 border-b border-gray-50">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span className="text-blue-700 font-semibold text-base">{initials}</span>
          </div>
          <div>
            <p className="text-sm text-gray-800 font-medium">
              {profile.fullName || "Your Name"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {profile.role || "Your Role"}
            </p>
          </div>
          <button className="ml-auto px-3.5 py-1.5 text-xs font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors">
            Change photo
          </button>
        </div>

        {/* Fields */}
        <div className="space-y-5">
          <InputField
            id={`${uid}-name`}
            label="Full Name"
            value={profile.fullName}
            placeholder="Jane Doe"
            icon={<UserCircle2 size={15} />}
            onChange={setField("fullName")}
          />
          <InputField
            id={`${uid}-email`}
            label="Email Address"
            type="email"
            value={profile.email}
            placeholder="jane@company.com"
            icon={<Mail size={15} />}
            onChange={setField("email")}
            hint="Used for notifications and account recovery."
          />
          <InputField
            id={`${uid}-role`}
            label="Role"
            value={profile.role}
            placeholder="e.g. HR Analytics Manager"
            icon={<Briefcase size={15} />}
            onChange={setField("role")}
            hint="Displayed across your dashboard and reports."
          />
        </div>
      </Card>

      {/* ── Card 2 — Preferences ── */}
      <Card
        icon={<SlidersHorizontal size={17} className="text-blue-600" />}
        title="Preferences"
        description="Choose which notifications and alerts you receive"
      >
        <div className="space-y-0 divide-y divide-gray-50">
          {/* Toggle 1 */}
          <div className="pb-5">
            <Toggle
              id={`${uid}-pulse`}
              checked={prefs.dailyPulseReminders}
              onChange={setPref("dailyPulseReminders")}
              label="Receive Daily Pulse Reminders"
              description="Get a daily prompt to submit your mood and workload check-in before end of day."
            />
          </div>

          {/* Toggle 2 */}
          <div className="pt-5">
            <Toggle
              id={`${uid}-alerts`}
              checked={prefs.highRiskAlerts}
              onChange={setPref("highRiskAlerts")}
              label="Receive High-Risk Alerts"
              description="Be notified immediately when an employee's resignation probability crosses 70%."
            />
          </div>
        </div>
      </Card>

      {/* ── Save button ── */}
      <div className="flex items-center justify-between pt-1">
        <p className="text-xs text-gray-400">
          {saveState === "saved"
            ? "All changes saved."
            : "Changes are not saved until you click Save."}
        </p>
        <button
          onClick={handleSave}
          disabled={saveState !== "idle"}
          className={`
            inline-flex items-center gap-2 px-5 py-2.5
            text-sm font-medium rounded-xl
            transition-all duration-150 min-w-[148px] justify-center
            ${saveState === "saved"
              ? "bg-emerald-500 text-white border border-emerald-500 cursor-default"
              : saveState === "saving"
              ? "bg-blue-400 text-white border border-blue-400 cursor-default"
              : "bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 shadow-sm hover:shadow-md active:scale-[0.98]"
            }
          `}
        >
          {saveState === "saving" && (
            <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
          )}
          {saveState === "saved" && <Check size={14} className="stroke-[2.5]" />}
          {saveState === "saving" ? "Saving…"
            : saveState === "saved" ? "Saved!"
            : "Save Changes"}
        </button>
      </div>

    </div>
  );
}
