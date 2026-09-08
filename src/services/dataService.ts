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

// Default app state intentionally kept empty so the site starts without demo data.
export const INITIAL_ADMISSIONS: AdmissionApplication[] = [];

// Default custom forms are intentionally empty until admin creates them.
export const INITIAL_FORMS: CustomForm[] = [];

// Default form submissions are intentionally empty until users submit real responses.
export const INITIAL_SUBMISSIONS: FormSubmission[] = [];

// Default notices are intentionally empty until admin publishes content.
export const INITIAL_NOTICES: NoticeItem[] = [];

// Default events are intentionally empty until admin publishes upcoming events.
export const INITIAL_EVENTS: EventItem[] = [];

// Default gallery is intentionally empty until admin uploads images.
export const INITIAL_GALLERY: GalleryItem[] = [];

class DataService {
  // Listeners for real-time reactivity across components
  private listeners: Set<() => void> = new Set();
  private isSyncing = false;

  private clearLegacyDemoData() {
    const keysToClear = [
      KEY_ADMISSIONS,
      KEY_FORMS,
      KEY_SUBMISSIONS,
      KEY_NOTICES,
      KEY_EVENTS,
      KEY_GALLERY,
    ];

    keysToClear.forEach((key) => {
      try {
        localStorage.setItem(key, JSON.stringify([]));
      } catch (e) {
        console.warn("Failed to clear legacy demo data for", key, e);
      }
    });

    try {
      localStorage.setItem("nis_saved_papers_v2", JSON.stringify([]));
    } catch (e) {
      console.warn("Failed to clear legacy saved papers data", e);
    }
  }

