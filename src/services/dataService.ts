import { 
  AdmissionApplication, 
  CustomForm, 
  FormSubmission, 
  NoticeItem, 
  EventItem, 
  GalleryItem, 
  SchoolInfo,
  InquiryItem,
  InquiryStatus
} from "../types";
import { supabase } from "../lib/supabase";

// Storage keys for offline-first caching & instant rendering
const KEY_ADMISSIONS = "nis_admissions_data_v2";
const KEY_FORMS = "nis_forms_data_v2";
const KEY_SUBMISSIONS = "nis_form_submissions_v2";
const KEY_NOTICES = "nis_notices_data_v2";
const KEY_EVENTS = "nis_events_data_v2";
const KEY_GALLERY = "nis_gallery_data_v2";
const KEY_SCHOOL_INFO = "nis_school_info_v2";
const KEY_INQUIRIES = "nis_inquiries_data_v2";
const KEY_ADMIN_PASSWORD = "nis_admin_password_hash";

// 1. Initial School Profile
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

export const INITIAL_ADMISSIONS: AdmissionApplication[] = [];
export const INITIAL_FORMS: CustomForm[] = [];
export const INITIAL_SUBMISSIONS: FormSubmission[] = [];
export const INITIAL_NOTICES: NoticeItem[] = [];
export const INITIAL_EVENTS: EventItem[] = [];
export const INITIAL_GALLERY: GalleryItem[] = [];
export const INITIAL_INQUIRIES: InquiryItem[] = [];

class DataService {
  private listeners: Set<() => void> = new Set();
  private isSyncing = false;

