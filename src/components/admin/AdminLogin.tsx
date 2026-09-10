import { useState } from "react";
import { AuthService } from "../../services/authService";
import { dataService } from "../../services/dataService";
import LOGOS from "../../assets/logos";

interface Props {
  onLogin: () => void;
  setView: (v: string) => void;
}

export default function AdminLogin({ onLogin, setView }: Props) {
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const school = dataService.getSchoolInfo();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await AuthService.loginAsync(password);
      if (res.success) {
        onLogin();
      } else {
        setError(res.message || "Invalid admin password. Default is admin123");
        setLoading(false);
      }
    } catch (err) {
      const fallbackRes = AuthService.login(password);
      if (fallbackRes.success) {
        onLogin();
      } else {
        setError("Invalid admin password. Please try again.");
        setLoading(false);
      }
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "linear-gradient(135deg, var(--primary) 0%, #0a1931 100%)" }}
    >
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
          {/* Header */}
          <div className="p-8 text-center" style={{ background: "var(--sidebar)" }}>
            <div className="w-20 h-20 rounded-2xl bg-white/10 p-2 mx-auto mb-4 backdrop-blur flex items-center justify-center shadow-lg">
              <img
                src={LOGOS.schoolLogo}
                alt={school.name}
                className="w-full h-full object-contain"
              />
            </div>
            <h1
              className="text-white font-bold text-lg leading-snug"
              style={{ fontFamily: "DM Serif Display, serif" }}
            >
              {school.name}
            </h1>
            <div className="text-blue-300 text-xs mt-1 font-medium tracking-wide">
              Secured Administrator Access
            </div>
          </div>

          {/* Form */}
          <div className="p-8">
            <div className="mb-6">
              <h2
                className="text-xl font-bold text-slate-800"
                style={{ fontFamily: "DM Serif Display, serif" }}
              >
                Admin Authorization
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your administrative security password to access the management portal.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <span className="text-base">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                  Admin Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-3 text-sm pr-12 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    placeholder="Enter security password..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1.5 py-1 rounded font-medium"
                  >
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                  <span>Default access: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600 font-mono">admin123</code></span>
                  <span>(Changeable in Settings)</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-all shadow-md hover:opacity-95 active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: "var(--primary)" }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Verifying Access...
                  </>
                ) : (
                  "Unlock Admin Dashboard"
                )}
              </button>
            </form>

            <div className="mt-8 pt-5 border-t border-slate-100 text-center">
              <button
                onClick={() => setView("public")}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1.5 transition-colors"
              >
                <span>←</span> Back to Public Website
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-blue-100/60 text-xs mt-6">
          Authorized Personnel Only · {school.name}
        </p>
      </div>
    </div>
  );
}
