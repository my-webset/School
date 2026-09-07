import { useState, useEffect } from "react";
import { dataService } from "../../services/dataService";
import LOGOS from "../../assets/logos";

interface Props {
  currentPage: string;
  setCurrentPage: (p: string) => void;
  setView: (v: string) => void;
}

export default function PublicHeader({ currentPage, setCurrentPage, setView }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [school, setSchool] = useState(dataService.getSchoolInfo());

  useEffect(() => {
    return dataService.subscribe(() => {
      setSchool(dataService.getSchoolInfo());
    });
  }, []);

  const navLinks = [
    { id: "home", label: "Home" },
    { id: "about", label: "About Us" },
    { id: "academics", label: "Academics" },
    { id: "facilities", label: "Facilities" },
    { id: "gallery", label: "Gallery" },
    { id: "notices", label: "Notices" },
    { id: "events", label: "Events" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
      {/* Top Banner Bar */}
      <div style={{ background: "var(--primary)" }} className="text-white text-xs py-2 px-6 hidden md:flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5 font-medium">
            <span>📞</span> {school.phone}
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span>✉️</span> {school.email}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span>Est. {school.established}</span>
          <span className="opacity-40">|</span>
          <span>{school.affiliationNo}</span>
          <span className="opacity-40">|</span>
          <span className="bg-white/10 px-2 py-0.5 rounded text-[11px] font-semibold">CBSE Affiliated</span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex items-center justify-between px-6 py-3.5 max-w-7xl mx-auto">
        {/* School Crest & Name */}
        <button
          onClick={() => setCurrentPage("home")}
          className="flex items-center gap-3.5 text-left group"
        >
          <img
            src={LOGOS.schoolLogo}
            alt={school.name}
            className="w-11 h-11 object-contain p-0.5 rounded-xl border border-slate-100 bg-white shadow-xs group-hover:scale-105 transition-transform"
          />
          <div>
            <div
              className="font-bold text-slate-900 leading-tight text-base sm:text-lg"
              style={{ fontFamily: "DM Serif Display, serif" }}
            >
              {school.name}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              {school.board} · Est. {school.established}
            </div>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = currentPage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setCurrentPage(link.id)}
                className={`px-3 py-1.5 text-xs rounded-xl font-semibold transition-all ${
                  isActive
                    ? "text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
                style={isActive ? { background: "var(--primary)" } : {}}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Action CTAs */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCurrentPage("admission")}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-900 shadow-sm transition-all hover:scale-105 hover:opacity-95"
            style={{ background: "var(--accent)" }}
          >
            <span>📝</span> Apply for Admission
          </button>
          <button
            onClick={() => setView("adminLogin")}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-xs"
          >
            Admin Portal
          </button>
          <button
            className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-6 py-4 flex flex-col gap-1.5 shadow-lg">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                setCurrentPage(link.id);
                setMenuOpen(false);
              }}
              className="text-left px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => {
              setCurrentPage("admission");
              setMenuOpen(false);
            }}
            className="mt-2 py-3 rounded-xl text-xs font-bold text-slate-900 text-center shadow-xs"
            style={{ background: "var(--accent)" }}
          >
            Apply for Admission 2026-27
          </button>
        </div>
      )}
    </header>
  );
}