  constructor() {
    // Initial sync on app launch
    this.syncFromSupabase();

    // Auto-sync every 12 seconds to keep all devices (laptop, mobile) strictly synchronized
    if (typeof window !== "undefined") {
      setInterval(() => {
        this.syncFromSupabase();
      }, 12000);

      window.addEventListener("focus", () => {
        this.syncFromSupabase();
      });

      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          this.syncFromSupabase();
        }
      });
    }
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

  // --- FULL TWO-WAY SUPABASE DATABASE SYNC ---
  async syncFromSupabase(): Promise<{ success: boolean; message?: string }> {
    if (this.isSyncing) return { success: true };
    this.isSyncing = true;

    try {
      // 1. Sync Admissions Table
      const admissionsRes = await supabase.select("admissions", "order=created_at.desc");
      if (admissionsRes.data && Array.isArray(admissionsRes.data)) {
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
      }

      // 2. Sync Custom Forms Table
      const formsRes = await supabase.select("custom_forms", "order=created_at.desc");
      if (formsRes.data && Array.isArray(formsRes.data)) {
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
      }

      // 3. Sync Form Submissions Table
      const submissionsRes = await supabase.select("form_submissions", "order=submitted_at.desc");
      if (submissionsRes.data && Array.isArray(submissionsRes.data)) {
        const mappedSubs: FormSubmission[] = submissionsRes.data.map((row: any) => ({
          id: row.id,
          formId: row.form_id,
          formName: row.form_name,
          data: typeof row.data === "string" ? JSON.parse(row.data) : (row.data || {}),
          submittedAt: row.submitted_at,
        }));
        localStorage.setItem(KEY_SUBMISSIONS, JSON.stringify(mappedSubs));
      }

      // 4. Sync Notices Table
      const noticesRes = await supabase.select("notices", "order=date.desc");
      if (noticesRes.data && Array.isArray(noticesRes.data)) {
        const mappedNotices: NoticeItem[] = noticesRes.data.map((row: any) => ({
          id: row.id,
          title: row.title,
          date: row.date,
          category: row.category,
          published: row.published !== undefined ? row.published : true,
          description: row.description || undefined,
          attachmentUrl: row.attachment_url || undefined,
        }));
        localStorage.setItem(KEY_NOTICES, JSON.stringify(mappedNotices));
      }

      // 5. Sync Events Table
      const eventsRes = await supabase.select("events", "order=date.asc");
      if (eventsRes.data && Array.isArray(eventsRes.data)) {
        const mappedEvents: EventItem[] = eventsRes.data.map((row: any) => ({
          id: row.id,
          name: row.name,
          date: row.date,
          time: row.time,
          location: row.location,
          description: row.description,
          published: row.published !== undefined ? row.published : true,
        }));
        localStorage.setItem(KEY_EVENTS, JSON.stringify(mappedEvents));
      }

      // 6. Sync Gallery Table
      const galleryRes = await supabase.select("gallery", "order=created_at.desc");
      if (galleryRes.data && Array.isArray(galleryRes.data)) {
        const mappedGallery: GalleryItem[] = galleryRes.data.map((row: any) => ({
          id: row.id,
          title: row.title,
          category: row.category,
          imageUrl: row.image_url,
          date: row.date,
        }));
        localStorage.setItem(KEY_GALLERY, JSON.stringify(mappedGallery));
      }

      // 7. Sync Inquiries Table
      const inquiriesRes = await supabase.select("inquiries", "order=created_at.desc");
      if (inquiriesRes.data && Array.isArray(inquiriesRes.data)) {
        const mappedInquiries: InquiryItem[] = inquiriesRes.data.map((row: any) => ({
          id: row.id,
          name: row.name,
          phone: row.phone,
          email: row.email,
          message: row.message,
          status: row.status || "New",
          createdAt: row.created_at,
        }));
        localStorage.setItem(KEY_INQUIRIES, JSON.stringify(mappedInquiries));
      }

      // 8. Sync School Information
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

      // 9. Sync Site Settings & Master Password across all devices
      const settingsRes = await supabase.select("site_settings", "id=eq.1");
      if (settingsRes.data && Array.isArray(settingsRes.data) && settingsRes.data.length > 0) {
        const row = settingsRes.data[0];
        if (row.admin_password_hash) {
          localStorage.setItem(KEY_ADMIN_PASSWORD, row.admin_password_hash);
        }
      }

      this.notify();
      return { success: true };
    } catch (err: any) {
      console.warn("[DataService] Background Supabase sync notice:", err);
      return { success: false, message: err?.message || String(err) };
    } finally {
      this.isSyncing = false;
    }
  }

  // --- ADMIN PASSWORD MANAGEMENT (Cross-Device Database Synchronized) ---
  getAdminPassword(): string {
    return localStorage.getItem(KEY_ADMIN_PASSWORD) || "admin123";
  }

  async verifyAdminPasswordWithSupabase(password: string): Promise<boolean> {
    try {
      const res = await supabase.select("site_settings", "id=eq.1");
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const dbPass = res.data[0].admin_password_hash || "admin123";
        localStorage.setItem(KEY_ADMIN_PASSWORD, dbPass);
        return password === dbPass;
      }
    } catch (e) {
      console.warn("Supabase password check fallback to cached password", e);
    }
    return password === this.getAdminPassword();
  }

  async saveAdminPassword(newPassword: string): Promise<{ success: boolean; message: string }> {
    if (!newPassword || newPassword.length < 4) {
      return { success: false, message: "Password must be at least 4 characters long." };
    }
    localStorage.setItem(KEY_ADMIN_PASSWORD, newPassword);

    try {
      const updateRes = await supabase.update("site_settings", "id=eq.1", {
        admin_password_hash: newPassword,
        updated_at: new Date().toISOString(),
      });
      if (updateRes.error) {
        await supabase.insert("site_settings", {
          id: 1,
          admin_password_hash: newPassword,
        });
      }
    } catch (err) {
      console.error("Failed to sync password to Supabase:", err);
    }

    this.notify();
    return { success: true, message: "Admin password successfully updated across all devices!" };
  }

  // --- STATS OVERVIEW ---
  getStats() {
    const admissions = this.getAdmissions();
    const forms = this.getForms();
    const submissions = this.getSubmissions();
    const notices = this.getNotices();
    const events = this.getEvents();
    const gallery = this.getGallery();
    const inquiries = this.getInquiries();

    const todayStr = new Date().toISOString().split("T")[0];
    const todaySubmissions = admissions.filter(a => (a.createdAt || "").startsWith(todayStr)).length;
    const pendingApplications = admissions.filter(a => a.status === "Pending").length;
    const approvedApplications = admissions.filter(a => a.status === "Approved").length;
    const rejectedApplications = admissions.filter(a => a.status === "Rejected").length;
    const newInquiries = inquiries.filter(i => i.status === "New").length;

    return {
      totalApplications: admissions.length,
      todaySubmissions,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      totalForms: forms.length,
      totalCustomFormSubmissions: submissions.length,
      totalNotices: notices.filter(n => n.published).length,
      totalEvents: events.filter(e => e.published).length,
      totalGallery: gallery.length,
      totalInquiries: inquiries.length,
      newInquiries,
    };
  }

  // --- ADMISSIONS ---
  getAdmissions(): AdmissionApplication[] {
    try {
      const raw = localStorage.getItem(KEY_ADMISSIONS);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
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
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_FORMS;
  }

  saveForms(forms: CustomForm[]) {
    localStorage.setItem(KEY_FORMS, JSON.stringify(forms));
    this.notify();
  }

  getFormById(id: string): CustomForm | undefined {
    return this.getForms().find(f => f.id === id);
  }

  async fetchFormByIdDirect(id: string): Promise<CustomForm | undefined> {
    const existing = this.getFormById(id);
    if (existing) return existing;

    try {
      const res = await supabase.select("custom_forms", `id=eq.${id}`);
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const row = res.data[0];
        const form: CustomForm = {
          id: row.id,
          name: row.name,
          description: row.description,
          status: row.status,
          createdAt: row.created_at ? row.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
          fields: typeof row.fields === "string" ? JSON.parse(row.fields) : (row.fields || []),
          submissionsCount: 0,
        };
        const currentForms = this.getForms();
        if (!currentForms.some(f => f.id === form.id)) {
          currentForms.unshift(form);
          this.saveForms(currentForms);
        }
        return form;
      }
    } catch (e) {
      console.error("fetchFormByIdDirect error:", e);
    }
    return undefined;
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

  // --- FORM SUBMISSIONS ---
  getSubmissions(formId?: string): FormSubmission[] {
    try {
      const raw = localStorage.getItem(KEY_SUBMISSIONS);
      if (raw !== null) {
        const parsed: FormSubmission[] = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          if (formId) return parsed.filter(s => s.formId === formId);
          return parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }
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
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
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
      attachment_url: newNotice.attachmentUrl || null,
    }).catch((err) => {
      console.error("Supabase notice insert error:", err);
    });

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
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
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
    }).catch((err) => {
      console.error("Supabase event insert error:", err);
    });

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
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
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
    }).catch((err) => {
      console.error("Supabase gallery insert error:", err);
    });

    return newItem;
  }

  deleteGalleryItem(id: string): boolean {
    const items = this.getGallery().filter(g => g.id !== id);
    this.saveGallery(items);
    supabase.delete("gallery", `id=eq.${id}`).catch(() => {});
    return true;
  }

  // --- ONLINE INQUIRIES & CONTACT MESSAGES ---
  getInquiries(): InquiryItem[] {
    try {
      const raw = localStorage.getItem(KEY_INQUIRIES);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_INQUIRIES;
  }

  saveInquiries(inquiries: InquiryItem[]) {
    localStorage.setItem(KEY_INQUIRIES, JSON.stringify(inquiries));
    this.notify();
  }

  addInquiry(data: Omit<InquiryItem, "id" | "status" | "createdAt">): InquiryItem {
    const inquiries = this.getInquiries();
    const newInquiry: InquiryItem = {
      ...data,
      id: `INQ-${Date.now().toString(36).toUpperCase()}`,
      status: "New",
      createdAt: new Date().toISOString(),
    };
    inquiries.unshift(newInquiry);
    this.saveInquiries(inquiries);

    supabase.insert("inquiries", {
      id: newInquiry.id,
      name: newInquiry.name,
      phone: newInquiry.phone,
      email: newInquiry.email,
      message: newInquiry.message,
      status: newInquiry.status,
      created_at: newInquiry.createdAt,
    }).catch((err) => {
      console.error("Supabase inquiry insert error:", err);
    });

    return newInquiry;
  }

  updateInquiryStatus(id: string, status: InquiryStatus): boolean {
    const inquiries = this.getInquiries();
    const idx = inquiries.findIndex(i => i.id === id);
    if (idx === -1) return false;
    inquiries[idx].status = status;
    this.saveInquiries(inquiries);

    supabase.update("inquiries", `id=eq.${id}`, { status }).catch(() => {});
    return true;
  }

  deleteInquiry(id: string): boolean {
    const inquiries = this.getInquiries().filter(i => i.id !== id);
    this.saveInquiries(inquiries);
    supabase.delete("inquiries", `id=eq.${id}`).catch(() => {});
    return true;
  }

  exportInquiriesToCSV() {
    const inquiries = this.getInquiries();
    if (inquiries.length === 0) {
      alert("No online inquiries available to export.");
      return;
    }
    const headers = ["Inquiry ID", "Name", "Phone", "Email", "Status", "Date Received", "Message"];
    const rows = inquiries.map(i => [
      i.id,
      `"${i.name.replace(/"/g, '""')}"`,
      `"${i.phone}"`,
      `"${i.email}"`,
      i.status,
      new Date(i.createdAt).toLocaleString("en-IN"),
      `"${i.message.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    this.downloadFile(csvContent, `Nalanda_Inquiries_${new Date().toISOString().split("T")[0]}.csv`, "text/csv;charset=utf-8;");
  }

  // --- SCHOOL INFO ---
  getSchoolInfo(): SchoolInfo {
    try {
      const raw = localStorage.getItem(KEY_SCHOOL_INFO);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
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

  // --- DYNAMIC STATS ---
  getStats() {
    const admissions = this.getAdmissions();
    const today = new Date().toISOString().split("T")[0];
    const todayCount = admissions.filter(a => a.createdAt.startsWith(today)).length;
    const pendingCount = admissions.filter(a => a.status === "Pending").length;
    const approvedCount = admissions.filter(a => a.status === "Approved").length;
    const rejectedCount = admissions.filter(a => a.status === "Rejected").length;
    const totalSubmissions = this.getSubmissions().length;
    const inquiries = this.getInquiries();
    const newInquiries = inquiries.filter(i => i.status === "New").length;

    return {
      totalApplications: admissions.length,
      pendingApplications: pendingCount,
      approvedApplications: approvedCount,
      rejectedApplications: rejectedCount,
      todaySubmissions: todayCount,
      totalCustomFormSubmissions: totalSubmissions,
      totalNotices: this.getNotices().filter(n => n.published).length,
      totalEvents: this.getEvents().filter(e => e.published).length,
      totalInquiries: inquiries.length,
      newInquiries: newInquiries,
    };
  }

  // --- FULL JSON BACKUP & RESTORE ---
  exportFullBackupJSON() {
    const backup = {
      version: "2.0",
      exportedAt: new Date().toISOString(),
      schoolInfo: this.getSchoolInfo(),
      admissions: this.getAdmissions(),
      notices: this.getNotices(),
      events: this.getEvents(),
      gallery: this.getGallery(),
      forms: this.getForms(),
      submissions: this.getSubmissions(),
      inquiries: this.getInquiries(),
    };
    const jsonStr = JSON.stringify(backup, null, 2);
    this.downloadFile(
      jsonStr, 
      `Nalanda_Full_Cloud_Backup_${new Date().toISOString().split("T")[0]}.json`, 
      "application/json;charset=utf-8;"
    );
  }

  async restoreFromBackupJSON(jsonContent: string): Promise<{ success: boolean; message: string }> {
    try {
      const data = JSON.parse(jsonContent);
      if (!data || typeof data !== "object") {
        return { success: false, message: "Invalid backup file format." };
      }

      if (data.schoolInfo) this.saveSchoolInfo(data.schoolInfo);
      if (Array.isArray(data.admissions)) {
        this.saveAdmissions(data.admissions);
        for (const a of data.admissions) {
          await supabase.insert("admissions", {
            id: a.id,
            student_name: a.studentName,
            dob: a.dob,
            gender: a.gender,
            class_applying: a.classApplying,
            father_name: a.fatherName,
            mother_name: a.motherName,
            phone: a.phone,
            email: a.email,
            address: a.address,
            prev_school: a.prevSchool || null,
            prev_class: a.prevClass || null,
            academics: a.academics || null,
            status: a.status,
            notes: a.notes || null,
            created_at: a.createdAt,
          }).catch(() => {});
        }
      }

      if (Array.isArray(data.notices)) {
        this.saveNotices(data.notices);
        for (const n of data.notices) {
          await supabase.insert("notices", {
            id: n.id,
            title: n.title,
            date: n.date,
            category: n.category,
            published: n.published,
            description: n.description,
            attachment_url: n.attachmentUrl || null,
          }).catch(() => {});
        }
      }

      if (Array.isArray(data.events)) {
        this.saveEvents(data.events);
        for (const e of data.events) {
          await supabase.insert("events", {
            id: e.id,
            name: e.name,
            date: e.date,
            time: e.time,
            location: e.location,
            description: e.description,
            published: e.published,
          }).catch(() => {});
        }
      }

      if (Array.isArray(data.gallery)) {
        this.saveGallery(data.gallery);
        for (const g of data.gallery) {
          await supabase.insert("gallery", {
            id: g.id,
            title: g.title,
            category: g.category,
            image_url: g.imageUrl,
            date: g.date,
          }).catch(() => {});
        }
      }

      if (Array.isArray(data.forms)) {
        this.saveForms(data.forms);
        for (const f of data.forms) {
          await supabase.insert("custom_forms", {
            id: f.id,
            name: f.name,
            description: f.description,
            status: f.status,
            fields: f.fields,
            created_at: f.createdAt,
          }).catch(() => {});
        }
      }

      if (Array.isArray(data.inquiries)) {
        this.saveInquiries(data.inquiries);
        for (const i of data.inquiries) {
          await supabase.insert("inquiries", {
            id: i.id,
            name: i.name,
            phone: i.phone,
            email: i.email,
            message: i.message,
            status: i.status,
            created_at: i.createdAt,
          }).catch(() => {});
        }
      }

      this.notify();
      return { success: true, message: "Database successfully restored and synchronized with Supabase!" };
    } catch (e: any) {
      return { success: false, message: `Restore error: ${e?.message || String(e)}` };
    }
  }

  // --- RESET ALL DATA ---
  async resetAllData() {
    this.saveAdmissions(INITIAL_ADMISSIONS);
    localStorage.setItem(KEY_SUBMISSIONS, JSON.stringify(INITIAL_SUBMISSIONS));
    this.saveNotices(INITIAL_NOTICES);
    this.saveEvents(INITIAL_EVENTS);
    this.saveGallery(INITIAL_GALLERY);
    this.saveSchoolInfo(INITIAL_SCHOOL_INFO);
    this.saveForms(INITIAL_FORMS);
    this.saveInquiries(INITIAL_INQUIRIES);
    this.notify();
  }

  // --- CSV EXPORTS ---
  exportAdmissionsToCSV() {
    const apps = this.getAdmissions();
    if (apps.length === 0) {
      alert("No admission applications available to export.");
      return;
    }
    const headers = [
      "Application ID", "Student Name", "Class Applying", "Date of Birth", "Gender", 
      "Father Name", "Mother Name", "Phone", "Email", "Residential Address", 
      "Previous School", "Academics / Marks", "Status", "Notes", "Submission Date"
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

