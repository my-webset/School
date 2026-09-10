import { dataService } from "./dataService";

const AUTH_TOKEN_KEY = "nis_admin_authenticated";

export class AuthService {
  static getStoredPassword(): string {
    return dataService.getAdminPassword();
  }

  static async loginAsync(password: string): Promise<{ success: boolean; message?: string }> {
    if (!password) {
      return { success: false, message: "Please enter the admin password." };
    }
    const isValid = await dataService.verifyAdminPasswordWithSupabase(password);
    if (isValid) {
      sessionStorage.setItem(AUTH_TOKEN_KEY, "true");
      return { success: true };
    }
    return { success: false, message: "Incorrect password. Please try again." };
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

  static async changePassword(currentPass: string, newPass: string): Promise<{ success: boolean; message: string }> {
    const validPassword = this.getStoredPassword();
    if (currentPass !== validPassword) {
      return { success: false, message: "Current password does not match." };
    }
    return await dataService.saveAdminPassword(newPass);
  }
}

