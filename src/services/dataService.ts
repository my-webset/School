import { 
  AdmissionApplication, 
  CustomForm, 
  FormSubmission, 
  NoticeItem, 
  EventItem, 
  GalleryItem, 
  SchoolInfo 
} from "../types";
import { supabase } from "../lib/supabase";

// Storage keys
const KEY_ADMISSIONS = "nis_admissions_data_v2";
const KEY_FORMS = "nis_forms_data_v2";
const KEY_SUBMISSIONS = "nis_form_submissions_v2";
const KEY_NOTICES = "nis_notices_data_v2";
const KEY_EVENTS = "nis_events_data_v2";
const KEY_GALLERY = "nis_gallery_data_v2";
const KEY_SCHOOL_INFO = "nis_school_info_v2";

// 1. Comprehensive School Profile
export const INITIAL_SCHOOL_INFO: SchoolInfo = {
  name: "Nalanda International School",
  tagline: "Nurturing Excellence, Building Futures",
  established: 1989,
  affiliationNo: "CBSE/AFF/2130124",
  board: "CBSE (Central Board of Secondary Education)",
  principal: "Dr. Priya Sharma",
  principalMessage: "Education is the most powerful weapon you can use to change the world. At Nalanda, we believe every child carries unique potential. Our dedicated faculty and world-class infrastructure create an environment where curiosity flourishes and character is built.",
  address: "14, Vidya Vihar, Sector 21, Noida, Uttar Pradesh – 201301",
  phone: "+91 98765 43210",
  email: "admissions@nalandainternational.edu.in",
  website: "www.nalandainternational.edu.in",
  about: "Nalanda International School has been a beacon of academic excellence in Noida for over three decades. We nurture young minds with a holistic curriculum blending modern pedagogy with Indian values, preparing students for a globally competitive world.",
  socials: {
    facebook: "https://facebook.com/nalandainternational",
    instagram: "https://instagram.com/nalandainternational",
    youtube: "https://youtube.com/@nalandainternational",
  },
};

