import { useState, useRef } from "react";
import { AuthService } from "../../services/authService";
import { dataService } from "../../services/dataService";

export default function SettingsManager() {
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [toast, setToast] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // 1. Password Change (Cross-device database sync)
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      alert("New password and confirm password do not match.");
      return;
    }
    const res = await AuthService.changePassword(currentPass, newPass);
    if (res.success) {
      showToast(res.message);
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
    } else {
      alert(res.message);
    }
  };

  // 2. Force Cloud Database Sync
  const handleForceSync = async () => {
    setIsSyncing(true);
    const res = await dataService.syncFromSupabase();
    setIsSyncing(false);
    setLastSyncTime(new Date().toLocaleTimeString());
    if (res.success) {
      showToast("Cloud Database synchronized successfully!");
    } else {
      alert(`Sync issue: ${res.message || "Please check your network and Supabase connection."}`);
    }
  };

  // 3. Download Full JSON Backup
  const handleDownloadBackup = () => {
    dataService.exportFullBackupJSON();
    showToast("Full backup file downloaded!");
  };

  // 4. Restore from JSON Backup
  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      if (window.confirm("Restore entire school database from this backup? This will update cloud database records.")) {
        setIsRestoring(true);
        const res = await dataService.restoreFromBackupJSON(content);
        setIsRestoring(false);
        if (res.success) {
          showToast(res.message);
        } else {
          alert(res.message);
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 5. Reset All Data to Clean Defaults
  const handleResetData = async () => {
    if (window.confirm("Are you sure you want to reset all site data to clean defaults?")) {
      await dataService.resetAllData();
      showToast("Data reset completed successfully!");
    }
  };

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
          Manage master admin authorization, synchronize cloud database across devices, and manage full system data backups.
        </p>
      </div>

      {/* 1. Admin Password Change */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg">
            🔐
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Master Admin Security Password</h2>
            <p className="text-[11px] text-slate-500">
              Update password across all devices (laptop, mobile, tablet) synchronized directly in Supabase.
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
            Update Admin Password (All Devices)
          </button>
        </form>
      </div>

      {/* 2. Cloud Database Sync & Health */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-lg">
              ☁️
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">Cloud Database Synchronization</h2>
              <p className="text-[11px] text-slate-500">
                Direct real-time 2-way sync with Supabase for admissions, notices, events, gallery, forms & inquiries.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live Cloud Sync Active
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div>
            <div className="font-semibold text-slate-800">Automatic Sync Interval: Every 12 seconds</div>
            <div className="text-slate-500 text-[11px] mt-0.5">Last synchronized: {lastSyncTime}</div>
          </div>

          <button
            onClick={handleForceSync}
            disabled={isSyncing}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 font-bold text-slate-800 transition-colors shadow-xs flex items-center gap-2"
          >
            {isSyncing ? (
              <>
                <span className="animate-spin text-sm">🔄</span>
                <span>Syncing Database...</span>
              </>
            ) : (
              <>
                <span>🔄</span>
                <span>Sync Now with Cloud</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3. Data Backup & Maintenance */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-lg">
            💾
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">Data Backup & Maintenance</h2>
            <p className="text-[11px] text-slate-500">
              Export complete school database as JSON, restore existing backups, or clean database defaults.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          {/* Export JSON */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 flex flex-col justify-between">
            <div>
              <div className="font-bold text-slate-800 text-sm">Export Full Backup</div>
              <div className="text-[11px] text-slate-500 mt-1">
                Generates a complete JSON backup file containing all 8 modules (Admissions, Forms, Submissions, Notices, Events, Gallery, Inquiries, School Profile).
              </div>
            </div>
            <button
              onClick={handleDownloadBackup}
              className="w-full py-2.5 rounded-xl font-bold text-white shadow-sm flex items-center justify-center gap-2"
              style={{ background: "var(--primary)" }}
            >
              <span>📥</span> Download Full JSON Backup
            </button>
          </div>

          {/* Import JSON */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 flex flex-col justify-between">
            <div>
              <div className="font-bold text-slate-800 text-sm">Restore from Backup</div>
              <div className="text-[11px] text-slate-500 mt-1">
                Upload a previously downloaded JSON backup file to overwrite or restore records in your database.
              </div>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleRestoreFile}
                className="hidden"
                id="backup-upload-input"
              />
              <label
                htmlFor="backup-upload-input"
                className="w-full py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 font-bold text-slate-700 cursor-pointer flex items-center justify-center gap-2 transition-colors"
              >
                {isRestoring ? (
                  <span>⏳ Restoring Data...</span>
                ) : (
                  <>
                    <span>📤</span>
                    <span>Upload & Restore JSON</span>
                  </>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Reset */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="text-slate-500">
            Need to start fresh? Reset all admission and submission queues to initial defaults.
          </div>
          <button
            onClick={handleResetData}
            className="px-4 py-2 rounded-xl border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 font-bold transition-colors whitespace-nowrap"
          >
            ⚠️ Reset All Data to Clean Defaults
          </button>
        </div>
      </div>
    </div>
  );
}

