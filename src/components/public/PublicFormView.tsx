import { useState, useEffect } from "react";
import { dataService } from "../../services/dataService";
import { CustomForm } from "../../types";
import LOGOS from "../../assets/logos";

interface Props {
  formId: string;
  onBack: () => void;
}

export default function PublicFormView({ formId, onBack }: Props) {
  const [form, setForm] = useState<CustomForm | undefined>(dataService.getFormById(formId));
  const [loading, setLoading] = useState(!form);
  const school = dataService.getSchoolInfo();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState("");

  useEffect(() => {
    const loadForm = async () => {
      const found = await dataService.fetchFormByIdDirect(formId);
      setForm(found);
      setLoading(false);
    };
    loadForm();
  }, [formId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="text-center space-y-3">
          <div className="animate-spin text-3xl">🔄</div>
          <div className="text-xs font-semibold text-slate-600">Loading form from database...</div>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-md shadow-sm">
          <div className="text-3xl mb-3">⚠️</div>
          <h2 className="text-lg font-bold text-slate-800">Form Not Found</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            The requested registration form does not exist, has been archived, or is still being published.
          </p>
          <button
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm"
            style={{ background: "var(--primary)" }}
          >
            Back to School Home
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (label: string, val: any) => {
    setFormData(prev => ({ ...prev, [label]: val }));
  };

  const handleCheckboxChange = (label: string, option: string, isChecked: boolean) => {
    setFormData(prev => {
      const currentList: string[] = Array.isArray(prev[label]) ? prev[label] : [];
      if (isChecked) {
        return { ...prev, [label]: [...currentList, option] };
      } else {
        return { ...prev, [label]: currentList.filter(o => o !== option) };
      }
    });
  };

  const handleFileUpload = (label: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData(prev => ({
        ...prev,
        [label]: {
          fileName: file.name,
          fileSize: `${(file.size / 1024).toFixed(1)} KB`,
          fileType: file.type,
          dataUrl: e.target?.result as string,
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = dataService.addFormSubmission(form.id, formData);
    setSubmissionId(result.id);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen py-12 px-6" style={{ background: "var(--background)" }}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <img src={LOGOS.schoolLogo} alt="Logo" className="w-14 h-14 object-contain mx-auto" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">{school.name}</h2>
          <div className="text-[11px] text-slate-500">{school.board}</div>
        </div>

        {submitted ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center mx-auto text-3xl">
              ✅
            </div>
            <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "DM Serif Display, serif" }}>
              Response Submitted Successfully!
            </h1>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your details have been securely recorded in our school database and will be reviewed by the administration.
            </p>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs font-mono text-slate-700 inline-block">
              Reference ID: <strong className="text-blue-900">{submissionId}</strong>
            </div>
            <div className="pt-4">
              <button
                onClick={onBack}
                className="px-6 py-3 rounded-xl text-xs font-bold text-white shadow-sm"
                style={{ background: "var(--primary)" }}
              >
                Go to School Home
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="pb-4 border-b border-slate-100">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900" style={{ fontFamily: "DM Serif Display, serif" }}>
                {form.name}
              </h1>
              {form.description && (
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{form.description}</p>
              )}
            </div>

            <div className="space-y-4 text-xs">
              {form.fields.map(field => {
                if (field.type === "heading") {
                  return (
                    <div key={field.id} className="pt-4 border-t border-slate-100">
                      <h3 className="font-bold text-slate-800 text-sm">{field.label}</h3>
                    </div>
                  );
                }

                return (
                  <div key={field.id}>
                    <label className="font-semibold text-slate-700 block mb-1">
                      {field.label} {field.required && <span className="text-red-500 font-bold">*</span>}
                    </label>

                    {field.type === "textarea" ? (
                      <textarea
                        required={field.required}
                        rows={3}
                        value={formData[field.label] || ""}
                        onChange={e => handleChange(field.label, e.target.value)}
                        className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none resize-none"
                        placeholder={field.placeholder || "Enter details..."}
                      />
                    ) : field.type === "select" ? (
                      <select
                        required={field.required}
                        value={formData[field.label] || ""}
                        onChange={e => handleChange(field.label, e.target.value)}
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
                              required={field.required}
                              value={opt}
                              checked={formData[field.label] === opt}
                              onChange={() => handleChange(field.label, opt)}
                              className="text-blue-600"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    ) : field.type === "checkbox" ? (
                      <div className="space-y-1.5 pt-1">
                        {(field.options || []).map(opt => {
                          const list = Array.isArray(formData[field.label]) ? formData[field.label] : [];
                          const isChecked = list.includes(opt);
                          return (
                            <label key={opt} className="flex items-center gap-2 text-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                value={opt}
                                checked={isChecked}
                                onChange={e => handleCheckboxChange(field.label, opt, e.target.checked)}
                                className="rounded text-blue-600"
                              />
                              <span>{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    ) : field.type === "file" ? (
                      <div className="space-y-2">
                        <input
                          type="file"
                          required={field.required && !formData[field.label]}
                          onChange={e => {
                            const f = e.target.files?.[0];
                            if (f) handleFileUpload(field.label, f);
                          }}
                          className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                        />
                        {formData[field.label] && (
                          <div className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                            <span>✓</span> {formData[field.label].fileName} ({formData[field.label].fileSize})
                          </div>
                        )}
                      </div>
                    ) : (
                      <input
                        type={field.type === "tel" ? "tel" : field.type === "number" ? "number" : field.type === "date" ? "date" : field.type === "email" ? "email" : "text"}
                        required={field.required}
                        value={formData[field.label] || ""}
                        onChange={e => handleChange(field.label, e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none"
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-bold text-xs text-white shadow-sm hover:opacity-95 transition-opacity"
              style={{ background: "var(--primary)" }}
            >
              Submit Response →
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

