import { useState, useEffect, useRef } from "react";
import { dataService } from "../../services/dataService";
import { GalleryItem } from "../../types";

export default function GalleryManager() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Process selected image file from device storage/gallery
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (PNG, JPG, JPEG, WebP).");
      return;
    }

    setIsProcessingFile(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Optimize and compress image if too large
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1600;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setForm(f => ({
          ...f,
          imageUrl: compressedDataUrl,
          title: f.title || file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
        }));
        setIsProcessingFile(false);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.imageUrl) {
      alert("Please provide a title and select/provide an image.");
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
          onClick={() => {
            setForm({
              title: "",
              category: "Campus",
              imageUrl: "",
              date: new Date().toISOString().split("T")[0],
            });
            setShowModal(true);
          }}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-95 transition-opacity flex items-center gap-1.5"
          style={{ background: "var(--primary)" }}
        >
          <span>+</span>
          <span>Add New Photo</span>
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
            No photos in this category. Click "+ Add New Photo" to upload highlights from your device or gallery.
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
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg" style={{ fontFamily: "DM Serif Display, serif" }}>
                Add Gallery Photo
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Upload Mode Selector */}
              <div className="flex rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setUploadMode("file")}
                  className={`flex-1 py-1.5 font-bold rounded-lg transition-all ${
                    uploadMode === "file" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  📁 Upload from Device / Phone Gallery
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode("url")}
                  className={`flex-1 py-1.5 font-bold rounded-lg transition-all ${
                    uploadMode === "url" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  🔗 Image Web URL
                </button>
              </div>

              {/* Mode 1: File Upload */}
              {uploadMode === "file" ? (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1.5">Choose Photo from Device *</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileSelect(f);
                    }}
                    className="hidden"
                    id="gallery-file-picker"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const f = e.dataTransfer.files?.[0];
                      if (f) handleFileSelect(f);
                    }}
                    className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/70 hover:bg-blue-50/20 transition-all"
                  >
                    {isProcessingFile ? (
                      <div className="space-y-2 py-4">
                        <div className="animate-spin text-2xl">⏳</div>
                        <div className="font-semibold text-slate-700">Optimizing photo for cloud upload...</div>
                      </div>
                    ) : form.imageUrl ? (
                      <div className="space-y-3">
                        <img src={form.imageUrl} alt="Selected" className="h-40 w-full object-cover rounded-xl mx-auto shadow-sm" />
                        <div className="text-[11px] font-bold text-blue-600 hover:underline">Click to choose a different photo</div>
                      </div>
                    ) : (
                      <div className="space-y-2 py-2">
                        <div className="text-3xl">📷</div>
                        <div className="font-bold text-slate-800 text-sm">Click to choose image or drag & drop</div>
                        <div className="text-[11px] text-slate-400">Supports JPG, PNG, WEBP from your phone or computer</div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Image URL *</label>
                  <input
                    required={uploadMode === "url"}
                    type="url"
                    value={form.imageUrl}
                    onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none"
                    placeholder="https://images.unsplash.com/..."
                  />
                  {form.imageUrl && (
                    <div className="h-32 mt-2 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                      <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as any).style.display = 'none'; }} />
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Photo Title / Caption *</label>
                <input
                  required
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none"
                  placeholder="e.g. Science Fair Robotics Demonstration"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
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
                  <label className="font-semibold text-slate-700 block mb-1">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={!form.imageUrl || !form.title}
                  className="flex-1 py-3 rounded-xl font-bold text-white shadow-sm disabled:opacity-50"
                  style={{ background: "var(--primary)" }}
                >
                  Add Photo to Gallery
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

