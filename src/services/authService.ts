import { getStoredConfig, saveStoredConfig } from "../config/api";

const AUTH_TOKEN_KEY = "nis_admin_authenticated";
const CUSTOM_PASSWORD_KEY = "nis_admin_password_hash";

export class AuthService {
  private static getStoredPassword(): string {
    const custom = localStorage.getItem(CUSTOM_PASSWORD_KEY);
    if (custom) return custom;
    const config = getStoredConfig();
    return config.defaultAdminPassword || "admin123";
  }

  static login(password: string): { success: boolean; message?: string } {
    const validPassword = this.getStoredPassword();
    if (!password) {
      return { success: false, message: "Please enter the admin password." };
    }
    if (password === validPassword) {
      sessionStorage.setItem(AUTH_TOKEN_KEY, "true");
      return { success: true };
    }
    return { success: false, message: "Incorrect password. Please try again." };
  }

  static isAuthenticated(): boolean {
    return sessionStorage.getItem(AUTH_TOKEN_KEY) === "true";
  }

  static logout(): void {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
  }

  static changePassword(currentPass: string, newPass: string): { success: boolean; message: string } {
    const validPassword = this.getStoredPassword();
    if (currentPass !== validPassword) {
      return { success: false, message: "Current password does not match." };
    }
    if (!newPass || newPass.length < 4) {
      return { success: false, message: "New password must be at least 4 characters long." };
    }
    localStorage.setItem(CUSTOM_PASSWORD_KEY, newPass);
    saveStoredConfig({ defaultAdminPassword: newPass });
    return { success: true, message: "Admin password successfully updated!" };
  }
}
