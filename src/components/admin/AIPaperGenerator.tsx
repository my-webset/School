import { useState, useRef, useEffect } from "react";
import { dataService } from "../../services/dataService";
import { generatePaperWithAI, AIPaperResult, PaperSection, PaperQuestion } from "../../services/aiClient";
import { exportPaperAsWord } from "../../services/docxExporter";
import LOGOS from "../../assets/logos";

const STORAGE_SAVED_PAPERS = "nis_saved_papers_v2";

interface QuestionCounts {
  mcq: number;
  fill: number;
  tf: number;
  very_short: number;
  short: number;
  long: number;
  case: number;
}

export default function AIPaperGenerator() {
  const school = dataService.getSchoolInfo();
  const [tab, setTab] = useState<"generator" | "saved">("generator");

  const [blueprint, setBlueprint] = useState({
    subject: "The Psychology of Money",
    className: "Class X",
    examType: "Annual Examination 2026–27",
    targetPages: 3,
    totalMarks: 80,
    duration: "3 Hours",
    difficulty: "Mixed (Standard)",
    chapters: "Financial Behavior, Compounding, Wealth vs Income, Room for Error, Saving Habits, Autonomy & Freedom",
    sectionOrder: ["mcq", "fill", "tf", "very_short", "short", "long", "case"],
    customInstructions: "",
    counts: {
      mcq: 10,
      fill: 5,
      tf: 5,
      very_short: 4,
      short: 4,
      long: 4,
      case: 4,
    } as QuestionCounts,
  });

  const [images, setImages] = useState<File[]>([]);
  const [chatLog, setChatLog] = useState<Array<{ role: "user" | "status"; text: string }>>([]);
  const [history, setHistory] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [instruction, setInstruction] = useState("");
  const [paper, setPaper] = useState<AIPaperResult | null>(null);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [viewMode, setViewMode] = useState<"continuous" | "multipage">("continuous");
  const [zoomLevel, setZoomLevel] = useState<number>(100);
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
  const updateCount = (key: keyof QuestionCounts, delta: number) => {
    setBlueprint((b) => ({
      ...b,
      counts: {
        ...b.counts,
        [key]: Math.max(0, (b.counts[key] || 0) + delta),
      },
    }));
  };

  function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files || []);
    setImages((prev) => [...prev, ...picked].slice(0, 7));
    e.target.value = "";
    showToast(`Added ${picked.length} reference image(s)`);
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  // Preflight Quality & Audit Calculation Engine
  const calculatedTotalMarks = paper
    ? paper.sections?.reduce(
        (sum, s) => sum + (s.questions?.reduce((qSum, q) => qSum + (Number(q.marks) || 1), 0) || 0),
        0
      )
    : 0;

  const totalQuestionsCount = paper
    ? paper.sections?.reduce((sum, s) => sum + (s.questions?.length || 0), 0)
    : 0;

  // Duplicate Check Engine
  const duplicateCheck = (() => {
    if (!paper || !paper.sections) return { hasDuplicates: false, count: 0 };
    const allQuestions: string[] = [];
    let dups = 0;
    paper.sections.forEach((s) => {
      s.questions?.forEach((q) => {
        const clean = q.text.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 40);
        if (clean.length > 10 && allQuestions.includes(clean)) {
          dups++;
        } else {
          allQuestions.push(clean);
        }
      });
    });
    return { hasDuplicates: dups > 0, count: dups };
  })();

  const isMarksValid = paper ? calculatedTotalMarks === Number(blueprint.totalMarks) : true;

  async function runInstruction(text?: string) {
    const cmd = (text ?? instruction).trim();
    if (!cmd || loading) return;

    let effectiveBlueprint = { ...blueprint };

    // Natural Language Command Parser
    const pageMatch = cmd.match(/(\d+)\s*(?:page|pages)/i);
    if (pageMatch && pageMatch[1]) {
      const pCount = Math.min(Math.max(parseInt(pageMatch[1], 10), 1), 6);
      effectiveBlueprint.targetPages = pCount;
    }

    const marksMatch = cmd.match(/(\d+)\s*(?:mark|marks)/i);
    if (marksMatch && marksMatch[1]) {
      effectiveBlueprint.totalMarks = parseInt(marksMatch[1], 10);
    }

    setBlueprint(effectiveBlueprint);

    const isFreshGeneration = /^(generate the paper|regenerate the paper|regenerate from scratch|create the paper)$/i.test(cmd);
    const effectiveHistory = isFreshGeneration ? [] : history;

    setChatLog((log) => [...log, { role: "user", text: cmd }]);
    setInstruction("");
    setLoading(true);
    setError("");

    try {
      const newPaper = await generatePaperWithAI({
        instruction: cmd,
        blueprint: effectiveBlueprint,
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
      setChatLog((log) => [...log, { role: "status", text: `✅ Examination paper generated with 0 gaps and exact ${effectiveBlueprint.totalMarks} marks!` }]);
      showToast(`Paper Generated successfully (${newPaper.maximumMarks} Marks)!`);
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
            AI Question Paper Studio & Layout Engine
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure exact pages, question counts, and sequential order with zero gaps, strict repetition checks, and global branding.
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
          {/* LEFT: Exam Blueprint & Exact Count Configurator */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-4 h-fit">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">PAPER CONFIGURATOR</span>
              <span className="text-[11px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-md">
                Strict Sequential Order
              </span>
            </div>

            {/* Target Paper Pages */}
            <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700">Target Paper Length</label>
                <span className="text-[11px] text-blue-600 font-semibold font-mono">
                  {blueprint.targetPages} {blueprint.targetPages === 1 ? "Page" : "Pages"}
                </span>
              </div>
              <div className="grid grid-cols-6 gap-1">
                {[1, 2, 3, 4, 5, 6].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => updateField("targetPages", p)}
                    className={`py-1.5 text-center rounded-xl text-xs font-bold transition-all ${
                      blueprint.targetPages === p
                        ? "bg-blue-900 text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {p}P
                  </button>
                ))}
              </div>
            </div>

            {/* Exact Question Counts Configuration */}
            <div className="space-y-2 border border-slate-100 rounded-2xl p-3 bg-slate-50/50">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-1 border-b border-slate-200/60">
                <span>Question Types & Quantity</span>
                <span className="text-[10px] text-slate-400 font-normal">Exact numbers</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-700">
                {[
                  { key: "mcq" as const, label: "Multiple Choice (MCQ)", marks: "1M" },
                  { key: "fill" as const, label: "Fill in the Blanks", marks: "1M" },
                  { key: "tf" as const, label: "True / False", marks: "1M" },
                  { key: "very_short" as const, label: "Very Short Answers", marks: "2M" },
                  { key: "short" as const, label: "Short Answers", marks: "3M" },
                  { key: "long" as const, label: "Long Answers", marks: "5M" },
                  { key: "case" as const, label: "Case-Based / Competency", marks: "5M" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-0.5">
                    <span className="text-[11px] font-medium text-slate-600">
                      {item.label} <span className="text-[10px] text-slate-400">({item.marks})</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateCount(item.key, -1)}
                        className="w-5 h-5 rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold text-xs"
                      >
                        -
                      </button>
                      <span className="w-5 text-center font-mono font-bold text-xs text-slate-800">
                        {blueprint.counts[item.key] || 0}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCount(item.key, 1)}
                        className="w-5 h-5 rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Basic Blueprint Inputs */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Subject</label>
                  <input
                    value={blueprint.subject}
                    onChange={(e) => updateField("subject", e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. Mathematics"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Class / Grade</label>
                  <input
                    value={blueprint.className}
                    onChange={(e) => updateField("className", e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. Class X"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Exam Title</label>
                  <input
                    value={blueprint.examType}
                    onChange={(e) => updateField("examType", e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Total Maximum Marks</label>
                  <input
                    type="number"
                    value={blueprint.totalMarks}
                    onChange={(e) => updateField("totalMarks", Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Topics & Chapters (Syllabus)</label>
                <textarea
                  rows={2}
                  value={blueprint.chapters}
                  onChange={(e) => updateField("chapters", e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none leading-relaxed"
                />
              </div>

              {/* Reference Images */}
              <div className="space-y-2">
                <div
                  className="border border-dashed border-slate-200 rounded-xl p-2.5 text-center cursor-pointer hover:border-blue-400 bg-slate-50/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="text-xs font-semibold text-slate-600">
                    📷 Attach Reference Material ({images.length}/7)
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Upload syllabus, sample questions, or textbook excerpts (JPG/PNG)
                  </p>
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
                  <div className="space-y-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium px-0.5">
                      <span>{images.length} of 7 attached</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImages([]);
                          showToast("All reference images cleared");
                        }}
                        className="text-red-500 hover:text-red-700 hover:underline font-semibold text-[10px] transition-colors"
                      >
                        Clear All
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {images.map((file, idx) => {
                        const previewUrl = URL.createObjectURL(file);
                        return (
                          <div
                            key={idx}
                            className="relative group rounded-lg overflow-hidden border border-slate-200 bg-white aspect-square shadow-2xs"
                          >
                            <img
                              src={previewUrl}
                              alt={`ref-${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                              <span className="text-[9px] text-white font-medium px-1 text-center truncate max-w-full">
                                {file.name}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(idx);
                                showToast(`Removed ${file.name}`);
                              }}
                              className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-4.5 h-4.5 text-[10px] font-bold flex items-center justify-center shadow-md transition-transform hover:scale-110 z-10"
                              title={`Remove ${file.name}`}
                              aria-label={`Remove ${file.name}`}
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={() => runInstruction("Generate the paper")}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl font-bold text-xs text-white shadow-md flex items-center justify-center gap-2 hover:opacity-95 transition-opacity disabled:opacity-50 mt-1"
                style={{ background: "var(--primary)" }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Synthesizing {blueprint.targetPages}-Page Paper...
                  </>
                ) : (
                  `⚡ Generate ${blueprint.targetPages}-Page Question Paper (${blueprint.totalMarks} Marks)`
                )}
              </button>
            </div>
          </div>

          {/* RIGHT: Live Preview & Quality Preflight Dock */}
          <div className="lg:col-span-8 flex flex-col gap-3">
            {/* Automated Preflight Quality & Audit Bar */}
            {paper && (
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4 flex-wrap font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">Marks Check:</span>
                    <span className={`font-mono font-bold px-2 py-0.5 rounded-md ${
                      isMarksValid ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {calculatedTotalMarks} / {blueprint.totalMarks} Marks {isMarksValid ? "✓ Exact" : "⚠️ Rebalancing"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">Questions:</span>
                    <span className="font-mono font-bold px-2 py-0.5 bg-blue-50 text-blue-800 rounded-md">
                      {totalQuestionsCount} Questions
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">Repetition Check:</span>
                    <span className={`font-mono font-bold px-2 py-0.5 rounded-md ${
                      !duplicateCheck.hasDuplicates ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      {!duplicateCheck.hasDuplicates ? "✓ 100% Unique" : `⚠️ ${duplicateCheck.count} duplicates`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500">Layout:</span>
                    <span className="font-bold text-slate-700">Compact Flow (No Gaps)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAnswerKey(!showAnswerKey)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                      showAnswerKey ? "bg-blue-50 border-blue-200 text-blue-700" : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {showAnswerKey ? "✓ Answer Key" : "🔑 Show Key"}
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1 text-xs font-bold rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 shadow-xs"
                  >
                    🖨️ Print
                  </button>
                  <button
                    onClick={handleDownloadWord}
                    className="px-3 py-1 text-xs font-bold rounded-lg text-white shadow-xs"
                    style={{ background: "var(--primary)" }}
                  >
                    ⬇ Word
                  </button>
                  <button
                    onClick={handleSaveToLibrary}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    💾 Save
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-700 text-xs p-3 rounded-2xl border border-red-200 flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Live Paper Document Canvas (Compact, Seamless, Zero Artificial Gaps) */}
            <div
              id="printable-exam-paper"
              className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 relative text-slate-900 overflow-hidden"
              style={{ fontFamily: "'Times New Roman', Times, serif" }}
            >
              {/* Official Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none watermark-layer">
                <img src={school.logoUrl || LOGOS.schoolLogo} alt="Watermark" className="w-80 h-80 object-contain" />
              </div>

              {!paper && !loading && (
                <div className="text-center py-16 font-sans">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-2xl flex items-center justify-center mx-auto mb-2">
                    📝
                  </div>
                  <h3 className="font-bold text-slate-800 text-base" style={{ fontFamily: "DM Serif Display, serif" }}>
                    Live Examination Paper Preview
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    Configure question counts on the left or type your command below to generate a compact, gap-free test paper.
                  </p>
                </div>
              )}

              {loading && (
                <div className="text-center py-20 font-sans text-slate-500 space-y-2">
                  <svg className="animate-spin w-8 h-8 text-blue-900 mx-auto" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <div className="text-sm font-semibold text-slate-800">
                    Formatting questions sequentially without gaps...
                  </div>
                </div>
              )}

              {paper && !loading && (
                <div className="space-y-4">
                  {/* School Header */}
                  <div className="text-center pb-2 border-b-2 border-slate-900">
                    <div className="flex justify-center mb-1">
                      <img src={school.logoUrl || LOGOS.schoolLogo} alt="Logo" className="w-10 h-10 object-contain" />
                    </div>
                    <h1 className="text-lg sm:text-xl font-bold uppercase tracking-wider">{school.name}</h1>
                    <p className="text-[11px] italic text-slate-600">{school.address}</p>
                    <p className="text-[11px] font-sans text-slate-600">
                      Affiliation: {school.affiliationNo} | {school.board}
                    </p>
                    <h2 className="text-sm sm:text-base font-bold uppercase tracking-wide mt-1 text-slate-900">
                      {paper.examTitle} ({paper.session})
                    </h2>
                  </div>

                  {/* Metadata Strip */}
                  <div className="flex justify-between border-b border-t border-slate-900 py-1 text-xs font-bold font-sans">
                    <span>SUBJECT: {paper.subject?.toUpperCase()}</span>
                    <span>CLASS: {paper.className?.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold font-sans pb-1">
                    <span>TIME ALLOWED: {paper.timeAllowed}</span>
                    <span>MAXIMUM MARKS: {paper.maximumMarks}</span>
                  </div>

                  {/* Dynamic General Instructions */}
                  <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3 text-[11px] font-sans">
                    <div className="font-bold underline mb-0.5">GENERAL INSTRUCTIONS:</div>
                    <ol className="list-decimal pl-4 space-y-0.5 text-slate-700">
                      {paper.generalInstructions?.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ol>
                  </div>

                  {/* Compact, Continuous Sections Flow */}
                  <div className="space-y-3 pt-1">
                    {paper.sections?.map((section, si) => (
                      <div key={si} className="space-y-2">
                        <div className="text-center border-y border-slate-300 py-1 my-2 bg-slate-50/40">
                          <p className="font-bold text-xs sm:text-sm tracking-wide">
                            {section.sectionLabel} {section.sectionTitle}
                          </p>
                          {section.sectionNote && (
                            <p className="italic text-[11px] text-slate-600 font-sans">{section.sectionNote}</p>
                          )}
                        </div>

                        {/* Sequential Questions */}
                        <div className="space-y-2">
                          {section.questions?.map((q) => (
                            <div key={q.number} className="text-xs leading-relaxed">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <span className="font-bold mr-1.5 font-mono">{q.number}.</span>
                                  <span className="whitespace-pre-line text-slate-900">{q.text}</span>
                                </div>
                                <span className="font-bold font-sans whitespace-nowrap ml-2 text-[11px]">
                                  [{q.marks} Mark{q.marks === 1 ? "" : "s"}]
                                </span>
                              </div>

                              {/* MCQ Option Grid */}
                              {q.type === "mcq" && q.options && (
                                <div className="pl-4 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 text-slate-700 font-sans text-[11px]">
                                  {q.options.map((opt, oi) => (
                                    <div key={oi} className="hover:text-black">{opt}</div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Answer Key */}
                  {showAnswerKey && paper.answerKey && paper.answerKey.length > 0 && (
                    <div className="mt-6 pt-3 border-t-2 border-slate-900 font-sans">
                      <div className="text-center font-bold text-xs uppercase mb-2 text-blue-900">
                        ANSWER KEY & MODEL MARKING SCHEME
                      </div>
                      <table className="w-full text-xs border border-slate-300">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="border border-slate-300 py-1 px-2 text-center w-16">Q. No.</th>
                            <th className="border border-slate-300 py-1 px-3 text-left">Answer / Model Solution</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paper.answerKey.map((a) => (
                            <tr key={a.number} className="border-t border-slate-200">
                              <td className="border border-slate-300 text-center font-bold py-1 px-2">{a.number}</td>
                              <td className="border border-slate-300 py-1 px-3 whitespace-pre-line">{a.answer}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="text-center text-[11px] font-sans text-slate-400 border-t border-slate-200 pt-3 mt-4">
                    *** END OF QUESTION PAPER ***
                  </div>
                </div>
              )}
            </div>

            {/* Conversational AI Command Assistant Dock */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  AI Command Assistant
                </span>
                <span className="text-[10px] text-slate-400">
                  Command page length, question quantities, ordering, or instruction edits
                </span>
              </div>

              {/* Chat Log */}
              {chatLog.length > 0 && (
                <div className="max-h-28 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  {chatLog.map((m, i) => (
                    <div
                      key={i}
                      className={
                        m.role === "user"
                          ? "bg-blue-900 text-white rounded-xl px-3 py-1 w-fit ml-auto shadow-xs"
                          : "text-slate-500 italic text-[11px] px-1"
                      }
                    >
                      {m.text}
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Prompt Suggestions */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Make Section A: 12 MCQs + 4 Fill in Blanks + 4 True/False",
                  "Make a 3-page paper with 80 marks",
                  "Change order to Fill in Blanks first",
                  "Make Section C harder with analytical problems",
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => runInstruction(s)}
                    disabled={loading}
                    className="text-[10px] bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    + {s}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <div className="flex gap-2">
                <input
                  className="flex-1 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                  placeholder='Type a command e.g. "Create 4-page paper, 80 marks, 16 MCQs, 6 Short, 4 Long, 2 Cases"'
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && runInstruction()}
                  disabled={loading}
                />
                <button
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm disabled:opacity-50 transition-all hover:opacity-95"
                  style={{ background: "var(--primary)" }}
                  onClick={() => runInstruction()}
                  disabled={loading || !instruction.trim()}
                >
                  Apply Command
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
