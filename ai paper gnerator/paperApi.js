// frontend/services/paperApi.js
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "/api/ai-paper";

/**
 * Sends the chat instruction + blueprint + up to 7 images to the backend,
 * gets back the full, current paper JSON.
 */
export async function generatePaper({ instruction, blueprint, schoolInfo, history, images }) {
  const form = new FormData();
  form.append("instruction", instruction);
  form.append("blueprint", JSON.stringify(blueprint));
  form.append("schoolInfo", JSON.stringify(schoolInfo));
  form.append("history", JSON.stringify(history));
  images.slice(0, 7).forEach((file) => form.append("images", file));

  const { data } = await axios.post(`${API_BASE}/generate`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.paper;
}

/**
 * Downloads the current paper as a .docx file.
 */
export async function downloadPaperAsWord({ paper, schoolInfo }) {
  const response = await axios.post(
    `${API_BASE}/export-docx`,
    { paper, schoolInfo },
    { responseType: "blob" }
  );
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  const fileName = `${(paper.subject || "question-paper").replace(/\s+/g, "_")}.docx`;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
