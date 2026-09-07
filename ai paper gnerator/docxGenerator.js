// backend/services/docxGenerator.js
// Converts the paper JSON (from aiClient.generatePaper) + schoolInfo into a
// .docx buffer, replacing the old "Print / Save PDF" flow.
//
// npm install docx

const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} = require("docx");

function center(children, opts = {}) {
  return new Paragraph({ alignment: AlignmentType.CENTER, children, ...opts });
}

function buildHeader(schoolInfo, paper) {
  return [
    center([new TextRun({ text: schoolInfo.name || "", bold: true, size: 32 })], { spacing: { after: 60 } }),
    center([new TextRun({ text: schoolInfo.address || "", italics: true, size: 20 })]),
    center([
      new TextRun({
        text: `Affiliation: ${schoolInfo.affiliation || ""} | CBSE (Central Board of Secondary Education)`,
        size: 20,
      }),
    ]),
    center([new TextRun({ text: `${paper.examTitle || ""} (${paper.session || ""})`, bold: true, size: 24 })], {
      spacing: { before: 120, after: 200 },
    }),
    new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000" } },
      spacing: { after: 200 },
      tabStops: [{ type: "right", position: 9000 }],
      children: [
        new TextRun({ text: `SUBJECT: ${(paper.subject || "").toUpperCase()}`, bold: true }),
        new TextRun({ text: `\tCLASS: ${paper.className || ""}`.toUpperCase(), bold: true }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200 },
      tabStops: [{ type: "right", position: 9000 }],
      children: [
        new TextRun({ text: `TIME ALLOWED: ${paper.timeAllowed || ""}`, bold: true }),
        new TextRun({ text: `\tMAXIMUM MARKS: ${paper.maximumMarks ?? ""}`, bold: true }),
      ],
    }),
  ];
}

function buildInstructions(paper) {
  const items = (paper.generalInstructions || []).map(
    (line, i) =>
      new Paragraph({
        text: `${i + 1}. ${line}`,
        spacing: { after: 80 },
      })
  );
  return [
    new Paragraph({ children: [new TextRun({ text: "GENERAL INSTRUCTIONS:", bold: true, underline: {} })], spacing: { after: 120 } }),
    ...items,
    new Paragraph({ text: "", spacing: { after: 200 } }),
  ];
}

function buildSections(paper) {
  const out = [];
  for (const section of paper.sections || []) {
    out.push(
      center([new TextRun({ text: `${section.sectionLabel} ${section.sectionTitle || ""}`, bold: true, size: 24 })], {
        spacing: { before: 200, after: 60 },
      })
    );
    if (section.sectionNote) {
      out.push(
        center([new TextRun({ text: section.sectionNote, italics: true, size: 20 })], { spacing: { after: 160 } })
      );
    }
    for (const q of section.questions || []) {
      out.push(
        new Paragraph({
          spacing: { after: 60 },
          tabStops: [{ type: "right", position: 9500 }],
          children: [
            new TextRun({ text: `${q.number}. `, bold: true }),
            new TextRun({ text: q.text }),
            new TextRun({ text: `\t[${q.marks} Mark${q.marks === 1 ? "" : "s"}]`, bold: true }),
          ],
        })
      );
      if (q.type === "mcq" && Array.isArray(q.options)) {
        for (const opt of q.options) {
          out.push(new Paragraph({ text: `      ${opt}`, spacing: { after: 40 } }));
        }
      }
      out.push(new Paragraph({ text: "", spacing: { after: 100 } }));
    }
  }
  return out;
}

function buildAnswerKey(paper) {
  if (!paper.answerKey || !paper.answerKey.length) return [];
  const rows = [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ text: "Q. No.", alignment: AlignmentType.CENTER })] }),
        new TableCell({ children: [new Paragraph({ text: "Answer", alignment: AlignmentType.CENTER })] }),
      ],
    }),
    ...paper.answerKey.map(
      (a) =>
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: String(a.number), alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: String(a.answer), alignment: AlignmentType.CENTER })] }),
          ],
        })
    ),
  ];
  return [
    new Paragraph({ text: "", spacing: { before: 300 } }),
    center([new TextRun({ text: "ANSWER KEY", bold: true, size: 24 })], { spacing: { after: 120 } }),
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }),
  ];
}

/**
 * @param {object} paper       - JSON returned by aiClient.generatePaper
 * @param {object} schoolInfo  - { name, address, affiliation }
 * @returns {Promise<Buffer>}  - the .docx file bytes
 */
async function paperToDocxBuffer(paper, schoolInfo) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          ...buildHeader(schoolInfo, paper),
          ...buildInstructions(paper),
          ...buildSections(paper),
          ...buildAnswerKey(paper),
        ],
      },
    ],
  });
  return Packer.toBuffer(doc);
}

module.exports = { paperToDocxBuffer };
