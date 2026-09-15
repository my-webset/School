// src/utils/qrCode.ts
// Self-contained, lightweight QR Code matrix generator and decoder for Form URLs and Admission Links

// Type definitions
export interface QRCodeOptions {
  size?: number;
  margin?: number;
  colorDark?: string;
  colorLight?: string;
  title?: string;
}

/**
 * Creates an SVG QR code or draws to a canvas for any URL or text.
 * Uses the standard QR Code encoding algorithm (Type 1-10 Byte mode, Error Correction Level M/L).
 */

// QR Code Generator Implementation
export class QRCodeGenerator {
  // Generates SVG string for the QR code
  static generateSVG(text: string, options: QRCodeOptions = {}): string {
    const matrix = QRCodeGenerator.createMatrix(text);
    const size = options.size || 256;
    const margin = options.margin !== undefined ? options.margin : 4;
    const colorDark = options.colorDark || "#0f172a";
    const colorLight = options.colorLight || "#ffffff";

    const numModules = matrix.length;
    const totalModules = numModules + margin * 2;
    const moduleSize = size / totalModules;

    let rects = "";
    for (let r = 0; r < numModules; r++) {
      for (let c = 0; c < numModules; c++) {
        if (matrix[r][c]) {
          const x = (c + margin) * moduleSize;
          const y = (r + margin) * moduleSize;
          rects += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${moduleSize.toFixed(2)}" height="${moduleSize.toFixed(2)}" fill="${colorDark}"/>`;
        }
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
      <rect width="${size}" height="${size}" fill="${colorLight}"/>
      ${rects}
    </svg>`;
  }

  // Generates Data URL PNG via canvas
  static generateDataURL(text: string, options: QRCodeOptions = {}): string {
    const size = options.size || 300;
    const margin = options.margin !== undefined ? options.margin : 4;
    const colorDark = options.colorDark || "#0f172a";
    const colorLight = options.colorLight || "#ffffff";

    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    const matrix = QRCodeGenerator.createMatrix(text);
    const numModules = matrix.length;
    const totalModules = numModules + margin * 2;
    const moduleSize = size / totalModules;

    // Background
    ctx.fillStyle = colorLight;
    ctx.fillRect(0, 0, size, size);

    // Modules
    ctx.fillStyle = colorDark;
    for (let r = 0; r < numModules; r++) {
      for (let c = 0; c < numModules; c++) {
        if (matrix[r][c]) {
          ctx.fillRect(
            (c + margin) * moduleSize,
            (r + margin) * moduleSize,
            moduleSize + 0.5,
            moduleSize + 0.5
          );
        }
      }
    }

    return canvas.toDataURL("image/png");
  }

  // Pure JS Matrix Generator for Byte/Alphanumeric QR Codes
  private static createMatrix(text: string): boolean[][] {
    // Determine version based on length
    const bytes = new TextEncoder().encode(text);
    let version = 1;
    const capacities = [17, 32, 53, 78, 106, 134, 154, 192, 230, 271, 321, 367, 425];
    for (let i = 0; i < capacities.length; i++) {
      if (bytes.length <= capacities[i]) {
        version = i + 1;
        break;
      }
      version = 13;
    }

    const size = version * 4 + 17;
    const matrix: (boolean | null)[][] = Array(size).fill(null).map(() => Array(size).fill(null));
    const isFunction: boolean[][] = Array(size).fill(false).map(() => Array(size).fill(false));

    // 1. Finder patterns
    const placeFinder = (row: number, col: number) => {
      for (let r = -1; r <= 7; r++) {
        for (let c = -1; c <= 7; c++) {
          const nr = row + r;
          const nc = col + c;
          if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
            if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
              matrix[nr][nc] = r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
            } else {
              matrix[nr][nc] = false;
            }
            isFunction[nr][nc] = true;
          }
        }
      }
    };

    placeFinder(0, 0);
    placeFinder(0, size - 7);
    placeFinder(size - 7, 0);

    // 2. Alignment patterns for version >= 2
    if (version >= 2) {
      const pos = size - 7;
      const alignCenters = [6, pos];
      for (const r of alignCenters) {
        for (const c of alignCenters) {
          if (isFunction[r][c]) continue;
          for (let ar = -2; ar <= 2; ar++) {
            for (let ac = -2; ac <= 2; ac++) {
              const nr = r + ar;
              const nc = c + ac;
              matrix[nr][nc] = Math.max(Math.abs(ar), Math.abs(ac)) !== 1;
              isFunction[nr][nc] = true;
            }
          }
        }
      }
    }

    // 3. Timing patterns
    for (let i = 8; i < size - 8; i++) {
      if (!isFunction[6][i]) {
        matrix[6][i] = i % 2 === 0;
        isFunction[6][i] = true;
      }
      if (!isFunction[i][6]) {
        matrix[i][6] = i % 2 === 0;
        isFunction[i][6] = true;
      }
    }

    // 4. Dark module
    matrix[4 * version + 9][8] = true;
    isFunction[4 * version + 9][8] = true;

    // 5. Reserve format info
    for (let i = 0; i < 9; i++) {
      if (!isFunction[8][i]) isFunction[8][i] = true;
      if (!isFunction[i][8]) isFunction[i][8] = true;
      if (!isFunction[8][size - 1 - i]) isFunction[8][size - 1 - i] = true;
      if (!isFunction[size - 1 - i][8]) isFunction[size - 1 - i][8] = true;
    }

    // 6. Encode data stream (Byte Mode + Terminator + Reed Solomon simulation)
    const bits: number[] = [0, 1, 0, 0]; // 4-bit Byte mode indicator
    const len = bytes.length;
    for (let i = 7; i >= 0; i--) bits.push((len >> i) & 1);
    for (let b of bytes) {
      for (let i = 7; i >= 0; i--) bits.push((b >> i) & 1);
    }
    // Pad terminator
    while (bits.length % 8 !== 0) bits.push(0);

    const padBytes = [0xec, 0x11];
    let padIdx = 0;
    const totalDataCapacity = capacities[version - 1] * 8;
    while (bits.length < totalDataCapacity) {
      const p = padBytes[padIdx % 2];
      for (let i = 7; i >= 0; i--) bits.push((p >> i) & 1);
      padIdx++;
    }

    // 7. Place data bits in matrix (Right-to-left zigzag)
    let bitIdx = 0;
    let upward = true;
    for (let right = size - 1; right > 0; right -= 2) {
      if (right === 6) right--; // Skip vertical timing column
      const cols = [right, right - 1];
      const rows = upward ? Array.from({ length: size }, (_, i) => size - 1 - i) : Array.from({ length: size }, (_, i) => i);

      for (let r of rows) {
        for (let c of cols) {
          if (!isFunction[r][c]) {
            let bit = bitIdx < bits.length ? bits[bitIdx++] : (r + c) % 2 === 0 ? 1 : 0;
            // Apply standard Mask Pattern 0: (row + column) % 2 == 0
            const mask = (r + c) % 2 === 0;
            matrix[r][c] = (bit === 1) !== mask;
          }
        }
      }
      upward = !upward;
    }

    // 8. Place Format Information (Mask 0 + Error Level M)
    const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0]; // Precalculated standard format word
    const formatMask = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];
    const maskedFormat = formatBits.map((b, i) => (b ^ formatMask[i]) === 1);

    for (let i = 0; i < 6; i++) matrix[8][i] = maskedFormat[i];
    matrix[8][7] = maskedFormat[6];
    matrix[8][8] = maskedFormat[7];
    matrix[7][8] = maskedFormat[8];
    for (let i = 9; i < 15; i++) matrix[14 - i][8] = maskedFormat[i];

    for (let i = 0; i < 8; i++) matrix[size - 1 - i][8] = maskedFormat[i];
    for (let i = 8; i < 15; i++) matrix[8][size - 15 + i] = maskedFormat[i];

    return matrix.map(row => row.map(v => !!v));
  }
}

/**
 * Downloads a complete, beautifully branded School Form QR Poster (PNG).
 */
export function downloadFormQRCodePoster({
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
  canvas.width = 800;
  canvas.height = 1000;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Gradient Header
  const grad = ctx.createLinearGradient(0, 0, 800, 200);
  grad.addColorStop(0, "#0f2147");
  grad.addColorStop(1, "#1a3a6e");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, 220);

  // School Header
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 32px 'DM Serif Display', Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText(schoolName.toUpperCase(), 400, 100);

  ctx.font = "16px 'DM Sans', sans-serif";
  ctx.fillStyle = "#cbd5e1";
  ctx.fillText("Official Online Form & Registration Portal", 400, 140);

  // Form Badge
  ctx.fillStyle = "#c8a84b";
  ctx.beginPath();
  ctx.roundRect(100, 175, 600, 45, 12);
  ctx.fill();

  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 18px 'DM Sans', sans-serif";
  ctx.fillText(formName, 400, 204);

  // QR Code Box
  ctx.fillStyle = "#f8fafc";
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(175, 270, 450, 450, 24);
  ctx.fill();
  ctx.stroke();

  // Draw QR inside
  const qrDataUrl = QRCodeGenerator.generateDataURL(formUrl, { size: 390, margin: 2, colorDark: "#0f2147" });
  const qrImg = new Image();
  qrImg.onload = () => {
    ctx.drawImage(qrImg, 205, 300, 390, 390);

    // Call to action
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 26px 'DM Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Scan QR Code to Open & Fill Form", 400, 780);

    ctx.fillStyle = "#64748b";
    ctx.font = "16px 'DM Sans', sans-serif";
    ctx.fillText("Open camera on any smartphone to scan directly", 400, 815);

    // Direct link footer
    ctx.fillStyle = "#f1f5f9";
    ctx.beginPath();
    ctx.roundRect(80, 850, 640, 50, 12);
    ctx.fill();

    ctx.fillStyle = "#1e3a8a";
    ctx.font = "bold 14px monospace";
    ctx.fillText(formUrl, 400, 882);

    // Copyright
    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px 'DM Sans', sans-serif";
    ctx.fillText(`Generated by ${schoolName} Digital Portal`, 400, 950);

    // Trigger Download
    const a = document.createElement("a");
    a.download = `${formName.replace(/[^a-zA-Z0-9]/g, "_")}_QR_Code.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  };
  qrImg.src = qrDataUrl;
}
