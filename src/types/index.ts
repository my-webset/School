export type AdmissionStatus = "Pending" | "Approved" | "Rejected";

export interface AdmissionApplication {
  id: string;
  studentName: string;
  dob: string;
  gender: string;
  classApplying: string;
  fatherName: string;
  motherName: string;
  phone: string;
  email: string;
  address: string;
  prevSchool?: string;
  prevClass?: string;
  academics?: string;
  status: AdmissionStatus;
  createdAt: string;
  updatedAt?: string;
  notes?: string;
}

export interface FormField {
  id: string;
  type: "text" | "textarea" | "number" | "email" | "tel" | "date" | "select" | "radio" | "checkbox" | "file" | "heading";
  label: string;
  placeholder?: string;
  required: boolean;
  helpText?: string;
  options?: string[]; // array of strings or newline-delimited in UI
}

export interface CustomForm {
  id: string;
  name: string;
  description?: string;
  status: "Published" | "Draft";
  createdAt: string;
  fields: FormField[];
  submissionsCount?: number;
}

export interface FormSubmission {
  id: string;
  formId: string;
  formName: string;
  data: Record<string, any>;
  submittedAt: string;
}

export type InquiryStatus = "New" | "Contacted" | "Resolved";

export interface InquiryItem {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  status: InquiryStatus;
  createdAt: string;
}

export interface NoticeItem {
  id: string;
  title: string;
  date: string;
  category: "Academic" | "Event" | "Admission" | "Examination" | "General";
  published: boolean;
  description?: string;
  attachmentUrl?: string;
}

export interface EventItem {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  description: string;
  published: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: "Campus" | "Sports" | "Cultural" | "Academics" | "Events";
  imageUrl: string;
  date: string;
}

export interface SchoolInfo {
  name: string;
  tagline: string;
  established: number;
  affiliationNo: string;
  board: string;
  principal: string;
  principalMessage: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  about: string;
  logoUrl?: string;
  heroImageUrl?: string;
  campusImageUrl?: string;
  aboutUsImageUrl?: string;
  socials: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    twitter?: string;
  };
}

export interface QuestionItem {
  no: number;
  section: string;
  type: "MCQ" | "Very Short Answer" | "Short Answer" | "Long Answer" | "Fill in the Blanks" | "True/False";
  text: string;
  marks: number;
  answer?: string;
  options?: string[];
}

export interface GeneratedPaper {
  id: string;
  title: string;
  subject: string;
  grade: string;
  examType: string;
  totalMarks: number;
  duration: string;
  topics: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Mixed";
  instructions: string[];
  sections: {
    name: string;
    description: string;
    totalMarks: number;
    questions: QuestionItem[];
  }[];
  createdAt: string;
  status: "Draft" | "Published";
}

export interface SiteSettings {
  adminPasswordHash?: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  groqApiKey?: string;
  geminiApiKey?: string;
  openaiApiKey?: string;
  aiProvider: "groq" | "gemini" | "openai" | "smart-local";
  aiUsageCount: number;
  aiCreditsLimit: number;
  themeColor: string;
}
