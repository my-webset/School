import { useState, useEffect } from "react";
import { AuthService } from "../../services/authService";
import { dataService } from "../../services/dataService";
import { AICREDITS_CONFIG } from "../../services/aiClient";

export default function SettingsManager() {
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [toast, setToast] = useState("");
  const [usageCount, setUsageCount] = useState(0);
  const maxQuota = 500;

  const loadUsage = () => {
    try {
      const raw = localStorage.getItem("nis_school_settings_v1");
      if (raw) {
        const parsed = JSON.parse(raw);
        setUsageCount(parsed.aiUsageCount || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadUsage();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // 1. Password Change
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      alert("New password and confirm password do not match.");
      return;
    }
    const res = AuthService.changePassword(currentPass, newPass);
    if (res.success) {
      showToast(res.message);
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
    } else {
      alert(res.message);
    }
  };

  // 2. Reset AI Usage Counter
  const handleResetAICounter = () => {
    try {
      const raw = localStorage.getItem("nis_school_settings_v1");
      const parsed = raw ? JSON.parse(raw) : {};
      localStorage.setItem("nis_school_settings_v1", JSON.stringify({ ...parsed, aiUsageCount: 0 }));
      setUsageCount(0);
      showToast("AI credit usage tracker reset to 0.");
    } catch (e) {
      console.error(e);
    }
  };

  // 3. Reset All Data
  const handleResetData = () => {
    if (window.confirm("Are you sure you want to reset all admissions and submission data to clean defaults?")) {
      dataService.resetAllData();
      showToast("Data reset completed successfully!");
    }
  };

  // 4. Download Full JSON Backup
  const handleDownloadBackup = () => {
    const backup = {
      schoolInfo: dataService.getSchoolInfo(),
      admissions: dataService.getAdmissions(),
      notices: dataService.getNotices(),
      events: dataService.getEvents(),
      gallery: dataService.getGallery(),
      forms: dataService.getForms(),
      submissions: dataService.getSubmissions(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Nalanda_Full_Backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const usagePercent = Math.min(100, Math.round((usageCount / maxQuota) * 100));

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-800 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2">
          <span>⚙️</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "DM Serif Display, serif" }}>
          Website & System Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage administrator security password, monitor AI generation quota, and perform system data backups.
        </p>
      </div>

      {/* 1. Admin Password Change */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg">
            🔐
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Admin Security Password</h2>
            <p className="text-[11px] text-slate-500">
              Update the master security password required to unlock this admin dashboard.
            </p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Current Password *</label>
            <input
              type="password"
              required
              value={currentPass}
              onChange={e => setCurrentPass(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Enter current password..."
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">New Password *</label>
              <input
                type="password"
                required
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="New password..."
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Confirm New Password *</label>
              <input
                type="password"
                required
                value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Confirm password..."
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl font-bold text-white shadow-sm hover:opacity-95 transition-opacity"
            style={{ background: "var(--primary)" }}
          >
            Update Admin Password
          </button>
        </form>
      </div>

      {/* 2. AI Credit Usage & Quota Dashboard */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-lg">
              🤖
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">AI Credit Usage & Quota</h2>
              <p className="text-[11px] text-slate-500">Live credit consumption tracker for AI Question Paper synthesis.</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            AI Service Connected
          </span>
        </div>

        {/* AI Stats Cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100">
            <div className="text-[11px] font-semibold text-purple-700">Total Papers Synthesized</div>
            <div className="text-2xl font-bold text-purple-900 font-mono mt-1">{usageCount}</div>
            <div className="text-[10px] text-purple-600 mt-0.5">Exam blueprints generated</div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
            <div className="text-[11px] font-semibold text-blue-700">Active Engine Model</div>
            <div className="text-base font-bold text-blue-900 font-mono mt-1 truncate">{AICREDITS_CONFIG.model}</div>
            <div className="text-[10px] text-blue-600 mt-0.5">High-speed neural inference</div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <div className="text-[11px] font-semibold text-emerald-700">Available Quota Limit</div>
            <div className="text-2xl font-bold text-emerald-900 font-mono mt-1">{maxQuota - usageCount}</div>
            <div className="text-[10px] text-emerald-600 mt-0.5">Remaining credit allowance</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Quota Utilization</span>
            <span className="font-bold font-mono">{usageCount} / {maxQuota} ({usagePercent}%)</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${usagePercent}%`,
                background: usagePercent > 80 ? "#dc2626" : "var(--primary)",
              }}
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
          <span className="text-slate-400">Endpoint: <code className="font-mono text-slate-600">{AICREDITS_CONFIG.baseUrl}</code></span>
          <button
            onClick={handleResetAICounter}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-semibold transition-colors"
          >
            Reset Usage Counter
          </button>
        </div>
      </div>

      {/* 3. Data Maintenance & Full Backup */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-lg">
            💾
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Data Backup & Maintenance</h2>
            <p className="text-[11px] text-slate-500">Download complete site state or reset data store to clean initial state.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleDownloadBackup}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-2"
            style={{ background: "var(--primary)" }}
          >
            <span>📥</span> Download Full JSON Backup
          </button>
          <button
            onClick={handleResetData}
            className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 text-xs font-bold transition-colors"
          >
            ⚠️ Reset All Data to Clean Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
