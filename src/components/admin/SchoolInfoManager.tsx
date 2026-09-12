import { useState, useEffect, useRef } from "react";
import { dataService } from "../../services/dataService";
import { SchoolInfo } from "../../types";
import LOGOS from "../../assets/logos";

export default function SchoolInfoManager() {
  const [info, setInfo] = useState<SchoolInfo>(dataService.getSchoolInfo());
  const [tab, setTab] = useState("general");
  const [toast, setToast] = useState("");

  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const campusInputRef = useRef<HTMLInputElement>(null);
  const aboutInputRef = useRef<HTMLInputElement>(null);

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
    showToast("School Information and Branding saved & updated globally across the website!");
  };

  const handleImageUpload = (file: File, key: "logoUrl" | "heroImageUrl" | "campusImageUrl" | "aboutUsImageUrl") => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDimension = key === "logoUrl" ? 500 : 1600;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
          setInfo(prev => ({ ...prev, [key]: compressedDataUrl }));
          showToast(`Image uploaded for ${key}! Click 'Save Changes' to apply everywhere.`);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
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
            School Profile & Branding System
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Update official school details, logo, hero banner, campus photos, and social links displayed globally site-wide.
          </p>
        </div>
        <button
          onClick={() => handleSave()}
          className="px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-95 transition-opacity"
          style={{ background: "var(--primary)" }}
        >
          Save & Publish Globally
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sub-tabs */}
        <div className="lg:w-60 flex-shrink-0 bg-white rounded-2xl border border-slate-100 shadow-sm p-2 space-y-1 h-fit">
          {[
            { id: "general", label: "General & Affiliation", icon: "🏫" },
            { id: "branding", label: "Branding & Images", icon: "🎨" },
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
                  <img
                    src={info.logoUrl || LOGOS.schoolLogo}
                    alt="Logo"
                    className="w-16 h-16 object-contain p-1 bg-white rounded-xl shadow-xs"
                  />
                  <div>
                    <div className="font-bold text-slate-800 text-xs">Official School Crest / Logo</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      To replace the crest image everywhere, switch to the <strong>Branding & Images</strong> tab.
                    </div>
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

            {/* 2. Branding & Global Images */}
            {tab === "branding" && (
              <div className="space-y-6">
                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl text-[11px] text-blue-900 leading-relaxed">
                  💡 <strong>Global Brand Asset Engine:</strong> Updating any image below immediately replaces that asset across the entire website, exam question paper headers, admission forms, and public pages.
                </div>

                {/* 1. School Logo */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800 text-xs">1. Official School Logo / Crest</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Used in Header, Footer, Admin Dashboard, and Exam Papers</div>
                    </div>
                    <img
                      src={info.logoUrl || LOGOS.schoolLogo}
                      alt="Logo Preview"
                      className="w-12 h-12 object-contain bg-white rounded-xl border border-slate-200 p-1 shadow-xs"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Or enter image URL (https://...)"
                      value={info.logoUrl || ""}
                      onChange={e => setInfo(prev => ({ ...prev, logoUrl: e.target.value }))}
                      className="flex-1 border border-slate-200 bg-white rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="px-3.5 py-2 bg-slate-800 text-white font-semibold rounded-xl text-xs hover:bg-black transition-colors"
                    >
                      📁 Upload File
                    </button>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], "logoUrl")}
                    />
                  </div>
                </div>

                {/* 2. Hero Cover Image */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800 text-xs">2. Hero Banner / Cover Page Image</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Used on Home Page Hero & Optional Exam Cover Pages</div>
                    </div>
                    <img
                      src={info.heroImageUrl || "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=80"}
                      alt="Hero Preview"
                      className="w-16 h-10 object-cover bg-white rounded-xl border border-slate-200 shadow-xs"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter banner image URL (https://...)"
                      value={info.heroImageUrl || ""}
                      onChange={e => setInfo(prev => ({ ...prev, heroImageUrl: e.target.value }))}
                      className="flex-1 border border-slate-200 bg-white rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => heroInputRef.current?.click()}
                      className="px-3.5 py-2 bg-slate-800 text-white font-semibold rounded-xl text-xs hover:bg-black transition-colors"
                    >
                      📁 Upload File
                    </button>
                    <input
                      ref={heroInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], "heroImageUrl")}
                    />
                  </div>
                </div>

                {/* 3. Campus Image */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800 text-xs">3. Campus Infrastructure Image</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Used in Facilities, Campus section, and document backgrounds</div>
                    </div>
                    <img
                      src={info.campusImageUrl || "https://images.unsplash.com/photo-1562774053-701939374585?w=600&q=80"}
                      alt="Campus Preview"
                      className="w-16 h-10 object-cover bg-white rounded-xl border border-slate-200 shadow-xs"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter campus image URL (https://...)"
                      value={info.campusImageUrl || ""}
                      onChange={e => setInfo(prev => ({ ...prev, campusImageUrl: e.target.value }))}
                      className="flex-1 border border-slate-200 bg-white rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => campusInputRef.current?.click()}
                      className="px-3.5 py-2 bg-slate-800 text-white font-semibold rounded-xl text-xs hover:bg-black transition-colors"
                    >
                      📁 Upload File
                    </button>
                    <input
                      ref={campusInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], "campusImageUrl")}
                    />
                  </div>
                </div>

                {/* 4. About Us Image */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800 text-xs">4. About Us & Academic Philosophy Image</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Used in the Public About page and institutional profiles</div>
                    </div>
                    <img
                      src={info.aboutUsImageUrl || "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80"}
                      alt="About Preview"
                      className="w-16 h-10 object-cover bg-white rounded-xl border border-slate-200 shadow-xs"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter About Us image URL (https://...)"
                      value={info.aboutUsImageUrl || ""}
                      onChange={e => setInfo(prev => ({ ...prev, aboutUsImageUrl: e.target.value }))}
                      className="flex-1 border border-slate-200 bg-white rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => aboutInputRef.current?.click()}
                      className="px-3.5 py-2 bg-slate-800 text-white font-semibold rounded-xl text-xs hover:bg-black transition-colors"
                    >
                      📁 Upload File
                    </button>
                    <input
                      ref={aboutInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], "aboutUsImageUrl")}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. Principal's Desk */}
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

            {/* 4. Contact & Address */}
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

            {/* 5. Socials */}
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
                Save Changes Globally
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
