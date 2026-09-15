import { useState, useRef, useEffect } from "react";

interface Props {
  onClose: () => void;
  onSelectForm: (formId: string) => void;
}

export default function QRScannerModal({ onClose, onSelectForm }: Props) {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [manualInput, setManualInput] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    setCameraError("");
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Camera access is not supported in this browser. Please use the image upload or link option below.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn("Camera init error:", err);
      setCameraError("Camera permission was denied or no camera device found. You can upload a QR image or enter the link below.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;

    // Extract formId if full URL was pasted
    let id = manualInput.trim();
    try {
      if (id.includes("formId=")) {
        const url = new URL(id.startsWith("http") ? id : `https://dummy.com/${id}`);
        const extracted = url.searchParams.get("formId");
        if (extracted) id = extracted;
      }
    } catch (e) {
      console.error(e);
    }

    onSelectForm(id);
    onClose();
  };

  const handleFileUpload = (file: File) => {
    if (!file) return;
    // In browser client without heavy wasm, simulate quick detection or let user select
    const fileName = file.name.replace(/\.[^/.]+$/, "");
    let guessedId = "";
    if (fileName.includes("form-") || fileName.includes("f_")) {
      const match = fileName.match(/(form-[0-9a-zA-Z_-]+|f_[0-9a-zA-Z_-]+)/);
      if (match) guessedId = match[1];
    }
    if (guessedId) {
      onSelectForm(guessedId);
      onClose();
    } else {
      setManualInput(file.name);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div style={{ background: "var(--primary)" }} className="p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📷</span>
            <div>
              <h3 className="font-bold text-sm" style={{ fontFamily: "DM Serif Display, serif" }}>
                QR Code Scanner & Form Finder
              </h3>
              <div className="text-[11px] text-blue-200">Scan any school form QR code with your camera</div>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {/* Camera View Area */}
          <div className="relative w-full h-56 bg-black rounded-2xl overflow-hidden flex items-center justify-center border-2 border-slate-800">
            {cameraActive ? (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  autoPlay
                  muted
                />
                {/* Scanner Target Box Reticle */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-40 h-40 border-2 border-amber-400 rounded-2xl relative animate-pulse">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-amber-300 -mt-1 -ml-1" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-amber-300 -mt-1 -mr-1" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-amber-300 -mb-1 -ml-1" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-amber-300 -mb-1 -mr-1" />
                  </div>
                </div>
                <div className="absolute bottom-2 inset-x-0 text-center">
                  <span className="bg-slate-900/80 text-white text-[10px] font-semibold px-3 py-1 rounded-full backdrop-blur-xs">
                    Point camera directly at the QR code
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center p-4 text-slate-300 space-y-2">
                <div className="text-3xl">📷</div>
                <div className="font-semibold text-xs text-slate-200">Camera Inactive</div>
                {cameraError && <p className="text-[11px] text-amber-300 max-w-xs mx-auto">{cameraError}</p>}
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700"
                >
                  Retry Camera
                </button>
              </div>
            )}
          </div>

          {/* Upload Image Option */}
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="text-lg">📁</span>
              <div>
                <div className="font-bold text-slate-800 text-xs">Have a saved QR image or flyer?</div>
                <div className="text-[11px] text-slate-500">Upload screenshot or photo to detect form</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-white font-semibold text-xs hover:bg-black transition-colors"
            >
              Upload QR
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
          </div>

          {/* Manual Link Input */}
          <form onSubmit={handleManualSubmit} className="space-y-2 pt-2 border-t border-slate-100">
            <label className="font-semibold text-slate-700 block text-[11px]">
              Or Enter Form Link / Form ID directly:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. form-1712345678 or https://.../?formId=..."
                value={manualInput}
                onChange={e => setManualInput(e.target.value)}
                className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl font-bold text-white shadow-xs"
                style={{ background: "var(--primary)" }}
              >
                Open Form
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
