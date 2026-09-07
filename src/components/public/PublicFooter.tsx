import { dataService } from "../../services/dataService";
import LOGOS from "../../assets/logos";

interface Props {
  setCurrentPage: (p: string) => void;
}

export default function PublicFooter({ setCurrentPage }: Props) {
  const school = dataService.getSchoolInfo();

  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* School Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img
              src={LOGOS.schoolLogo}
              alt={school.name}
              className="w-12 h-12 object-contain p-1 rounded-xl bg-white/10"
            />
            <div>
              <div className="text-white font-bold text-base leading-tight" style={{ fontFamily: "DM Serif Display, serif" }}>
                {school.name}
              </div>
              <div className="text-[11px] text-slate-400">CBSE Affiliated · Est. {school.established}</div>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-slate-400">
            {school.tagline}. Committed to academic distinction, holistic character building, and innovative education.
          </p>
          <div className="flex items-center gap-3 pt-2">
            {school.socials?.facebook && (
              <a href={school.socials.facebook} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center p-1.5 transition-colors" title="Facebook">
                <img src={LOGOS.facebook} alt="Facebook" className="w-full h-full object-contain" />
              </a>
            )}
            {school.socials?.instagram && (
              <a href={school.socials.instagram} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center p-1.5 transition-colors" title="Instagram">
                <img src={LOGOS.instagram} alt="Instagram" className="w-full h-full object-contain" />
              </a>
            )}
            {school.socials?.youtube && (
              <a href={school.socials.youtube} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center p-1.5 transition-colors" title="YouTube">
                <img src={LOGOS.youtube} alt="YouTube" className="w-full h-full object-contain" />
              </a>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <div className="text-white font-bold text-xs uppercase tracking-wider mb-4">Quick Navigation</div>
          <ul className="space-y-2 text-xs">
            {["home", "about", "academics", "facilities", "gallery", "notices", "events", "contact"].map(l => (
              <li key={l}>
                <button
                  onClick={() => { setCurrentPage(l); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="hover:text-white transition-colors capitalize text-left"
                >
                  {l.replace("-", " ")}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Admissions */}
        <div>
          <div className="text-white font-bold text-xs uppercase tracking-wider mb-4">Admissions</div>
          <ul className="space-y-2 text-xs">
            <li>
              <button
                onClick={() => { setCurrentPage("admission"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="text-white font-semibold hover:underline text-left"
              >
                👉 Online Admission Form 2026-27
              </button>
            </li>
            <li>
              <button
                onClick={() => { setCurrentPage("admission"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="hover:text-white text-left"
              >
                Check Application Status
              </button>
            </li>
            <li>
              <button
                onClick={() => { setCurrentPage("academics"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="hover:text-white text-left"
              >
                Curriculum & Stream Options
              </button>
            </li>
            <li>
              <button
                onClick={() => { setCurrentPage("notices"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className="hover:text-white text-left"
              >
                Admission Criteria & Circulars
              </button>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-3 text-xs">
          <div className="text-white font-bold text-xs uppercase tracking-wider mb-4">Get in Touch</div>
          <div className="flex items-start gap-2.5">
            <img src={LOGOS.location} alt="Location" className="w-4 h-4 object-contain mt-0.5 flex-shrink-0 opacity-80" />
            <span>{school.address}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <img src={LOGOS.contacts} alt="Phone" className="w-4 h-4 object-contain flex-shrink-0 opacity-80" />
            <span>{school.phone}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-sm">✉️</span>
            <span>{school.email}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-sm">🌐</span>
            <span>{school.website}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8 mt-12 border-t border-slate-800 text-xs text-center flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
        <div>© {new Date().getFullYear()} {school.name}. All rights reserved.</div>
        <div className="text-[11px]">CBSE Affiliation No: {school.affiliationNo}</div>
      </div>
    </footer>
  );
}
