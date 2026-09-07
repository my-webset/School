import { useState, useEffect } from "react";
import { dataService } from "../../services/dataService";
import { NoticeItem } from "../../types";

interface Props {
  setCurrentPage: (p: string) => void;
}

export default function PublicNoticesPage({ setCurrentPage }: Props) {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [activeCat, setActiveCat] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setNotices(dataService.getNotices().filter(n => n.published));
    return dataService.subscribe(() => {
      setNotices(dataService.getNotices().filter(n => n.published));
    });
  }, []);

  const categories = ["All", "Admission", "Academic", "Event", "Examination", "General"];

  const filtered = notices.filter(n => {
    const matchesCat = activeCat === "All" || n.category === activeCat;
    const matchesSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || (n.description || "").toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen pb-20" style={{ background: "var(--background)" }}>
      {/* Banner */}
      <div style={{ background: "var(--primary)" }} className="py-16 text-center text-white">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "DM Serif Display, serif" }}>
            Notices & Official Circulars
          </h1>
          <p className="text-blue-200 text-xs sm:text-sm mt-2">
            Stay updated with official announcements, exam timetables, and academic circulars.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        {/* Search & Category Filter */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  activeCat === cat
                    ? "text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
                style={activeCat === cat ? { background: "var(--primary)" } : {}}
              >
                {cat}
              </button>
            ))}
          </div>

          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search circulars..."
            className="w-full sm:w-64 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none"
          />
        </div>

        {/* List */}
        <div className="space-y-3.5">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center text-slate-400 text-xs">
              No circulars found matching your criteria.
            </div>
          ) : (
            filtered.map((n) => (
              <div
                key={n.id}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 font-bold"
                  style={{ background: "var(--secondary)", color: "var(--primary)" }}
                >
                  <span className="text-base font-bold">{new Date(n.date).getDate()}</span>
                  <span className="text-[10px] uppercase font-semibold">{new Date(n.date).toLocaleDateString("en-IN", { month: "short" })}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {n.category}
                    </span>
                    <span className="text-[11px] text-slate-400">{new Date(n.date).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{n.title}</h3>
                  {n.description && <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.description}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
