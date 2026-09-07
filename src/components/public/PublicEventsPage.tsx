import { useState, useEffect } from "react";
import { dataService } from "../../services/dataService";
import { EventItem } from "../../types";

export default function PublicEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    setEvents(dataService.getEvents().filter(e => e.published));
    return dataService.subscribe(() => {
      setEvents(dataService.getEvents().filter(e => e.published));
    });
  }, []);

  return (
    <div className="min-h-screen pb-20" style={{ background: "var(--background)" }}>
      <div style={{ background: "var(--primary)" }} className="py-16 text-center text-white">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "DM Serif Display, serif" }}>
            School Activities & Events Calendar
          </h1>
          <p className="text-blue-200 text-xs sm:text-sm mt-2">
            Explore our vibrant calendar of sporting competitions, science fests, and cultural celebrations.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-4">
        {events.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center text-slate-400 text-xs">
            No events scheduled at the moment.
          </div>
        ) : (
          events.map((evt) => (
            <div
              key={evt.id}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col sm:flex-row items-start gap-5 hover:shadow-md transition-shadow"
            >
              <div
                className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 font-bold"
                style={{ background: "var(--secondary)", color: "var(--primary)" }}
              >
                <span className="text-lg font-bold">{new Date(evt.date).getDate()}</span>
                <span className="text-[11px] uppercase font-semibold">{new Date(evt.date).toLocaleDateString("en-IN", { month: "short" })}</span>
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="font-bold text-slate-900 text-base">{evt.name}</h3>
                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                  <span>🕒 {evt.time}</span>
                  <span>📍 {evt.location}</span>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{evt.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
