// backend/routes/paperGenerator.routes.js
const express = require("express");
const upload = require("./upload");
const { generate, exportDocx } = require("./paperGenerator.controller");

const router = express.Router();

// Command-based chat: user types an instruction, optionally attaches up to 7 images
router.post("/generate", upload.array("images", 7), generate);

// Replaces "Print / Save PDF" — always returns a .docx of the current paper
router.post("/export-docx", exportDocx);

module.exports = router;

// In your main server.js / app.js:
//   const paperGeneratorRoutes = require("./routes/paperGenerator.routes");
//   app.use("/api/ai-paper", paperGeneratorRoutes);
