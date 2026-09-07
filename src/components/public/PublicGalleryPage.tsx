import { useState, useEffect } from "react";
import { dataService } from "../../services/dataService";
import { GalleryItem } from "../../types";

export default function PublicGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [category, setCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  useEffect(() => {
    setItems(dataService.getGallery());
    return dataService.subscribe(() => {
      setItems(dataService.getGallery());
    });
  }, []);

  const categories = ["All", "Campus", "Sports", "Cultural", "Academics", "Events"];
  const filtered = category === "All" ? items : items.filter(i => i.category === category);

  return (
    <div className="min-h-screen pb-20" style={{ background: "var(--background)" }}>
      <div style={{ background: "var(--primary)" }} className="py-16 text-center text-white">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "DM Serif Display, serif" }}>
            Campus & Life Photo Gallery
          </h1>
          <p className="text-blue-200 text-xs sm:text-sm mt-2">
            Moments of achievement, exploration, athleticism, and joy captured on our campus.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                category === cat
                  ? "text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
              style={category === cat ? { background: "var(--primary)" } : {}}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map(item => (
            <div
              key={item.id}
              onClick={() => setSelectedImage(item)}
              className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
            >
              <div className="h-52 overflow-hidden bg-slate-100 relative">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                  {item.category}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-slate-900 text-xs truncate">{item.title}</h3>
                <div className="text-[11px] text-slate-400 mt-0.5">{item.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-white rounded-3xl overflow-hidden max-w-3xl w-full shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative max-h-[75vh] bg-black flex items-center justify-center">
              <img src={selectedImage.imageUrl} alt={selectedImage.title} className="max-h-[75vh] object-contain w-full" />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{selectedImage.title}</h3>
                <div className="text-xs text-slate-500">{selectedImage.category} · {selectedImage.date}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
