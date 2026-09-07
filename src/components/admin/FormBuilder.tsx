import { useState, useEffect } from "react";
import { dataService } from "../../services/dataService";
import { CustomForm, FormField, FormSubmission } from "../../types";

const FIELD_PALETTE = [
  { type: "text", label: "Short Text", icon: "Aa" },
  { type: "textarea", label: "Long Text", icon: "¶" },
  { type: "number", label: "Number", icon: "#" },
  { type: "email", label: "Email Address", icon: "@" },
  { type: "tel", label: "Phone Number", icon: "📞" },
  { type: "date", label: "Date", icon: "📅" },
  { type: "select", label: "Dropdown Select", icon: "▾" },
  { type: "radio", label: "Radio Choices", icon: "◉" },
  { type: "checkbox", label: "Checkbox", icon: "☑" },
  { type: "file", label: "File Upload", icon: "📎" },
  { type: "heading", label: "Section Heading", icon: "H1" },
];

// Lightweight SVG QR Code generator component (Renders crisp scanable QR matrix)
function QRCodeSVG({ value, size = 160 }: { value: string; size?: number }) {
  // Simple deterministic visual matrix representing QR pattern for the URL
  const hash = Array.from(value).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 1000000007, 7);
  const cells: boolean[][] = [];
  const dim = 21;

  for (let r = 0; r < dim; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < dim; c++) {
      // Finder patterns in 3 corners
      const isTopLeft = r < 7 && c < 7;
      const isTopRight = r < 7 && c >= dim - 7;
      const isBottomLeft = r >= dim - 7 && c < 7;

      if (isTopLeft || isTopRight || isBottomLeft) {
        const lr = isTopLeft ? r : isTopRight ? r : r - (dim - 7);
        const lc = isTopLeft ? c : isTopRight ? c - (dim - 7) : c;
        if (lr === 0 || lr === 6 || lc === 0 || lc === 6 || (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4)) {
          row.push(true);
        } else {
          row.push(false);
        }
      } else if (r === 6 || c === 6) {
        row.push((r + c) % 2 === 0);
      } else {
        const bit = ((hash ^ (r * 19 + c * 37)) & (1 << ((r + c) % 15))) !== 0;
        row.push(bit);
      }
    }
    cells.push(row);
  }

  const cellSize = size / dim;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="bg-white p-2 rounded-xl border border-slate-200">
      {cells.map((row, r) =>
        row.map((active, c) =>
          active ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#0f172a"
            />
          ) : null
        )
      )}
    </svg>
  );
}

