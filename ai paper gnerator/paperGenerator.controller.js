// backend/controllers/paperGenerator.controller.js
const { generatePaper } = require("./aiClient");
const { paperToDocxBuffer } = require("./docxGenerator");

/**
 * POST /api/ai-paper/generate
 * multipart/form-data:
 *   - blueprint  (JSON string) — the Exam Blueprint panel state
 *   - schoolInfo (JSON string) — { name, address, affiliation }
 *   - history    (JSON string) — prior chat turns [{role, content}]
 *   - instruction (string)     — the new command typed in the chat box
 *   - images[]   (files, max 7)
 */
async function generate(req, res) {
  try {
    const blueprint = JSON.parse(req.body.blueprint || "{}");
    const schoolInfo = JSON.parse(req.body.schoolInfo || "{}");
    const history = JSON.parse(req.body.history || "[]");
    const instruction = (req.body.instruction || "").trim();

    if (!instruction) {
      return res.status(400).json({ error: "instruction is required." });
    }

    const files = req.files || [];
    if (files.length > 7) {
      return res.status(400).json({ error: "Max 7 images allowed per request." });
    }

    const images = files.map((f) => ({
      mimeType: f.mimetype,
      base64: f.buffer.toString("base64"),
    }));

    const paper = await generatePaper({ schoolInfo, blueprint, history, instruction, images });

    return res.json({ paper });
  } catch (err) {
    console.error("[paperGenerator.generate]", err);
    return res.status(500).json({ error: err.message || "Failed to generate paper." });
  }
}

/**
 * POST /api/ai-paper/export-docx
 * body: { paper: {...}, schoolInfo: {...} }
 * Streams a .docx file back directly (no PDF/print step anymore).
 */
async function exportDocx(req, res) {
  try {
    const { paper, schoolInfo } = req.body;
    if (!paper) return res.status(400).json({ error: "paper is required." });

    const buffer = await paperToDocxBuffer(paper, schoolInfo || {});
    const fileName = `${(paper.subject || "question-paper").replace(/\s+/g, "_")}_${(paper.className || "").replace(/\s+/g, "_")}.docx`;

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    return res.send(buffer);
  } catch (err) {
    console.error("[paperGenerator.exportDocx]", err);
    return res.status(500).json({ error: err.message || "Failed to export Word file." });
  }
}

module.exports = { generate, exportDocx };
