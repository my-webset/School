import { useState, useEffect } from "react";
import { dataService } from "../../services/dataService";
import { SchoolInfo } from "../../types";
import LOGOS from "../../assets/logos";

export default function SchoolInfoManager() {
  const [info, setInfo] = useState<SchoolInfo>(dataService.getSchoolInfo());
  const [tab, setTab] = useState("general");
  const [toast, setToast] = useState("");

  useEffect(() => {
    setInfo(dataService.getSchoolInfo());
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    dataService.saveSchoolInfo(info);
    showToast("School Information saved & updated across the website!");
  };

  return (
    <div className="p-6 space-y-5">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-800 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2">
          <span>🏫</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "DM Serif Display, serif" }}>
            School Profile & Branding Information
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Update official school details, contact info, principal desk, and social links displayed site-wide.
          </p>
        </div>
        <button
          onClick={() => handleSave()}
          className="px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-95 transition-opacity"
          style={{ background: "var(--primary)" }}
        >
          Save & Publish Changes
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sub-tabs */}
        <div className="lg:w-56 flex-shrink-0 bg-white rounded-2xl border border-slate-100 shadow-sm p-2 space-y-1 h-fit">
          {[
            { id: "general", label: "General & Affiliation", icon: "🏫" },
            { id: "principal", label: "Principal's Desk", icon: "👩‍💼" },
            { id: "contact", label: "Contact & Address", icon: "📍" },
            { id: "socials", label: "Social Media Links", icon: "🌐" },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                tab === t.id ? "text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
              }`}
              style={tab === t.id ? { background: "var(--primary)" } : {}}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Content Form */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 max-w-3xl">
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            {/* 1. General & Affiliation */}
            {tab === "general" && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <img src={LOGOS.schoolLogo} alt="Logo" className="w-16 h-16 object-contain p-1 bg-white rounded-xl shadow-xs" />
                  <div>
                    <div className="font-bold text-slate-800 text-xs">Official School Crest / Logo</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Asset mapped from <code>logo/school logo.png</code></div>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">School Name *</label>
                  <input
                    required
                    value={info.name}
                    onChange={e => setInfo(f => ({ ...f, name: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">School Motto / Tagline</label>
                  <input
                    value={info.tagline}
                    onChange={e => setInfo(f => ({ ...f, tagline: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Established Year</label>
                    <input
                      type="number"
                      value={info.established}
                      onChange={e => setInfo(f => ({ ...f, established: Number(e.target.value) }))}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">CBSE Affiliation No.</label>
                    <input
                      value={info.affiliationNo}
                      onChange={e => setInfo(f => ({ ...f, affiliationNo: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Education Board</label>
                    <input
                      value={info.board}
                      onChange={e => setInfo(f => ({ ...f, board: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">About School Narrative</label>
                  <textarea
                    rows={4}
                    value={info.about}
                    onChange={e => setInfo(f => ({ ...f, about: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* 2. Principal's Desk */}
            {tab === "principal" && (
              <div className="space-y-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Principal / Head of Institution Name</label>
                  <input
                    value={info.principal}
                    onChange={e => setInfo(f => ({ ...f, principal: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                    placeholder="e.g. Dr. Priya Sharma"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Principal's Address / Welcome Message</label>
                  <textarea
                    rows={6}
                    value={info.principalMessage}
                    onChange={e => setInfo(f => ({ ...f, principalMessage: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* 3. Contact & Address */}
            {tab === "contact" && (
              <div className="space-y-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Campus Full Postal Address</label>
                  <textarea
                    rows={2}
                    value={info.address}
                    onChange={e => setInfo(f => ({ ...f, address: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none resize-none"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Helpline Phone Number</label>
                    <input
                      type="tel"
                      value={info.phone}
                      onChange={e => setInfo(f => ({ ...f, phone: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Official Admissions Email</label>
                    <input
                      type="email"
                      value={info.email}
                      onChange={e => setInfo(f => ({ ...f, email: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Official Website Domain</label>
                  <input
                    value={info.website}
                    onChange={e => setInfo(f => ({ ...f, website: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* 4. Socials */}
            {tab === "socials" && (
              <div className="space-y-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Facebook Page URL</label>
                  <input
                    value={info.socials?.facebook || ""}
                    onChange={e => setInfo(f => ({ ...f, socials: { ...f.socials, facebook: e.target.value } }))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                    placeholder="https://facebook.com/..."
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Instagram Profile URL</label>
                  <input
                    value={info.socials?.instagram || ""}
                    onChange={e => setInfo(f => ({ ...f, socials: { ...f.socials, instagram: e.target.value } }))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                    placeholder="https://instagram.com/..."
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">YouTube Channel URL</label>
                  <input
                    value={info.socials?.youtube || ""}
                    onChange={e => setInfo(f => ({ ...f, socials: { ...f.socials, youtube: e.target.value } }))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                    placeholder="https://youtube.com/@..."
                  />
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl font-bold text-white shadow-sm"
                style={{ background: "var(--primary)" }}
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
