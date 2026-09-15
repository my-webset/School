import { useState, useEffect } from "react";
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
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(true);

  // Construct absolute URL for the form (Static direct URL)
  const defaultOrigin = typeof window !== "undefined" ? window.location.origin + window.location.pathname : "https://school.edu";
  const [customBaseUrl, setCustomBaseUrl] = useState(defaultOrigin);
  const [isEditingUrl, setIsEditingUrl] = useState(false);

  // The permanent static form URL encoded into the QR
  const formUrl = `${customBaseUrl.replace(/\/$/, "")}${customBaseUrl.includes("?") ? "&" : "?"}formId=${formId}`;

  useEffect(() => {
    let active = true;
    setIsGenerating(true);
    QRCodeGenerator.generateDataURL(formUrl, {
      size: 400,
      margin: 2,
      colorDark: "#0f2147",
      colorLight: "#ffffff",
      errorCorrectionLevel: "H",
    }).then((url) => {
      if (active) {
        setQrDataUrl(url);
        setIsGenerating(false);
      }
    });
    return () => {
      active = false;
    };
  }, [formUrl]);

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

  const handleDownloadPoster = () => {
    downloadFormQRCodePoster({
      schoolName: school.name,
      formName,
      formUrl,
      logoUrl: school.logoUrl,
    });
  };

  const handleDownloadQRImage = () => {
    QRCodeGenerator.downloadStaticQRImage(formUrl, `${formName}_Static_QR`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div style={{ background: "var(--primary)" }} className="p-5 text-white text-center relative">
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
          <h2 className="text-lg font-bold mt-0.5 text-white leading-tight" style={{ fontFamily: "DM Serif Display, serif" }}>
            {formName}
          </h2>
          <div className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-[10px] font-bold tracking-wide">
            <span>✓</span> Permanent Static QR Code
          </div>
        </div>

        {/* QR Canvas Area */}
        <div className="p-6 text-center space-y-4">
          <div className="w-56 h-56 mx-auto bg-slate-50 rounded-2xl p-3 border-2 border-dashed border-slate-200 flex items-center justify-center shadow-inner relative">
            {isGenerating ? (
              <div className="text-xs text-slate-400 animate-pulse">Generating static QR...</div>
            ) : qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Static Form QR Code"
                className="w-full h-full object-contain rounded-xl"
              />
            ) : (
              <div className="text-xs text-red-500">Failed to load QR</div>
            )}
          </div>

          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            This is a <strong>pure static QR code</strong> containing your direct form URL. It never expires and works with any phone camera or barcode scanner.
          </p>

          {/* Form Static URL Box */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold px-1">
              <span>Static Destination URL:</span>
              <button
                type="button"
                onClick={() => setIsEditingUrl(!isEditingUrl)}
                className="text-blue-600 hover:text-blue-700 underline text-[10px]"
              >
                {isEditingUrl ? "Done" : "✏️ Custom Domain"}
              </button>
            </div>

            {isEditingUrl && (
              <div className="pt-1">
                <input
                  type="text"
                  value={customBaseUrl}
                  onChange={(e) => setCustomBaseUrl(e.target.value)}
                  placeholder="e.g. https://nalandaschool.org"
                  className="w-full text-xs font-mono border border-blue-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Change base domain if you are generating QR for your live website.
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 pt-0.5">
              <div className="flex-1 truncate font-mono text-[11px] text-blue-900 bg-white border border-slate-200 rounded-lg px-2 py-1.5 select-all">
                {formUrl}
              </div>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-white border border-slate-200 shadow-xs hover:bg-slate-100 transition-colors flex-shrink-0"
              >
                {copied ? "✓ Copied!" : "📋 Copy"}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <button
              onClick={handleDownloadQRImage}
              className="px-3 py-2.5 rounded-xl font-bold text-xs text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 shadow-xs flex items-center justify-center gap-1 transition-colors"
              title="Download standalone high-res static QR code image"
            >
              <span>🖼️</span> Static QR
            </button>
            <button
              onClick={handleDownloadPoster}
              className="px-3 py-2.5 rounded-xl font-bold text-xs text-white shadow-xs flex items-center justify-center gap-1 hover:opacity-95 transition-opacity"
              style={{ background: "var(--primary)" }}
              title="Download official school branded flyer poster"
            >
              <span>📥</span> Poster
            </button>
            <button
              onClick={handleWhatsApp}
              className="px-3 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs flex items-center justify-center gap-1 transition-colors"
              title="Share direct form link via WhatsApp"
            >
              <span>📲</span> WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
