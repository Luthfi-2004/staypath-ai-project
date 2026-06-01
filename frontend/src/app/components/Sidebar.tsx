import {
  LayoutDashboard, Users, TrendingUp, Settings,
  Activity, X, Calendar, Clock, Folder, CheckSquare
} from "lucide-react";

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  role: "hrd" | "employee";
  onClose?: () => void;
}

const HRD_NAV_GROUPS = [
  {
    group: "General",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, badge: null, badgeStyle: "" },
      { id: "ourteams", label: "Our Teams", icon: Users, badge: null, badgeStyle: "" },
      { id: "employees", label: "Employees", icon: Users, badge: null, badgeStyle: "" },
      { id: "attendance", label: "Attendance", icon: Calendar, badge: null, badgeStyle: "" },
      { id: "projects", label: "Projects", icon: Folder, badge: "Soon", badgeStyle: "bg-slate-900/10 text-slate-900" },
    ]
  },
  {
    group: "Others",
    items: [
      { id: "predictions", label: "Predictions", icon: TrendingUp, badge: "AI", badgeStyle: "bg-violet-500/15 text-violet-400" },
      { id: "settings", label: "Settings", icon: Settings, badge: null, badgeStyle: "" },
    ]
  }
];

const KARYAWAN_NAV_GROUPS = [
  {
    group: "General",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, badge: null, badgeStyle: "" },
      { id: "myteam", label: "My Team", icon: Users, badge: null, badgeStyle: "" },
      { id: "clockinout", label: "Clock In/Out", icon: CheckSquare, badge: null, badgeStyle: "" },
      { id: "myattendances", label: "My Attendance", icon: Clock, badge: null, badgeStyle: "" },
      { id: "projects", label: "Projects", icon: Folder, badge: "2", badgeStyle: "bg-slate-900/10 text-slate-900" },
      // { id: "leaverequests", label: "Leave Requests", icon: Calendar, badge: null, badgeStyle: "" },
    ]
  },
  {
    group: "Others",
    items: [
      { id: "settings", label: "Settings", icon: Settings, badge: null, badgeStyle: "" },
    ]
  }
];

export function Sidebar({ activePage, onNavigate, role, onClose }: SidebarProps) {
  return (
    <div className="flex flex-col h-full w-60 bg-slate-900 select-none">

      {/* Logo */}
      <div className="flex items-center justify-between px-5 pt-6 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center flex-shrink-0 shadow-sm shadow-slate-900/50">
            <Activity className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-heading text-white text-sm font-semibold tracking-tight leading-tight">StayPath AI</p>
            <p className="text-slate-500 text-[11px] leading-tight">HR Analytics</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <X size={15} />
          </button>
        )}
      </div>



      {/* Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto">
        <div className="space-y-6">
          {(role === "hrd" ? HRD_NAV_GROUPS : KARYAWAN_NAV_GROUPS).map((g, idx) => (
            <div key={idx}>
              <p className="px-2 mb-2.5 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
                {g.group}
              </p>
              <ul className="space-y-0.5">
                {g.items.map(({ id, label, icon: Icon, badge, badgeStyle }) => {
                  const isActive = activePage === id;
                  return (
                    <li key={id}>
                      <button
                        onClick={() => onNavigate(id)}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                          transition-all duration-150 group
                          ${isActive
                            ? "bg-slate-800 text-white shadow-sm shadow-slate-900/50"
                            : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                          }
                        `}
                      >
                        <Icon
                          size={16}
                          className={`flex-shrink-0 transition-colors ${isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"}`}
                          strokeWidth={isActive ? 2.2 : 1.8}
                        />
                        <span className="flex-1 text-left font-medium font-heading">{label}</span>
                        {badge && (
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${isActive ? "bg-white/20 text-white" : badgeStyle}`}>
                            {badge}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      {/* Footer branding */}
      <div className="px-5 py-4 border-t border-slate-800">
        <p className="text-slate-600 text-[10px] text-center">
          StayPath AI · HR Analytics Platform
        </p>
      </div>

    </div>
  );
}