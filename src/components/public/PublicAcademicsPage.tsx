import { dataService } from "../../services/dataService";

interface Props {
  setCurrentPage: (p: string) => void;
}

export default function PublicAcademicsPage({ setCurrentPage }: Props) {
  const school = dataService.getSchoolInfo();

  const wings = [
    {
      title: "Foundational & Pre-Primary Wing",
      grades: "Nursery, LKG, UKG",
      focus: "Activity-centric learning, phonics, number sense, motor development, and joyful creative discovery.",
      subjects: ["English Phonics & Rhymes", "Foundational Numeracy", "General Awareness", "Creative Arts & Music"],
    },
    {
      title: "Primary Wing",
      grades: "Class I to Class V",
      focus: "Building solid conceptual understanding in mathematics, languages, environmental studies, and basic computing.",
      subjects: ["English Language & Literature", "Mathematics", "Environmental Studies (EVS)", "Second Language (Hindi)", "Information Technology"],
    },
    {
      title: "Middle School Wing",
      grades: "Class VI to Class VIII",
      focus: "Developing critical inquiry, laboratory experimentation, introductory coding, and interdisciplinary project work.",
      subjects: ["Physics, Chemistry, Biology", "Mathematics", "History, Civics, Geography", "Third Language (Sanskrit/French)", "Robotics & Coding"],
    },
    {
      title: "Secondary & Senior Secondary Wing",
      grades: "Class IX to Class XII",
      focus: "Specialized streams for competitive entrance (JEE, NEET, CUET, CLAT) with rigorous CBSE board exam preparation.",
      subjects: ["Science Stream (PCM/PCB)", "Commerce Stream (Accounts, Business Studies, Eco)", "Humanities Stream (Pol Sci, Psychology, History)"],
    },
  ];

  return (
    <div className="min-h-screen pb-20" style={{ background: "var(--background)" }}>
      <div style={{ background: "var(--primary)" }} className="py-16 text-center text-white">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "DM Serif Display, serif" }}>
            Academics & CBSE Curriculum
          </h1>
          <p className="text-blue-200 text-xs sm:text-sm mt-2">
            Affiliated to CBSE ({school.affiliationNo}) · Progressive, competency-based education framework.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          {wings.map(w => (
            <div key={w.title} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-3 py-1 rounded-full font-mono">
                  {w.grades}
                </span>
                <h3 className="font-bold text-slate-900 text-lg mt-3 mb-2" style={{ fontFamily: "DM Serif Display, serif" }}>
                  {w.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">{w.focus}</p>

                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Key Focus Areas:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {w.subjects.map(s => (
                      <span key={s} className="text-[11px] bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 font-medium">
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4">
                <button
                  onClick={() => setCurrentPage("admission")}
                  className="w-full py-2.5 rounded-xl font-bold text-xs text-slate-900 text-center shadow-xs hover:opacity-95 transition-opacity"
                  style={{ background: "var(--accent)" }}
                >
                  Apply for {w.grades.split(",")[0]}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
