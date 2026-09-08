import { getStoredConfig } from "../config/api";

// Lightweight direct REST client for Supabase that works seamlessly across local dev and Vercel
export class SupabaseClient {
  private getUrl(): string {
    const config = getStoredConfig();
    return (config.supabaseUrl || "").replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
  }

  private getHeaders(): Record<string, string> {
    const config = getStoredConfig();
    const key = config.supabaseAnonKey || "";
    return {
      "Content-Type": "application/json",
      "apikey": key,
      "Authorization": `Bearer ${key}`,
      "Prefer": "return=representation",
    };
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const url = this.getUrl();
      const config = getStoredConfig();
      if (!url || !config.supabaseAnonKey || config.supabaseAnonKey.length < 15) {
        return {
          success: false,
          message: "Please configure a valid Supabase Project URL and Anon Key in .env or Vercel.",
        };
      }
      const response = await fetch(`${url}/rest/v1/`, {
        method: "GET",
        headers: this.getHeaders(),
      });
      if (response.ok || response.status === 404 || response.status === 200) {
        return { success: true, message: "Connected to Supabase successfully!" };
      }
      return { success: false, message: `Connection failed with status ${response.status}: ${response.statusText}` };
    } catch (e: any) {
      return { success: false, message: e.message || "Failed to reach Supabase server" };
    }
  }

  async select<T = any>(table: string, query: string = ""): Promise<{ data: T[] | null; error: any }> {
    try {
      const url = `${this.getUrl()}/rest/v1/${table}${query ? `?${query}` : ""}`;
      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(),
      });
      if (!response.ok) {
        const errText = await response.text();
        return { data: null, error: `Error ${response.status}: ${errText}` };
      }
      const data = await response.json();
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error?.message || "Fetch failed" };
    }
  }

  async insert<T = any>(table: string, payload: any): Promise<{ data: T | null; error: any }> {
    try {
      const url = `${this.getUrl()}/rest/v1/${table}`;
      const response = await fetch(url, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errText = await response.text();
        return { data: null, error: `Error ${response.status}: ${errText}` };
      }
      const data = await response.json();
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error?.message || "Insert failed" };
    }
  }

  async update<T = any>(table: string, filterQuery: string, payload: any): Promise<{ data: T | null; error: any }> {
    try {
      const url = `${this.getUrl()}/rest/v1/${table}?${filterQuery}`;
      const response = await fetch(url, {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errText = await response.text();
        return { data: null, error: `Error ${response.status}: ${errText}` };
      }
      const data = await response.json();
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error?.message || "Update failed" };
    }
  }

  async delete(table: string, filterQuery: string): Promise<{ success: boolean; error: any }> {
    try {
      const url = `${this.getUrl()}/rest/v1/${table}?${filterQuery}`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: this.getHeaders(),
      });
      if (!response.ok) {
        const errText = await response.text();
        return { success: false, error: `Error ${response.status}: ${errText}` };
      }
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error?.message || "Delete failed" };
    }
  }
}

export const supabase = new SupabaseClient();
