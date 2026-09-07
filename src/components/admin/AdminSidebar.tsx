import { dataService } from "../../services/dataService";
import LOGOS from "../../assets/logos";

interface Props {
  activeSection: string;
  setActiveSection: (s: string) => void;
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
  onLogout: () => void;
}

const MENU_ITEMS = [
  { id: "dashboard", label: "Dashboard", iconUrl: LOGOS.dashboard },
  { id: "admissions", label: "Admission Forms", iconUrl: LOGOS.admissions },
  { id: "formBuilder", label: "Form Builder", iconUrl: LOGOS.formBuilder },
  { id: "aiPaper", label: "AI Paper Generator", iconUrl: LOGOS.aiPaper },
  { id: "notices", label: "Notices", iconUrl: LOGOS.notices },
  { id: "events", label: "Events", iconUrl: LOGOS.events },
  { id: "gallery", label: "Gallery", iconUrl: LOGOS.gallery },
  { id: "schoolInfo", label: "School Information", iconUrl: LOGOS.schoolInfo },
  { id: "settings", label: "Website Settings", iconUrl: LOGOS.settings },
];

export default function AdminSidebar({
  activeSection,
  setActiveSection,
  collapsed,
  setCollapsed,
  onLogout,
}: Props) {
  const school = dataService.getSchoolInfo();

  return (
    <aside
      className="flex flex-col h-full flex-shrink-0 transition-all duration-300"
      style={{
        width: collapsed ? 72 : 256,
        background: "var(--sidebar)",
        borderRight: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* School Brand Header */}
      <div
        className="flex items-center gap-3 px-4 py-4 border-b"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <img
          src={LOGOS.schoolLogo}
          alt={school.name}
          className="w-10 h-10 object-contain rounded-lg flex-shrink-0 bg-white/10 p-1"
        />
        {!collapsed && (
          <div className="overflow-hidden flex-1">
            <div
              className="text-white text-xs font-bold leading-tight truncate"
              style={{ fontFamily: "DM Serif Display, serif" }}
            >
              {school.name}
            </div>
            <div className="text-blue-300 text-[11px] font-medium tracking-wide">
              Admin Portal
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-blue-300 hover:text-white p-1 rounded-md hover:bg-white/10 ml-auto transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {MENU_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left ${
                isActive
                  ? "text-white font-semibold shadow-inner"
                  : "text-blue-200/80 hover:text-white hover:bg-white/10"
              }`}
              style={isActive ? { background: "rgba(255,255,255,0.14)" } : {}}
            >
              <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                <img
                  src={item.iconUrl}
                  alt={item.label}
                  className={`w-5 h-5 object-contain transition-transform ${isActive ? "scale-110" : "opacity-90"}`}
                />
              </div>
              {!collapsed && <span className="truncate text-xs">{item.label}</span>}
              {!collapsed && isActive && (
                <span
                  className="ml-auto w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: "var(--accent)" }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div className="p-2 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-300 hover:text-red-100 hover:bg-red-500/20 transition-all text-left"
          title={collapsed ? "Logout" : undefined}
        >
          <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
            <img src={LOGOS.logout} alt="Logout" className="w-5 h-5 object-contain" />
          </div>
          {!collapsed && <span className="text-xs font-semibold">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
