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

// Clean initial data (No massive fake counts, start with clean real items)
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

const INITIAL_NOTICES: NoticeItem[] = [
  {
    id: "not-1",
    title: "Admissions Open for Academic Session 2026-27 (Nursery to Class IX)",
    date: new Date().toISOString().split("T")[0],
    category: "Admission",
    published: true,
    description: "Online application portal is now active for upcoming session admissions.",
  },
  {
    id: "not-2",
    title: "Annual Sports Day & Athletics Meet Schedule",
    date: new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0],
    category: "Event",
    published: true,
    description: "Annual sports meet will take place at the school sports complex.",
  },
  {
    id: "not-3",
    title: "Half-Yearly Examination Timetable & Syllabus Guidelines",
    date: new Date(Date.now() - 5 * 86400000).toISOString().split("T")[0],
    category: "Academic",
    published: true,
    description: "Detailed subject syllabus and examination guidelines released for classes VI to XII.",
  },
];

const INITIAL_EVENTS: EventItem[] = [
  {
    id: "evt-1",
    name: "Annual Science & Robotics Exhibition",
    date: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    time: "09:30 AM",
    location: "School Auditorium & Labs",
    description: "Students from all classes showcase innovative scientific experiments and robotics prototypes.",
    published: true,
  },
  {
    id: "evt-2",
    name: "Inter-House Football & Basketball Championship",
    date: new Date(Date.now() + 21 * 86400000).toISOString().split("T")[0],
    time: "08:00 AM",
    location: "Main Sports Complex",
    description: "Championship matches among Tagore, Shivaji, Raman and Ashoka houses.",
    published: true,
  },
];

const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: "gal-1",
    title: "State-of-the-art Science Laboratory",
    category: "Campus",
    imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop",
    date: "2026-08-15",
  },
  {
    id: "gal-2",
    title: "Annual Sports Meet Athletics & Track",
    category: "Sports",
    imageUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop",
    date: "2026-08-20",
  },
  {
    id: "gal-3",
    title: "Modern Digital Library & Reading Zone",
    category: "Campus",
    imageUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&auto=format&fit=crop",
    date: "2026-08-25",
  },
  {
    id: "gal-4",
    title: "Cultural Performing Arts Festival",
    category: "Cultural",
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop",
    date: "2026-09-01",
  },
];

const INITIAL_FORMS: CustomForm[] = [
  {
    id: "form-scholarship-2026",
    name: "Merit & Sports Scholarship Application 2026",
    description: "Apply for financial assistance or athletic fee waiver.",
    status: "Published",
    createdAt: new Date().toISOString().split("T")[0],
    submissionsCount: 0,
    fields: [
      { id: "f1", type: "text", label: "Student Full Name", placeholder: "Enter student name", required: true },
      { id: "f2", type: "select", label: "Applying Category", required: true, options: ["Academic Merit (Above 90%)", "State/National Sports", "Co-Curricular / Performing Arts"] },
      { id: "f3", type: "tel", label: "Parent Contact Number", placeholder: "+91 XXXXX XXXXX", required: true },
      { id: "f4", type: "textarea", label: "Achievements / Details", placeholder: "Summarize marks or sport honors...", required: true },
    ],
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
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    return [];
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
    };
    apps.unshift(newApp);
    this.saveAdmissions(apps);

    // Sync to Supabase table in background if configured
    supabase.insert("admissions", newApp).catch(() => {});

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

    supabase.update("admissions", `id=eq.${id}`, { status, updated_at: apps[idx].updatedAt }).catch(() => {});
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
      if (raw) return JSON.parse(raw);
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

  // --- FORM SUBMISSIONS ---
  getSubmissions(formId?: string): FormSubmission[] {
    try {
      const raw = localStorage.getItem(KEY_SUBMISSIONS);
      const all: FormSubmission[] = raw ? JSON.parse(raw) : [];
      if (formId) return all.filter(s => s.formId === formId);
      return all;
    } catch (e) {
      console.error(e);
      return [];
    }
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
      if (raw) return JSON.parse(raw);
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
      if (raw) return JSON.parse(raw);
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
      if (raw) return JSON.parse(raw);
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

  // --- DYNAMIC STATISTICS ---
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

  // --- RESET ALL DATA ---
  resetAllData() {
    localStorage.removeItem(KEY_ADMISSIONS);
    localStorage.removeItem(KEY_SUBMISSIONS);
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
      "Status",
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
      a.status,
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
