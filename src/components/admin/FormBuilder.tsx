import { useState, useEffect } from "react";
import { dataService } from "../../services/dataService";
import { CustomForm, FormField, FormSubmission } from "../../types";

const FIELD_PALETTE = [
  { type: "text", label: "Short Text", desc: "Single-line text input", icon: "Aa" },
  { type: "textarea", label: "Long Paragraph", desc: "Multi-line text box", icon: "¶" },
  { type: "number", label: "Number", desc: "Numerical marks or age", icon: "#" },
  { type: "email", label: "Email Address", desc: "Validated email input", icon: "@" },
  { type: "tel", label: "Phone / Mobile", desc: "Contact phone number", icon: "📞" },
  { type: "date", label: "Date Picker", desc: "Calendar date selector", icon: "📅" },
  { type: "select", label: "Dropdown Select", desc: "Single choice from menu", icon: "▾" },
  { type: "radio", label: "Radio Choices", desc: "Multiple choice (1 pick)", icon: "◉" },
  { type: "checkbox", label: "Checkboxes", desc: "Multi-select option boxes", icon: "☑" },
  { type: "file", label: "File Attachment", desc: "Document / image upload", icon: "📎" },
  { type: "heading", label: "Section Header", desc: "Divider & sub-heading", icon: "H1" },
];

interface Props {
  initialTab?: "builder" | "preview" | "list" | "submissions";
}

