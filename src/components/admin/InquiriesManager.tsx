import { useState, useEffect } from "react";
import { dataService } from "../../services/dataService";
import { InquiryItem, InquiryStatus } from "../../types";

const statusColors: Record<InquiryStatus, string> = {
  New: "bg-blue-50 text-blue-700 border-blue-200",
  Contacted: "bg-amber-50 text-amber-700 border-amber-200",
  Resolved: "bg-green-50 text-green-700 border-green-200",
};

export default function InquiriesManager() {
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");

  const loadData = () => {
    setInquiries(dataService.getInquiries());
  };

  useEffect(() => {
    loadData();
    return dataService.subscribe(loadData);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const handleStatusChange = (id: string, newStatus: InquiryStatus) => {
    dataService.updateInquiryStatus(id, newStatus);
    showToast(`Status updated to ${newStatus}`);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this contact inquiry?")) {
      dataService.deleteInquiry(id);
      showToast("Inquiry deleted.");
    }
  };

  const filtered = inquiries.filter(item => {
    const matchesFilter = filterStatus === "All" || item.status === filterStatus;
    const matchesSearch =
      !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.phone.includes(search) ||
      item.email.toLowerCase().includes(search.toLowerCase()) ||
      item.message.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const newCount = inquiries.filter(i => i.status === "New").length;
  const contactedCount = inquiries.filter(i => i.status === "Contacted").length;
  const resolvedCount = inquiries.filter(i => i.status === "Resolved").length;

  return (
    <div className="p-6 space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-800 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2">
          <span>📬</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "DM Serif Display, serif" }}>
              Online Contact Inquiries
            </h1>
            {newCount > 0 && (
              <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                {newCount} New
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time messages submitted by parents, students, and visitors via the Contact page.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => dataService.exportInquiriesToCSV()}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl text-white shadow-sm flex items-center gap-1.5"
            style={{ background: "var(--primary)" }}
          >
            <span>📥</span> Export to CSV
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setFilterStatus("All")}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            filterStatus === "All" ? "border-blue-500 shadow-sm bg-blue-50/30" : "bg-white border-slate-100 hover:border-slate-200"
          }`}
        >
          <div className="text-xs text-slate-500 font-medium">Total Received</div>
          <div className="text-2xl font-bold text-slate-800 font-mono mt-1">{inquiries.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">All inquiries captured</div>
        </div>

        <div
          onClick={() => setFilterStatus("New")}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            filterStatus === "New" ? "border-blue-500 shadow-sm bg-blue-50/40" : "bg-white border-slate-100 hover:border-slate-200"
          }`}
        >
          <div className="text-xs text-blue-600 font-medium">New / Unread</div>
          <div className="text-2xl font-bold text-blue-700 font-mono mt-1">{newCount}</div>
          <div className="text-[10px] text-blue-600/80 mt-0.5">Awaiting response</div>
        </div>

        <div
          onClick={() => setFilterStatus("Contacted")}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            filterStatus === "Contacted" ? "border-amber-500 shadow-sm bg-amber-50/40" : "bg-white border-slate-100 hover:border-slate-200"
          }`}
        >
          <div className="text-xs text-amber-700 font-medium">Contacted / In Progress</div>
          <div className="text-2xl font-bold text-amber-700 font-mono mt-1">{contactedCount}</div>
          <div className="text-[10px] text-amber-600 mt-0.5">Communication initiated</div>
        </div>

        <div
          onClick={() => setFilterStatus("Resolved")}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            filterStatus === "Resolved" ? "border-green-500 shadow-sm bg-green-50/40" : "bg-white border-slate-100 hover:border-slate-200"
          }`}
        >
          <div className="text-xs text-green-700 font-medium">Resolved</div>
          <div className="text-2xl font-bold text-green-700 font-mono mt-1">{resolvedCount}</div>
          <div className="text-[10px] text-green-600 mt-0.5">Completed inquiries</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {["All", "New", "Contacted", "Resolved"].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                filterStatus === st
                  ? "text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
              style={filterStatus === st ? { background: "var(--primary)" } : {}}
            >
              {st} {st === "New" && newCount > 0 && `(${newCount})`}
            </button>
          ))}
        </div>

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, phone, email, message..."
          className="w-full sm:w-72 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none"
        />
      </div>

      {/* Inquiries List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center text-slate-400 text-xs">
            No contact inquiries found. New submissions from the public website will show here automatically.
          </div>
        ) : (
          filtered.map(inq => {
            const cleanPhone = inq.phone.replace(/[^0-9]/g, "");
            const whatsappUrl = `https://wa.me/${cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`}?text=${encodeURIComponent(
              `Hello ${inq.name}, thank you for contacting Nalanda International School regarding your inquiry.`
            )}`;

            return (
              <div
                key={inq.id}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow space-y-4"
              >
                {/* Top Row: Sender Info & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-100/60 text-blue-900 font-bold flex items-center justify-center text-base flex-shrink-0">
                      {inq.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <span>{inq.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[inq.status]}`}>
                          {inq.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Received on {new Date(inq.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={`tel:${inq.phone}`}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <span>📞</span> {inq.phone}
                    </a>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <span>💬</span> WhatsApp
                    </a>
                    <a
                      href={`mailto:${inq.email}?subject=Re: Inquiry with Nalanda International School`}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <span>✉️</span> {inq.email}
                    </a>
                  </div>
                </div>

                {/* Message Body */}
                <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Inquiry Message</div>
                  <p className="whitespace-pre-line">{inq.message}</p>
                </div>

                {/* Bottom Actions: Status Selector & Delete */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-500">Update Status:</span>
                    {(["New", "Contacted", "Resolved"] as InquiryStatus[]).map(st => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(inq.id, st)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          inq.status === st
                            ? "bg-slate-800 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handleDelete(inq.id)}
                    className="text-red-500 hover:text-red-700 font-semibold text-xs ml-auto"
                  >
                    Delete Inquiry
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
