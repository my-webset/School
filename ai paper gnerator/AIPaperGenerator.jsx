// frontend/components/AIPaperGenerator/AIPaperGenerator.jsx
import React, { useRef, useState } from "react";
import { generatePaper, downloadPaperAsWord } from "../../services/paperApi";

const QUESTION_FORMATS = [
  { key: "mcq", label: "MCQ (1 Mark)" },
  { key: "very_short", label: "Very Short (2 Marks)" },
  { key: "short", label: "Short Ans (3 Marks)" },
  { key: "long", label: "Long Ans (5 Marks)" },
  { key: "true_false", label: "True / False" },
  { key: "fill_blank", label: "Fill in Blanks" },
];

// Replace with your real school settings (pull from your "School Information" page/context)
const DEFAULT_SCHOOL_INFO = {
  name: "Nalanda International School",
  address: "14, Vidya Vihar, Sector 21, Noida, Uttar Pradesh – 201301",
  affiliation: "CBSE/AFF/2130124",
};

export default function AIPaperGenerator({ schoolInfo = DEFAULT_SCHOOL_INFO }) {
  const [blueprint, setBlueprint] = useState({
    subject: "Mathematics",
    className: "Class X",
    examType: "Half-Yearly Examination",
    totalMarks: 80,
    duration: "3 Hours",
    difficulty: "Mixed (Standard)",
    chapters: "Real Numbers, Polynomials, Linear Equations, Quadratic Equations, Trigonometry",
    formats: { mcq: true, very_short: true, short: true, long: true, true_false: true, fill_blank: true },
  });

  const [images, setImages] = useState([]); // File[]
  const [chatLog, setChatLog] = useState([]); // [{role:'user'|'status', text}]
  const [history, setHistory] = useState([]); // raw {role, content} sent back to the model
  const [instruction, setInstruction] = useState("");
  const [paper, setPaper] = useState(null);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const updateField = (field, value) => setBlueprint((b) => ({ ...b, [field]: value }));
  const toggleFormat = (key) =>
    setBlueprint((b) => ({ ...b, formats: { ...b.formats, [key]: !b.formats[key] } }));

  function handleImagePick(e) {
    const picked = Array.from(e.target.files || []);
    setImages((prev) => {
      const combined = [...prev, ...picked].slice(0, 7); // hard cap at 7
      return combined;
    });
    e.target.value = "";
  }
  function removeImage(idx) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  async function runInstruction(text) {
    const cmd = (text ?? instruction).trim();
    if (!cmd || loading) return;

    const isFreshGeneration = /^(generate the paper|regenerate the paper|regenerate from scratch|create the paper)$/i.test(cmd);
    const effectiveHistory = isFreshGeneration ? [] : history;

    setChatLog((log) => [...log, { role: "user", text: cmd }]);
    setInstruction("");
    setLoading(true);
    setError("");

    try {
      const newPaper = await generatePaper({
        instruction: cmd,
        blueprint,
        schoolInfo,
        history: effectiveHistory,
        images,
      });
      setPaper(newPaper);
      // Fresh generation starts from a clean context; incremental edits keep prior turns.
      setHistory((h) => {
        const nextHistory = isFreshGeneration ? [] : h;
        return [
          ...nextHistory,
          { role: "user", content: cmd },
          { role: "assistant", content: JSON.stringify(newPaper) },
        ];
      });
      setChatLog((log) => [...log, { role: "status", text: "✅ Paper updated based on your instruction." }]);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Something went wrong.");
      setChatLog((log) => [...log, { role: "status", text: "⚠️ Could not update the paper. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadWord() {
    if (!paper) return;
    try {
      await downloadPaperAsWord({ paper, schoolInfo });
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Word export failed.");
    }
  }

  function handleRegenerate() {
    runInstruction("Regenerate the paper from scratch using the same blueprint.");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 p-6">
      {/* LEFT: Exam Blueprint (kept as-is) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 h-fit">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">EXAM BLUEPRINT</h2>
          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">CBSE Aligned</span>
        </div>

        {/* Reference images — replaces the old single PDF upload */}
        <label className="block text-sm text-slate-500 mb-2">Reference Images (Optional, max 7)</label>
        <div
          className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center cursor-pointer mb-2"
          onClick={() => fileInputRef.current?.click()}
        >
          <p className="text-sm font-medium text-slate-700">Click to select images</p>
          <p className="text-xs text-slate-400">Syllabus pages, sample papers, diagrams — up to 7 images</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handleImagePick}
          />
        </div>
        {images.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-4">
            {images.map((file, idx) => (
              <div key={idx} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`ref-${idx}`}
                  className="w-full h-16 object-cover rounded-md border border-slate-200"
                />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute -top-1 -right-1 bg-slate-800 text-white rounded-full w-4 h-4 text-[10px] leading-4"
                >
                  ×
                </button>
              </div>
            ))}
            <span className="text-[11px] text-slate-400 col-span-4">{images.length}/7 images</span>
          </div>
        )}

        <Field label="Subject">
          <input className="input" value={blueprint.subject} onChange={(e) => updateField("subject", e.target.value)} />
        </Field>
        <Field label="Class / Grade">
          <input className="input" value={blueprint.className} onChange={(e) => updateField("className", e.target.value)} />
        </Field>
        <Field label="Exam Type">
          <input className="input" value={blueprint.examType} onChange={(e) => updateField("examType", e.target.value)} />
        </Field>
        <Field label="Total Marks">
          <input
            type="number"
            className="input"
            value={blueprint.totalMarks}
            onChange={(e) => updateField("totalMarks", Number(e.target.value))}
          />
        </Field>
        <Field label="Time Duration">
          <input className="input" value={blueprint.duration} onChange={(e) => updateField("duration", e.target.value)} />
        </Field>
        <Field label="Difficulty">
          <input className="input" value={blueprint.difficulty} onChange={(e) => updateField("difficulty", e.target.value)} />
        </Field>
        <Field label="Chapters & Topics">
          <textarea
            className="input min-h-[70px]"
            value={blueprint.chapters}
            onChange={(e) => updateField("chapters", e.target.value)}
          />
        </Field>

        <label className="block text-sm text-slate-500 mb-2 mt-3">Question Formats</label>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {QUESTION_FORMATS.map((f) => (
            <label key={f.key} className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={!!blueprint.formats[f.key]} onChange={() => toggleFormat(f.key)} />
              {f.label}
            </label>
          ))}
        </div>
      </div>

      {/* RIGHT: Toolbar + Live Preview + Command Chat */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <ToolbarButton onClick={handleRegenerate} disabled={!paper || loading}>
              ↻ Regenerate
            </ToolbarButton>
            <ToolbarButton onClick={() => setShowAnswerKey((s) => !s)} disabled={!paper}>
              {showAnswerKey ? "Hide" : "Show"} Answer Key
            </ToolbarButton>
            <ToolbarButton onClick={() => runInstruction("Save this paper to the library, no changes needed.")} disabled={!paper}>
              💾 Save to Library
            </ToolbarButton>
          </div>
          <ToolbarButton primary onClick={handleDownloadWord} disabled={!paper}>
            ⬇ Download as Word
          </ToolbarButton>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg border border-red-200">{error}</div>
        )}

        {/* Live paper preview */}
        <div className="bg-white rounded-xl border border-slate-200 p-8 min-h-[400px]">
          {!paper && !loading && (
            <p className="text-center text-slate-400 mt-24">
              Tell the AI what paper you need in the chat below to generate a preview here.
            </p>
          )}
          {loading && <p className="text-center text-slate-400 mt-24">Generating…</p>}
          {paper && <PaperPreview paper={paper} showAnswerKey={showAnswerKey} schoolInfo={schoolInfo} />}
        </div>

        {/* Command-based chat dock — replaces the old single "Generate" button */}
        <div className="bg-white rounded-xl border border-slate-200 p-3">
          <div className="max-h-40 overflow-y-auto space-y-2 mb-2 px-1">
            {chatLog.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "text-sm bg-slate-100 rounded-lg px-3 py-1.5 w-fit ml-auto text-slate-800"
                    : "text-xs text-slate-500 italic"
                }
              >
                {m.text}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder='e.g. "Generate the paper" or "Make Section C harder" or "Add 2 more MCQs"'
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runInstruction()}
              disabled={loading}
            />
            <button
              className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
              onClick={() => runInstruction()}
              disabled={loading || !instruction.trim()}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      <style>{`.input{width:100%;border:1px solid #e2e8f0;border-radius:0.5rem;padding:0.5rem 0.75rem;font-size:0.875rem;margin-bottom:0.75rem;}`}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm text-slate-500 mb-1">{label}</label>
      {children}
    </div>
  );
}

