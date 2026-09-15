import { useState } from "react";
import { QRCodeGenerator, downloadFormQRCodePoster } from "../../utils/qrCode";
import { dataService } from "../../services/dataService";
import LOGOS from "../../assets/logos";

interface Props {
  formId: string;
  formName: string;
  formDesc?: string;
  onClose: () => void;
}

export default function FormQRModal({ formId, formName, formDesc, onClose }: Props) {
  const school = dataService.getSchoolInfo();
  const [copied, setCopied] = useState(false);

  // Construct absolute URL for the form
  const baseUrl = typeof window !== "undefined" ? window.location.origin + window.location.pathname : "https://school.edu";
  const formUrl = `${baseUrl}?formId=${formId}`;
  const qrDataUrl = QRCodeGenerator.generateDataURL(formUrl, { size: 300, margin: 2, colorDark: "#0f2147" });

  const handleCopy = () => {
    navigator.clipboard.writeText(formUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `📝 *${school.name}*\n\nPlease complete the official form: *${formName}*\n\n👉 Click link to open and submit:\n${formUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleDownload = () => {
    downloadFormQRCodePoster({
      schoolName: school.name,
      formName,
      formUrl,
      logoUrl: school.logoUrl,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div style={{ background: "var(--primary)" }} className="p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-sm transition-colors"
          >
            ✕
          </button>
          
          <img
            src={school.logoUrl || LOGOS.schoolLogo}
            alt="School Logo"
            className="w-12 h-12 object-contain bg-white rounded-2xl p-1 mx-auto mb-2 shadow-xs"
          />
          <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">{school.name}</div>
          <h2 className="text-lg font-bold mt-1 text-white leading-tight" style={{ fontFamily: "DM Serif Display, serif" }}>
            {formName}
          </h2>
          <div className="inline-block mt-2 px-3 py-0.5 rounded-full bg-white/15 text-[10px] font-semibold tracking-wide">
            Scan to Open & Fill Form
          </div>
        </div>

        {/* QR Canvas Area */}
        <div className="p-6 text-center space-y-4">
          <div className="w-56 h-56 mx-auto bg-slate-50 rounded-2xl p-3 border-2 border-dashed border-slate-200 flex items-center justify-center shadow-inner">
            <img
              src={qrDataUrl}
              alt="Form QR Code"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>

          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Scan with any phone camera or barcode scanner to directly access and submit this form online.
          </p>

          {/* Form URL Box */}
          <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl text-left">
            <div className="flex-1 truncate font-mono text-[11px] text-blue-900 px-1">
              {formUrl}
            </div>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-white border border-slate-200 shadow-xs hover:bg-slate-100 transition-colors flex-shrink-0"
            >
              {copied ? "✓ Copied!" : "📋 Copy"}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-white shadow-sm flex items-center justify-center gap-1.5 hover:opacity-95 transition-opacity"
              style={{ background: "var(--primary)" }}
            >
              <span>📥</span> Download Poster
            </button>
            <button
              onClick={handleWhatsApp}
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>📲</span> WhatsApp Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
