import { useState, useEffect } from "react";
import { dataService } from "../../services/dataService";
import LOGOS from "../../assets/logos";

interface Props {
  setCurrentPage: (p: string) => void;
}

export default function HomePage({ setCurrentPage }: Props) {
  const [school, setSchool] = useState(dataService.getSchoolInfo());
  const [notices, setNotices] = useState(dataService.getNotices().filter(n => n.published));

  useEffect(() => {
    return dataService.subscribe(() => {
      setSchool(dataService.getSchoolInfo());
      setNotices(dataService.getNotices().filter(n => n.published));
    });
  }, []);

  const features = [
    {
      title: "Academic Excellence",
      iconUrl: LOGOS.academicExcellence,
      desc: "Comprehensive CBSE curriculum paired with personalized academic mentoring and digital classrooms.",
    },
    {
      title: "Holistic Environment",
      iconUrl: LOGOS.holisticEnvironment,
      desc: "Balancing intellectual rigor with emotional quotient, sportsmanship, and ethical leadership.",
    },
    {
      title: "Experienced Faculty",
      iconUrl: LOGOS.experiencedFaculty,
      desc: "Dedicated master educators committed to nurturing curiosity, creativity, and foundational mastery.",
    },
    {
      title: "Modern Infrastructure",
      iconUrl: LOGOS.modernInfrastructure,
      desc: "Air-conditioned smart classrooms, high-tech robotics labs, and extensive campus amenities.",
    },
    {
      title: "Safe Environment",
      iconUrl: LOGOS.safeEnvironment,
      desc: "Round-the-clock CCTV security, trained medical staff, and strict child protection protocols.",
    },
    {
      title: "Tech-Enabled Learning",
      iconUrl: LOGOS.techEnabledLearning,
      desc: "Interactive smart boards, coding curriculum, STEM learning kits, and virtual resource portals.",
    },
  ];

  const facilities = [
    {
      name: "Advanced Science Labs",
      iconUrl: LOGOS.scienceLab,
      desc: "Spacious Physics, Chemistry & Biology laboratories equipped with modern apparatus.",
    },
    {
      name: "Modern Digital Library",
      iconUrl: LOGOS.library,
      desc: "Over 20,000 physical volumes, digital encyclopedias, and quiet reading research zones.",
    },
    {
      name: "Grand Auditorium",
      iconUrl: LOGOS.auditorium,
      desc: "1,200-seat acoustically designed auditorium for theatre, conferences, and cultural fests.",
    },
    {
      name: "Sports Complex & Track",
      iconUrl: LOGOS.sportsComplex,
      desc: "Cricket pitch, basketball courts, Olympic athletic tracks, and indoor sports arena.",
    },
    {
      name: "Art & Music Conservatory",
      iconUrl: LOGOS.artAndMusic,
      desc: "Dedicated visual arts studios, classical & western music rooms, and dance halls.",
    },
    {
      name: "Computer & AI Lab",
      iconUrl: LOGOS.techEnabledLearning,
      desc: "High-speed networked computing lab with Python programming and robotics modules.",
    },
  ];

  const academicPrograms = [
    { name: "Pre-Primary Foundation", classes: "Nursery – UKG", desc: "Montessori-inspired experiential play learning, language immersion, and motor skills development." },
    { name: "Primary Wing", classes: "Class I – V", desc: "Core literacy, computational thinking, environmental science, and creative expression." },
    { name: "Middle School", classes: "Class VI – VIII", desc: "Analytical science, second languages, integrated robotics, and inter-school sports." },
    { name: "Senior Secondary", classes: "Class IX – XII", desc: "Rigorous board preparation with Science (PCM/PCB), Commerce, and Humanities streams." },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden min-h-[580px] flex items-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=1600&auto=format&fit=crop"
            alt="School Campus"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(90deg, rgba(15,33,71,0.95) 0%, rgba(15,33,71,0.85) 55%, rgba(15,33,71,0.45) 100%)",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28 text-white grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-8 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-blue-200 text-xs font-semibold uppercase tracking-wider backdrop-blur-xs">
              <span>🏆</span>
              <span>CBSE Affiliated · {school.affiliationNo}</span>
            </div>

            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight"
              style={{ fontFamily: "DM Serif Display, serif" }}
            >
              {school.name}
            </h1>

            <p className="text-base sm:text-lg text-blue-100 max-w-2xl leading-relaxed">
              {school.tagline}. Providing world-class education rooted in traditional values, preparing young leaders for global success since {school.established}.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={() => setCurrentPage("admission")}
                className="px-7 py-3.5 rounded-xl font-bold text-sm text-slate-900 shadow-xl transition-all hover:scale-105"
                style={{ background: "var(--accent)" }}
              >
                Apply for Admission 2026-27
              </button>
              <button
                onClick={() => setCurrentPage("about")}
                className="px-6 py-3.5 rounded-xl font-semibold text-sm bg-white/10 border border-white/25 text-white hover:bg-white/20 transition-all backdrop-blur-xs"
              >
                Explore Campus
              </button>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="lg:col-span-4 bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 text-white space-y-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <img src={LOGOS.schoolLogo} alt="Logo" className="w-12 h-12 object-contain p-1 bg-white/20 rounded-xl" />
              <div>
                <div className="font-bold text-sm" style={{ fontFamily: "DM Serif Display, serif" }}>Key Highlights</div>
                <div className="text-[11px] text-blue-200">Excellence in Numbers</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                <div className="text-2xl font-bold font-mono text-amber-300">100%</div>
                <div className="text-[11px] text-blue-100 mt-0.5">Board Pass Rate</div>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                <div className="text-2xl font-bold font-mono text-amber-300">35+</div>
                <div className="text-[11px] text-blue-100 mt-0.5">Years of Legacy</div>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                <div className="text-2xl font-bold font-mono text-amber-300">1:18</div>
                <div className="text-[11px] text-blue-100 mt-0.5">Teacher Ratio</div>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                <div className="text-2xl font-bold font-mono text-amber-300">25+</div>
                <div className="text-[11px] text-blue-100 mt-0.5">Sports & Clubs</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHY CHOOSE US (FEATURING OFFICIAL FEATURE LOGOS) */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-900 bg-blue-50 px-3 py-1 rounded-full">
            Our Distinctive Edge
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mt-3" style={{ fontFamily: "DM Serif Display, serif" }}>
            Why Choose {school.name}?
          </h2>
          <p className="text-xs text-slate-500 mt-2">
            A harmonious integration of academic brilliance, moral integrity, and modern infrastructure.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-50 p-2.5 mb-5 flex items-center justify-center border border-slate-100">
                <img src={f.iconUrl} alt={f.title} className="w-full h-full object-contain" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">{f.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. PRINCIPAL'S DESK */}
      <section style={{ background: "var(--muted)" }} className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-100 grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4 text-center">
              <div className="w-36 h-36 rounded-full mx-auto p-1 bg-gradient-to-tr from-blue-900 to-amber-400 mb-4 shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop"
                  alt={school.principal}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="font-bold text-slate-900 text-base">{school.principal}</div>
              <div className="text-xs text-slate-500">Principal & Director of Academics</div>
              <div className="text-[11px] text-blue-700 font-semibold mt-1">Ph.D. Education · {school.name}</div>
            </div>

            <div className="lg:col-span-8 space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-600">From the Principal's Desk</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800" style={{ fontFamily: "DM Serif Display, serif" }}>
                "Inspiring Minds, Illuminating Futures"
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                "{school.principalMessage}"
              </p>
              <div className="pt-3">
                <button
                  onClick={() => setCurrentPage("admission")}
                  className="text-xs font-bold text-blue-900 hover:underline inline-flex items-center gap-1.5"
                >
                  Learn more about our admissions process →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WORLD-CLASS FACILITIES (FEATURING OFFICIAL FACILITY LOGOS) */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-900 bg-blue-50 px-3 py-1 rounded-full">
            Campus Infrastructure
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mt-3" style={{ fontFamily: "DM Serif Display, serif" }}>
            World-Class School Facilities
          </h2>
          <p className="text-xs text-slate-500 mt-2">
            Every facility is crafted to cultivate creativity, scientific temperament, and physical vitality.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((fac) => (
            <div
              key={fac.name}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-shadow flex items-start gap-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-50/70 p-2.5 flex items-center justify-center flex-shrink-0 border border-blue-100">
                <img src={fac.iconUrl} alt={fac.name} className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">{fac.name}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{fac.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. ACADEMIC PROGRAMMES */}
      <section style={{ background: "var(--primary)" }} className="py-20 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
              Structured Learning Pathways
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-2" style={{ fontFamily: "DM Serif Display, serif" }}>
              Academic Wings & Curricula
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {academicPrograms.map((prog) => (
              <div
                key={prog.name}
                className="bg-white/10 rounded-3xl p-6 border border-white/15 backdrop-blur-xs flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider mb-2 font-mono" style={{ color: "var(--accent)" }}>
                    {prog.classes}
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "DM Serif Display, serif" }}>
                    {prog.name}
                  </h3>
                  <p className="text-xs text-blue-100/90 leading-relaxed">{prog.desc}</p>
                </div>
                <button
                  onClick={() => setCurrentPage("academics")}
                  className="mt-5 text-xs font-bold text-white hover:underline text-left inline-flex items-center gap-1"
                >
                  View Curriculum →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. LATEST NOTICES TICKER / CARDS */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-900">Official Announcements</span>
            <h2 className="text-3xl font-bold text-slate-800 mt-1" style={{ fontFamily: "DM Serif Display, serif" }}>
              Latest Circulars & Notices
            </h2>
          </div>
          <button
            onClick={() => setCurrentPage("notices")}
            className="text-xs font-bold text-blue-900 hover:underline self-start sm:self-auto"
          >
            View All Circulars →
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {notices.slice(0, 3).map((notice) => (
            <div
              key={notice.id}
              className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4"
            >
              <div
                className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 font-bold"
                style={{ background: "var(--secondary)", color: "var(--primary)" }}
              >
                <span className="text-sm font-bold">{new Date(notice.date).getDate()}</span>
                <span className="text-[10px] uppercase">{new Date(notice.date).toLocaleDateString("en-IN", { month: "short" })}</span>
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  {notice.category}
                </span>
                <h4 className="font-bold text-slate-900 text-xs mt-1.5 leading-snug">{notice.title}</h4>
                {notice.description && <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{notice.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. ADMISSIONS BANNER CTA */}
      <section className="py-16 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-6 space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-white/10 p-2 mx-auto mb-2 flex items-center justify-center">
            <img src={LOGOS.schoolLogo} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: "DM Serif Display, serif" }}>
            Admissions Open for Academic Session 2026-27
          </h2>
          <p className="text-xs sm:text-sm text-blue-200 max-w-xl mx-auto leading-relaxed">
            Secure your child's seat at {school.name}. Limited seats available across Pre-Primary, Primary, Middle, and Senior Secondary wings.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setCurrentPage("admission");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="px-8 py-3.5 rounded-xl font-bold text-sm text-slate-900 shadow-2xl transition-all hover:scale-105"
              style={{ background: "var(--accent)" }}
            >
              Submit Online Admission Form
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
