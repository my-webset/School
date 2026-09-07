import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import DashboardHome from "./DashboardHome";
import AdmissionsManager from "./AdmissionsManager";
import FormBuilder from "./FormBuilder";
import AIPaperGenerator from "./AIPaperGenerator";
import NoticesManager from "./NoticesManager";
import EventsManager from "./EventsManager";
import GalleryManager from "./GalleryManager";
import SchoolInfoManager from "./SchoolInfoManager";
import SettingsManager from "./SettingsManager";
import { dataService } from "../../services/dataService";
import LOGOS from "../../assets/logos";

interface Props {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: Props) {
  const [section, setSection] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const school = dataService.getSchoolInfo();

  const renderSection = () => {
    switch (section) {
      case "dashboard":
        return <DashboardHome setActiveSection={setSection} />;
      case "admissions":
        return <AdmissionsManager />;
      case "formBuilder":
        return <FormBuilder />;
      case "aiPaper":
        return <AIPaperGenerator />;
      case "notices":
        return <NoticesManager />;
      case "events":
        return <EventsManager />;
      case "gallery":
        return <GalleryManager />;
      case "schoolInfo":
        return <SchoolInfoManager />;
      case "settings":
        return <SettingsManager />;
      default:
        return <DashboardHome setActiveSection={setSection} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--background)" }}>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <div
        className={`
          fixed lg:relative z-50 lg:z-auto h-full transition-transform duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <AdminSidebar
          activeSection={section}
          setActiveSection={(s) => {
            setSection(s);
            setMobileOpen(false);
          }}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          onLogout={onLogout}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between flex-shrink-0 z-10 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>{school.name}</span>
              <span>/</span>
              <span className="font-semibold text-slate-800 capitalize">
                {section.replace(/([A-Z])/g, " $1").trim()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 hidden md:block">
              {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
            </div>

            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <img
                src={LOGOS.schoolLogo}
                alt="Admin Logo"
                className="w-8 h-8 rounded-full object-contain p-0.5 border border-slate-200 bg-white"
              />
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-slate-800 leading-tight">Administrator</div>
                <div className="text-[10px] text-slate-400 font-medium">Master Access</div>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}
