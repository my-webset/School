// src/assets/logos.ts
// Robust logo asset resolver supporting local Vite dev, Vercel root, and GitHub Pages subpath deployments.

const getAssetUrl = (filename: string) => {
  const base = (import.meta.env.BASE_URL || "./").replace(/\/$/, "");
  // Using encoded filename to avoid broken links on servers with strict URL handling
  const encodedName = encodeURIComponent(filename).replace(/%2F/g, "/");
  return base ? `${base}/logos/${encodedName}` : `logos/${encodedName}`;
};

export const LOGOS = {
  // Brand & School Logos
  schoolLogo: getAssetUrl("school logo.png"),
  tabFavicon: getAssetUrl("tab img .png"),

  // Admin Navigation & Action Logos
  dashboard: getAssetUrl("dashboard.png"),
  admissions: getAssetUrl("admisson form lgog.png"),
  formBuilder: getAssetUrl("Form builer logo.png"),
  aiPaper: getAssetUrl("ai lgo.png"),
  notices: getAssetUrl("Notices.png"),
  events: getAssetUrl("events lofo.png"),
  gallery: getAssetUrl("gallery logog.png"),
  schoolInfo: getAssetUrl("information lgoo.png"),
  settings: getAssetUrl("setting logo.png"),
  logout: getAssetUrl("logout logog copy.png"),

  // Dashboard & Status Stat Logos
  totalApplicants: getAssetUrl("total aplllicant logo.png"),
  pendingStatus: getAssetUrl("pending logog.png"),
  rejectedStatus: getAssetUrl("rajected logo.png"),

  // Features ("Why Choose Us") Logos
  academicExcellence: getAssetUrl("academaic exccelelnce logo.png"),
  holisticEnvironment: getAssetUrl("Holistic enviornmetn logo.png"),
  experiencedFaculty: getAssetUrl("expreicnnnde faculty lgoo.png"),
  modernInfrastructure: getAssetUrl("modern infrastruer logo.png"),
  safeEnvironment: getAssetUrl("safe enviornment logo.png"),
  techEnabledLearning: getAssetUrl("tech enabled learnign.png"),

  // Facilities Logos
  scienceLab: getAssetUrl("sceintce lab log.png"),
  library: getAssetUrl("library lgog.png"),
  auditorium: getAssetUrl("auditoriam logo.png"),
  sportsComplex: getAssetUrl("sports n comple loof.png"),
  artAndMusic: getAssetUrl("art and msuc logo.png"),

  // Contact & Social Logos
  contacts: getAssetUrl("contacts.png"),
  location: getAssetUrl("location.png"),
  facebook: getAssetUrl("facebook logog.png"),
  instagram: getAssetUrl("insta lgog.png"),
  youtube: getAssetUrl("yt logo.png"),
};

export default LOGOS;
