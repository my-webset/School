import { useState, useEffect } from "react";
import { dataService } from "../../services/dataService";
import { AdmissionApplication } from "../../types";
import LOGOS from "../../assets/logos";

const statusColor: Record<string, string> = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Approved: "bg-green-50 text-green-700 border-green-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
};

export default function AdmissionsManager() {
  const [apps, setApps] = useState<AdmissionApplication[]>([]);
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selected, setSelected] = useState<AdmissionApplication | null>(null);
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState("");
  const [notesInput, setNotesInput] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [manualForm, setManualForm] = useState({
    studentName: "", dob: "", gender: "Male", classApplying: "Class I",
    fatherName: "", motherName: "", phone: "", email: "", address: "", prevSchool: ""
  });
  const perPage = 8;
  const school = dataService.getSchoolInfo();

  const loadData = () => {
    setApps(dataService.getAdmissions());
  };

  useEffect(() => {
    loadData();
    return dataService.subscribe(loadData);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const handleStatusChange = (id: string, status: "Pending" | "Approved" | "Rejected") => {
    dataService.updateAdmissionStatus(id, status, notesInput || undefined);
    if (selected?.id === id) {
      setSelected(prev => prev ? { ...prev, status, notes: notesInput || prev.notes } : null);
    }
    showToast(`Application ${id} marked as ${status}`);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(`Are you sure you want to delete application ${id}?`)) {
      dataService.deleteAdmission(id);
      if (selected?.id === id) setSelected(null);
      showToast(`Application ${id} removed`);
    }
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.studentName || !manualForm.phone) {
      alert("Please fill required fields.");
      return;
    }
    dataService.addAdmission(manualForm);
    setShowAddModal(false);
    setManualForm({
      studentName: "", dob: "", gender: "Male", classApplying: "Class I",
      fatherName: "", motherName: "", phone: "", email: "", address: "", prevSchool: ""
    });
    showToast("Application created successfully!");
  };

  const filtered = apps.filter(a => {
    const q = search.toLowerCase();
    return (
      (!search ||
        a.id.toLowerCase().includes(q) ||
        a.studentName.toLowerCase().includes(q) ||
        a.fatherName.toLowerCase().includes(q) ||
        a.phone.includes(q)) &&
      (!filterClass || a.classApplying === filterClass) &&
      (!filterStatus || a.status === filterStatus)
    );
  });

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const classOptions = Array.from(new Set(apps.map(a => a.classApplying))).filter(Boolean);

  return (
    <div className="p-6 space-y-5">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-800 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2">
          <span>🔔</span>
          <span>{toast}</span>
        </div>
      )}

      {selected ? (
        /* Printable Detail View */
        <div>
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <button
              onClick={() => setSelected(null)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl transition-colors"
            >
              ← Back to Applications List
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 flex items-center gap-1.5 shadow-sm"
              >
                🖨️ Print Slip
              </button>
              <button
                onClick={() => handleStatusChange(selected.id, "Approved")}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-green-600 text-white hover:bg-green-700 shadow-sm"
              >
                Approve
              </button>
              <button
                onClick={() => handleStatusChange(selected.id, "Rejected")}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 shadow-sm"
              >
                Reject
              </button>
              <button
                onClick={() => handleStatusChange(selected.id, "Pending")}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-amber-500 text-white hover:bg-amber-600 shadow-sm"
              >
                Mark Pending
              </button>
            </div>
          </div>

          <div
            id="printable-admission-slip"
            className="bg-white rounded-3xl border border-slate-100 shadow-lg p-8 max-w-3xl mx-auto"
          >

            {/* School Header */}
            <div className="text-center pb-6 border-b border-slate-200 mb-6 flex flex-col items-center">
              <img src={LOGOS.schoolLogo} alt="Logo" className="w-16 h-16 object-contain mb-2" />
              <h2 className="text-xl font-bold text-slate-900 uppercase" style={{ fontFamily: "DM Serif Display, serif" }}>
                {school.name}
              </h2>
              <div className="text-xs text-slate-500 max-w-md">{school.address}</div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">Phone: {school.phone} | Email: {school.email}</div>
              <div className="mt-3 inline-block bg-slate-100 px-4 py-1 rounded-full text-xs font-bold text-slate-800 uppercase tracking-wide">
                Admission Registration Slip (Session 2026-27)
              </div>
            </div>

            {/* Applicant Summary */}
            <div className="flex items-start justify-between mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <div className="text-lg font-bold text-slate-800">{selected.studentName}</div>
                <div className="text-xs font-mono text-slate-500 mt-0.5">Application ID: <span className="font-bold text-slate-800">{selected.id}</span></div>
                <div className="text-xs text-slate-500 mt-0.5">Submitted On: {new Date(selected.createdAt).toLocaleString("en-IN")}</div>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${statusColor[selected.status]}`}>
                {selected.status.toUpperCase()}
              </span>
            </div>

            {/* Information Grid */}
            <div className="grid sm:grid-cols-2 gap-4 text-xs mb-6">
              {[
                ["Class Applying For", selected.classApplying],
                ["Date of Birth", selected.dob || "Not specified"],
                ["Gender", selected.gender || "Not specified"],
                ["Father's Name", selected.fatherName || "—"],
                ["Mother's Name", selected.motherName || "—"],
                ["Contact Phone", selected.phone],
                ["Email Address", selected.email || "—"],
                ["Previous School", selected.prevSchool || "—"],
                ["Previous Class", selected.prevClass || "—"],
              ].map(([k, v]) => (
                <div key={k as string} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[11px] text-slate-400 font-medium mb-0.5">{k}</div>
                  <div className="font-semibold text-slate-800 text-xs">{v}</div>
                </div>
              ))}
              <div className="sm:col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-[11px] text-slate-400 font-medium mb-0.5">Residential Address</div>
                <div className="font-semibold text-slate-800 text-xs">{selected.address}</div>
              </div>
            </div>

            {/* Admin Notes Section */}
            <div className="pt-4 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Internal Administrative Remarks / Verification Notes
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Documents verified, fee receipt issued..."
                  value={notesInput}
                  onChange={e => setNotesInput(e.target.value)}
                  className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
                <button
                  onClick={() => {
                    dataService.updateAdmissionStatus(selected.id, selected.status, notesInput);
                    showToast("Note updated");
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white"
                  style={{ background: "var(--primary)" }}
                >
                  Save Note
                </button>
              </div>
              {selected.notes && (
                <div className="mt-2 text-xs text-slate-600 bg-blue-50/60 p-2.5 rounded-xl border border-blue-100">
                  <strong>Current Note:</strong> {selected.notes}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Header & CSV Export */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "DM Serif Display, serif" }}>
                Admission Management
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {filtered.length} total applicant records ({apps.filter(a => a.status === "Pending").length} pending action)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl text-white shadow-sm hover:opacity-90 transition-opacity"
                style={{ background: "var(--primary)" }}
              >
                + Manual Registration
              </button>
              <button
                onClick={() => dataService.exportAdmissionsToCSV()}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <span>📥</span> Download Full CSV
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by student, ID, parent, mobile..."
              className="flex-1 min-w-[220px] border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none"
            />
            <select
              value={filterClass}
              onChange={e => { setFilterClass(e.target.value); setPage(1); }}
              className="border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white focus:outline-none"
            >
              <option value="">All Classes</option>
              {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={filterStatus}
              onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
              className="border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            {(search || filterClass || filterStatus) && (
              <button
                onClick={() => { setSearch(""); setFilterClass(""); setFilterStatus(""); setPage(1); }}
                className="text-xs text-red-600 hover:underline px-2"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "var(--muted)" }}>
                    {["App ID", "Student Name", "Class", "Parent / Contact", "Submitted Date", "Status", "Actions"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-16 text-center text-slate-400 text-xs">
                        No admission applications found. Click <strong>+ Manual Registration</strong> or fill the public admission form to add records.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((app) => (
                      <tr key={app.id} className="border-t border-slate-50 hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs font-bold text-slate-700">{app.id}</td>
                        <td className="px-4 py-3 font-medium text-slate-900 text-xs">{app.studentName}</td>
                        <td className="px-4 py-3 text-slate-600 text-xs">{app.classApplying}</td>
                        <td className="px-4 py-3 text-slate-600 text-xs">
                          <div>{app.fatherName || app.motherName || "—"}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{app.phone}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                          {new Date(app.createdAt).toLocaleDateString("en-IN")}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColor[app.status]}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => { setSelected(app); setNotesInput(app.notes || ""); }}
                              className="text-xs font-semibold text-blue-700 hover:underline"
                            >
                              View
                            </button>
                            {app.status !== "Approved" && (
                              <button
                                onClick={() => handleStatusChange(app.id, "Approved")}
                                className="text-xs font-semibold text-green-600 hover:underline"
                              >
                                Approve
                              </button>
                            )}
                            {app.status !== "Rejected" && (
                              <button
                                onClick={() => handleStatusChange(app.id, "Rejected")}
                                className="text-xs font-semibold text-red-600 hover:underline"
                              >
                                Reject
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(app.id)}
                              className="text-xs text-slate-400 hover:text-red-500 ml-1"
                              title="Delete record"
                            >
                              ✕
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                <div className="text-xs text-slate-500">
                  Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
                  >
                    ←
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`px-3 py-1.5 text-xs border rounded-lg ${page === i + 1 ? "text-white border-transparent" : "border-slate-200 hover:bg-slate-50"}`}
                      style={page === i + 1 ? { background: "var(--primary)" } : {}}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Manual Registration Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg" style={{ fontFamily: "DM Serif Display, serif" }}>
                Manual Admission Entry
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleManualAdd} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Student Full Name *</label>
                <input
                  required
                  value={manualForm.studentName}
                  onChange={e => setManualForm(f => ({ ...f, studentName: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none"
                  placeholder="e.g. Rohan Sharma"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Class Applying *</label>
                  <select
                    value={manualForm.classApplying}
                    onChange={e => setManualForm(f => ({ ...f, classApplying: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none"
                  >
                    {["Nursery", "LKG", "UKG", ...Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`)].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Gender</label>
                  <select
                    value={manualForm.gender}
                    onChange={e => setManualForm(f => ({ ...f, gender: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Parent Contact Mobile *</label>
                  <input
                    required
                    value={manualForm.phone}
                    onChange={e => setManualForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Father / Guardian Name</label>
                  <input
                    value={manualForm.fatherName}
                    onChange={e => setManualForm(f => ({ ...f, fatherName: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none"
                    placeholder="Father's name"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Residential Address</label>
                <textarea
                  rows={2}
                  value={manualForm.address}
                  onChange={e => setManualForm(f => ({ ...f, address: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none resize-none"
                  placeholder="Address..."
                />
              </div>
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl font-semibold text-white"
                  style={{ background: "var(--primary)" }}
                >
                  Save Application
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
