import { dataService } from "../../services/dataService";
import LOGOS from "../../assets/logos";

interface Props {
  setCurrentPage: (p: string) => void;
}

export default function PublicAboutPage({ setCurrentPage }: Props) {
  const school = dataService.getSchoolInfo();

  return (
    <div className="min-h-screen pb-20" style={{ background: "var(--background)" }}>
      <div style={{ background: "var(--primary)" }} className="py-16 text-center text-white">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "DM Serif Display, serif" }}>
            About {school.name}
          </h1>
          <p className="text-blue-200 text-xs sm:text-sm mt-2">
            A tradition of academic distinction, ethical leadership, and holistic student growth since {school.established}.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        {/* Story Section */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-sm grid md:grid-cols-2 gap-8 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-900 bg-blue-50 px-3 py-1 rounded-full">
              Our Heritage
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-3 mb-4" style={{ fontFamily: "DM Serif Display, serif" }}>
              Nurturing Excellence for over 35 Years
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {school.about}
            </p>
            <div className="mt-6 flex items-center gap-4">
              <button
                onClick={() => setCurrentPage("admission")}
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-900 shadow-sm"
                style={{ background: "var(--accent)" }}
              >
                Apply for Admission
              </button>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-100">
            <img
              src={school.aboutUsImageUrl || school.campusImageUrl || "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=800&auto=format&fit=crop"}
              alt="Campus"
              className="w-full h-72 object-cover"
            />
          </div>
        </div>

        {/* Vision & Mission */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-xl">
              🎯
            </div>
            <h3 className="font-bold text-slate-900 text-lg" style={{ fontFamily: "DM Serif Display, serif" }}>
              Our Vision
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              To be a premier global institution that empowers learners with transformative education, ethical grounding, and innovative problem-solving abilities to thrive in a dynamically evolving world.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-xl">
              🌟
            </div>
            <h3 className="font-bold text-slate-900 text-lg" style={{ fontFamily: "DM Serif Display, serif" }}>
              Our Mission
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cultivate an inclusive, curiosity-driven environment that inspires critical thinking, respects cultural diversity, values physical wellness, and instills lifelong moral principles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
