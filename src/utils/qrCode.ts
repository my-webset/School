// src/utils/qrCode.ts
// Standard Static QR Code generator for School Online Forms and Direct Admission Links
import QRCode from "qrcode";

export interface QRCodeOptions {
  size?: number;
  margin?: number;
  colorDark?: string;
  colorLight?: string;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
}

/**
 * Static QR Code Utility:
 * Encodes the direct form URL directly into the matrix (zero redirects, permanent static code).
 */
export class QRCodeGenerator {
  /**
   * Generates a Data URL (PNG base64) for the given static URL or text.
   */
  static async generateDataURL(text: string, options: QRCodeOptions = {}): Promise<string> {
    const size = options.size || 350;
    const margin = options.margin !== undefined ? options.margin : 2;
    const colorDark = options.colorDark || "#0f172a";
    const colorLight = options.colorLight || "#ffffff";
    const errorCorrectionLevel = options.errorCorrectionLevel || "H";

    try {
      return await QRCode.toDataURL(text, {
        width: size,
        margin: margin,
        color: {
          dark: colorDark,
          light: colorLight,
        },
        errorCorrectionLevel: errorCorrectionLevel,
      });
    } catch (err) {
      console.error("Error generating QR Data URL:", err);
      return "";
    }
  }

  /**
   * Generates a clean SVG string for the given static URL or text.
   */
  static async generateSVG(text: string, options: QRCodeOptions = {}): Promise<string> {
    const size = options.size || 300;
    const margin = options.margin !== undefined ? options.margin : 2;
    const colorDark = options.colorDark || "#0f172a";
    const colorLight = options.colorLight || "#ffffff";
    const errorCorrectionLevel = options.errorCorrectionLevel || "H";

    try {
      return await QRCode.toString(text, {
        type: "svg",
        width: size,
        margin: margin,
        color: {
          dark: colorDark,
          light: colorLight,
        },
        errorCorrectionLevel: errorCorrectionLevel,
      });
    } catch (err) {
      console.error("Error generating QR SVG:", err);
      return "";
    }
  }

  /**
   * Downloads a standalone high-resolution static QR Code PNG
   */
  static async downloadStaticQRImage(text: string, fileName: string = "form_qr_code") {
    try {
      const dataUrl = await QRCode.toDataURL(text, {
        width: 1024,
        margin: 2,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
        errorCorrectionLevel: "H",
      });
      const a = document.createElement("a");
      a.download = `${fileName.replace(/[^a-zA-Z0-9_-]/g, "_")}_Static_QR.png`;
      a.href = dataUrl;
      a.click();
    } catch (err) {
      console.error("Error downloading static QR code:", err);
    }
  }
}

/**
 * Generates and downloads an official high-resolution, branded School Form QR Poster (PNG).
 * Contains the static QR code, school branding, form title, and direct URL.
 */
export async function downloadFormQRCodePoster({
  schoolName,
  formName,
  formUrl,
  logoUrl,
}: {
  schoolName: string;
  formName: string;
  formUrl: string;
  logoUrl?: string;
}) {
  const canvas = document.createElement("canvas");
  canvas.width = 1000;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Gradient Header
  const grad = ctx.createLinearGradient(0, 0, 1000, 260);
  grad.addColorStop(0, "#0f2147");
  grad.addColorStop(1, "#1a3a6e");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, 260);

  // Gold accent bar
  ctx.fillStyle = "#c8a84b";
  ctx.fillRect(0, 255, canvas.width, 5);

  // School Header
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 38px 'DM Serif Display', Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText(schoolName.toUpperCase(), 500, 110);

  ctx.font = "18px 'DM Sans', sans-serif";
  ctx.fillStyle = "#cbd5e1";
  ctx.fillText("Official Online Form & Registration Portal", 500, 155);

  // Form Badge
  ctx.fillStyle = "#c8a84b";
  ctx.beginPath();
  ctx.roundRect(120, 195, 760, 52, 14);
  ctx.fill();

  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 22px 'DM Sans', sans-serif";
  ctx.fillText(formName, 500, 230);

  // QR Code Box
  ctx.fillStyle = "#f8fafc";
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(200, 320, 600, 600, 32);
  ctx.fill();
  ctx.stroke();

  // Generate High-Res Static QR Code
  try {
    const qrDataUrl = await QRCode.toDataURL(formUrl, {
      width: 520,
      margin: 2,
      color: {
        dark: "#0f2147",
        light: "#f8fafc",
      },
      errorCorrectionLevel: "H",
    });

    const qrImg = new Image();
    qrImg.onload = () => {
      ctx.drawImage(qrImg, 240, 360, 520, 520);

      // Call to action
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 32px 'DM Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Scan Static QR to Open Form", 500, 990);

      ctx.fillStyle = "#64748b";
      ctx.font = "18px 'DM Sans', sans-serif";
      ctx.fillText("Point your phone camera or QR scanner to open directly", 500, 1030);

      // Direct static URL footer pill
      ctx.fillStyle = "#f1f5f9";
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(80, 1080, 840, 65, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#1e3a8a";
      ctx.font = "bold 16px monospace";
      ctx.fillText(formUrl, 500, 1120);

      // Static Badge Tag
      ctx.fillStyle = "#059669";
      ctx.font = "bold 14px 'DM Sans', sans-serif";
      ctx.fillText("✓ Permanent Static QR Code • Direct Form Access", 500, 1190);

      // Copyright
      ctx.fillStyle = "#94a3b8";
      ctx.font = "14px 'DM Sans', sans-serif";
      ctx.fillText(`Generated by ${schoolName} Portal`, 500, 1270);

      // Trigger Download
      const a = document.createElement("a");
      a.download = `${formName.replace(/[^a-zA-Z0-9_-]/g, "_")}_Official_QR_Poster.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    qrImg.src = qrDataUrl;
  } catch (err) {
    console.error("Failed to render QR poster:", err);
  }
}
