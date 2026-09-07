import { dataService } from "../../services/dataService";
import LOGOS from "../../assets/logos";

interface Props {
  setCurrentPage: (p: string) => void;
}

export default function PublicFacilitiesPage({ setCurrentPage }: Props) {
  const school = dataService.getSchoolInfo();

  const facilities = [
    {
      name: "Advanced Science Labs",
      iconUrl: LOGOS.scienceLab,
      desc: "Fully equipped Physics, Chemistry, and Biology laboratories maintaining rigorous safety protocols and modern experimental kits.",
    },
    {
      name: "Digital Library & Reading Zone",
      iconUrl: LOGOS.library,
      desc: "Resource-rich library housing over 20,000 reference books, international journals, digital databases, and quiet study alcoves.",
    },
    {
      name: "Grand Air-Conditioned Auditorium",
      iconUrl: LOGOS.auditorium,
      desc: "State-of-the-art 1,200 seater acoustic auditorium hosting annual theatre productions, debate competitions, and guest seminars.",
    },
    {
      name: "Sports Complex & Track",
      iconUrl: LOGOS.sportsComplex,
      desc: "Extensive multi-sport complex featuring standard football grounds, cricket pitches, basketball courts, and athletics tracks.",
    },
    {
      name: "Art & Music Conservatory",
      iconUrl: LOGOS.artAndMusic,
      desc: "Dedicated creative arts wing offering classical and western music instruction, pottery, fine painting, and theatre workshops.",
    },
    {
      name: "Robotics & Computing Center",
      iconUrl: LOGOS.techEnabledLearning,
      desc: "High-speed internet computing labs with high-end workstations dedicated to computational thinking, AI, and robotics projects.",
    },
  ];

  return (
    <div className="min-h-screen pb-20" style={{ background: "var(--background)" }}>
      <div style={{ background: "var(--primary)" }} className="py-16 text-center text-white">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "DM Serif Display, serif" }}>
            World-Class Campus Facilities
          </h1>
          <p className="text-blue-200 text-xs sm:text-sm mt-2">
            Designed to foster intellectual curiosity, physical agility, and artistic expression.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map(fac => (
            <div
              key={fac.name}
              className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-lg transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="w-16 h-16 rounded-2xl bg-blue-50/70 p-3 mb-6 flex items-center justify-center border border-blue-100">
                  <img src={fac.iconUrl} alt={fac.name} className="w-full h-full object-contain" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">{fac.name}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{fac.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 bg-gradient-to-r from-blue-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white text-center shadow-xl">
          <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: "DM Serif Display, serif" }}>
            Experience {school.name} in Person
          </h3>
          <p className="text-xs sm:text-sm text-blue-200 max-w-xl mx-auto mb-6">
            We welcome parents and prospective students to tour our classrooms, laboratories, and athletic complexes.
          </p>
          <button
            onClick={() => setCurrentPage("admission")}
            className="px-6 py-3 rounded-xl font-bold text-xs text-slate-900 shadow-md"
            style={{ background: "var(--accent)" }}
          >
            Apply for Admission & Campus Tour
          </button>
        </div>
      </div>
    </div>
  );
}
