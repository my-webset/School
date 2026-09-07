import { useState } from "react";
import { dataService } from "../../services/dataService";
import { AdmissionApplication } from "../../types";
import LOGOS from "../../assets/logos";

interface Props {
  setCurrentPage: (p: string) => void;
}

export default function AdmissionPage({ setCurrentPage }: Props) {
  const [step, setStep] = useState<"form" | "confirm">("form");
  const [submittedApp, setSubmittedApp] = useState<AdmissionApplication | null>(null);
  const [lookupId, setLookupId] = useState("");
  const [lookupResult, setLookupResult] = useState<AdmissionApplication | "not_found" | null>(null);

  const [form, setForm] = useState({
    studentName: "",
    dob: "",
    gender: "Male",
    classApplying: "Class I",
    fatherName: "",
    motherName: "",
    phone: "",
    email: "",
    address: "",
    prevSchool: "",
    prevClass: "",
    academics: "",
  });

  const school = dataService.getSchoolInfo();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentName || !form.phone || !form.dob) {
      alert("Please fill in all mandatory fields.");
      return;
    }

    const app = dataService.addAdmission(form);
    setSubmittedApp(app);
    setStep("confirm");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupId.trim()) return;
    const apps = dataService.getAdmissions();
    const found = apps.find(a => a.id.toLowerCase() === lookupId.trim().toLowerCase());
    if (found) {
      setLookupResult(found);
    } else {
      setLookupResult("not_found");
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Banner */}
      <div style={{ background: "var(--primary)" }} className="py-16 text-center text-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider mb-3">
            Academic Session 2026-27
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "DM Serif Display, serif" }}>
            Online Student Admission Portal
          </h1>
          <p className="text-blue-200 text-xs sm:text-sm mt-2 max-w-xl mx-auto">
            Apply online for Nursery through Class XII. Transparent admission guidelines and instant verification.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {step === "confirm" && submittedApp ? (
          /* Confirmation & Printable Slip */
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-100 text-center">
            <div className="w-16 h-16 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center mx-auto mb-4 text-3xl">
              ✅
            </div>
            <h2 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "DM Serif Display, serif" }}>
              Application Successfully Registered!
            </h2>
            <p className="text-xs text-slate-500 mt-1 mb-8 max-w-md mx-auto">
              Your admission request has been logged into our school admissions database. Please save your application number for status tracking.
            </p>

            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 text-left max-w-2xl mx-auto mb-8 shadow-xs">
              {/* Slip Header */}
              <div className="flex items-center justify-between pb-5 border-b border-slate-200 mb-6">
                <div className="flex items-center gap-3">
                  <img src={LOGOS.schoolLogo} alt="Logo" className="w-12 h-12 object-contain" />
                  <div>
                    <div className="font-bold text-slate-900 text-sm uppercase">{school.name}</div>
                    <div className="text-[10px] text-slate-500">{school.affiliationNo} · {school.board}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Application No</div>
                  <div className="font-bold text-base text-blue-900 font-mono">{submittedApp.id}</div>
                </div>
              </div>

              {/* Slip Grid */}
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-[11px] text-slate-400">Student Name</div>
                  <div className="font-bold text-slate-800 text-sm mt-0.5">{submittedApp.studentName}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Class Applying For</div>
                  <div className="font-bold text-slate-800 text-sm mt-0.5">{submittedApp.classApplying}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Parent / Guardian</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{submittedApp.fatherName || submittedApp.motherName}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Contact Number</div>
                  <div className="font-semibold text-slate-800 font-mono mt-0.5">{submittedApp.phone}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Submission Date</div>
                  <div className="font-semibold text-slate-800 mt-0.5">
                    {new Date(submittedApp.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Current Status</div>
                  <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 mt-0.5">
                    {submittedApp.status.toUpperCase()} REVIEW
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => window.print()}
                className="px-6 py-3 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 flex items-center gap-2 shadow-xs"
              >
                <span>🖨️</span> Print Registration Slip
              </button>
              <button
                onClick={() => {
                  setStep("form");
                  setCurrentPage("home");
                }}
                className="px-6 py-3 rounded-xl text-xs font-bold text-white shadow-sm"
                style={{ background: "var(--primary)" }}
              >
                Return to Home
              </button>
            </div>
          </div>
        ) : (
          /* Application Form */
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-100 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "DM Serif Display, serif" }}>
                Student Admission Registration
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Please provide accurate student and parent information. Fields marked with <span className="text-red-500 font-bold">*</span> are required.
              </p>
            </div>

            {/* 1. Student Details */}
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold" style={{ background: "var(--primary)" }}>
                  1
                </span>
                Student Particulars
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Student's Full Name *</label>
                  <input
                    required
                    value={form.studentName}
                    onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="e.g. Aarav Sharma"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Date of Birth *</label>
                  <input
                    required
                    type="date"
                    value={form.dob}
                    onChange={e => setForm(f => ({ ...f, dob: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Gender *</label>
                  <select
                    value={form.gender}
                    onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-white focus:outline-none"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Class Applying For *</label>
                  <select
                    value={form.classApplying}
                    onChange={e => setForm(f => ({ ...f, classApplying: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-white focus:outline-none"
                  >
                    {["Nursery", "LKG", "UKG", ...Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`)].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Parent Details */}
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold" style={{ background: "var(--primary)" }}>
                  2
                </span>
                Parent & Contact Information
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Father's Name *</label>
                  <input
                    required
                    value={form.fatherName}
                    onChange={e => setForm(f => ({ ...f, fatherName: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none"
                    placeholder="Father's full name"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mother's Name *</label>
                  <input
                    required
                    value={form.motherName}
                    onChange={e => setForm(f => ({ ...f, motherName: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none"
                    placeholder="Mother's full name"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mobile Contact Number *</label>
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email Address *</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none"
                    placeholder="parent@example.com"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Full Residential Address *</label>
                  <textarea
                    required
                    rows={2}
                    value={form.address}
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none resize-none"
                    placeholder="Residential address with pincode..."
                  />
                </div>
              </div>
            </div>

            {/* 3. Previous Schooling */}
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold" style={{ background: "var(--primary)" }}>
                  3
                </span>
                Academic Background (If applicable)
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Previous School Attended</label>
                  <input
                    value={form.prevSchool}
                    onChange={e => setForm(f => ({ ...f, prevSchool: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none"
                    placeholder="Name of last school"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Last Class Passed</label>
                  <input
                    value={form.prevClass}
                    onChange={e => setForm(f => ({ ...f, prevClass: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none"
                    placeholder="e.g. Class V"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl font-bold text-sm text-slate-900 shadow-xl transition-all hover:scale-[1.01]"
              style={{ background: "var(--accent)" }}
            >
              Submit Admission Application →
            </button>
          </form>
        )}

        {/* Real-time Status Lookup Widget */}
        <div className="mt-12 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg">
              🔍
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg" style={{ fontFamily: "DM Serif Display, serif" }}>
                Check Application Status
              </h3>
              <p className="text-xs text-slate-500">
                Enter your application registration number (e.g., <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">NIS-2026-001</code>) to track current progress.
              </p>
            </div>
          </div>

          <form onSubmit={handleLookup} className="flex gap-3 mt-4">
            <input
              required
              value={lookupId}
              onChange={e => setLookupId(e.target.value)}
              placeholder="e.g. NIS-2026-001"
              className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none"
            />
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm"
              style={{ background: "var(--primary)" }}
            >
              Search
            </button>
          </form>

          {lookupResult === "not_found" && (
            <div className="mt-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs">
              ⚠️ No application found matching <strong>{lookupId}</strong>. Please verify the registration number or contact the admissions helpline.
            </div>
          )}

          {lookupResult && lookupResult !== "not_found" && (
            <div className="mt-5 p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-900">{lookupResult.studentName}</div>
                  <div className="text-xs text-slate-500 font-mono">App ID: {lookupResult.id} · Applied for {lookupResult.classApplying}</div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  lookupResult.status === "Approved" ? "bg-green-100 text-green-800" :
                  lookupResult.status === "Rejected" ? "bg-red-100 text-red-800" :
                  "bg-amber-100 text-amber-800"
                }`}>
                  {lookupResult.status.toUpperCase()}
                </span>
              </div>

              {lookupResult.status === "Approved" && (
                <div className="text-xs text-green-800 bg-green-50 p-3 rounded-xl border border-green-200">
                  🎉 <strong>Congratulations!</strong> Your admission application has been approved. Please visit the administrative block with original birth certificate, transfer certificate, and 2 passport photos to finalize enrollment.
                </div>
              )}

              {lookupResult.status === "Pending" && (
                <div className="text-xs text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200">
                  ⏳ Your application is currently under review by the admissions committee. Notifications will also be shared via SMS to {lookupResult.phone}.
                </div>
              )}

              {lookupResult.status === "Rejected" && (
                <div className="text-xs text-red-800 bg-red-50 p-3 rounded-xl border border-red-200">
                  Your application could not be accommodated due to seat capacity constraints for this academic cycle.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
