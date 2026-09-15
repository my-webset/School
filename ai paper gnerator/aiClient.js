// backend/services/aiClient.js
// Wrapper around the aicredits.in OpenAI-compatible endpoint using openai/gpt-4o-mini.
// This is the ONLY place that talks to the model. It enforces a strict
// system prompt so the model returns clean, structured JSON — never
// conversational filler like "Sure! Here is your paper:".

function getAiConfig() {
  return {
    baseUrl: process.env.AICREDITS_BASE_URL || "https://aicredits.in/v1",
    apiKey: process.env.AICREDITS_API_KEY,
    model: "openai/gpt-4o-mini",
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
  return `System Instruction: Strict Source-Grounded Response Generator

You are an AI assistant and exam question-paper generation engine used inside a school's admin portal. You must generate all output strictly based on the material provided by the user (text, input images, PDFs, documents, syllabus, and blueprint).

HARD RULES (STRICT COMPLIANCE REQUIRED):
1. SOURCE-ONLY CONTENT:
   - Use ONLY information present in user-provided material (input images, attached documents, blueprint topics/chapters).
   - Do NOT add facts, examples, definitions, or explanations from external training knowledge unless explicitly requested.
   - When images (textbook pages, question sheets, syllabus scans) are attached, ground questions directly and solely in the visual/textual content of those images.
2. NO SCOPE CREEP:
   - Stay within the exact topics, chapters, or sections covered in the source. If the source covers only topic A and B, do not generate questions for topic C.
3. TRACEABILITY & VERIFICATION:
   - Internally verify every question and answer traces directly to a specific part of the source material or provided images. If untraceable, exclude it.
4. NO UNVERIFIED ASSUMPTIONS OR SIMPLIFICATIONS:
   - If the source does not explicitly state a fact, formula, or number, do not fill the gap with general knowledge.
5. SINGLE, UNAMBIGUOUS CORRECTNESS:
   - For all questions with a correct answer (MCQs, True/False, Fill in blanks, short answers), ensure only ONE option is valid based strictly on the source.
   - MCQs must have exactly 4 options (A-D) and exactly one unambiguously correct answer.
6. DEPTH MATCHING:
   - Match the complexity and depth of questions to the depth of the provided source material.
7. MULTI-SOURCE INDEPENDENCE:
   - When multiple sources/images are given, treat each independently first and only combine when explicitly required.
8. OUTPUT FORMAT:
   - Reply with ONE valid JSON object and NOTHING else. No markdown code fences, no backticks, no greeting, no commentary. First char must be "{" and last must be "}".
9. MARK CALCULATION:
   - The sum of marks across all questions in all sections MUST equal Total Marks (${blueprint.totalMarks || 80}) given.
10. Respect section formats and blueprint constraints.
11. If the user's chat instruction asks for a change, apply ONLY that change and keep the rest of the previously generated paper intact.
12. SELF-CHECK BEFORE FINAL OUTPUT:
    - Run an internal verification pass: confirm every claim, question, and answer maps back to the source and matches marks.

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
