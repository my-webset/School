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

// Clean and sanitize Supabase base URL (strips trailing /rest/v1 or /)
const cleanSupabaseUrl = (rawUrl?: string): string => {
  if (!rawUrl) return "https://dnpanpydwuijjoepyxdu.supabase.co";
  return rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
};

// Default fallback settings (loaded from .env / Vercel Environment Variables)
export const DEFAULT_CONFIG: ApiConfig = {
  supabaseUrl: cleanSupabaseUrl(
    (import.meta as any).env?.VITE_SUPABASE_URL || "https://dnpanpydwuijjoepyxdu.supabase.co"
  ),
  supabaseAnonKey:
    (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
    "sb_publishable_EXwBbk_EdxAiQ6Nk_uheeA_ozVr-K93",
  groqApiKey: (import.meta as any).env?.VITE_GROQ_API_KEY || "",
  geminiApiKey: (import.meta as any).env?.VITE_GEMINI_API_KEY || "",
  openaiApiKey: (import.meta as any).env?.VITE_OPENAI_API_KEY || "",
  defaultAdminPassword: (import.meta as any).env?.VITE_ADMIN_PASSWORD || "admin123",
};

export const getStoredConfig = (): ApiConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Clean up any stale/dummy legacy URLs in localStorage
      const storedUrl = parsed.supabaseUrl;
      const validUrl =
        storedUrl && !storedUrl.includes("dummy") && !storedUrl.includes("dslskizj")
          ? cleanSupabaseUrl(storedUrl)
          : DEFAULT_CONFIG.supabaseUrl;

      const validKey =
        parsed.supabaseAnonKey && !parsed.supabaseAnonKey.includes("dummy")
          ? parsed.supabaseAnonKey
          : DEFAULT_CONFIG.supabaseAnonKey;

      return {
        ...DEFAULT_CONFIG,
        ...parsed,
        supabaseUrl: validUrl,
        supabaseAnonKey: validKey,
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
    const updated = {
      ...current,
      ...config,
      ...(config.supabaseUrl ? { supabaseUrl: cleanSupabaseUrl(config.supabaseUrl) } : {}),
    };
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to save settings to localStorage", e);
    return DEFAULT_CONFIG;
  }
};
