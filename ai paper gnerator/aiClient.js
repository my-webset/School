// backend/services/aiClient.js
// Wrapper around the aicredits.in OpenAI-compatible endpoint using gpt-5-nano.
// This is the ONLY place that talks to the model. It enforces a strict
// system prompt so the model returns clean, structured JSON — never
// conversational filler like "Sure! Here is your paper:".

function getAiConfig() {
  return {
    baseUrl: process.env.AICREDITS_BASE_URL || "https://aicredits.in/v1",
    apiKey: process.env.AICREDITS_API_KEY,
    model: process.env.AICREDITS_MODEL || "gpt-5-nano",
  };
}

if (!process.env.AICREDITS_API_KEY) {
  console.warn("[aiClient] AICREDITS_API_KEY is not set in the environment.");
}

/**
 * Builds the system prompt that fixes the exact shape/format of the paper.
 * schoolInfo + blueprint come from the "Exam Blueprint" panel on the left
 * of the AI Paper Generator page (kept as-is on the frontend).
 */
function buildSystemPrompt(schoolInfo, blueprint) {
  return `You are an exam question-paper generation engine used inside a school's admin portal.

HARD RULES (never break these):
1. Reply with ONE valid JSON object and NOTHING else. No markdown code fences, no backticks,
   no greeting, no explanation, no "Here is your paper", no sign-off, no commentary of any kind
   before or after the JSON. The very first character of your reply must be "{" and the very
   last character must be "}".
2. Never invent facts about the school (name/address/affiliation) — you are only responsible for
   the exam content itself (instructions text, sections, questions, marks, options, answer key).
   The school header is rendered separately by the app.
3. Always respect the Exam Blueprint exactly: Subject, Class/Grade, Exam Type, Total Marks,
   Time Duration, Difficulty, Chapters & Topics, and the selected Question Formats.
4. The sum of marks across all questions in all sections MUST equal the Total Marks given.
5. Distribute questions across sections in this fixed convention unless the user explicitly asks
   to change it in the chat:
   - SECTION A — Objective & Conceptual: MCQ / True-False / Fill in the Blanks, 1 mark each.
   - SECTION B — Short Answer: 2-mark and 3-mark questions.
   - SECTION C — Long Answer / Analytical: 5-mark questions.
   Only include sections whose question formats were selected in the blueprint.
6. Every question must be genuinely answerable from the given Subject/Class/Chapters — do not
   generate vague or filler questions. MCQs must have exactly 4 options (A–D) and exactly one
   correct answer.
7. If the user's chat instruction only asks for a small change (e.g. "make section C harder",
   "add 2 more MCQs", "remove trigonometry"), apply ONLY that change and keep the rest of the
   previously generated paper intact — return the full, updated paper JSON again in full.
8. If reference images were attached, treat them as source material (textbook pages, sample
   papers, diagrams, syllabus scans) to ground the questions — do not describe the images back
   to the user, just use them silently as context.
9. Only produce an "answerKey" array when the user has asked to include/show the answer key.

Return JSON in EXACTLY this shape:
{
  "examTitle": string,               // e.g. "HALF-YEARLY EXAMINATION"
  "session": string,                 // e.g. "SESSION 2026-27"
  "subject": string,
  "className": string,
  "timeAllowed": string,             // e.g. "3 Hours"
  "maximumMarks": number,
  "generalInstructions": string[],   // numbered lines, no numbering characters included
  "sections": [
    {
      "sectionLabel": string,        // e.g. "SECTION A"
      "sectionTitle": string,        // e.g. "(OBJECTIVE & CONCEPTUAL)"
      "sectionNote": string,         // short italic note under the section title
      "questions": [
        {
          "number": number,
          "type": "mcq" | "true_false" | "fill_blank" | "short" | "long",
          "text": string,
          "marks": number,
          "options": string[] | null   // present only for "mcq", else null
        }
      ]
    }
  ],
  "answerKey": [ { "number": number, "answer": string } ] | null
}

CURRENT EXAM BLUEPRINT:
${JSON.stringify(blueprint, null, 2)}

SCHOOL (for tone/level only, do not repeat this in your output):
${JSON.stringify(schoolInfo, null, 2)}`;
}

/**
 * @param {object} params
 * @param {object} params.schoolInfo   - { name, address, affiliation }
 * @param {object} params.blueprint    - the left-panel form state
 * @param {Array}  params.history      - prior {role:'user'|'assistant', content:string} turns
 *                                       (assistant turns are stored as compact JSON strings)
 * @param {string} params.instruction  - the new command typed by the user in the chat box
 * @param {Array}  params.images       - array of { mimeType, base64 } for up to 7 reference images
 */
async function generatePaper({ schoolInfo, blueprint, history = [], instruction, images = [] }) {
  const { apiKey, baseUrl, model } = getAiConfig();

  if (!apiKey) {
    throw new Error("AICREDITS_API_KEY is missing on the server.");
  }

  const userContent = images.length > 0 ? [{ type: "text", text: instruction }] : instruction;
  for (const img of images.slice(0, 7)) {
    if (typeof userContent === "string") {
      throw new Error("Internal image payload error.");
    }
    userContent.push({
      type: "image_url",
      image_url: { url: `data:${img.mimeType};base64,${img.base64}` },
    });
  }

  const messages = [
    { role: "system", content: buildSystemPrompt(schoolInfo, blueprint) },
    ...history,
    { role: "user", content: userContent },
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  let response;
  try {
    response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_completion_tokens: 6000,
      }),
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("AI provider timed out after 60 seconds. Check AICREDITS_BASE_URL, model, and API access.");
    }
    throw new Error(`AI provider connection failed: ${error.message}`);
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`aicredits.in request failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const raw = data?.choices?.[0]?.message?.content ?? "";
  return parseModelJson(raw);
}

/** Defensively strips accidental code fences before parsing, then validates shape. */
function parseModelJson(raw) {
  const cleaned = raw.trim().replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/```$/, "").trim();
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new Error("Model did not return valid JSON. Raw response: " + raw.slice(0, 500));
  }
  if (!parsed.sections || !Array.isArray(parsed.sections)) {
    throw new Error("Model JSON is missing a 'sections' array.");
  }
  return parsed;
}

module.exports = { generatePaper, buildSystemPrompt };
