import { useState, useEffect } from "react";
import { dataService } from "../../services/dataService";
import { EventItem } from "../../types";

export default function EventsManager() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({
    name: "",
    date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    time: "09:00 AM",
    location: "Main Auditorium",
    description: "",
    published: true,
  });

  const loadData = () => {
    setEvents(dataService.getEvents());
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
      name: "",
      date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      time: "09:00 AM",
      location: "Main Auditorium",
      description: "",
      published: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (evt: EventItem) => {
    setEditingId(evt.id);
    setForm({
      name: evt.name,
      date: evt.date,
      time: evt.time,
      location: evt.location,
      description: evt.description,
      published: evt.published,
    });
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) {
      alert("Please enter event name.");
      return;
    }
    if (editingId) {
      const all = dataService.getEvents();
      const idx = all.findIndex(e => e.id === editingId);
      if (idx >= 0) {
        all[idx] = { ...all[idx], ...form };
        dataService.saveEvents(all);
        showToast("Event updated successfully!");
      }
    } else {
      dataService.addEvent(form);
      showToast("Event created successfully!");
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      dataService.deleteEvent(id);
      showToast("Event removed.");
    }
  };

  return (
    <div className="p-6 space-y-5">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-800 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2">
          <span>📅</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "DM Serif Display, serif" }}>
            School Events & Activities
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage upcoming sports meets, cultural celebrations, parent-teacher conferences, and academic workshops.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-95 transition-opacity"
          style={{ background: "var(--primary)" }}
        >
          + Add New Event
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {events.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center text-slate-400 text-xs">
            No events scheduled yet. Click "+ Add New Event" to add to the school calendar.
          </div>
        ) : (
          events.map((evt) => (
            <div
              key={evt.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3.5">
                <div
                  className="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 font-bold"
                  style={{ background: "var(--secondary)", color: "var(--primary)" }}
                >
                  <span className="text-sm font-bold">{new Date(evt.date).getDate()}</span>
                  <span className="text-[10px] uppercase">{new Date(evt.date).toLocaleDateString("en-IN", { month: "short" })}</span>
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-xs">{evt.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    🕒 {evt.time} &nbsp;|&nbsp; 📍 {evt.location}
                  </div>
                  <div className="text-xs text-slate-600 mt-1 leading-relaxed">{evt.description}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => handleOpenEdit(evt)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg text-blue-700 hover:bg-blue-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(evt.id)}
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
                {editingId ? "Edit Event" : "New Event"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Event Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none"
                  placeholder="e.g. Annual Athletic Championship"
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
                  <label className="font-semibold text-slate-700 block mb-1">Time</label>
                  <input
                    value={form.time}
                    onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none"
                    placeholder="e.g. 10:00 AM"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Venue / Location</label>
                <input
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none"
                  placeholder="e.g. School Sports Ground"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description & Highlights</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none resize-none"
                  placeholder="Details for students and parents..."
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl font-bold text-white shadow-sm"
                  style={{ background: "var(--primary)" }}
                >
                  {editingId ? "Update Event" : "Save Event"}
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