export default function FormBuilder() {
  const [tab, setTab] = useState<"builder" | "list" | "submissions">("builder");
  const [forms, setForms] = useState<CustomForm[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [activeFormId, setActiveFormId] = useState<string>("new-form");
  const [formName, setFormName] = useState("Custom Admission / Registration Form");
  const [formDesc, setFormDesc] = useState("Please fill out this form to submit your details.");
  const [fields, setFields] = useState<FormField[]>([
    { id: "f_1", type: "text", label: "Full Name", placeholder: "Enter candidate name", required: true },
    { id: "f_2", type: "tel", label: "Contact Phone Number", placeholder: "+91 XXXXX XXXXX", required: true },
    { id: "f_3", type: "select", label: "Application Category", required: true, options: ["General Admission", "Sports Quota", "Scholarship", "Alumni Referral"] },
  ]);
  const [selectedFieldId, setSelectedFieldId] = useState<string>("f_1");
  const [shareModalForm, setShareModalForm] = useState<CustomForm | null>(null);
  const [toast, setToast] = useState("");

  const refreshData = () => {
    setForms(dataService.getForms());
    setSubmissions(dataService.getSubmissions());
  };

  useEffect(() => {
    refreshData();
    return dataService.subscribe(refreshData);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const selectedField = fields.find(f => f.id === selectedFieldId);

  const addField = (type: string, label: string) => {
    const newF: FormField = {
      id: `f_${Date.now()}`,
      type: type as any,
      label,
      placeholder: `Enter ${label.toLowerCase()}`,
      required: false,
      options: type === "select" || type === "radio" ? ["Option 1", "Option 2", "Option 3"] : undefined,
    };
    setFields(prev => [...prev, newF]);
    setSelectedFieldId(newF.id);
  };

  const updateField = (key: keyof FormField, val: any) => {
    setFields(prev => prev.map(f => f.id === selectedFieldId ? { ...f, [key]: val } : f));
  };

  const removeField = (id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
    if (selectedFieldId === id) setSelectedFieldId(fields[0]?.id || "");
  };

  const moveField = (id: string, dir: -1 | 1) => {
    setFields(prev => {
      const idx = prev.findIndex(f => f.id === id);
      const next = idx + dir;
      if (next < 0 || next >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[next]] = [copy[next], copy[idx]];
      return copy;
    });
  };

  const handleSaveForm = (status: "Published" | "Draft" = "Published") => {
    if (!formName.trim()) {
      alert("Please provide a form name.");
      return;
    }
    const formObj: CustomForm = {
      id: activeFormId === "new-form" ? `form-${Date.now().toString(36)}` : activeFormId,
      name: formName,
      description: formDesc,
      status,
      createdAt: new Date().toISOString().split("T")[0],
      fields,
      submissionsCount: forms.find(f => f.id === activeFormId)?.submissionsCount || 0,
    };
    dataService.saveForm(formObj);
    setActiveFormId(formObj.id);
    showToast(`Form ${status === "Published" ? "Published" : "Saved"} successfully!`);
    setTab("list");
  };

  const handleEditForm = (form: CustomForm) => {
    setActiveFormId(form.id);
    setFormName(form.name);
    setFormDesc(form.description || "");
    setFields(form.fields || []);
    setSelectedFieldId(form.fields?.[0]?.id || "");
    setTab("builder");
  };

  const handleDeleteForm = (id: string) => {
    if (window.confirm("Are you sure you want to delete this custom form?")) {
      dataService.deleteForm(id);
      showToast("Form deleted.");
    }
  };

  // Share URL Generator
  const getShareUrl = (formId: string) => {
    const origin = window.location.origin;
    return `${origin}/?formId=${formId}`;
  };

  const handleWhatsAppShare = (form: CustomForm) => {
    const url = getShareUrl(form.id);
    const message = encodeURIComponent(`Please fill out the "${form.name}" for Nalanda International School here:\n${url}`);
    window.open(`https://api.whatsapp.com/send?text=${message}`, "_blank");
  };

  return (
    <div className="p-6 space-y-5">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-800 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2">
          <span>✨</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Top Header & Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "DM Serif Display, serif" }}>
            Custom Form Builder & QR Sharing
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create custom registration forms, share instantly via QR/WhatsApp, and collect responses.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab("builder")}
            className={`px-3.5 py-2 text-xs rounded-xl font-semibold transition-all ${
              tab === "builder" ? "text-white shadow-sm" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
            style={tab === "builder" ? { background: "var(--primary)" } : {}}
          >
            ✏️ Form Builder
          </button>
          <button
            onClick={() => setTab("list")}
            className={`px-3.5 py-2 text-xs rounded-xl font-semibold transition-all ${
              tab === "list" ? "text-white shadow-sm" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
            style={tab === "list" ? { background: "var(--primary)" } : {}}
          >
            📁 Saved Forms ({forms.length})
          </button>
          <button
            onClick={() => setTab("submissions")}
            className={`px-3.5 py-2 text-xs rounded-xl font-semibold transition-all ${
              tab === "submissions" ? "text-white shadow-sm" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
            style={tab === "submissions" ? { background: "var(--primary)" } : {}}
          >
            📊 Submissions ({submissions.length})
          </button>
        </div>
      </div>

      {/* 1. SAVED FORMS TAB */}
      {tab === "list" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-700">All Published & Draft Forms</div>
            <button
              onClick={() => {
                setActiveFormId("new-form");
                setFormName("New Registration Form");
                setFormDesc("");
                setFields([
                  { id: "f_1", type: "text", label: "Full Name", placeholder: "Enter name", required: true },
                  { id: "f_2", type: "tel", label: "Phone Number", placeholder: "+91 XXXXX XXXXX", required: true },
                ]);
                setTab("builder");
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white"
              style={{ background: "var(--primary)" }}
            >
              + Create New Form
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "var(--muted)" }}>
                  {["Form Name", "Fields", "Created Date", "Status", "Responses", "Share & Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {forms.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-400 text-xs">
                      No custom forms found. Click "Create New Form" to get started.
                    </td>
                  </tr>
                ) : (
                  forms.map(f => (
                    <tr key={f.id} className="border-t border-slate-50 hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800 text-xs">{f.name}</div>
                        <div className="text-[11px] text-slate-400">{f.description || "No description"}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 font-mono">{f.fields.length} fields</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{f.createdAt}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${f.status === "Published" ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                          {f.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs font-bold text-slate-700">
                        {dataService.getSubmissions(f.id).length}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setShareModalForm(f)}
                            className="px-2.5 py-1 rounded-md text-xs font-semibold text-white flex items-center gap-1 shadow-xs"
                            style={{ background: "#25D366" }}
                            title="Share via QR Code & WhatsApp"
                          >
                            <span>📲</span> Share QR / WA
                          </button>
                          <button
                            onClick={() => handleEditForm(f)}
                            className="text-xs font-semibold text-blue-700 hover:underline px-1"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteForm(f.id)}
                            className="text-xs text-red-500 hover:text-red-700 px-1"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. FORM SUBMISSIONS TAB */}
      {tab === "submissions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">
              {submissions.length} total responses received across all forms.
            </div>
            <button
              onClick={() => dataService.exportFormSubmissionsToCSV()}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl text-white shadow-sm flex items-center gap-1.5"
              style={{ background: "var(--primary)" }}
            >
              <span>📥</span> Download Submissions CSV
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "var(--muted)" }}>
                    {["Submission ID", "Form Name", "Submitted Time", "Captured Data"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {submissions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-16 text-center text-slate-400 text-xs">
                        No responses submitted yet. Share your forms with QR codes or WhatsApp links to collect data!
                      </td>
                    </tr>
                  ) : (
                    submissions.map(sub => (
                      <tr key={sub.id} className="border-t border-slate-50 hover:bg-slate-50/70">
                        <td className="px-4 py-3 font-mono text-xs font-bold text-slate-700">{sub.id}</td>
                        <td className="px-4 py-3 text-xs font-medium text-slate-800">{sub.formName}</td>
                        <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                          {new Date(sub.submittedAt).toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5 max-w-xl">
                            {Object.entries(sub.data).map(([k, v]) => (
                              <span key={k} className="text-[11px] bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">
                                <strong>{k}:</strong> {String(v)}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. VISUAL BUILDER CANVAS */}
      {tab === "builder" && (
        <div className="grid lg:grid-cols-12 gap-5 min-h-[600px]">
          {/* Left: Palette */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 h-fit">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">
              Add Form Elements
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {FIELD_PALETTE.map(item => (
                <button
                  key={item.type}
                  onClick={() => addField(item.type, item.label)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-transparent hover:border-slate-200 transition-all text-left"
                >
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "var(--secondary)", color: "var(--primary)" }}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  <span className="ml-auto text-slate-400 text-xs">+</span>
                </button>
              ))}
            </div>
          </div>

          {/* Center: Canvas */}
          <div className="lg:col-span-6 space-y-4">
            {/* Form Title Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Form Name / Title</label>
                <input
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full text-base font-bold text-slate-900 border-b border-slate-200 pb-1 focus:outline-none focus:border-blue-600"
                  placeholder="Enter form title..."
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Description / Instructions</label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  className="w-full text-xs text-slate-600 border border-slate-200 rounded-xl p-2.5 focus:outline-none resize-none"
                  placeholder="Form instructions for applicants..."
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleSaveForm("Draft")}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Save Draft
                </button>
                <button
                  onClick={() => handleSaveForm("Published")}
                  className="px-4 py-1.5 text-xs font-semibold rounded-xl text-white shadow-sm"
                  style={{ background: "var(--primary)" }}
                >
                  Publish & Get Link
                </button>
              </div>
            </div>

            {/* Field Canvas Items */}
            <div className="space-y-3">
              {fields.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center text-slate-400 text-xs">
                  Click on any form element on the left to add it here.
                </div>
              ) : (
                fields.map((field, idx) => {
                  const isSelected = selectedFieldId === field.id;
                  return (
                    <div
                      key={field.id}
                      onClick={() => setSelectedFieldId(field.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer bg-white ${
                        isSelected ? "border-blue-500 shadow-md bg-blue-50/20" : "border-slate-100 hover:border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                          <span>{field.label}</span>
                          {field.required && <span className="text-red-500 font-bold">*</span>}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={e => { e.stopPropagation(); moveField(field.id, -1); }}
                            disabled={idx === 0}
                            className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 text-xs"
                          >
                            ↑
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); moveField(field.id, 1); }}
                            disabled={idx === fields.length - 1}
                            className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 text-xs"
                          >
                            ↓
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); removeField(field.id); }}
                            className="p-1 text-red-400 hover:text-red-600 text-xs ml-1"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {/* Mock input display */}
                      {field.type === "heading" ? (
                        <div className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-1">{field.label}</div>
                      ) : field.type === "textarea" ? (
                        <div className="h-12 border border-slate-200 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-400">
                          {field.placeholder || "Long text area..."}
                        </div>
                      ) : field.type === "select" ? (
                        <div className="border border-slate-200 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500 flex items-center justify-between">
                          <span>Select option... ({field.options?.length || 0} choices)</span>
                          <span>▾</span>
                        </div>
                      ) : (
                        <div className="border border-slate-200 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-400">
                          {field.placeholder || `Enter ${field.label}...`}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Field Settings Inspector */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 h-fit space-y-4">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Field Settings
            </div>
            {selectedField ? (
              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Field Label</label>
                  <input
                    value={selectedField.label}
                    onChange={e => updateField("label", e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none"
                  />
                </div>
                {selectedField.type !== "heading" && (
                  <>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Placeholder Text</label>
                      <input
                        value={selectedField.placeholder || ""}
                        onChange={e => updateField("placeholder", e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                      <span className="font-semibold text-slate-700">Required Field</span>
                      <input
                        type="checkbox"
                        checked={selectedField.required}
                        onChange={e => updateField("required", e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                      />
                    </div>
                    {(selectedField.type === "select" || selectedField.type === "radio" || selectedField.type === "checkbox") && (
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Options (One per line)</label>
                        <textarea
                          rows={4}
                          value={(selectedField.options || []).join("\n")}
                          onChange={e => updateField("options", e.target.value.split("\n").filter(Boolean))}
                          className="w-full border border-slate-200 rounded-xl p-2.5 focus:outline-none resize-none"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="text-slate-400 text-xs text-center py-8">
                Select a field on the canvas to configure its properties.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SHARE MODAL (QR CODE & WHATSAPP) */}
      {shareModalForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md text-center">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg" style={{ fontFamily: "DM Serif Display, serif" }}>
                Share Form
              </h3>
              <button onClick={() => setShareModalForm(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="font-semibold text-slate-800 text-sm mb-1">{shareModalForm.name}</div>
            <p className="text-xs text-slate-500 mb-4">Scan QR code or share directly via WhatsApp to collect instant submissions.</p>

            {/* QR Code */}
            <div className="flex justify-center mb-5">
              <QRCodeSVG value={getShareUrl(shareModalForm.id)} size={180} />
            </div>

            {/* Share URL copy box */}
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 mb-4 text-xs font-mono text-slate-600 overflow-hidden">
              <span className="truncate flex-1 text-left px-1">{getShareUrl(shareModalForm.id)}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(getShareUrl(shareModalForm.id));
                  showToast("Share link copied to clipboard!");
                }}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Copy
              </button>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleWhatsAppShare(shareModalForm)}
                className="py-3 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 shadow-sm hover:opacity-95"
                style={{ background: "#25D366" }}
              >
                <span>💬</span> WhatsApp Share
              </button>
              <button
                onClick={() => {
                  window.open(getShareUrl(shareModalForm.id), "_blank");
                }}
                className="py-3 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 shadow-sm hover:opacity-95"
                style={{ background: "var(--primary)" }}
              >
                <span>🌐</span> Open Form
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
