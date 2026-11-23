import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { api } from "./api.js";
import { useAuth } from "./auth.jsx";

const ChatCtx = createContext(null);
export const useChat = () => useContext(ChatCtx);

let nextId = 1;
const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
export const msg = (role, kind, extra) => ({ id: nextId++, role, kind, time: now(), ...extra });

/** Keeps the conversation alive while the user navigates between pages. */
export function ChatProvider({ children }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState([]); // recently opened tickets (top bar chips)
  const [version, setVersion] = useState(0); // bump to make dashboards refetch
  const conversationId = useRef(null);

  useEffect(() => { setMessages([]); setRecent([]); conversationId.current = null; }, [user?.id]);

  const push = (m) => setMessages((prev) => [...prev, m]);
  const refresh = () => setVersion((v) => v + 1);
  const remember = (inc) =>
    setRecent((r) => [{ id: inc.id, title: inc.title, priority: inc.priority }, ...r.filter((x) => x.id !== inc.id)].slice(0, 3));
  const forget = (id) => setRecent((r) => r.filter((x) => x.id !== id));

  const send = async (text, files = []) => {
    const shown = text || "Please see the attached file" + (files.length > 1 ? "s." : ".");
    push(msg("user", "text", { text: shown, files: files.map((f) => ({ name: f.name, url: f.type.startsWith("image/") ? URL.createObjectURL(f) : null })) }));
    setLoading(true);
    try {
      const ids = files.length ? (await api.uploadFiles(files)).map((a) => a.id) : [];
      const data = await api.chat(shown, conversationId.current, ids);
      conversationId.current = data.conversation_id;
      push(msg("assistant", "answer", { data }));
      remember({ id: data.incident_id, title: shown.slice(0, 40), priority: data.priority });
      refresh();
    } catch (e) {
      push(msg("assistant", "text", { text: "Sorry, something went wrong: " + e.message }));
    } finally {
      setLoading(false);
    }
  };

  const showIncident = (inc) => {
    remember(inc);
    push(msg("assistant", "answer", { data: {
      incident_id: inc.id, reply: inc.recommendation || inc.description, category: inc.category,
      priority: inc.priority, status: inc.status, escalated: inc.status === "escalated",
      sources: inc.sources || [], actions: inc.actions || [] } }));
  };

  const prioritize = async () => {
    push(msg("user", "text", { text: "What should I focus on first?" }));
    try {
      const rows = (await api.incidents()).filter((i) => ["open", "in_progress"].includes(i.status)).slice(0, 3);
      push(rows.length ? msg("assistant", "table", { rows }) : msg("assistant", "text", { text: "No outstanding tickets. 🎉" }));
    } catch (e) { push(msg("assistant", "text", { text: e.message })); }
  };

  const deduce = async () => {
    try {
      const top = (await api.incidents()).find((i) => ["open", "in_progress"].includes(i.status));
      if (!top) return push(msg("assistant", "text", { text: "Nothing to analyse yet." }));
      push(msg("user", "text", { text: `Please tell me what's wrong with: ${top.title}` }));
      showIncident(top);
    } catch (e) { push(msg("assistant", "text", { text: e.message })); }
  };

  return (
    <ChatCtx.Provider value={{ messages, loading, send, push, recent, forget, remember, version, refresh, prioritize, deduce, showIncident }}>
      {children}
    </ChatCtx.Provider>
  );
}
