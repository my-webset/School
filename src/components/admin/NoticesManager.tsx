import { useState, useEffect } from "react";
import { dataService } from "../../services/dataService";
import { NoticeItem } from "../../types";

export default function NoticesManager() {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    category: "General" as NoticeItem["category"],
    description: "",
    published: true,
  });

  const loadData = () => {
    setNotices(dataService.getNotices());
  };

  useEffect(() => {
    loadData();
    return dataService.subscribe(loadData);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      title: "",
      date: new Date().toISOString().split("T")[0],
      category: "General",
      description: "",
      published: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (n: NoticeItem) => {
    setEditingId(n.id);
    setForm({
      title: n.title,
      date: n.date,
      category: n.category,
      description: n.description || "",
      published: n.published,
    });
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) {
      alert("Please enter a notice title.");
      return;
    }
    if (editingId) {
      const all = dataService.getNotices();
      const idx = all.findIndex(n => n.id === editingId);
      if (idx >= 0) {
        all[idx] = { ...all[idx], ...form };
        dataService.saveNotices(all);
        showToast("Notice updated successfully!");
      }
    } else {
      dataService.addNotice(form);
      showToast("Notice created and published!");
    }
    setShowModal(false);
  };

  const togglePublish = (id: string) => {
    const all = dataService.getNotices();
    const idx = all.findIndex(n => n.id === id);
    if (idx >= 0) {
      all[idx].published = !all[idx].published;
      dataService.saveNotices(all);
      showToast(all[idx].published ? "Notice published live" : "Notice moved to drafts");
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this notice?")) {
      dataService.deleteNotice(id);
      showToast("Notice removed.");
    }
  };

  return (
    <div className="p-6 space-y-5">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-800 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2">
          <span>📢</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "DM Serif Display, serif" }}>
            Official Notices & Circulars
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage school announcements, examination notices, and circulars shown on the public site.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-95 transition-opacity"
          style={{ background: "var(--primary)" }}
        >
          + Create New Notice
        </button>
      </div>

      {/* Notices List */}
      <div className="space-y-3">
        {notices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center text-slate-400 text-xs">
            No notices found. Click "+ Create New Notice" to post an announcement.
          </div>
        ) : (
          notices.map((n) => (
            <div
              key={n.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3.5">
                <div
                  className="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 font-bold"
                  style={{ background: "var(--secondary)", color: "var(--primary)" }}
                >
                  <span className="text-sm font-bold">{new Date(n.date).getDate()}</span>
                  <span className="text-[10px] uppercase">{new Date(n.date).toLocaleDateString("en-IN", { month: "short" })}</span>
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-xs leading-snug">{n.title}</div>
                  {n.description && <div className="text-xs text-slate-500 mt-1 line-clamp-2">{n.description}</div>}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {n.category}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${n.published ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {n.published ? "● Live on Site" : "○ Draft / Hidden"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => togglePublish(n.id)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  {n.published ? "Unpublish" : "Publish"}
                </button>
                <button
                  onClick={() => handleOpenEdit(n)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg text-blue-700 hover:bg-blue-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(n.id)}
                  className="px-2 py-1.5 text-xs text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg" style={{ fontFamily: "DM Serif Display, serif" }}>
                {editingId ? "Edit Notice" : "New Notice"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Notice Title *</label>
                <input
                  required
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none"
                  placeholder="Enter notice headline..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value as any }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none"
                  >
                    <option value="Admission">Admission</option>
                    <option value="Academic">Academic</option>
                    <option value="Event">Event</option>
                    <option value="Examination">Examination</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Notice Details / Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none resize-none"
                  placeholder="Full circular text..."
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                <span className="font-semibold text-slate-700">Publish immediately to website</span>
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={e => setForm(f => ({ ...f, published: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl font-bold text-white shadow-sm"
                  style={{ background: "var(--primary)" }}
                >
                  {editingId ? "Update Notice" : "Publish Notice"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold"
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
