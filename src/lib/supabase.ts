import { getStoredConfig } from "../config/api";

// Lightweight direct REST client for Supabase that works seamlessly without heavy external bundles
export class SupabaseClient {
  private getUrl(): string {
    const config = getStoredConfig();
    return config.supabaseUrl.replace(/\/$/, "");
  }

  private getHeaders(): Record<string, string> {
    const config = getStoredConfig();
    return {
      "Content-Type": "application/json",
      "apikey": config.supabaseAnonKey,
      "Authorization": `Bearer ${config.supabaseAnonKey}`,
      "Prefer": "return=representation",
    };
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const url = this.getUrl();
      const config = getStoredConfig();
      if (!url || !config.supabaseAnonKey || config.supabaseAnonKey.includes("dummy")) {
        return {
          success: false,
          message: "Please configure a valid Supabase Project URL and Anon Key in Settings.",
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
        throw new Error(`Error fetching ${table}: ${response.statusText}`);
      }
      const data = await response.json();
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
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
        throw new Error(`Error inserting into ${table}: ${response.statusText}`);
      }
      const data = await response.json();
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
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
        throw new Error(`Error updating ${table}: ${response.statusText}`);
      }
      const data = await response.json();
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
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
        throw new Error(`Error deleting from ${table}: ${response.statusText}`);
      }
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error };
    }
  }
}

export const supabase = new SupabaseClient();
