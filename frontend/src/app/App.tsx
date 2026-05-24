import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Sidebar } from "./components/Sidebar";
import { DashboardPage } from "./components/DashboardPage";
import { EmployeesPage } from "./components/EmployeesPage";
import { Predictions } from "./components/Predictions";
import { SettingsPage } from "./components/SettingsPage";
import { DailyPulse } from "./components/DailyPulse";
import {
  Bell, Search, Menu, LayoutDashboard, Users,
  TrendingUp, Settings, HeartPulse, Cpu, Calendar, LogOut,
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
  dashboard:   { title: "Dashboard",   subtitle: "Selamat datang",                    icon: LayoutDashboard },
  employees:   { title: "Karyawan",    subtitle: "Kelola data karyawan",              icon: Users           },
  predictions: { title: "Prediksi",    subtitle: "Forecasting attrisi berbasis AI",   icon: TrendingUp      },
  dailypulse:  { title: "Daily Pulse", subtitle: "Check-in harian kamu",              icon: HeartPulse      },
  settings:    { title: "Pengaturan",  subtitle: "Akun & preferensi",                 icon: Settings        },
};

// Halaman yang hanya boleh diakses HRD
const HRD_ONLY_PAGES: PageId[] = ["dashboard", "employees", "predictions", "settings"];

function todayLabel() {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
}

// ─── Topbar meta ──────────────────────────────────────────────────────────────

function TopbarMeta({ page }: { page: PageId }) {
  if (page === "dashboard") {
    return (
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100">
        <Calendar size={13} className="text-gray-400" />
        <span className="text-xs text-gray-500 font-medium">{todayLabel()}</span>
      </div>
    );
  }
  if (page === "predictions") {
    return (
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50 border border-violet-100">
        <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
        <Cpu size={12} className="text-violet-500" />
        <span className="text-xs text-violet-600 font-medium">Model aktif</span>
      </div>
    );
  }
  if (page === "dailypulse") {
    return (
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100">
        <HeartPulse size={13} className="text-emerald-500" />
        <span className="text-xs text-emerald-600 font-medium">Check-in terbuka · {todayLabel()}</span>
      </div>
    );
  }
  return null;
}

// ─── Notification panel ───────────────────────────────────────────────────────

const NOTIFICATIONS = [
  { id: 1, text: "Satu karyawan melebihi 90% risiko attrisi",    time: "2m lalu",  dot: "bg-red-500"    },
  { id: 2, text: "4 karyawan sudah submit Daily Pulse",          time: "18m lalu", dot: "bg-blue-500"   },
  { id: 3, text: "AI model selesai dijalankan ulang",            time: "1j lalu",  dot: "bg-violet-500" },
];

function NotificationPanel({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-notification-panel]")) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      data-notification-panel
      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-gray-100 shadow-xl z-30 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-150"
    >
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-800">Notifikasi</p>
        <span className="text-xs text-blue-600 font-medium cursor-pointer hover:text-blue-700">Tandai semua dibaca</span>
      </div>
      <ul className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
        {NOTIFICATIONS.map((n) => (
          <li key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
            <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${n.dot}`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-700 leading-snug">{n.text}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{n.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const navigate    = useNavigate();
  const location    = useLocation();
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // ── Auth state dari localStorage ──
  const role:         Role   = localStorage.getItem("role") as Role;
  const employeeName: string = localStorage.getItem("employee_name") || "User";

  // Redirect ke login kalau belum auth
  useEffect(() => {
    if (!role) {
      navigate("/login");
    }
  }, [role, navigate]);

  const getPageFromPath = (): PageId => {
    const path = location.pathname;
    if (path.includes("/employees"))  return "employees";
    if (path.includes("/predictions")) return "predictions";
    if (path.includes("/dailypulse"))  return "dailypulse";
    if (path.includes("/settings"))    return "settings";
    return "dashboard";
  };

  const activePage = getPageFromPath();

  const handleNavigate = (page: string) => {
    // Karyawan hanya boleh ke dailypulse
    if (role === "karyawan" && page !== "dailypulse") return;
    navigate(page === "dashboard" ? "/dashboard" : `/dashboard/${page}`);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("employee_id");
    localStorage.removeItem("employee_name");
    navigate("/login");
  };

  const meta = PAGE_META[activePage];
  const Icon = meta.icon;

  if (!role) return null; // tunggu redirect

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ── Sidebar desktop ── */}
      <aside className="hidden lg:flex flex-shrink-0">
        <Sidebar
          activePage={activePage}
          onNavigate={handleNavigate}
          role={role}
          employeeName={employeeName}
          onLogout={handleLogout}
        />
      </aside>

      {/* ── Sidebar mobile overlay ── */}
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

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="flex-shrink-0 h-14 bg-white border-b border-gray-100 flex items-center px-4 gap-3 relative">
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

          <TopbarMeta page={activePage} />

          {/* Search (HRD only) */}
          {role === "hrd" && (
            <div className="relative">
              {searchOpen ? (
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => { setSearchOpen(false); setSearchQuery(""); }}
                  placeholder="Cari…"
                  className="w-44 pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <Search size={16} />
                </button>
              )}
            </div>
          )}

          {/* Notif (HRD only) */}
          {role === "hrd" && (
            <div className="relative">
              <button
                onClick={() => setNotifOpen((o) => !o)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors relative"
              >
                <Bell size={16} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
              </button>
              {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Keluar"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            {/* Karyawan hanya bisa akses dailypulse */}
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