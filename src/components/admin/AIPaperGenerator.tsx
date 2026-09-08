import { useState, useRef, useEffect } from "react";
import { dataService } from "../../services/dataService";
import { generatePaperWithAI, AIPaperResult } from "../../services/aiClient";
import { exportPaperAsWord } from "../../services/docxExporter";
import LOGOS from "../../assets/logos";

const QUESTION_FORMATS = [
  { key: "mcq", label: "MCQ (1 Mark)" },
  { key: "very_short", label: "Very Short (2 Marks)" },
  { key: "short", label: "Short Ans (3 Marks)" },
  { key: "long", label: "Long Ans (5 Marks)" },
  { key: "true_false", label: "True / False" },
  { key: "fill_blank", label: "Fill in Blanks" },
];

const STORAGE_SAVED_PAPERS = "nis_saved_papers_v2";

export default function AIPaperGenerator() {
  const school = dataService.getSchoolInfo();
  const [tab, setTab] = useState<"generator" | "saved">("generator");

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

  const [images, setImages] = useState<File[]>([]);
  const [chatLog, setChatLog] = useState<Array<{ role: "user" | "status"; text: string }>>([]);
  const [history, setHistory] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [instruction, setInstruction] = useState("");
  const [paper, setPaper] = useState<AIPaperResult | null>(null);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [savedPapers, setSavedPapers] = useState<Array<{ id: string; title: string; date: string; paper: AIPaperResult }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_SAVED_PAPERS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSavedPapers(parsed);
          return;
        }
      }
      localStorage.setItem(STORAGE_SAVED_PAPERS, JSON.stringify([]));
      setSavedPapers([]);
    } catch (e) {
      console.error(e);
      setSavedPapers([]);
    }
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const updateField = (field: string, value: any) => setBlueprint((b) => ({ ...b, [field]: value }));
  const toggleFormat = (key: string) =>
    setBlueprint((b) => ({ ...b, formats: { ...b.formats, [key as any]: !(b.formats as any)[key] } }));

  function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files || []);
    setImages((prev) => [...prev, ...picked].slice(0, 7));
    e.target.value = "";
    showToast(`Added ${picked.length} reference image(s)`);
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  async function runInstruction(text?: string) {
    const cmd = (text ?? instruction).trim();
    if (!cmd || loading) return;

    const isFreshGeneration = /^(generate the paper|regenerate the paper|regenerate from scratch|create the paper)$/i.test(cmd);
    const effectiveHistory = isFreshGeneration ? [] : history;

    setChatLog((log) => [...log, { role: "user", text: cmd }]);
    setInstruction("");
    setLoading(true);
    setError("");

    try {
      const newPaper = await generatePaperWithAI({
        instruction: cmd,
        blueprint,
        schoolInfo: {
          name: school.name,
          address: school.address,
          affiliation: school.affiliationNo,
        },
        history: effectiveHistory,
        images,
      });

      setPaper(newPaper);
      setHistory((h) => {
        const nextHistory = isFreshGeneration ? [] : h;
        return [
          ...nextHistory,
          { role: "user", content: cmd },
          { role: "assistant", content: JSON.stringify(newPaper) },
        ];
      });
      setChatLog((log) => [...log, { role: "status", text: "✅ Question paper generated successfully with AI." }]);
      showToast("Question paper generated!");
    } catch (err: any) {
      setError(err?.message || "Failed to generate paper. Please try again.");
      setChatLog((log) => [...log, { role: "status", text: "⚠️ Error generating paper. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  function handleSaveToLibrary() {
    if (!paper) return;
    const newEntry = {
      id: `paper-${Date.now()}`,
      title: `${paper.subject} (${paper.className}) - ${paper.examTitle}`,
      date: new Date().toISOString().split("T")[0],
      paper,
    };
    const updated = [newEntry, ...savedPapers];
    setSavedPapers(updated);
    localStorage.setItem(STORAGE_SAVED_PAPERS, JSON.stringify(updated));
    showToast("Paper saved to your library!");
  }

  function handleDeleteSaved(id: string) {
    const updated = savedPapers.filter((p) => p.id !== id);
    setSavedPapers(updated);
    localStorage.setItem(STORAGE_SAVED_PAPERS, JSON.stringify(updated));
    showToast("Saved paper deleted.");
  }

  function handleDownloadWord() {
    if (!paper) return;
    exportPaperAsWord(paper, {
      name: school.name,
      address: school.address,
      affiliation: school.affiliationNo,
    });
    showToast("Downloaded Word document!");
  }

  return (
    <div className="p-6 space-y-5">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-800 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2">
          <span>🤖</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "DM Serif Display, serif" }}>
            AI Question Paper Studio
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Powered by high-speed neural AI. Customize blueprint, upload reference images, and interact conversationally.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab("generator")}
            className={`px-3.5 py-2 text-xs rounded-xl font-semibold transition-all ${
              tab === "generator" ? "text-white shadow-sm" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
            style={tab === "generator" ? { background: "var(--primary)" } : {}}
          >
            ⚙️ Generator Studio
          </button>
          <button
            onClick={() => setTab("saved")}
            className={`px-3.5 py-2 text-xs rounded-xl font-semibold transition-all ${
              tab === "saved" ? "text-white shadow-sm" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
            style={tab === "saved" ? { background: "var(--primary)" } : {}}
          >
            📚 Saved Papers ({savedPapers.length})
          </button>
        </div>
      </div>

      {tab === "saved" ? (
        /* Saved Papers List */
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--muted)" }}>
                {["Exam Title", "Subject", "Class", "Marks", "Duration", "Created Date", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {savedPapers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-slate-400 text-xs">
                    No saved question papers yet. Generate a paper and click "Save to Library" to keep it here.
                  </td>
                </tr>
              ) : (
                savedPapers.map((item) => (
                  <tr key={item.id} className="border-t border-slate-50 hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800 text-xs">{item.title}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{item.paper.subject}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{item.paper.className}</td>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-slate-700">{item.paper.maximumMarks}M</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{item.paper.timeAllowed}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{item.date}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setPaper(item.paper);
                            setTab("generator");
                          }}
                          className="text-xs font-semibold text-blue-700 hover:underline"
                        >
                          Open Preview
                        </button>
                        <button
                          onClick={() => handleDeleteSaved(item.id)}
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
      ) : (
        /* Main Generator Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Exam Blueprint Panel */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-4 h-fit">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">EXAM BLUEPRINT</span>
              <span className="text-[11px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-md">
                CBSE Aligned
              </span>
            </div>

            {/* Reference Images Upload (Up to 7 images) */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 mb-1.5 block">
                Reference Images (Optional, max 7)
              </label>
              <div
                className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center cursor-pointer hover:border-blue-400 transition-colors bg-slate-50/50"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-xl mb-1">📷</div>
                <p className="text-xs font-semibold text-slate-700">Click to attach reference images</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Syllabus scans, sample problems, diagrams — up to 7 images</p>
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
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {images.map((file, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`ref-${idx}`}
                        className="w-full h-16 object-cover"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(idx);
                        }}
                        className="absolute top-1 right-1 bg-black/70 hover:bg-black text-white rounded-full w-4 h-4 text-[10px] leading-4 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <div className="text-[10px] text-slate-400 col-span-4 pt-1 font-mono">
                    {images.length}/7 images attached
                  </div>
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Subject</label>
                  <input
                    value={blueprint.subject}
                    onChange={(e) => updateField("subject", e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none"
                    placeholder="e.g. Mathematics"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Class / Grade</label>
                  <input
                    value={blueprint.className}
                    onChange={(e) => updateField("className", e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none"
                    placeholder="e.g. Class X"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Exam Type</label>
                  <input
                    value={blueprint.examType}
                    onChange={(e) => updateField("examType", e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none"
                    placeholder="e.g. Half-Yearly"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Total Marks</label>
                  <input
                    type="number"
                    value={blueprint.totalMarks}
                    onChange={(e) => updateField("totalMarks", Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Time Duration</label>
                  <input
                    value={blueprint.duration}
                    onChange={(e) => updateField("duration", e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none"
                    placeholder="e.g. 3 Hours"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Difficulty</label>
                  <input
                    value={blueprint.difficulty}
                    onChange={(e) => updateField("difficulty", e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none"
                    placeholder="e.g. Mixed (Standard)"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Chapters & Topics</label>
                <textarea
                  rows={3}
                  value={blueprint.chapters}
                  onChange={(e) => updateField("chapters", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:outline-none resize-none leading-relaxed"
                  placeholder="Comma separated topics..."
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-2">Question Formats</label>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  {QUESTION_FORMATS.map((f) => (
                    <label key={f.key} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!(blueprint.formats as any)[f.key]}
                        onChange={() => toggleFormat(f.key)}
                        className="rounded text-blue-600"
                      />
                      <span className="text-[11px] font-medium">{f.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Instant Action Generate */}
              <button
                onClick={() => runInstruction("Generate the paper")}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl font-bold text-xs text-white shadow-md flex items-center justify-center gap-2 hover:opacity-95 transition-opacity disabled:opacity-50 mt-2"
                style={{ background: "var(--primary)" }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Synthesizing Exam Paper...
                  </>
                ) : (
                  "🤖 Generate Question Paper"
                )}
              </button>
            </div>
          </div>

          {/* RIGHT: Toolbar + Live Preview + Command Chat Dock */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Top Toolbar */}
            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => runInstruction("Regenerate the paper from scratch using the same blueprint.")}
                  disabled={!paper || loading}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                >
                  ↻ Regenerate
                </button>
                <button
                  onClick={() => setShowAnswerKey(!showAnswerKey)}
                  disabled={!paper}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                >
                  {showAnswerKey ? "Hide" : "Show"} Answer Key
                </button>
                <button
                  onClick={handleSaveToLibrary}
                  disabled={!paper}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                >
                  💾 Save to Library
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  disabled={!paper}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40"
                >
                  🖨️ Print / PDF
                </button>
                <button
                  onClick={handleDownloadWord}
                  disabled={!paper}
                  className="px-4 py-1.5 text-xs font-bold rounded-lg text-white shadow-sm flex items-center gap-1.5 disabled:opacity-40"
                  style={{ background: "var(--primary)" }}
                >
                  ⬇ Download as Word
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 text-xs p-3.5 rounded-2xl border border-red-200 flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Live Paper Preview Canvas (Isolated for single-sheet clean print & PDF export) */}
            <div
              id="printable-exam-paper"
              className="bg-white rounded-3xl border border-slate-200 shadow-md p-8 sm:p-10 min-h-[450px] relative overflow-hidden text-slate-900"
              style={{ fontFamily: "'Times New Roman', Times, serif" }}
            >
              {/* Official Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none watermark-layer">
                <img src={LOGOS.schoolLogo} alt="Watermark" className="w-96 h-96 object-contain" />
              </div>


              {!paper && !loading && (
                <div className="text-center py-20 font-sans">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-2xl flex items-center justify-center mx-auto mb-3">
                    📝
                  </div>
                  <h3 className="font-bold text-slate-800 text-base" style={{ fontFamily: "DM Serif Display, serif" }}>
                    Live Examination Preview
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    Click "Generate Question Paper" or type instructions in the command chat dock below.
                  </p>
                </div>
              )}

              {loading && (
                <div className="text-center py-24 font-sans text-slate-500 space-y-3">
                  <svg className="animate-spin w-8 h-8 text-blue-900 mx-auto" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <div className="text-sm font-semibold text-slate-800">Drafting authentic CBSE questions...</div>
                </div>
              )}

              {paper && !loading && (
                <div className="space-y-6">
                  {/* School Header */}
                  <div className="text-center pb-4 border-b-2 border-slate-900">
                    <div className="flex justify-center mb-1.5">
                      <img src={LOGOS.schoolLogo} alt="Logo" className="w-12 h-12 object-contain" />
                    </div>
                    <h1 className="text-xl font-bold uppercase tracking-wider">{school.name}</h1>
                    <p className="text-xs italic text-slate-600">{school.address}</p>
                    <p className="text-xs font-sans text-slate-600 mt-0.5">
                      Affiliation: {school.affiliationNo} | {school.board}
                    </p>
                    <h2 className="text-base font-bold uppercase tracking-wide mt-2 text-slate-900">
                      {paper.examTitle} ({paper.session})
                    </h2>
                  </div>

                  {/* Subject, Class, Marks Strip */}
                  <div className="flex justify-between border-b border-t border-slate-900 py-1.5 text-xs font-bold font-sans">
                    <span>SUBJECT: {paper.subject?.toUpperCase()}</span>
                    <span>CLASS: {paper.className?.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold font-sans">
                    <span>TIME ALLOWED: {paper.timeAllowed}</span>
                    <span>MAXIMUM MARKS: {paper.maximumMarks}</span>
                  </div>

                  {/* General Instructions */}
                  <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 text-xs font-sans">
                    <div className="font-bold underline mb-1">GENERAL INSTRUCTIONS:</div>
                    <ol className="list-decimal pl-4 space-y-0.5 text-slate-700">
                      {paper.generalInstructions?.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ol>
                  </div>

                  {/* Sections & Questions */}
                  <div className="space-y-6">
                    {paper.sections?.map((section, si) => (
                      <div key={si} className="space-y-3">
                        <div className="text-center border-y border-slate-300 py-1.5 my-3">
                          <p className="font-bold text-sm tracking-wide">
                            {section.sectionLabel} {section.sectionTitle}
                          </p>
                          {section.sectionNote && (
                            <p className="italic text-xs text-slate-600 font-sans mt-0.5">{section.sectionNote}</p>
                          )}
                        </div>

                        <div className="space-y-3">
                          {section.questions?.map((q) => (
                            <div key={q.number} className="text-xs leading-relaxed">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <span className="font-bold mr-1.5">{q.number}.</span>
                                  <span className="whitespace-pre-line text-slate-900">{q.text}</span>
                                </div>
                                <span className="font-bold font-sans whitespace-nowrap ml-2">
                                  [{q.marks} Mark{q.marks === 1 ? "" : "s"}]
                                </span>
                              </div>

                              {/* MCQ Choices */}
                              {q.type === "mcq" && q.options && (
                                <div className="pl-5 pt-1.5 space-y-0.5 text-slate-700 font-sans">
                                  {q.options.map((opt, oi) => (
                                    <div key={oi}>{opt}</div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Answer Key Table */}
                  {showAnswerKey && paper.answerKey && paper.answerKey.length > 0 && (
                    <div className="mt-8 pt-4 border-t-2 border-slate-900 font-sans">
                      <div className="text-center font-bold text-xs uppercase mb-3">
                        ANSWER KEY & MODEL MARKING SCHEME
                      </div>
                      <table className="w-full text-xs border border-slate-300">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="border border-slate-300 py-1.5 px-3 text-center w-20">Q. No.</th>
                            <th className="border border-slate-300 py-1.5 px-3 text-left">Answer / Model Solution</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paper.answerKey.map((a) => (
                            <tr key={a.number} className="border-t border-slate-200">
                              <td className="border border-slate-300 text-center font-bold py-1.5 px-3">{a.number}</td>
                              <td className="border border-slate-300 py-1.5 px-3 whitespace-pre-line">{a.answer}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="text-center text-xs font-sans text-slate-400 border-t border-slate-200 pt-4 mt-6">
                    *** END OF QUESTION PAPER ***
                  </div>
                </div>
              )}
            </div>

            {/* Command-Based Conversational Chat Dock */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  AI Command Assistant
                </span>
                <span className="text-[10px] text-slate-400">
                  Type prompt to generate or modify sections incrementally
                </span>
              </div>

              {/* Chat Log */}
              {chatLog.length > 0 && (
                <div className="max-h-36 overflow-y-auto space-y-2 p-2 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                  {chatLog.map((m, i) => (
                    <div
                      key={i}
                      className={
                        m.role === "user"
                          ? "bg-blue-900 text-white rounded-xl px-3 py-1.5 w-fit ml-auto shadow-xs"
                          : "text-slate-500 italic text-[11px] px-1"
                      }
                    >
                      {m.text}
                    </div>
                  ))}
                </div>
              )}

              {/* Quick suggestions pills */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Generate the paper",
                  "Make Section C more analytical",
                  "Add 2 more MCQs in Section A",
                  "Include step-by-step calculus problems",
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => runInstruction(s)}
                    disabled={loading}
                    className="text-[11px] bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
                  >
                    + {s}
                  </button>
                ))}
              </div>

              {/* Input box */}
              <div className="flex gap-2">
                <input
                  className="flex-1 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder='e.g. "Generate the paper" or "Make Section C harder" or "Add trigonometry word problem"'
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && runInstruction()}
                  disabled={loading}
                />
                <button
                  className="px-5 py-2.5 rounded-2xl text-xs font-bold text-white shadow-sm disabled:opacity-50 transition-all hover:opacity-95"
                  style={{ background: "var(--primary)" }}
                  onClick={() => runInstruction()}
                  disabled={loading || !instruction.trim()}
                >
                  Send Command
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
