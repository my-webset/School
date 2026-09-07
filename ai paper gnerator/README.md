# AI Paper Generator — updated page

What changed vs the old page:

1. **Upload Syllabus (PDF)** → **Reference Images** — up to 7 images per request (drag/click,
   thumbnails, remove button). Sent to the model as vision input so it can read syllabus pages,
   sample papers, diagrams, etc.
2. **"Generate Question Paper with AI" button** → **command-based chat dock** at the bottom of
   the right panel. The user types instructions like *"Generate the paper"*, *"Make Section C
   harder"*, *"Add 2 more MCQs"*, and the model returns the full, updated paper each time. The
   Exam Blueprint panel on the left is untouched.
3. **"Print / Save PDF"** → **"Download as Word"**, which calls the backend and downloads a
   real `.docx` built from the AI's structured output.
4. The model is instructed (see `backend/services/aiClient.js`) to return **only** a JSON object
   describing the paper — no greetings, no "Here is your paper", no markdown fences. The chat
   log only ever shows the user's own commands plus a short client-side status line
   ("✅ Paper updated…") — the raw model output is never shown as chat text.

## Backend setup

```bash
cd backend
npm install express multer docx cors dotenv
```

`.env`:
```
AICREDITS_API_KEY=your_key_here
AICREDITS_BASE_URL=https://aicredits.in/v1
AICREDITS_MODEL=gpt-4o-mini
```

Wire the router into your existing Express app:
```js
const paperGeneratorRoutes = require("./routes/paperGenerator.routes");
app.use("/api/ai-paper", paperGeneratorRoutes);
```

Node 18+ is assumed (native `fetch`). On older Node, `npm install node-fetch` and add
`const fetch = require("node-fetch");` at the top of `aiClient.js`.

## Frontend setup

```bash
cd frontend
npm install axios
```

Drop `components/AIPaperGenerator/AIPaperGenerator.jsx` into your admin portal's routes in
place of the current AI Paper Generator page, e.g.:

```jsx
import AIPaperGenerator from "./components/AIPaperGenerator/AIPaperGenerator";
// <Route path="/ai-paper-generator" element={<AIPaperGenerator schoolInfo={mySchoolSettings} />} />
```

Pass your real `schoolInfo` (name/address/affiliation) from wherever "School Information" is
already stored — the AI never invents this, it's rendered by the app.

## Notes

- `response_format: { type: "json_object" }` is sent to force clean JSON; if aicredits.in's
  gpt-5-nano endpoint doesn't support that parameter, remove it — `aiClient.js` already
  defensively strips stray code fences before parsing.
- Multer enforces the "max 7 images" rule server-side too (`upload.array("images", 7)`), not
  just in the UI.
- The `.docx` is streamed straight from memory (no temp files to clean up).
