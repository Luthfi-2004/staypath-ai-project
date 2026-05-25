import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import { Sidebar } from "./components/Sidebar";
import { DashboardPage } from "./components/DashboardPage";
import { EmployeesPage } from "./components/EmployeesPage";
import { Predictions } from "./components/Predictions";
import { SettingsPage } from "./components/SettingsPage";
import { DailyPulse } from "./components/DailyPulse";
import {
  Menu, LayoutDashboard, Users, TrendingUp,
  Settings, HeartPulse, Cpu, Calendar, LogOut, ChevronDown,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type PageId = "dashboard" | "employees" | "predictions" | "dailypulse" | "settings";
type Role   = "hrd" | "karyawan" | null;

interface PageMeta {
  title:    string;
  subtitle: string;
  icon:     React.ElementType;
}

const PAGE_META: Record<PageId, PageMeta> = {
  dashboard:   { title: "Dashboard",   subtitle: "Selamat datang",                  icon: LayoutDashboard },
  employees:   { title: "Karyawan",    subtitle: "Kelola data karyawan",            icon: Users           },
  predictions: { title: "Prediksi",    subtitle: "Forecasting attrisi berbasis AI", icon: TrendingUp      },
  dailypulse:  { title: "Daily Pulse", subtitle: "Check-in harian kamu",            icon: HeartPulse      },
  settings:    { title: "Pengaturan",  subtitle: "Akun & preferensi",               icon: Settings        },
};

const HRD_ONLY: PageId[] = ["dashboard", "employees", "predictions", "settings"];

function todayLabel() {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
}

// ─── Topbar badge ─────────────────────────────────────────────────────────────

function TopbarMeta({ page }: { page: PageId }) {
  if (page === "dashboard") return (
    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100">
      <Calendar size={13} className="text-gray-400" />
      <span className="text-xs text-gray-500 font-medium">{todayLabel()}</span>
    </div>
  );
  if (page === "predictions") return (
    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50 border border-violet-100">
      <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
      <Cpu size={12} className="text-violet-500" />
      <span className="text-xs text-violet-600 font-medium">Model aktif</span>
    </div>
  );
  if (page === "dailypulse") return (
    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100">
      <HeartPulse size={13} className="text-emerald-500" />
      <span className="text-xs text-emerald-600 font-medium">Check-in terbuka · {todayLabel()}</span>
    </div>
  );
  return null;
}

// ─── User dropdown (menggantikan tombol logout terpisah) ──────────────────────

function UserDropdown({ name, role, onLogout }: {
  name: string; role: Role; onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = name.split(" ").map((w) => w[0] ?? "").join("").slice(0, 2).toUpperCase() || "??";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
      >
        {/* Avatar */}
        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <span className="text-blue-700 text-[11px] font-bold">{initials}</span>
        </div>
        {/* Name + role — hidden on small screens */}
        <div className="hidden md:block text-left">
          <p className="text-xs font-semibold text-gray-800 leading-tight">{name}</p>
          <p className="text-[10px] text-gray-400 leading-tight">
            {role === "hrd" ? "HRD" : "Karyawan"}
          </p>
        </div>
        <ChevronDown size={13} className={`text-gray-400 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-gray-100 shadow-xl z-30 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-150">
          {/* User info */}
          <div className="px-4 py-3.5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-700 text-xs font-bold">{initials}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
                <p className="text-xs text-gray-400 truncate">
                  {role === "hrd" ? "HR Department" : "Karyawan"}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-1.5">
            <button
              onClick={() => { onLogout(); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors font-medium"
            >
              <LogOut size={15} />
              Keluar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole]             = useState<Role>(localStorage.getItem("role") as Role);
  const [employeeName, setEmpName]  = useState(localStorage.getItem("employee_name") || "User");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!role) navigate("/login");
  }, [role, navigate]);

  const getPageFromPath = (): PageId => {
    const path = location.pathname;
    if (path.includes("/employees"))   return "employees";
    if (path.includes("/predictions")) return "predictions";
    if (path.includes("/dailypulse"))  return "dailypulse";
    if (path.includes("/settings"))    return "settings";
    return "dashboard";
  };

  const activePage = getPageFromPath();

  const handleNavigate = (page: string) => {
    if (role === "karyawan" && HRD_ONLY.includes(page as PageId)) return;
    navigate(page === "dashboard" ? "/dashboard" : `/dashboard/${page}`);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("employee_id");
    localStorage.removeItem("employee_name");
    localStorage.removeItem("employee_email");
    setRole(null);
    setEmpName("User");
    navigate("/login");
  };

  if (!role) return null;

  const meta = PAGE_META[activePage];
  const Icon = meta.icon;

  if (role === "karyawan" && HRD_ONLY.includes(activePage)) {
    navigate("/dashboard/dailypulse");
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-shrink-0">
        <Sidebar
          activePage={activePage}
          onNavigate={handleNavigate}
          role={role}
          employeeName={employeeName}
          onLogout={handleLogout}
        />
      </aside>

      {/* Sidebar mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-10 flex-shrink-0">
            <Sidebar
              activePage={activePage}
              onNavigate={handleNavigate}
              role={role}
              employeeName={employeeName}
              onLogout={handleLogout}
              onClose={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="flex-shrink-0 h-14 bg-white border-b border-gray-100 flex items-center px-4 gap-3">

          {/* Hamburger mobile */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Menu size={18} />
          </button>

          {/* Page title */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Icon size={14} className="text-blue-600" />
            </div>
            <div className="min-w-0">
              <h1 className="text-gray-900 text-sm font-semibold leading-tight truncate">{meta.title}</h1>
              <p className="text-gray-400 text-[11px] leading-tight hidden sm:block">{meta.subtitle}</p>
            </div>
          </div>

          {/* Badge kontekstual */}
          <TopbarMeta page={activePage} />

          {/* User dropdown — satu-satunya aksi di kanan atas */}
          <UserDropdown name={employeeName} role={role} onLogout={handleLogout} />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            {role === "karyawan" ? (
              <DailyPulse />
            ) : (
              <>
                {activePage === "dashboard"   && <DashboardPage />}
                {activePage === "employees"   && <EmployeesPage />}
                {activePage === "predictions" && <Predictions />}
                {activePage === "dailypulse"  && <DailyPulse />}
                {activePage === "settings"    && <SettingsPage />}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}