  constructor() {
    this.clearLegacyDemoData();
    // Automatically trigger background two-way sync with Supabase
    this.syncFromSupabase();
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => {
      try { fn(); } catch (e) { console.error(e); }
    });
  }

  // --- TWO-WAY SUPABASE DATABASE SYNC ---
  async syncFromSupabase() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      // 1. Sync Admissions Table
      const admissionsRes = await supabase.select("admissions", "order=created_at.desc");
      if (admissionsRes.data && Array.isArray(admissionsRes.data)) {
        if (admissionsRes.data.length > 0) {
          const mapped: AdmissionApplication[] = admissionsRes.data.map((row: any) => ({
            id: row.id,
            studentName: row.student_name,
            dob: row.dob,
            gender: row.gender,
            classApplying: row.class_applying,
            fatherName: row.father_name,
            motherName: row.mother_name,
            phone: row.phone,
            email: row.email,
            address: row.address,
            prevSchool: row.prev_school || undefined,
            prevClass: row.prev_class || undefined,
            academics: row.academics || undefined,
            status: row.status,
            notes: row.notes || undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at || row.created_at,
          }));
          localStorage.setItem(KEY_ADMISSIONS, JSON.stringify(mapped));
        } else {
          localStorage.setItem(KEY_ADMISSIONS, JSON.stringify([]));
        }
      }

      // 2. Sync Custom Forms Table
      const formsRes = await supabase.select("custom_forms", "order=created_at.desc");
      if (formsRes.data && Array.isArray(formsRes.data)) {
        if (formsRes.data.length > 0) {
          const mappedForms: CustomForm[] = formsRes.data.map((row: any) => ({
            id: row.id,
            name: row.name,
            description: row.description,
            status: row.status,
            createdAt: row.created_at ? row.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
            fields: typeof row.fields === "string" ? JSON.parse(row.fields) : (row.fields || []),
            submissionsCount: 0,
          }));
          localStorage.setItem(KEY_FORMS, JSON.stringify(mappedForms));
        } else {
          localStorage.setItem(KEY_FORMS, JSON.stringify([]));
        }
      }

      // 3. Sync Form Submissions Table
      const submissionsRes = await supabase.select("form_submissions", "order=submitted_at.desc");
      if (submissionsRes.data && Array.isArray(submissionsRes.data)) {
        if (submissionsRes.data.length > 0) {
          const mappedSubs: FormSubmission[] = submissionsRes.data.map((row: any) => ({
            id: row.id,
            formId: row.form_id,
            formName: row.form_name,
            data: typeof row.data === "string" ? JSON.parse(row.data) : (row.data || {}),
            submittedAt: row.submitted_at,
          }));
          localStorage.setItem(KEY_SUBMISSIONS, JSON.stringify(mappedSubs));
        } else {
          localStorage.setItem(KEY_SUBMISSIONS, JSON.stringify([]));
        }
      }

      // 4. Sync School Information
      const schoolRes = await supabase.select("school_info", "id=eq.1");
      if (schoolRes.data && Array.isArray(schoolRes.data) && schoolRes.data.length > 0) {
        const row = schoolRes.data[0];
        const mappedSchool: SchoolInfo = {
          name: row.name || INITIAL_SCHOOL_INFO.name,
          tagline: row.tagline || INITIAL_SCHOOL_INFO.tagline,
          established: row.established || INITIAL_SCHOOL_INFO.established,
          affiliationNo: row.affiliation_no || INITIAL_SCHOOL_INFO.affiliationNo,
          board: row.board || INITIAL_SCHOOL_INFO.board,
          principal: row.principal || INITIAL_SCHOOL_INFO.principal,
          principalMessage: row.principal_message || INITIAL_SCHOOL_INFO.principalMessage,
          address: row.address || INITIAL_SCHOOL_INFO.address,
          phone: row.phone || INITIAL_SCHOOL_INFO.phone,
          email: row.email || INITIAL_SCHOOL_INFO.email,
          website: row.website || INITIAL_SCHOOL_INFO.website,
          about: row.about || INITIAL_SCHOOL_INFO.about,
          socials: typeof row.socials === "string" ? JSON.parse(row.socials) : (row.socials || INITIAL_SCHOOL_INFO.socials),
        };
        localStorage.setItem(KEY_SCHOOL_INFO, JSON.stringify(mappedSchool));
      }

      this.notify();
    } catch (err) {
      console.warn("[DataService] Background Supabase sync notice:", err);
    } finally {
      this.isSyncing = false;
    }
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

    // Sync to Supabase table in background
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
      console.error("Supabase admissions insert error:", err);
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
      console.error("Supabase admissions update error:", err);
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

    // Sync to Supabase
    supabase.insert("custom_forms", {
      id: form.id,
      name: form.name,
      description: form.description,
      status: form.status,
      fields: form.fields,
      created_at: form.createdAt,
    }).catch(() => {
      supabase.update("custom_forms", `id=eq.${form.id}`, {
        name: form.name,
        description: form.description,
        status: form.status,
        fields: form.fields,
      });
    });

    return form;
  }

  deleteForm(id: string): boolean {
    const forms = this.getForms().filter(f => f.id !== id);
    this.saveForms(forms);
    supabase.delete("custom_forms", `id=eq.${id}`).catch(() => {});
    return true;
  }

  deleteSubmission(id: string): boolean {
    const submissions = this.getSubmissions();
    const target = submissions.find(sub => sub.id === id);
    if (!target) return false;

    const nextSubmissions = submissions.filter(sub => sub.id !== id);
    localStorage.setItem(KEY_SUBMISSIONS, JSON.stringify(nextSubmissions));

    const forms = this.getForms();
    const formIdx = forms.findIndex(f => f.id === target.formId);
    if (formIdx >= 0) {
      const currentCount = forms[formIdx].submissionsCount ?? 0;
      forms[formIdx].submissionsCount = Math.max(0, currentCount - 1);
      this.saveForms(forms);
    }

    supabase.delete("form_submissions", `id=eq.${id}`).catch(() => {});
    this.notify();
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
      console.error("Supabase form submission insert error:", err);
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

    supabase.insert("notices", {
      id: newNotice.id,
      title: newNotice.title,
      date: newNotice.date,
      category: newNotice.category,
      published: newNotice.published,
      description: newNotice.description,
    }).catch(() => {});

    return newNotice;
  }

  deleteNotice(id: string): boolean {
    const notices = this.getNotices().filter(n => n.id !== id);
    this.saveNotices(notices);
    supabase.delete("notices", `id=eq.${id}`).catch(() => {});
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

    supabase.insert("events", {
      id: newEvent.id,
      name: newEvent.name,
      date: newEvent.date,
      time: newEvent.time,
      location: newEvent.location,
      description: newEvent.description,
      published: newEvent.published,
    }).catch(() => {});

    return newEvent;
  }

  deleteEvent(id: string): boolean {
    const events = this.getEvents().filter(e => e.id !== id);
    this.saveEvents(events);
    supabase.delete("events", `id=eq.${id}`).catch(() => {});
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

    supabase.insert("gallery", {
      id: newItem.id,
      title: newItem.title,
      category: newItem.category,
      image_url: newItem.imageUrl,
      date: newItem.date,
    }).catch(() => {});

    return newItem;
  }

  deleteGalleryItem(id: string): boolean {
    const items = this.getGallery().filter(g => g.id !== id);
    this.saveGallery(items);
    supabase.delete("gallery", `id=eq.${id}`).catch(() => {});
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

    supabase.update("school_info", "id=eq.1", {
      name: info.name,
      tagline: info.tagline,
      established: info.established,
      affiliation_no: info.affiliationNo,
      board: info.board,
      principal: info.principal,
      principal_message: info.principalMessage,
      address: info.address,
      phone: info.phone,
      email: info.email,
      website: info.website,
      about: info.about,
      socials: info.socials,
    }).catch(() => {});
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

  // --- RESET ALL DATA TO RESTORE CLEAN STATE ---
  resetAllData() {
    this.saveAdmissions(INITIAL_ADMISSIONS);
    localStorage.setItem(KEY_SUBMISSIONS, JSON.stringify(INITIAL_SUBMISSIONS));
    this.saveNotices(INITIAL_NOTICES);
    this.saveEvents(INITIAL_EVENTS);
    this.saveGallery(INITIAL_GALLERY);
    this.saveSchoolInfo(INITIAL_SCHOOL_INFO);
    this.saveForms(INITIAL_FORMS);
    this.syncFromSupabase();
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
