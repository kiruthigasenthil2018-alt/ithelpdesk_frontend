const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Token lives in sessionStorage: it is cleared when the tab closes (safer than localStorage).
const KEY = "helpdesk_token";
export const getToken = () => sessionStorage.getItem(KEY);
export const setToken = (t) => (t ? sessionStorage.setItem(KEY, t) : sessionStorage.removeItem(KEY));

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => (onUnauthorized = fn);

async function request(path, options = {}) {
  const headers = { ...(options.isForm ? {} : { "Content-Type": "application/json" }) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let res;
  try {
    res = await fetch(BASE + path, { ...options, headers });
  } catch {
    throw new Error(`Cannot reach the API at ${BASE}. Is the backend running?`);
  }
  if (res.status === 401 && token) onUnauthorized();
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
    } catch {}
    throw new Error(detail);
  }
  return res.json();
}

const post = (path, body) => request(path, { method: "POST", body: JSON.stringify(body) });
const patch = (path, body) => request(path, { method: "PATCH", body: JSON.stringify(body) });
const qs = (params = {}) => {
  const p = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== "" && v != null));
  return p.toString() ? "?" + p.toString() : "";
};

export const api = {
  health: () => request("/health"),
  login: (email, password) => post("/auth/login", { email, password }),
  register: (name, email, password) => post("/auth/register", { name, email, password }),
  me: () => request("/auth/me"),
  stats: () => request("/dashboard/stats"),
  analytics: (days) => request(`/analytics?days=${days}`),
  notifications: () => request("/notifications"),
  incidents: (params) => request("/incidents" + qs({ limit: 200, ...params })),
  incident: (id) => request(`/incidents/${id}`),
  createIncident: (title, description) => post("/incidents", { title, description }),
  updateIncident: (id, body) => patch(`/incidents/${id}`, body),
  comment: (id, message) => post(`/incidents/${id}/comments`, { message }),
  chat: (message, conversation_id, attachment_ids = []) => post("/chat", { message, conversation_id, attachment_ids }),
  uploadFiles: (files, incidentId) => {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    if (incidentId) form.append("incident_id", incidentId);
    return request("/attachments", { method: "POST", body: form, isForm: true });
  },
  attachments: (id) => request(`/incidents/${id}/attachments`),
  deleteAttachment: (id) => request(`/attachments/${id}`, { method: "DELETE" }),
  feedback: (id, resolved, rating, comment) => post(`/incidents/${id}/feedback`, { resolved, rating, comment }),
  escalate: (id, reason) => post(`/incidents/${id}/escalate`, { reason }),
  runAction: (id, action) => post(`/incidents/${id}/actions/${action}/execute`, {}),
  report: (id) => request(`/reports/${id}`),
  catalog: () => request("/catalog"),
  requestItem: (id, details) => post(`/catalog/${id}/request`, { details }),
  kbSearch: (q, category) => request("/knowledge/search" + qs({ q, category, k: 6 })),
  kbArticles: () => request("/knowledge/articles"),
  kbArticle: (source) => request(`/knowledge/articles/${encodeURIComponent(source)}`),
  kbUpload: (file) => {
    const form = new FormData();
    form.append("file", file);
    return request("/knowledge/ingest", { method: "POST", body: form, isForm: true });
  },
  kbReindex: () => request("/knowledge/reindex", { method: "POST" }),
  users: () => request("/admin/users"),
  updateUser: (id, body) => patch(`/admin/users/${id}`, body),
  llmStatus: () => request("/admin/llm-status"),
};

export async function fetchAttachmentBlob(id, inline = false) {
  const res = await fetch(`${BASE}/attachments/${id}/download${inline ? "?inline=1" : ""}`, { headers: { Authorization: `Bearer ${getToken()}` } });
  if (!res.ok) throw new Error("Could not load the file");
  return res.blob();
}
export async function downloadAttachment(att) {
  const url = URL.createObjectURL(await fetchAttachmentBlob(att.id));
  const a = document.createElement("a");
  a.href = url; a.download = att.filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function parseTime(ts) {
  if (!ts) return new Date();
  return new Date(/Z|[+-]\d\d:\d\d$/.test(ts) ? ts : ts + "Z");
}
export const fmtTime = (ts) => parseTime(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
export const fmtDateTime = (ts) => (ts ? parseTime(ts).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "—");

export const PRIORITY_LABEL = { P1: "High", P2: "Medium", P3: "Normal", P4: "Low" };
export const PRIORITY_COLOR = { P1: "#e11d48", P2: "#22c55e", P3: "#3b82f6", P4: "#facc15" };
export const CATEGORIES = ["network", "hardware", "software", "account", "security"];
export const STATUSES = ["open", "in_progress", "resolved", "escalated"];
