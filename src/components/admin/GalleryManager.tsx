import { useState, useEffect } from "react";
import { dataService } from "../../services/dataService";
import { GalleryItem } from "../../types";

export default function GalleryManager() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [form, setForm] = useState({
    title: "",
    category: "Campus" as GalleryItem["category"],
    imageUrl: "",
    date: new Date().toISOString().split("T")[0],
  });

  const loadData = () => {
    setItems(dataService.getGallery());
  };

  useEffect(() => {
    loadData();
    return dataService.subscribe(loadData);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.imageUrl) {
      alert("Please provide title and image URL.");
      return;
    }
    dataService.addGalleryItem(form);
    setShowModal(false);
    setForm({
      title: "",
      category: "Campus",
      imageUrl: "",
      date: new Date().toISOString().split("T")[0],
    });
    showToast("Photo added to gallery!");
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this photo from gallery?")) {
      dataService.deleteGalleryItem(id);
      showToast("Photo removed.");
    }
  };

  const categories = ["All", "Campus", "Sports", "Cultural", "Academics", "Events"];
  const filtered = filterCat === "All" ? items : items.filter(i => i.category === filterCat);

  return (
    <div className="p-6 space-y-5">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-800 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2">
          <span>🖼️</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "DM Serif Display, serif" }}>
            Campus & Activity Gallery
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage high-resolution photo highlights displayed on the public gallery page.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-95 transition-opacity"
          style={{ background: "var(--primary)" }}
        >
          + Add New Photo
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              filterCat === cat
                ? "text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
            style={filterCat === cat ? { background: "var(--primary)" } : {}}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-slate-100 p-16 text-center text-slate-400 text-xs">
            No photos in this category. Click "+ Add New Photo" to upload highlights.
          </div>
        ) : (
          filtered.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group">
              <div className="relative h-44 overflow-hidden bg-slate-100">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  {item.category}
                </span>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="absolute top-2.5 right-2.5 w-7 h-7 bg-red-600/80 hover:bg-red-600 text-white rounded-lg flex items-center justify-center text-xs shadow-md transition-colors"
                  title="Delete image"
                >
                  ✕
                </button>
              </div>
              <div className="p-3.5">
                <div className="font-semibold text-slate-800 text-xs truncate">{item.title}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{item.date}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg" style={{ fontFamily: "DM Serif Display, serif" }}>
                Add Gallery Photo
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Photo Title / Caption *</label>
                <input
                  required
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none"
                  placeholder="e.g. Science Fair Robotics Demonstration"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value as any }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none"
                >
                  <option value="Campus">Campus Infrastructure</option>
                  <option value="Sports">Sports & Athletics</option>
                  <option value="Cultural">Cultural & Arts</option>
                  <option value="Academics">Academic Labs & Classrooms</option>
                  <option value="Events">Annual Day & Celebrations</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Image URL *</label>
                <input
                  required
                  type="url"
                  value={form.imageUrl}
                  onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              {form.imageUrl && (
                <div className="h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as any).style.display = 'none'; }} />
                </div>
              )}

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl font-bold text-white shadow-sm"
                  style={{ background: "var(--primary)" }}
                >
                  Add Photo
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