export default function FormBuilder({ initialTab = "builder" }: Props) {
  const [tab, setTab] = useState<"builder" | "preview" | "list" | "submissions">(initialTab);

  useEffect(() => {
    if (initialTab) {
      setTab(initialTab);
    }
  }, [initialTab]);
  const [forms, setForms] = useState<CustomForm[]>([]);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [activeFormId, setActiveFormId] = useState<string>("new-form");
  const [formName, setFormName] = useState("Student Registration Form");
  const [formDesc, setFormDesc] = useState("Please fill in the required applicant information below.");
  const [fields, setFields] = useState<FormField[]>([
    { id: "f_1", type: "text", label: "Student Full Name", placeholder: "e.g. Rahul Sharma", required: true },
    { id: "f_2", type: "date", label: "Date of Birth", placeholder: "", required: true },
    { id: "f_3", type: "tel", label: "Parent Mobile Number", placeholder: "+91 98765 43210", required: true },
    { id: "f_4", type: "select", label: "Applying for Class / Grade", required: true, options: ["Class I", "Class II", "Class III", "Class IV", "Class V", "Class VI", "Class VII", "Class VIII", "Class IX", "Class X", "Class XI", "Class XII"] },
  ]);
  const [selectedFieldId, setSelectedFieldId] = useState<string>("f_1");
  const [toast, setToast] = useState("");
  const [previewData, setPreviewData] = useState<Record<string, any>>({});

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
      id: `f_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: type as any,
      label,
      placeholder: type === "heading" ? undefined : `Enter ${label.toLowerCase()}...`,
      required: false,
      options: type === "select" || type === "radio" || type === "checkbox" ? ["Option 1", "Option 2", "Option 3"] : undefined,
    };
    setFields(prev => [...prev, newF]);
    setSelectedFieldId(newF.id);
  };

  const updateField = (key: keyof FormField, val: any) => {
    setFields(prev => prev.map(f => f.id === selectedFieldId ? { ...f, [key]: val } : f));
  };

  const duplicateField = (id: string) => {
    const target = fields.find(f => f.id === id);
    if (!target) return;
    const cloned: FormField = {
      ...target,
      id: `f_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      label: `${target.label} (Copy)`,
    };
    const idx = fields.findIndex(f => f.id === id);
    const updated = [...fields];
    updated.splice(idx + 1, 0, cloned);
    setFields(updated);
    setSelectedFieldId(cloned.id);
    showToast("Field duplicated!");
  };

  const removeField = (id: string) => {
    const updated = fields.filter(f => f.id !== id);
    setFields(updated);
    if (selectedFieldId === id) {
      setSelectedFieldId(updated[0]?.id || "");
    }
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
      alert("Please provide a form name / title.");
      return;
    }
    if (fields.length === 0) {
      alert("Please add at least one form element before publishing.");
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
    showToast(`Form ${status === "Published" ? "Published & Synced with Database" : "Saved as Draft"}!`);
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

  const handleDeleteSubmission = (id: string) => {
    if (window.confirm("Are you sure you want to delete this submitted form response?")) {
      dataService.deleteSubmission(id);
      showToast("Submitted form response deleted.");
    }
  };

  const getFormShareUrl = (formId: string) => `${window.location.origin}?formId=${encodeURIComponent(formId)}`;

  const handleCopyFormLink = async (formId: string) => {
    const shareUrl = getFormShareUrl(formId);
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast("Form link copied to clipboard!");
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      showToast("Form link copied to clipboard!");
    }
  };

  const handleShareWhatsApp = (formId: string) => {
    const form = forms.find(f => f.id === formId);
    const shareUrl = getFormShareUrl(formId);
    const message = encodeURIComponent(`Hello! Please fill out the online form for ${form?.name || "Nalanda International School"}:\n${shareUrl}`);
    window.open(`https://wa.me/?text=${message}`, "_blank", "noopener,noreferrer");
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
            Custom Form Builder & Manager
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Design dynamic registration, scholarship, and survey forms with live cloud sync and response collection.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
            onClick={() => setTab("preview")}
            className={`px-3.5 py-2 text-xs rounded-xl font-semibold transition-all ${
              tab === "preview" ? "text-white shadow-sm" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
            style={tab === "preview" ? { background: "var(--primary)" } : {}}
          >
            👁️ Live Preview
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
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-700">All Published & Draft Custom Forms</div>
            <button
              onClick={() => {
                setActiveFormId("new-form");
                setFormName("New Registration Form");
                setFormDesc("Please fill out this form.");
                setFields([
                  { id: `f_${Date.now()}_1`, type: "text", label: "Full Name", placeholder: "Enter name", required: true },
                  { id: `f_${Date.now()}_2`, type: "tel", label: "Contact Phone", placeholder: "+91 XXXXX XXXXX", required: true },
                ]);
                setSelectedFieldId(`f_${Date.now()}_1`);
                setTab("builder");
              }}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl text-white shadow-sm flex items-center gap-1.5"
              style={{ background: "var(--primary)" }}
            >
              <span>+</span> Create New Form
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "var(--muted)" }}>
                  {["Form Name", "Fields", "Created Date", "Status", "Responses", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {forms.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center text-slate-400 text-xs">
                      No custom forms found. Click "Create New Form" to build your first registration or survey form.
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
                            onClick={() => handleCopyFormLink(f.id)}
                            className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-1"
                            title="Copy Direct Link"
                          >
                            Copy Link
                          </button>
                          <button
                            onClick={() => handleShareWhatsApp(f.id)}
                            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 px-1"
                            title="Share on WhatsApp"
                          >
                            WhatsApp
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

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "var(--muted)" }}>
                    {["Submission ID", "Form Name", "Submitted Time", "Captured Data", "Actions"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {submissions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-16 text-center text-slate-400 text-xs">
                        No responses submitted yet. Publish a form and share its link to start collecting data.
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
                                <strong>{k}:</strong> {Array.isArray(v) ? v.join(", ") : String(v)}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeleteSubmission(sub.id)}
                            className="text-xs font-semibold text-red-600 hover:text-red-700"
                          >
                            Delete
                          </button>
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

      {/* 3. LIVE PREVIEW TAB */}
      {tab === "preview" && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Live Interactive Tester
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-2" style={{ fontFamily: "DM Serif Display, serif" }}>
                {formName || "Untitled Form"}
              </h2>
              {formDesc && <p className="text-xs text-slate-500 mt-0.5">{formDesc}</p>}
            </div>
            <button
              onClick={() => setTab("builder")}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold"
            >
              ← Back to Builder
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {fields.map(field => {
              if (field.type === "heading") {
                return (
                  <div key={field.id} className="pt-3 border-t border-slate-100">
                    <h3 className="font-bold text-slate-800 text-sm">{field.label}</h3>
                  </div>
                );
              }

              return (
                <div key={field.id} className="space-y-1.5">
                  <label className="font-semibold text-slate-700 block">
                    {field.label} {field.required && <span className="text-red-500 font-bold">*</span>}
                  </label>

                  {field.type === "textarea" ? (
                    <textarea
                      rows={3}
                      value={previewData[field.label] || ""}
                      onChange={e => setPreviewData({ ...previewData, [field.label]: e.target.value })}
                      placeholder={field.placeholder || "Enter details..."}
                      className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none resize-none"
                    />
                  ) : field.type === "select" ? (
                    <select
                      value={previewData[field.label] || ""}
                      onChange={e => setPreviewData({ ...previewData, [field.label]: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-white focus:outline-none"
                    >
                      <option value="">Select option...</option>
                      {(field.options || []).map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.type === "radio" ? (
                    <div className="space-y-1.5 pt-1">
                      {(field.options || []).map(opt => (
                        <label key={opt} className="flex items-center gap-2 text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name={field.id}
                            value={opt}
                            checked={previewData[field.label] === opt}
                            onChange={() => setPreviewData({ ...previewData, [field.label]: opt })}
                            className="text-blue-600"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : field.type === "checkbox" ? (
                    <div className="space-y-1.5 pt-1">
                      {(field.options || []).map(opt => {
                        const current = Array.isArray(previewData[field.label]) ? previewData[field.label] : [];
                        const isChecked = current.includes(opt);
                        return (
                          <label key={opt} className="flex items-center gap-2 text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setPreviewData({ ...previewData, [field.label]: [...current, opt] });
                                } else {
                                  setPreviewData({ ...previewData, [field.label]: current.filter((x: string) => x !== opt) });
                                }
                              }}
                              className="rounded text-blue-600"
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  ) : field.type === "file" ? (
                    <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50">
                      <div className="text-xl mb-1">📎</div>
                      <div className="text-slate-600 font-medium">Click to choose document or image file</div>
                    </div>
                  ) : (
                    <input
                      type={field.type === "tel" ? "tel" : field.type === "number" ? "number" : field.type === "date" ? "date" : field.type === "email" ? "email" : "text"}
                      value={previewData[field.label] || ""}
                      onChange={e => setPreviewData({ ...previewData, [field.label]: e.target.value })}
                      placeholder={field.placeholder || `Enter ${field.label}...`}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none"
                    />
                  )}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => showToast("Test response validated successfully in preview!")}
            className="w-full py-3.5 rounded-xl font-bold text-white shadow-sm"
            style={{ background: "var(--primary)" }}
          >
            Submit Test Response (Preview Mode)
          </button>
        </div>
      )}

      {/* 4. VISUAL BUILDER CANVAS */}
      {tab === "builder" && (
        <div className="grid lg:grid-cols-12 gap-5 min-h-[600px]">
          {/* Left: Palette */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-100 shadow-sm p-4 h-fit">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">
              Add Form Elements
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {FIELD_PALETTE.map(item => (
                <button
                  key={item.type}
                  onClick={() => addField(item.type, item.label)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-700 hover:bg-blue-50/50 hover:text-blue-900 border border-slate-100 hover:border-blue-200 transition-all text-left"
                >
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: "var(--secondary)", color: "var(--primary)" }}>
                    {item.icon}
                  </span>
                  <div>
                    <div className="font-semibold text-slate-800">{item.label}</div>
                    <div className="text-[10px] text-slate-400">{item.desc}</div>
                  </div>
                  <span className="ml-auto text-blue-600 font-bold text-sm">+</span>
                </button>
              ))}
            </div>
          </div>

          {/* Center: Canvas */}
          <div className="lg:col-span-6 space-y-4">
            {/* Form Title Card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Form Name / Title *</label>
                <input
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full text-base font-bold text-slate-900 border-b border-slate-200 pb-1 focus:outline-none focus:border-blue-600"
                  placeholder="e.g. Scholarship Application Form 2026"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Description / Instructions</label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  className="w-full text-xs text-slate-600 border border-slate-200 rounded-xl p-2.5 focus:outline-none resize-none"
                  placeholder="Instructions for applicants..."
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
                  className="px-4 py-1.5 text-xs font-semibold rounded-xl text-white shadow-sm flex items-center gap-1.5"
                  style={{ background: "var(--primary)" }}
                >
                  <span>🚀</span> Publish Form
                </button>
              </div>
            </div>

            {/* Field Canvas Items */}
            <div className="space-y-3">
              {fields.length === 0 ? (
                <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center text-slate-400 text-xs">
                  Click on any form element on the left to add fields to this form.
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
                          <span className="w-5 h-5 rounded bg-slate-100 text-slate-600 flex items-center justify-center font-mono text-[10px]">
                            {idx + 1}
                          </span>
                          <span>{field.label}</span>
                          {field.required && <span className="text-red-500 font-bold">*</span>}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={e => { e.stopPropagation(); moveField(field.id, -1); }}
                            disabled={idx === 0}
                            className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 text-xs"
                            title="Move Up"
                          >
                            ↑
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); moveField(field.id, 1); }}
                            disabled={idx === fields.length - 1}
                            className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 text-xs"
                            title="Move Down"
                          >
                            ↓
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); duplicateField(field.id); }}
                            className="p-1 text-blue-500 hover:text-blue-700 text-xs"
                            title="Duplicate Field"
                          >
                            📋
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); removeField(field.id); }}
                            className="p-1 text-red-400 hover:text-red-600 text-xs ml-1"
                            title="Delete Field"
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
                        <div className="border border-slate-200 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600 flex items-center justify-between">
                          <span>Select option... ({(field.options || []).length} choices configured)</span>
                          <span>▾</span>
                        </div>
                      ) : field.type === "radio" ? (
                        <div className="space-y-1 text-xs text-slate-600">
                          {(field.options || ["Choice 1", "Choice 2"]).map(opt => (
                            <div key={opt} className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full border border-slate-400" />
                              <span>{opt}</span>
                            </div>
                          ))}
                        </div>
                      ) : field.type === "checkbox" ? (
                        <div className="space-y-1 text-xs text-slate-600">
                          {(field.options || ["Check 1", "Check 2"]).map(opt => (
                            <div key={opt} className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded border border-slate-400" />
                              <span>{opt}</span>
                            </div>
                          ))}
                        </div>
                      ) : field.type === "file" ? (
                        <div className="border border-dashed border-slate-200 rounded-xl bg-slate-50 p-2 text-center text-xs text-slate-400">
                          📎 Document / Photo upload attachment
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
          <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-100 shadow-sm p-4 h-fit space-y-4">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Field Settings & Properties
            </div>
            {selectedField ? (
              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Field Label / Question *</label>
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

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                      <span className="font-semibold text-slate-700">Mandatory / Required</span>
                      <input
                        type="checkbox"
                        checked={selectedField.required}
                        onChange={e => updateField("required", e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                      />
                    </div>

                    {(selectedField.type === "select" || selectedField.type === "radio" || selectedField.type === "checkbox") && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-semibold text-slate-700">Options List (One per line)</label>
                          <span className="text-[10px] text-slate-400">{(selectedField.options || []).length} items</span>
                        </div>
                        <textarea
                          rows={5}
                          value={(selectedField.options || []).join("\n")}
                          onChange={e => updateField("options", e.target.value.split("\n").filter(Boolean))}
                          className="w-full border border-slate-200 rounded-xl p-2.5 focus:outline-none resize-none font-mono text-xs"
                          placeholder="Option 1&#10;Option 2&#10;Option 3"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="text-slate-400 text-xs text-center py-8">
                Select any field on the canvas to configure its properties.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

