import { useState, useEffect } from "react";
import { dataService } from "../../services/dataService";
import LOGOS from "../../assets/logos";

const statusColor: Record<string, string> = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Approved: "bg-green-50 text-green-700 border-green-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
};

interface Props {
  setActiveSection?: (s: string) => void;
}

export default function DashboardHome({ setActiveSection }: Props) {
  const [, setTick] = useState(0);

  useEffect(() => {
    return dataService.subscribe(() => setTick(t => t + 1));
  }, []);

  const stats = dataService.getStats();
  const admissions = dataService.getAdmissions();
  const recentApps = admissions.slice(0, 6);

  // Dynamic class breakdown
  const classCounts: Record<string, number> = {};
  admissions.forEach(a => {
    classCounts[a.classApplying] = (classCounts[a.classApplying] || 0) + 1;
  });
  const classList = Object.entries(classCounts);

  return (
    <div className="p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold text-slate-800"
            style={{ fontFamily: "DM Serif Display, serif" }}
          >
            Executive Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time admissions, submissions, and website operations overview.
          </p>
        </div>

        {/* Quick Action Downloads */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => dataService.exportAdmissionsToCSV()}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl text-white flex items-center gap-2 shadow-sm hover:opacity-90 transition-opacity"
            style={{ background: "var(--primary)" }}
          >
            <span>📥</span> Export Admissions (CSV)
          </button>
          <button
            onClick={() => dataService.exportFormSubmissionsToCSV()}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 flex items-center gap-2 transition-colors"
          >
            <span>📊</span> Export Form Submissions
          </button>
        </div>
      </div>

      {/* Dynamic Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">Total Applicants</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 p-1.5 flex items-center justify-center">
              <img src={LOGOS.totalApplicants} alt="Total" className="w-full h-full object-contain" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800 font-mono">
              {stats.totalApplications}
            </div>
            <div className="text-[11px] text-blue-600 font-medium mt-0.5">
              +{stats.todaySubmissions} received today
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">Pending Review</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 p-1.5 flex items-center justify-center">
              <img src={LOGOS.pendingStatus} alt="Pending" className="w-full h-full object-contain" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-600 font-mono">
              {stats.pendingApplications}
            </div>
            <div className="text-[11px] text-amber-700/80 font-medium mt-0.5">
              Awaiting decision
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">Approved</span>
            <div className="w-9 h-9 rounded-xl bg-green-50 p-1.5 flex items-center justify-center">
              <img src={LOGOS.schoolLogo} alt="Approved" className="w-full h-full object-contain" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600 font-mono">
              {stats.approvedApplications}
            </div>
            <div className="text-[11px] text-green-700/80 font-medium mt-0.5">
              Confirmed admissions
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">Rejected</span>
            <div className="w-9 h-9 rounded-xl bg-red-50 p-1.5 flex items-center justify-center">
              <img src={LOGOS.rejectedStatus} alt="Rejected" className="w-full h-full object-contain" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600 font-mono">
              {stats.rejectedApplications}
            </div>
            <div className="text-[11px] text-red-700/80 font-medium mt-0.5">
              Declined submissions
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">Form Responses</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 p-1.5 flex items-center justify-center">
              <img src={LOGOS.formBuilder} alt="Forms" className="w-full h-full object-contain" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-700 font-mono">
              {stats.totalCustomFormSubmissions}
            </div>
            <div className="text-[11px] text-purple-700/80 font-medium mt-0.5">
              Custom form leads
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">Active Notices</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-50 p-1.5 flex items-center justify-center">
              <img src={LOGOS.notices} alt="Notices" className="w-full h-full object-contain" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-cyan-700 font-mono">
              {stats.totalNotices}
            </div>
            <div className="text-[11px] text-cyan-700/80 font-medium mt-0.5">
              Live on website
            </div>
          </div>
        </div>
      </div>

      {/* Class distribution */}
      {classList.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="font-semibold text-slate-800 text-sm mb-3">
            Live Application Distribution by Class
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {classList.map(([cls, count]) => {
              const pct = Math.round((count / (admissions.length || 1)) * 100);
              return (
                <div key={cls} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                  <div className="text-sm font-bold text-slate-800 font-mono">{count}</div>
                  <div className="text-xs text-slate-500 mt-0.5 truncate">{cls}</div>
                  <div className="mt-2 h-1.5 rounded-full w-full bg-slate-200 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--primary)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Applications Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <div className="font-semibold text-slate-800 text-sm">Recent Admission Submissions</div>
            <div className="text-xs text-slate-400">Live incoming applications from parents & students</div>
          </div>
          {setActiveSection && (
            <button
              onClick={() => setActiveSection("admissions")}
              className="text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              View Full List →
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--muted)" }}>
                {["Application ID", "Student Name", "Class", "Parent / Contact", "Submitted", "Status", "Quick Action"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentApps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400 text-xs">
                    No admission applications yet. Use the public "Apply for Admission" page to submit new applications!
                  </td>
                </tr>
              ) : (
                recentApps.map((app) => (
                  <tr key={app.id} className="border-t border-slate-50 hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-slate-600">{app.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{app.studentName}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{app.classApplying}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">
                      <div>{app.fatherName || app.motherName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{app.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {new Date(app.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColor[app.status]}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {app.status !== "Approved" && (
                          <button
                            onClick={() => dataService.updateAdmissionStatus(app.id, "Approved")}
                            className="text-xs text-green-600 hover:text-green-800 font-medium"
                          >
                            Approve
                          </button>
                        )}
                        {app.status !== "Rejected" && (
                          <button
                            onClick={() => dataService.updateAdmissionStatus(app.id, "Rejected")}
                            className="text-xs text-red-600 hover:text-red-800 font-medium"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