function ToolbarButton({ children, onClick, disabled, primary }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={
        (primary
          ? "bg-blue-900 text-white"
          : "bg-white border border-slate-200 text-slate-700") +
        " px-3 py-2 rounded-lg text-sm disabled:opacity-40"
      }
    >
      {children}
    </button>
  );
}

/** Renders the AI's structured paper JSON exactly like the printed exam layout. */
function PaperPreview({ paper, showAnswerKey, schoolInfo }) {
  return (
    <div className="text-slate-900">
      <div className="text-center">
        <h1 className="text-xl font-bold">{schoolInfo.name}</h1>
        <p className="text-sm italic">{schoolInfo.address}</p>
        <p className="text-sm">
          Affiliation: {schoolInfo.affiliation} | CBSE (Central Board of Secondary Education)
        </p>
        <h2 className="font-bold mt-2">
          {paper.examTitle} ({paper.session})
        </h2>
      </div>

      <div className="flex justify-between border-b border-t border-slate-800 py-2 mt-4 text-sm font-semibold">
        <span>SUBJECT: {paper.subject?.toUpperCase()}</span>
        <span>CLASS: {paper.className?.toUpperCase()}</span>
      </div>
      <div className="flex justify-between text-sm font-semibold mb-4">
        <span>TIME ALLOWED: {paper.timeAllowed}</span>
        <span>MAXIMUM MARKS: {paper.maximumMarks}</span>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
        <p className="font-semibold underline mb-2">GENERAL INSTRUCTIONS:</p>
        <ol className="list-decimal list-inside text-sm space-y-1">
          {paper.generalInstructions?.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ol>
      </div>

      {paper.sections?.map((section, si) => (
        <div key={si} className="mb-5">
          <p className="text-center font-bold">
            {section.sectionLabel} {section.sectionTitle}
          </p>
          {section.sectionNote && <p className="text-center italic text-sm mb-2">{section.sectionNote}</p>}
          {section.questions?.map((q) => (
            <div key={q.number} className="flex justify-between text-sm mb-1">
              <span>
                {q.number}. {q.text}
              </span>
              <span className="font-semibold whitespace-nowrap ml-2">
                [{q.marks} Mark{q.marks === 1 ? "" : "s"}]
              </span>
            </div>
          ))}
          {section.questions?.some((q) => q.type === "mcq") &&
            section.questions
              .filter((q) => q.type === "mcq")
              .map((q) => (
                <div key={`opts-${q.number}`} className="pl-4 text-sm text-slate-700">
                  {q.options?.map((opt, oi) => (
                    <p key={oi}>{opt}</p>
                  ))}
                </div>
              ))}
        </div>
      ))}

      {showAnswerKey && paper.answerKey?.length > 0 && (
        <div className="mt-6">
          <p className="text-center font-bold mb-2">ANSWER KEY</p>
          <table className="w-full text-sm border border-slate-300">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 py-1">Q. No.</th>
                <th className="border border-slate-300 py-1">Answer</th>
              </tr>
            </thead>
            <tbody>
              {paper.answerKey.map((a) => (
                <tr key={a.number}>
                  <td className="border border-slate-300 text-center">{a.number}</td>
                  <td className="border border-slate-300 text-center">{a.answer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
