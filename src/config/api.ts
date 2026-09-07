// Central API and Environment Configuration

const STORAGE_KEY_SETTINGS = "nis_school_settings_v1";

export interface ApiConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  groqApiKey: string;
  geminiApiKey: string;
  openaiApiKey: string;
  defaultAdminPassword: string;
}

// Default fallback settings (can be overridden via Settings panel or .env)
export const DEFAULT_CONFIG: ApiConfig = {
  supabaseUrl: (import.meta as any).env?.VITE_SUPABASE_URL || "https://dslskizjbodjwyvfatvh.supabase.co",
  supabaseAnonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key",
  groqApiKey: (import.meta as any).env?.VITE_GROQ_API_KEY || "",
  geminiApiKey: (import.meta as any).env?.VITE_GEMINI_API_KEY || "",
  openaiApiKey: (import.meta as any).env?.VITE_OPENAI_API_KEY || "",
  defaultAdminPassword: "admin123",
};

export const getStoredConfig = (): ApiConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_CONFIG,
        ...parsed,
      };
    }
  } catch (e) {
    console.error("Failed to read settings from localStorage", e);
  }
  return DEFAULT_CONFIG;
};

export const saveStoredConfig = (config: Partial<ApiConfig>) => {
  try {
    const current = getStoredConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to save settings to localStorage", e);
    return DEFAULT_CONFIG;
  }
};
