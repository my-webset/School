import { useState, useEffect, useRef } from "react";
import { dataService, INITIAL_FACILITIES, INITIAL_WHY_CHOOSE_FEATURES } from "../../services/dataService";
import { SchoolInfo, FacilityItem, WhyChooseFeatureItem } from "../../types";
import { supabase } from "../../lib/supabase";
import LOGOS from "../../assets/logos";

export default function SchoolInfoManager() {
  const [info, setInfo] = useState<SchoolInfo>(() => dataService.getSchoolInfo());
  const [tab, setTab] = useState("general");
  const [toast, setToast] = useState("");
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const campusInputRef = useRef<HTMLInputElement>(null);
  const aboutInputRef = useRef<HTMLInputElement>(null);
  const principalInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const isDirtyRef = useRef(false);

  useEffect(() => {
    setInfo(dataService.getSchoolInfo());
    const unsub = dataService.subscribe(() => {
      if (!isDirtyRef.current) {
        setInfo(dataService.getSchoolInfo());
      }
    });
    return () => unsub();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const updateInfo = (updater: (prev: SchoolInfo) => SchoolInfo) => {
    isDirtyRef.current = true;
    setInfo(updater);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await dataService.saveSchoolInfo(info);
      isDirtyRef.current = false;
      showToast("✅ School Information, Branding & Images synced globally to all devices!");
    } catch (err: any) {
      showToast("⚠️ Notice: Saved locally. " + (err?.message || ""));
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (
    file: File,
    key: "logoUrl" | "heroImageUrl" | "campusImageUrl" | "aboutUsImageUrl" | "principalImageUrl"
  ) => {
    if (!file) return;
    setUploadingImage(key);
    showToast(`Optimizing and uploading image for ${key}...`);

    try {
      const maxDimension = key === "logoUrl" ? 400 : 1000;
      const quality = key === "logoUrl" ? 0.85 : 0.75;

      const compressedBlob = await new Promise<Blob | null>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            let width = img.width;
            let height = img.height;

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
              canvas.toBlob((blob) => resolve(blob), "image/jpeg", quality);
            } else {
              resolve(null);
            }
          };
          img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
      });

      if (!compressedBlob) {
        showToast("⚠️ Could not process image.");
        return;
      }

      const uploadRes = await supabase.uploadFile(
        "school-assets",
        `${key}-${Date.now()}.jpg`,
        compressedBlob,
      );
      let finalUrl = "";
      if (uploadRes.publicUrl && !uploadRes.error) {
        finalUrl = uploadRes.publicUrl;
      } else {
        finalUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(compressedBlob);
        });
      }

      if (finalUrl) {
        updateInfo(prev => ({ ...prev, [key]: finalUrl }));
        await dataService.saveSchoolAsset(key, finalUrl);
        showToast(`✅ Image uploaded & saved to database table!`);
      }
    } catch (err: any) {
      console.error(err);
      showToast("⚠️ Image upload notice: " + (err?.message || ""));
    } finally {
      setUploadingImage(null);
    }
  };


  // Facility Toggles & Handlers
  const facilitiesList: FacilityItem[] = info.facilities && info.facilities.length > 0 
    ? info.facilities 
    : INITIAL_FACILITIES;

  const toggleFacility = (id: string) => {
    const updated = facilitiesList.map(f => (f.id === id ? { ...f, enabled: !f.enabled } : f));
    updateInfo(prev => ({ ...prev, facilities: updated }));
  };

  const updateFacilityField = (id: string, field: "name" | "desc", val: string) => {
    const updated = facilitiesList.map(f => (f.id === id ? { ...f, [field]: val } : f));
    updateInfo(prev => ({ ...prev, facilities: updated }));
  };

  const addCustomFacility = () => {
    const newFac: FacilityItem = {
      id: `fac-${Date.now()}`,
      name: "New School Facility",
      desc: "Describe the specialized lab, sports arena, or modern campus facility.",
      iconKey: "techEnabledLearning",
      iconUrl: LOGOS.techEnabledLearning,
      enabled: true,
    };
    updateInfo(prev => ({ ...prev, facilities: [...facilitiesList, newFac] }));
  };

  const removeFacility = (id: string) => {
    updateInfo(prev => ({ ...prev, facilities: facilitiesList.filter(f => f.id !== id) }));
  };

  // Why Choose Us Toggles & Handlers
  const whyChooseList: WhyChooseFeatureItem[] = info.whyChooseFeatures && info.whyChooseFeatures.length > 0
    ? info.whyChooseFeatures
    : INITIAL_WHY_CHOOSE_FEATURES;

  const toggleWhyChoose = (id: string) => {
    const updated = whyChooseList.map(f => (f.id === id ? { ...f, enabled: !f.enabled } : f));
    updateInfo(prev => ({ ...prev, whyChooseFeatures: updated }));
  };

  const updateWhyChooseField = (id: string, field: "title" | "desc", val: string) => {
    const updated = whyChooseList.map(f => (f.id === id ? { ...f, [field]: val } : f));
    updateInfo(prev => ({ ...prev, whyChooseFeatures: updated }));
  };

  const addCustomWhyChoose = () => {
    const newFeat: WhyChooseFeatureItem = {
      id: `feat-${Date.now()}`,
      title: "Distinctive School Feature",
      desc: "Highlight key achievements, curriculum excellence, or unique student benefits.",
      iconKey: "academicExcellence",
      iconUrl: LOGOS.academicExcellence,
      enabled: true,
    };
    updateInfo(prev => ({ ...prev, whyChooseFeatures: [...whyChooseList, newFeat] }));
  };

  const removeWhyChoose = (id: string) => {
    updateInfo(prev => ({ ...prev, whyChooseFeatures: whyChooseList.filter(f => f.id !== id) }));
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
            Update official school details, branding logos, campus photos, facility checklist, and "Why Choose Us" features.
          </p>
        </div>
        <button
          onClick={() => handleSave()}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-95 transition-opacity disabled:opacity-60 flex items-center gap-2"
          style={{ background: "var(--primary)" }}
        >
          {saving ? "Saving..." : "Save & Publish Globally"}
        </button>
      </div>


      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sub-tabs */}
        <div className="lg:w-64 flex-shrink-0 bg-white rounded-2xl border border-slate-100 shadow-sm p-2 space-y-1 h-fit">
          {[
            { id: "general", label: "General & Affiliation", icon: "🏫" },
            { id: "branding", label: "Branding & Images", icon: "🎨" },
            { id: "facilities", label: "Facilities Checklist", icon: "🔬" },
            { id: "whyChoose", label: "Why Choose Us Boxes", icon: "⭐" },
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
                    onChange={e => updateInfo(f => ({ ...f, name: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">School Motto / Tagline</label>
                  <input
                    value={info.tagline}
                    onChange={e => updateInfo(f => ({ ...f, tagline: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Established Year</label>
                    <input
                      type="number"
                      value={info.established}
                      onChange={e => updateInfo(f => ({ ...f, established: Number(e.target.value) }))}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">CBSE Affiliation No.</label>
                    <input
                      value={info.affiliationNo}
                      onChange={e => updateInfo(f => ({ ...f, affiliationNo: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Education Board</label>
                    <input
                      value={info.board}
                      onChange={e => updateInfo(f => ({ ...f, board: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">About School Narrative</label>
                  <textarea
                    rows={4}
                    value={info.about}
                    onChange={e => updateInfo(f => ({ ...f, about: e.target.value }))}
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
                      onChange={e => updateInfo(prev => ({ ...prev, logoUrl: e.target.value }))}
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
                      onChange={e => updateInfo(prev => ({ ...prev, heroImageUrl: e.target.value }))}
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
                      onChange={e => updateInfo(prev => ({ ...prev, campusImageUrl: e.target.value }))}
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
                      onChange={e => updateInfo(prev => ({ ...prev, aboutUsImageUrl: e.target.value }))}
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

            {/* 3. Facilities Checklist (TICK TO SHOW / HIDE) */}
            {tab === "facilities" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-amber-50/80 border border-amber-200 rounded-2xl">
                  <div>
                    <div className="font-bold text-slate-800 text-xs">School Facilities Selection Engine</div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      Tick <strong>[✓]</strong> the facilities available at your school. Only checked facilities will be displayed on the Home Page and Facilities Page.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addCustomFacility}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors whitespace-nowrap shadow-xs"
                  >
                    + Add Facility
                  </button>
                </div>

                <div className="grid gap-3">
                  {facilitiesList.map(fac => {
                    const iconSrc = fac.iconUrl || (fac.iconKey && (LOGOS as any)[fac.iconKey]) || LOGOS.scienceLab;
                    return (
                      <div
                        key={fac.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          fac.enabled
                            ? "bg-white border-blue-200 shadow-xs"
                            : "bg-slate-50 border-slate-200 opacity-60"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <label className="flex items-start gap-3 cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              checked={fac.enabled}
                              onChange={() => toggleFacility(fac.id)}
                              className="w-4 h-4 mt-1 rounded text-blue-900 focus:ring-blue-800 cursor-pointer accent-blue-900"
                            />
                            <div className="w-10 h-10 rounded-xl bg-slate-100 p-1.5 flex items-center justify-center flex-shrink-0">
                              <img src={iconSrc} alt={fac.name} className="w-full h-full object-contain" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`font-bold text-xs ${fac.enabled ? "text-slate-900" : "text-slate-500"}`}>
                                  {fac.name}
                                </span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                  fac.enabled ? "bg-green-100 text-green-800" : "bg-slate-200 text-slate-600"
                                }`}>
                                  {fac.enabled ? "Active on Website" : "Hidden"}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 leading-relaxed">{fac.desc}</p>
                            </div>
                          </label>

                          <button
                            type="button"
                            onClick={() => removeFacility(fac.id)}
                            className="text-slate-400 hover:text-red-600 text-xs px-2 py-1"
                            title="Remove this facility"
                          >
                            ✕
                          </button>
                        </div>

                        {/* Inline quick editor if enabled */}
                        {fac.enabled && (
                          <div className="mt-3 pt-3 border-t border-slate-100 grid sm:grid-cols-2 gap-2 text-[11px]">
                            <div>
                              <span className="text-slate-500 font-semibold block mb-0.5">Facility Name:</span>
                              <input
                                value={fac.name}
                                onChange={e => updateFacilityField(fac.id, "name", e.target.value)}
                                className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none bg-white text-xs"
                              />
                            </div>
                            <div>
                              <span className="text-slate-500 font-semibold block mb-0.5">Short Description:</span>
                              <input
                                value={fac.desc}
                                onChange={e => updateFacilityField(fac.id, "desc", e.target.value)}
                                className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none bg-white text-xs"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. Why Choose Us Boxes (TICK TO SHOW / HIDE) */}
            {tab === "whyChoose" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-blue-50/80 border border-blue-200 rounded-2xl">
                  <div>
                    <div className="font-bold text-slate-800 text-xs">"Why Choose Us" Distinctive Features Selection</div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      Tick <strong>[✓]</strong> the feature boxes you want to display on the Home Page section. Unticked features will not be shown.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addCustomWhyChoose}
                    className="px-3 py-1.5 rounded-xl bg-blue-900 text-white font-bold text-xs hover:bg-blue-800 transition-colors whitespace-nowrap shadow-xs"
                  >
                    + Add Feature
                  </button>
                </div>

                <div className="grid gap-3">
                  {whyChooseList.map(feat => {
                    const iconSrc = feat.iconUrl || (feat.iconKey && (LOGOS as any)[feat.iconKey]) || LOGOS.academicExcellence;
                    return (
                      <div
                        key={feat.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          feat.enabled
                            ? "bg-white border-blue-200 shadow-xs"
                            : "bg-slate-50 border-slate-200 opacity-60"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <label className="flex items-start gap-3 cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              checked={feat.enabled}
                              onChange={() => toggleWhyChoose(feat.id)}
                              className="w-4 h-4 mt-1 rounded text-blue-900 focus:ring-blue-800 cursor-pointer accent-blue-900"
                            />
                            <div className="w-10 h-10 rounded-xl bg-slate-100 p-1.5 flex items-center justify-center flex-shrink-0">
                              <img src={iconSrc} alt={feat.title} className="w-full h-full object-contain" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`font-bold text-xs ${feat.enabled ? "text-slate-900" : "text-slate-500"}`}>
                                  {feat.title}
                                </span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                  feat.enabled ? "bg-green-100 text-green-800" : "bg-slate-200 text-slate-600"
                                }`}>
                                  {feat.enabled ? "Active on Home Page" : "Hidden"}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 leading-relaxed">{feat.desc}</p>
                            </div>
                          </label>

                          <button
                            type="button"
                            onClick={() => removeWhyChoose(feat.id)}
                            className="text-slate-400 hover:text-red-600 text-xs px-2 py-1"
                            title="Remove this feature"
                          >
                            ✕
                          </button>
                        </div>

                        {/* Inline quick editor if enabled */}
                        {feat.enabled && (
                          <div className="mt-3 pt-3 border-t border-slate-100 grid sm:grid-cols-2 gap-2 text-[11px]">
                            <div>
                              <span className="text-slate-500 font-semibold block mb-0.5">Feature Title:</span>
                              <input
                                value={feat.title}
                                onChange={e => updateWhyChooseField(feat.id, "title", e.target.value)}
                                className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none bg-white text-xs"
                              />
                            </div>
                            <div>
                              <span className="text-slate-500 font-semibold block mb-0.5">Description:</span>
                              <input
                                value={feat.desc}
                                onChange={e => updateWhyChooseField(feat.id, "desc", e.target.value)}
                                className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none bg-white text-xs"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. Principal's Desk */}
            {tab === "principal" && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800 text-xs">Principal's Official Portrait Photo</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Displayed in Principal's Desk section on Home and About pages</div>
                    </div>
                    <img
                      src={info.principalImageUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop"}
                      alt={info.principal}
                      className="w-12 h-12 rounded-full object-cover border-2 border-blue-900 shadow-xs"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter photo URL (https://...)"
                      value={info.principalImageUrl || ""}
                      onChange={e => updateInfo(prev => ({ ...prev, principalImageUrl: e.target.value }))}
                      className="flex-1 border border-slate-200 bg-white rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => principalInputRef.current?.click()}
                      className="px-3.5 py-2 bg-slate-800 text-white font-semibold rounded-xl text-xs hover:bg-black transition-colors"
                    >
                      📁 Upload Photo
                    </button>
                    <input
                      ref={principalInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], "principalImageUrl")}
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Principal / Head of Institution Name</label>
                  <input
                    value={info.principal}
                    onChange={e => updateInfo(f => ({ ...f, principal: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                    placeholder="e.g. Dr. Priya Sharma"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Principal's Address / Welcome Message</label>
                  <textarea
                    rows={6}
                    value={info.principalMessage}
                    onChange={e => updateInfo(f => ({ ...f, principalMessage: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* 6. Contact & Address */}
            {tab === "contact" && (
              <div className="space-y-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Campus Full Postal Address</label>
                  <textarea
                    rows={2}
                    value={info.address}
                    onChange={e => updateInfo(f => ({ ...f, address: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none resize-none"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Helpline Phone Number</label>
                    <input
                      type="tel"
                      value={info.phone}
                      onChange={e => updateInfo(f => ({ ...f, phone: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Official Admissions Email</label>
                    <input
                      type="email"
                      value={info.email}
                      onChange={e => updateInfo(f => ({ ...f, email: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Official Website Domain</label>
                  <input
                    value={info.website}
                    onChange={e => updateInfo(f => ({ ...f, website: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* 7. Socials */}
            {tab === "socials" && (
              <div className="space-y-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Facebook Page URL</label>
                  <input
                    value={info.socials?.facebook || ""}
                    onChange={e => updateInfo(f => ({ ...f, socials: { ...f.socials, facebook: e.target.value } }))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                    placeholder="https://facebook.com/..."
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Instagram Profile URL</label>
                  <input
                    value={info.socials?.instagram || ""}
                    onChange={e => updateInfo(f => ({ ...f, socials: { ...f.socials, instagram: e.target.value } }))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                    placeholder="https://instagram.com/..."
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">YouTube Channel URL</label>
                  <input
                    value={info.socials?.youtube || ""}
                    onChange={e => updateInfo(f => ({ ...f, socials: { ...f.socials, youtube: e.target.value } }))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                    placeholder="https://youtube.com/@..."
                  />
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl font-bold text-white shadow-sm hover:opacity-95 transition-opacity disabled:opacity-60"
                style={{ background: "var(--primary)" }}
              >
                {saving ? "Saving Changes..." : "Save Changes Globally"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
