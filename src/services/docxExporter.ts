import { AIPaperResult } from "./aiClient";

export function exportPaperAsWord(paper: AIPaperResult, schoolInfo: { name: string; address: string; affiliation: string }) {
  const content = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${paper.subject} - ${paper.examTitle}</title>
      <style>
        body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.3; color: #000; margin: 30pt; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
        .text-lg { font-size: 14pt; }
        .text-xl { font-size: 16pt; }
        .text-sm { font-size: 10pt; }
        .italic { font-style: italic; }
        .border-b { border-bottom: 1.5pt solid #000; }
        .border-t { border-top: 1.5pt solid #000; }
        .py-2 { padding-top: 6pt; padding-bottom: 6pt; }
        .mt-4 { margin-top: 12pt; }
        .mb-4 { margin-bottom: 12pt; }
        .mb-2 { margin-bottom: 6pt; }
        .flex { display: flex; justify-content: space-between; }
        .instructions { background: #f8f9fa; border: 1pt solid #ddd; padding: 8pt; margin-bottom: 14pt; font-size: 9.5pt; }
        .section-header { text-align: center; font-weight: bold; font-size: 11pt; margin-top: 14pt; margin-bottom: 6pt; text-transform: uppercase; border-top: 0.5pt solid #888; border-bottom: 0.5pt solid #888; padding: 3pt 0; }
        .question { margin-bottom: 8pt; display: flex; justify-content: space-between; font-size: 10.5pt; }
        .options { padding-left: 20pt; margin-bottom: 6pt; font-size: 10pt; }
        table { width: 100%; border-collapse: collapse; margin-top: 10pt; }
        th, td { border: 1pt solid #444; padding: 4pt 8pt; text-align: left; font-size: 10pt; }
        th { background: #eee; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="text-center">
        <div class="font-bold text-xl">${schoolInfo.name.toUpperCase()}</div>
        <div class="text-sm italic">${schoolInfo.address}</div>
        <div class="text-sm">Affiliation: ${schoolInfo.affiliation} | CBSE (Central Board of Secondary Education)</div>
        <div class="font-bold text-lg mt-4">${paper.examTitle} (${paper.session})</div>
      </div>

      <div class="border-t border-b py-2 mt-4" style="display: table; width: 100%;">
        <div style="display: table-row;">
          <div style="display: table-cell; text-align: left; font-weight: bold;">SUBJECT: ${paper.subject.toUpperCase()}</div>
          <div style="display: table-cell; text-align: right; font-weight: bold;">CLASS: ${paper.className.toUpperCase()}</div>
        </div>
        <div style="display: table-row;">
          <div style="display: table-cell; text-align: left; font-weight: bold;">TIME ALLOWED: ${paper.timeAllowed}</div>
          <div style="display: table-cell; text-align: right; font-weight: bold;">MAXIMUM MARKS: ${paper.maximumMarks}</div>
        </div>
      </div>

      <div class="instructions mt-4">
        <div class="font-bold"><u>GENERAL INSTRUCTIONS:</u></div>
        <ol style="margin: 4pt 0 0 16pt; padding: 0;">
          ${(paper.generalInstructions || []).map(ins => `<li>${ins}</li>`).join("")}
        </ol>
      </div>

      ${(paper.sections || []).map(sec => `
        <div class="section-header">
          ${sec.sectionLabel} ${sec.sectionTitle || ""}
          ${sec.sectionNote ? `<div style="font-size: 9pt; font-weight: normal; font-style: italic;">${sec.sectionNote}</div>` : ""}
        </div>
        ${(sec.questions || []).map(q => `
          <div class="question" style="display: table; width: 100%;">
            <div style="display: table-cell; text-align: left; width: 85%;">
              <strong>${q.number}.</strong> ${q.text.replace(/\n/g, "<br/>")}
              ${q.type === "mcq" && q.options ? `
                <div class="options">
                  ${q.options.map(opt => `<div>${opt}</div>`).join("")}
                </div>
              ` : ""}
            </div>
            <div style="display: table-cell; text-align: right; width: 15%; font-weight: bold; white-space: nowrap;">
              [${q.marks} Mark${q.marks === 1 ? "" : "s"}]
            </div>
          </div>
        `).join("")}
      `).join("")}

      ${paper.answerKey && paper.answerKey.length > 0 ? `
        <div class="text-center font-bold mt-4" style="margin-top: 20pt;">ANSWER KEY & MARKING SCHEME</div>
        <table>
          <thead>
            <tr>
              <th style="width: 15%; text-align: center;">Q. No.</th>
              <th>Answer / Model Solution</th>
            </tr>
          </thead>
          <tbody>
            ${paper.answerKey.map(a => `
              <tr>
                <td style="text-align: center; font-weight: bold;">${a.number}</td>
                <td>${a.answer}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      ` : ""}

      <div class="text-center mt-4 text-sm" style="margin-top: 24pt; color: #666;">*** END OF QUESTION PAPER ***</div>
    </body>
    </html>
  `;

  const blob = new Blob(["\ufeff", content], {
    type: "application/msword;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${paper.subject.replace(/\s+/g, "_")}_${paper.className.replace(/\s+/g, "_")}_Exam_Paper.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