// 2. Comprehensive Admissions Applications History
export const INITIAL_ADMISSIONS: AdmissionApplication[] = [
  {
    id: "NIS-2026-001",
    studentName: "Aarav Verma",
    dob: "2011-04-12",
    gender: "Male",
    classApplying: "Class X",
    fatherName: "Rajesh Verma",
    motherName: "Sunita Verma",
    phone: "+91 98765 43210",
    email: "aarav.verma@gmail.com",
    address: "A-42, Sector 15, Noida, UP 201301",
    prevSchool: "Delhi Public School, Sector 30",
    prevClass: "Class IX",
    academics: "Aggregate: 94.6%, Grade A1 in Maths & Science",
    status: "Approved",
    notes: "Merit scholarship approved. Document verification and entrance evaluation complete.",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "NIS-2026-002",
    studentName: "Ananya Sharma",
    dob: "2022-08-19",
    gender: "Female",
    classApplying: "Nursery",
    fatherName: "Dr. Manish Sharma",
    motherName: "Dr. Ritu Sharma",
    phone: "+91 98123 45678",
    email: "manish.sharma@yahoo.com",
    address: "Flat 302, ATS Greens, Sector 50, Noida, UP 201301",
    prevSchool: "First Steps Montessori Playway",
    prevClass: "Playgroup",
    academics: "N/A (Early Childhood Entry)",
    status: "Pending",
    notes: "Parent-child interaction scheduled for Saturday 11:00 AM.",
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "NIS-2026-003",
    studentName: "Rohan Kulkarni",
    dob: "2015-01-25",
    gender: "Male",
    classApplying: "Class VI",
    fatherName: "Anand Kulkarni",
    motherName: "Meenakshi Kulkarni",
    phone: "+91 97654 32109",
    email: "rohan.parents@outlook.com",
    address: "B-12, Sector 62, Noida, UP 201309",
    prevSchool: "St. Xavier's High School",
    prevClass: "Class V",
    academics: "Overall Score: 91.2%, National Science Olympiad School Rank 1",
    status: "Approved",
    notes: "Transfer Certificate, immunization card, and previous report card verified.",
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "NIS-2026-004",
    studentName: "Diya Patel",
    dob: "2012-11-03",
    gender: "Female",
    classApplying: "Class IX",
    fatherName: "Bhavesh Patel",
    motherName: "Neha Patel",
    phone: "+91 98987 65432",
    email: "patel.diya@gmail.com",
    address: "C-104, Supertech Capetown, Sector 74, Noida, UP 201301",
    prevSchool: "Amity International School",
    prevClass: "Class VIII",
    academics: "Overall Grade: A2, Distinction in Performing Arts",
    status: "Pending",
    notes: "Awaiting final term marksheet submission from previous school.",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "NIS-2026-005",
    studentName: "Kabir Mehra",
    dob: "2010-06-15",
    gender: "Male",
    classApplying: "Class XI (Science)",
    fatherName: "Vikram Mehra",
    motherName: "Pooja Mehra",
    phone: "+91 98112 23344",
    email: "vikram.mehra@techcorp.in",
    address: "Villa 8, Jaypee Greens, Greater Noida, UP 201310",
    prevSchool: "Modern School, Barakhamba",
    prevClass: "Class X",
    academics: "CBSE Class X Boards: 96.2%, State Swimming Gold Medalist",
    status: "Approved",
    notes: "Allocated PCMB Stream with Sports quota fee concession.",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: "NIS-2026-006",
    studentName: "Sneha Reddy",
    dob: "2020-03-10",
    gender: "Female",
    classApplying: "Class I",
    fatherName: "K. Venkat Reddy",
    motherName: "K. Sravani",
    phone: "+91 98776 65544",
    email: "venkat.reddy@gmail.com",
    address: "Plot 55, Sector 44, Noida, UP 201301",
    prevSchool: "EuroKids Preschool",
    prevClass: "Kindergarten",
    academics: "Readiness Score: Excellent",
    status: "Pending",
    notes: "Application fee received. Verification in progress.",
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "NIS-2026-007",
    studentName: "Aryan Gupta",
    dob: "2010-09-28",
    gender: "Male",
    classApplying: "Class XI (Commerce)",
    fatherName: "Deepak Gupta",
    motherName: "Reena Gupta",
    phone: "+91 99887 76655",
    email: "deepak.gupta@bizmail.com",
    address: "Shop-cum-residence 12, Atta Market, Sector 18, Noida",
    prevSchool: "Bal Bharati Public School",
    prevClass: "Class X",
    academics: "Class X Score: 68.4%",
    status: "Rejected",
    notes: "Did not meet eligibility cut-off criterion for Commerce with Applied Mathematics stream.",
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

// 3. Rich Custom Form Templates with QR sharing capabilities
export const INITIAL_FORMS: CustomForm[] = [
  {
    id: "form-scholarship-2026",
    name: "Merit & Sports Scholarship Application 2026-27",
    description: "Apply for academic fee concessions, sports excellence waivers, or co-curricular talent grants.",
    status: "Published",
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString().split("T")[0],
    submissionsCount: 4,
    fields: [
      { id: "f1", type: "text", label: "Student Full Name", placeholder: "Enter candidate legal name", required: true },
      { id: "f2", type: "select", label: "Scholarship Category", required: true, options: ["Academic Merit (Above 90%)", "State / National Sports Excellence", "Performing Arts & Cultural Honors", "Alumni / Sibling Concession"] },
      { id: "f3", type: "tel", label: "Parent Phone Number", placeholder: "+91 XXXXX XXXXX", required: true },
      { id: "f4", type: "email", label: "Registered Email Address", placeholder: "parent@example.com", required: true },
      { id: "f5", type: "textarea", label: "Academic or Athletic Achievements", placeholder: "Detail marks, championship medals, ranks, and tournament dates...", required: true },
    ],
  },
  {
    id: "form-transport-2026",
    name: "School Transport & GPS Bus Route Enrollment",
    description: "Register for safe, air-conditioned, CCTV and GPS-monitored school bus transport services.",
    status: "Published",
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString().split("T")[0],
    submissionsCount: 3,
    fields: [
      { id: "tr1", type: "text", label: "Student Name & Class", placeholder: "e.g. Aarav Verma (Class X-A)", required: true },
      { id: "tr2", type: "textarea", label: "Residential Pickup Address", placeholder: "House/Flat No, Society, Sector, Landmark", required: true },
      { id: "tr3", type: "select", label: "Preferred Bus Route", required: true, options: ["Route 1 (Sector 15 / 19 / 27 / Atta)", "Route 2 (Sector 62 / 63 / Indirapuram)", "Route 3 (Sector 44 / 45 / Golf Course)", "Route 4 (Sector 50 / 76 / 78 / Supertech)", "Route 5 (Greater Noida Expressway)"] },
      { id: "tr4", type: "tel", label: "Emergency Mobile Number", placeholder: "+91 XXXXX XXXXX", required: true },
    ],
  },
  {
    id: "form-pta-2026",
    name: "Parent-Teacher Association (PTA) Volunteer Enrollment",
    description: "Partner with school leadership in safety audits, career mentorship, and sports events.",
    status: "Published",
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString().split("T")[0],
    submissionsCount: 2,
    fields: [
      { id: "pta1", type: "text", label: "Parent / Guardian Name", placeholder: "Enter your full name", required: true },
      { id: "pta2", type: "text", label: "Child Name & Grade", placeholder: "Child's name and current class", required: true },
      { id: "pta3", type: "text", label: "Profession & Organization", placeholder: "e.g. Pediatrician / Senior Software Architect", required: true },
      { id: "pta4", type: "select", label: "Committee of Interest", required: true, options: ["Health, Safety & Nutrition Audit", "Career Mentoring & STEM Workshops", "Annual Cultural & Sports Fest Support", "Green Campus & Environmental Drive"] },
      { id: "pta5", type: "tel", label: "Contact Phone Number", placeholder: "+91 XXXXX XXXXX", required: true },
    ],
  },
  {
    id: "form-robotics-camp",
    name: "STEM Robotics & AI Summer Bootcamp 2026",
    description: "Hands-on engineering workshop on Arduino, Python sensors, drone mechanics, and AI bots.",
    status: "Published",
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString().split("T")[0],
    submissionsCount: 2,
    fields: [
      { id: "rob1", type: "text", label: "Student Full Name", placeholder: "Enter student name", required: true },
      { id: "rob2", type: "select", label: "Class / Grade", required: true, options: ["Class VI", "Class VII", "Class VIII", "Class IX", "Class X", "Class XI", "Class XII"] },
      { id: "rob3", type: "radio", label: "Will bring personal laptop?", required: true, options: ["Yes (Preferred)", "No (School Lab PC Needed)"] },
      { id: "rob4", type: "textarea", label: "Prior Coding or Electronics Experience", placeholder: "Mention Scratch, Python, Lego, Arduino, or beginner...", required: false },
      { id: "rob5", type: "tel", label: "Guardian Contact Phone", placeholder: "+91 XXXXX XXXXX", required: true },
    ],
  },
];

// 4. Complete Form Submissions History (Detailed responses for each custom form)
export const INITIAL_SUBMISSIONS: FormSubmission[] = [
  {
    id: "SUB-SCHOLAR-001",
    formId: "form-scholarship-2026",
    formName: "Merit & Sports Scholarship Application 2026-27",
    data: {
      "Student Full Name": "Aarav Verma",
      "Scholarship Category": "Academic Merit (Above 90%)",
      "Parent Phone Number": "+91 98765 43210",
      "Registered Email Address": "aarav.verma@gmail.com",
      "Academic or Athletic Achievements": "Secured 94.6% in Class IX finals with 1st rank in Mathematics & Science across the section. Qualified CBSE Regional Mathematics Olympiad.",
    },
    submittedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "SUB-SCHOLAR-002",
    formId: "form-scholarship-2026",
    formName: "Merit & Sports Scholarship Application 2026-27",
    data: {
      "Student Full Name": "Kabir Mehra",
      "Scholarship Category": "State / National Sports Excellence",
      "Parent Phone Number": "+91 98112 23344",
      "Registered Email Address": "vikram.mehra@techcorp.in",
      "Academic or Athletic Achievements": "Gold medalist at CBSE North Zone Swimming Championship 2025 (50m & 100m Freestyle). Represented Uttar Pradesh in 67th National School Games.",
    },
    submittedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: "SUB-SCHOLAR-003",
    formId: "form-scholarship-2026",
    formName: "Merit & Sports Scholarship Application 2026-27",
    data: {
      "Student Full Name": "Diya Patel",
      "Scholarship Category": "Performing Arts & Cultural Honors",
      "Parent Phone Number": "+91 98987 65432",
      "Registered Email Address": "patel.diya@gmail.com",
      "Academic or Athletic Achievements": "Senior diploma in Kathak dance with distinction; performed at National Youth Cultural Fest and state level classical competitions.",
    },
    submittedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "SUB-SCHOLAR-004",
    formId: "form-scholarship-2026",
    formName: "Merit & Sports Scholarship Application 2026-27",
    data: {
      "Student Full Name": "Rohan Kulkarni",
      "Scholarship Category": "Academic Merit (Above 90%)",
      "Parent Phone Number": "+91 97654 32109",
      "Registered Email Address": "rohan.parents@outlook.com",
      "Academic or Athletic Achievements": "National Science Olympiad (NSO) School Rank 1; 91.2% overall aggregate in Class V CBSE examinations.",
    },
    submittedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "SUB-TRANS-001",
    formId: "form-transport-2026",
    formName: "School Transport & GPS Bus Route Enrollment",
    data: {
      "Student Name & Class": "Ananya Sharma (Nursery-B)",
      "Residential Pickup Address": "Flat 302, ATS Greens, Sector 50, Noida",
      "Preferred Bus Route": "Route 4 (Sector 50 / 76 / 78 / Supertech)",
      "Emergency Mobile Number": "+91 98123 45678",
    },
    submittedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "SUB-TRANS-002",
    formId: "form-transport-2026",
    formName: "School Transport & GPS Bus Route Enrollment",
    data: {
      "Student Name & Class": "Aarav Verma (Class X-A)",
      "Residential Pickup Address": "A-42, Sector 15, Near Golchakkar, Noida",
      "Preferred Bus Route": "Route 1 (Sector 15 / 19 / 27 / Atta)",
      "Emergency Mobile Number": "+91 98765 43210",
    },
    submittedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "SUB-TRANS-003",
    formId: "form-transport-2026",
    formName: "School Transport & GPS Bus Route Enrollment",
    data: {
      "Student Name & Class": "Sneha Reddy (Class I-C)",
      "Residential Pickup Address": "Plot 55, Sector 44, Noida",
      "Preferred Bus Route": "Route 3 (Sector 44 / 45 / Golf Course)",
      "Emergency Mobile Number": "+91 98776 65544",
    },
    submittedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "SUB-PTA-001",
    formId: "form-pta-2026",
    formName: "Parent-Teacher Association (PTA) Volunteer Enrollment",
    data: {
      "Parent / Guardian Name": "Dr. Ritu Sharma",
      "Child Name & Grade": "Ananya Sharma (Nursery-B)",
      "Profession & Organization": "Consultant Pediatrician, Apollo Hospital",
      "Committee of Interest": "Health, Safety & Nutrition Audit",
      "Contact Phone Number": "+91 98123 45678",
    },
    submittedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "SUB-PTA-002",
    formId: "form-pta-2026",
    formName: "Parent-Teacher Association (PTA) Volunteer Enrollment",
    data: {
      "Parent / Guardian Name": "Vikram Mehra",
      "Child Name & Grade": "Kabir Mehra (Class XI Science)",
      "Profession & Organization": "VP Engineering, TechCorp Global Systems",
      "Committee of Interest": "Career Mentoring & STEM Workshops",
      "Contact Phone Number": "+91 98112 23344",
    },
    submittedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "SUB-ROBOT-001",
    formId: "form-robotics-camp",
    formName: "STEM Robotics & AI Summer Bootcamp 2026",
    data: {
      "Student Full Name": "Rohan Kulkarni",
      "Class / Grade": "Class VI",
      "Will bring personal laptop?": "Yes (Preferred)",
      "Prior Coding or Electronics Experience": "Completed MIT Scratch Level 2 and built basic ultrasonic sensor line-follower bot.",
      "Guardian Contact Phone": "+91 97654 32109",
    },
    submittedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "SUB-ROBOT-002",
    formId: "form-robotics-camp",
    formName: "STEM Robotics & AI Summer Bootcamp 2026",
    data: {
      "Student Full Name": "Diya Patel",
      "Class / Grade": "Class IX",
      "Will bring personal laptop?": "Yes (Preferred)",
      "Prior Coding or Electronics Experience": "Basic Python syntax and elementary AI prompt crafting.",
      "Guardian Contact Phone": "+91 98987 65432",
    },
    submittedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

// 5. Official Notices & Circulars
export const INITIAL_NOTICES: NoticeItem[] = [
  {
    id: "not-1",
    title: "Admissions Open for Academic Session 2026-27 (Nursery to Class XI)",
    date: new Date().toISOString().split("T")[0],
    category: "Admission",
    published: true,
    description: "Online application portal is now active. Registration forms, syllabus blueprints, and interaction schedules can be accessed directly from the school portal.",
  },
  {
    id: "not-2",
    title: "Annual Sports Day & Athletics Meet 2026 Schedule",
    date: new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0],
    category: "Event",
    published: true,
    description: "Annual sports meet will take place at the school sports complex. All house captains and athletics participants are requested to report for trials.",
  },
  {
    id: "not-3",
    title: "Half-Yearly Examination Timetable & Question Blueprint Guidelines",
    date: new Date(Date.now() - 5 * 86400000).toISOString().split("T")[0],
    category: "Academic",
    published: true,
    description: "Detailed subject syllabus and chapter-wise weightage guidelines have been published for classes VI to XII by the examination department.",
  },
];

// 6. Upcoming Events & Competitions
export const INITIAL_EVENTS: EventItem[] = [
  {
    id: "evt-1",
    name: "Annual Science & Robotics Exhibition 2026",
    date: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    time: "09:30 AM - 03:30 PM",
    location: "School Auditorium & Central Robotics Lab",
    description: "Students from all classes showcase innovative scientific experiments, automation systems, and AI robotics prototypes.",
    published: true,
  },
  {
    id: "evt-2",
    name: "Inter-House Football & Basketball Championship",
    date: new Date(Date.now() + 21 * 86400000).toISOString().split("T")[0],
    time: "08:00 AM - 02:00 PM",
    location: "Main Sports Complex & Floodlit Turf",
    description: "Annual championship tournament among Tagore, Shivaji, Raman, and Ashoka houses.",
    published: true,
  },
  {
    id: "evt-3",
    name: "CBSE Career Guidance & University Placement Fair",
    date: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    time: "10:00 AM - 04:00 PM",
    location: "School Multi-Purpose Hall",
    description: "Interactive symposium featuring top national & international university delegates for Senior Secondary students.",
    published: true,
  },
];

// 7. Campus Media & Infrastructure Gallery
export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: "gal-1",
    title: "State-of-the-art Science & Physics Laboratory",
    category: "Campus",
    imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop",
    date: "2026-08-15",
  },
  {
    id: "gal-2",
    title: "Annual Sports Meet Athletics & Track Championship",
    category: "Sports",
    imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop",
    date: "2026-08-20",
  },
  {
    id: "gal-3",
    title: "Modern Digital Library & Academic Resource Wing",
    category: "Campus",
    imageUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&auto=format&fit=crop",
    date: "2026-08-25",
  },
  {
    id: "gal-4",
    title: "Cultural Performing Arts Festival & Musical Drama",
    category: "Cultural",
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop",
    date: "2026-09-01",
  },
];

class DataService {
  // Listeners for real-time reactivity across components
  private listeners: Set<() => void> = new Set();

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => {
      try { fn(); } catch (e) { console.error(e); }
    });
  }

  // --- ADMISSIONS ---
  getAdmissions(): AdmissionApplication[] {
    try {
      const raw = localStorage.getItem(KEY_ADMISSIONS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }
    // Initialize with comprehensive dataset if empty
    this.saveAdmissions(INITIAL_ADMISSIONS);
    return INITIAL_ADMISSIONS;
  }

  saveAdmissions(apps: AdmissionApplication[]) {
    localStorage.setItem(KEY_ADMISSIONS, JSON.stringify(apps));
    this.notify();
  }

  addAdmission(data: Omit<AdmissionApplication, "id" | "createdAt" | "status">): AdmissionApplication {
    const apps = this.getAdmissions();
    const count = apps.length + 1;
    const pad = String(count).padStart(3, "0");
    const id = `NIS-2026-${pad}`;
    const newApp: AdmissionApplication = {
      ...data,
      id,
      status: "Pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    apps.unshift(newApp);
    this.saveAdmissions(apps);

    // Sync to Supabase table in background if configured
    const supabasePayload = {
      id: newApp.id,
      student_name: newApp.studentName,
      dob: newApp.dob,
      gender: newApp.gender,
      class_applying: newApp.classApplying,
      father_name: newApp.fatherName,
      mother_name: newApp.motherName,
      phone: newApp.phone,
      email: newApp.email,
      address: newApp.address,
      prev_school: newApp.prevSchool || null,
      prev_class: newApp.prevClass || null,
      academics: newApp.academics || null,
      status: newApp.status,
      notes: newApp.notes || null,
      created_at: newApp.createdAt,
      updated_at: newApp.updatedAt || newApp.createdAt,
    };

    supabase.insert("admissions", supabasePayload).catch((err) => {
      console.error("Supabase admissions insert failed:", err);
    });

    return newApp;
  }

  updateAdmissionStatus(id: string, status: "Pending" | "Approved" | "Rejected", notes?: string): boolean {
    const apps = this.getAdmissions();
    const idx = apps.findIndex(a => a.id === id);
    if (idx === -1) return false;
    apps[idx].status = status;
    apps[idx].updatedAt = new Date().toISOString();
    if (notes !== undefined) apps[idx].notes = notes;
    this.saveAdmissions(apps);

    supabase.update("admissions", `id=eq.${id}`, {
      status,
      notes: apps[idx].notes || null,
      updated_at: apps[idx].updatedAt,
    }).catch((err) => {
      console.error("Supabase admissions update failed:", err);
    });
    return true;
  }

  deleteAdmission(id: string): boolean {
    const apps = this.getAdmissions().filter(a => a.id !== id);
    this.saveAdmissions(apps);
    supabase.delete("admissions", `id=eq.${id}`).catch(() => {});
    return true;
  }

  // --- CUSTOM FORMS ---
  getForms(): CustomForm[] {
    try {
      const raw = localStorage.getItem(KEY_FORMS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }
    this.saveForms(INITIAL_FORMS);
    return INITIAL_FORMS;
  }

  saveForms(forms: CustomForm[]) {
    localStorage.setItem(KEY_FORMS, JSON.stringify(forms));
    this.notify();
  }

  getFormById(id: string): CustomForm | undefined {
    return this.getForms().find(f => f.id === id);
  }

  saveForm(form: CustomForm): CustomForm {
    const forms = this.getForms();
    const idx = forms.findIndex(f => f.id === form.id);
    if (idx >= 0) {
      forms[idx] = form;
    } else {
      forms.unshift(form);
    }
    this.saveForms(forms);
    return form;
  }

  deleteForm(id: string): boolean {
    const forms = this.getForms().filter(f => f.id !== id);
    this.saveForms(forms);
    return true;
  }

  // --- FORM SUBMISSIONS (HISTORY) ---
  getSubmissions(formId?: string): FormSubmission[] {
    try {
      const raw = localStorage.getItem(KEY_SUBMISSIONS);
      if (raw) {
        const parsed: FormSubmission[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (formId) return parsed.filter(s => s.formId === formId);
          return parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }
    // Initialize with comprehensive submissions history
    localStorage.setItem(KEY_SUBMISSIONS, JSON.stringify(INITIAL_SUBMISSIONS));
    if (formId) return INITIAL_SUBMISSIONS.filter(s => s.formId === formId);
    return INITIAL_SUBMISSIONS;
  }

  addFormSubmission(formId: string, data: Record<string, any>): FormSubmission {
    const form = this.getFormById(formId);
    const formName = form ? form.name : "Custom Form";
    const submissions = this.getSubmissions();
    const newSubmission: FormSubmission = {
      id: `SUB-${Date.now().toString(36).toUpperCase()}`,
      formId,
      formName,
      data,
      submittedAt: new Date().toISOString(),
    };
    submissions.unshift(newSubmission);
    localStorage.setItem(KEY_SUBMISSIONS, JSON.stringify(submissions));

    const supabasePayload = {
      id: newSubmission.id,
      form_id: formId,
      form_name: formName,
      data,
      submitted_at: newSubmission.submittedAt,
    };

    supabase.insert("form_submissions", supabasePayload).catch((err) => {
      console.error("Supabase form submission insert failed:", err);
    });

    // Update submissions count on form
    const forms = this.getForms();
    const formIdx = forms.findIndex(f => f.id === formId);
    if (formIdx >= 0) {
      forms[formIdx].submissionsCount = (forms[formIdx].submissionsCount || 0) + 1;
      this.saveForms(forms);
    }

    this.notify();
    return newSubmission;
  }

  // --- NOTICES ---
  getNotices(): NoticeItem[] {
    try {
      const raw = localStorage.getItem(KEY_NOTICES);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    this.saveNotices(INITIAL_NOTICES);
    return INITIAL_NOTICES;
  }

  saveNotices(notices: NoticeItem[]) {
    localStorage.setItem(KEY_NOTICES, JSON.stringify(notices));
    this.notify();
  }

  addNotice(notice: Omit<NoticeItem, "id">): NoticeItem {
    const notices = this.getNotices();
    const newNotice: NoticeItem = {
      ...notice,
      id: `not-${Date.now()}`,
    };
    notices.unshift(newNotice);
    this.saveNotices(notices);
    return newNotice;
  }

  deleteNotice(id: string): boolean {
    const notices = this.getNotices().filter(n => n.id !== id);
    this.saveNotices(notices);
    return true;
  }

  // --- EVENTS ---
  getEvents(): EventItem[] {
    try {
      const raw = localStorage.getItem(KEY_EVENTS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    this.saveEvents(INITIAL_EVENTS);
    return INITIAL_EVENTS;
  }

  saveEvents(events: EventItem[]) {
    localStorage.setItem(KEY_EVENTS, JSON.stringify(events));
    this.notify();
  }

  addEvent(event: Omit<EventItem, "id">): EventItem {
    const events = this.getEvents();
    const newEvent: EventItem = {
      ...event,
      id: `evt-${Date.now()}`,
    };
    events.unshift(newEvent);
    this.saveEvents(events);
    return newEvent;
  }

  deleteEvent(id: string): boolean {
    const events = this.getEvents().filter(e => e.id !== id);
    this.saveEvents(events);
    return true;
  }

  // --- GALLERY ---
  getGallery(): GalleryItem[] {
    try {
      const raw = localStorage.getItem(KEY_GALLERY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    this.saveGallery(INITIAL_GALLERY);
    return INITIAL_GALLERY;
  }

  saveGallery(items: GalleryItem[]) {
    localStorage.setItem(KEY_GALLERY, JSON.stringify(items));
    this.notify();
  }

  addGalleryItem(item: Omit<GalleryItem, "id">): GalleryItem {
    const items = this.getGallery();
    const newItem: GalleryItem = {
      ...item,
      id: `gal-${Date.now()}`,
    };
    items.unshift(newItem);
    this.saveGallery(items);
    return newItem;
  }

  deleteGalleryItem(id: string): boolean {
    const items = this.getGallery().filter(g => g.id !== id);
    this.saveGallery(items);
    return true;
  }

  // --- SCHOOL INFO ---
  getSchoolInfo(): SchoolInfo {
    try {
      const raw = localStorage.getItem(KEY_SCHOOL_INFO);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    this.saveSchoolInfo(INITIAL_SCHOOL_INFO);
    return INITIAL_SCHOOL_INFO;
  }

  saveSchoolInfo(info: SchoolInfo) {
    localStorage.setItem(KEY_SCHOOL_INFO, JSON.stringify(info));
    this.notify();
  }

  // --- DYNAMIC DASHBOARD STATISTICS ---
  getStats() {
    const admissions = this.getAdmissions();
    const today = new Date().toISOString().split("T")[0];
    const todayCount = admissions.filter(a => a.createdAt.startsWith(today)).length;
    const pendingCount = admissions.filter(a => a.status === "Pending").length;
    const approvedCount = admissions.filter(a => a.status === "Approved").length;
    const rejectedCount = admissions.filter(a => a.status === "Rejected").length;
    const totalSubmissions = this.getSubmissions().length;

    return {
      totalApplications: admissions.length,
      pendingApplications: pendingCount,
      approvedApplications: approvedCount,
      rejectedApplications: rejectedCount,
      todaySubmissions: todayCount,
      totalCustomFormSubmissions: totalSubmissions,
      totalNotices: this.getNotices().filter(n => n.published).length,
      totalEvents: this.getEvents().filter(e => e.published).length,
    };
  }

  // --- RESET ALL DATA TO RESTORE CLEAN REALISTIC STATE ---
  resetAllData() {
    this.saveAdmissions(INITIAL_ADMISSIONS);
    localStorage.setItem(KEY_SUBMISSIONS, JSON.stringify(INITIAL_SUBMISSIONS));
    this.saveNotices(INITIAL_NOTICES);
    this.saveEvents(INITIAL_EVENTS);
    this.saveGallery(INITIAL_GALLERY);
    this.saveSchoolInfo(INITIAL_SCHOOL_INFO);
    this.saveForms(INITIAL_FORMS);
    this.notify();
  }

  // --- EXPORT TO CSV HELPERS ---
  exportAdmissionsToCSV() {
    const apps = this.getAdmissions();
    if (apps.length === 0) {
      alert("No admission applications available to export.");
      return;
    }
    const headers = [
      "Application ID",
      "Student Name",
      "Class Applying",
      "Date of Birth",
      "Gender",
      "Father Name",
      "Mother Name",
      "Phone",
      "Email",
      "Residential Address",
      "Previous School",
      "Academics / Marks",
      "Status",
      "Notes",
      "Submission Date"
    ];

    const rows = apps.map(a => [
      a.id,
      `"${a.studentName.replace(/"/g, '""')}"`,
      `"${a.classApplying}"`,
      a.dob,
      a.gender,
      `"${a.fatherName.replace(/"/g, '""')}"`,
      `"${a.motherName.replace(/"/g, '""')}"`,
      `"${a.phone}"`,
      `"${a.email}"`,
      `"${a.address.replace(/"/g, '""')}"`,
      `"${(a.prevSchool || "").replace(/"/g, '""')}"`,
      `"${(a.academics || "").replace(/"/g, '""')}"`,
      a.status,
      `"${(a.notes || "").replace(/"/g, '""')}"`,
      new Date(a.createdAt).toLocaleDateString("en-IN")
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    this.downloadFile(csvContent, `Nalanda_Admissions_${new Date().toISOString().split("T")[0]}.csv`, "text/csv;charset=utf-8;");
  }

  exportFormSubmissionsToCSV(formId?: string) {
    const subs = this.getSubmissions(formId);
    if (subs.length === 0) {
      alert("No form submissions available to export.");
      return;
    }
    // Collect all field keys
    const allKeys = new Set<string>();
    subs.forEach(s => Object.keys(s.data).forEach(k => allKeys.add(k)));
    const keyArray = Array.from(allKeys);

    const headers = ["Submission ID", "Form Name", "Submitted At", ...keyArray.map(k => `"${k}"`)];
    const rows = subs.map(s => {
      const fieldValues = keyArray.map(k => `"${(s.data[k] ?? "").toString().replace(/"/g, '""')}"`);
      return [s.id, `"${s.formName}"`, new Date(s.submittedAt).toLocaleString("en-IN"), ...fieldValues].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    this.downloadFile(csvContent, `Form_Submissions_${new Date().toISOString().split("T")[0]}.csv`, "text/csv;charset=utf-8;");
  }

  private downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const dataService = new DataService();
