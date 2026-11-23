import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { isStaff, useAuth } from "../auth.jsx";
import { msg, useChat } from "../chat.jsx";
import Composer from "./Composer.jsx";
import * as I from "../Icons.jsx";
import { StatusBadge } from "../ui.jsx";
import IncidentTable from "./IncidentTable.jsx";
import ReportModal from "./ReportModal.jsx";

function AnswerCard({ data, onFeedback, onAction, onReport, onOpen, user }) {
  const staff = isStaff(user);
  return (
    <div className="bubble ai">
      <div className="badges">
        {data.category && <span className="badge">{data.category}</span>}
        {data.priority && <span className="badge">{data.priority}</span>}
        <StatusBadge s={data.status} />
        <button className="badge link" onClick={() => onOpen(data.incident_id)}>{data.incident_id} ↗</button>
      </div>
      <p className="answer">{data.reply}</p>
      {data.sources?.length > 0 && (
        <div className="sources"><b>Sources</b>
          {data.sources.map((s) => <span key={s.citation} className="src">{s.citation}</span>)}
        </div>
      )}
      {data.actions?.length > 0 && (
        <div className="actions"><b>Recommended actions</b>
          {data.actions.map((a) => (
            <div key={a.name} className="action">
              <span>
                <code>{a.name}</code> {a.description}
                {a.requires_approval && <em className="needs"> · needs admin approval</em>}
                {a.result && <div className="result">{a.result}</div>}
              </span>
              {a.status !== "executed" && staff && (
                <button className="btn small" disabled={a.requires_approval && user.role !== "admin"}
                  onClick={() => onAction(data.incident_id, a)}>
                  {a.requires_approval ? "Approve & run" : "Run"}
                </button>
              )}
            </div>
          ))}
          {!staff && <small className="muted">IT staff will run these actions for you.</small>}
        </div>
      )}
      <div className="btn-row">
        {!data.escalated && data.status !== "resolved" && (
          <>
            <button className="btn small" onClick={() => onFeedback(data.incident_id, true)}>It worked</button>
            <button className="btn small" onClick={() => onFeedback(data.incident_id, false)}>Still broken</button>
          </>
        )}
        <button className="btn small" onClick={() => onReport(data.incident_id)}>View report</button>
      </div>
    </div>
  );
}

export default function ChatPanel() {
  const { messages, loading, send, push, refresh } = useChat();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [notice, setNotice] = useState("");
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const handlers = {
    user, onOpen: (id) => navigate(`/incidents/${id}`),
    onFeedback: async (id, resolved) => {
      try {
        const inc = await api.feedback(id, resolved);
        push(msg("assistant", "text", { text: resolved ? `Great — ${id} is marked resolved.` : `Sorry about that. ${id} was escalated to ${inc.assigned_to}.` }));
        refresh();
      } catch (e) { setNotice(e.message); }
    },
    onAction: async (id, action) => {
      if (action.requires_approval && !window.confirm(`"${action.name}" is a consequential action. Approve it?`)) return;
      try { push(msg("assistant", "text", { text: (await api.runAction(id, action.name)).result })); refresh(); }
      catch (e) { setNotice(e.message); }
    },
    onReport: async (id) => { try { setReport(await api.report(id)); } catch (e) { setNotice(e.message); } },
  };

  return (
    <section className="chat">
      {notice && <div className="error" role="alert" onClick={() => setNotice("")}>{notice}</div>}
      <div className="messages">
        {messages.length === 0 && (
          <div className="welcome">
            <I.Bot width={36} height={36} />
            <h3>How can I help with your IT issue?</h3>
            <p>Describe a problem (e.g. “My VPN will not connect”). I’ll search the knowledge base, suggest fixes and create a ticket for you.</p>
            <div className="suggest">
              {["My VPN will not connect", "I am locked out of my account", "My printer is offline", "I clicked a suspicious link"].map((s) => (
                <button key={s} className="btn small" onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={"msg " + m.role}>
            <div className="who">
              {m.role === "assistant" ? <span className="ai-icon"><I.Smile width={18} height={18} /></span> : <span className="avatar sm">You</span>}
              <div><b>{m.role === "assistant" ? "AI assistant" : "You"}</b><small>{m.time}</small></div>
            </div>
            {m.kind === "text" && <div className={"bubble " + (m.role === "user" ? "user" : "ai")}><p className="answer">{m.text}</p>
              {m.files?.length > 0 && <div className="sent-files">{m.files.map((f, i) => (
                <span key={i} className="sent-file">{f.url ? <img src={f.url} alt={f.name} /> : "📄"} {f.name}</span>))}</div>}</div>}
            {m.kind === "table" && <IncidentTable rows={m.rows} showSla={false} onOpen={(r) => navigate(`/incidents/${r.id}`)} />}
            {m.kind === "answer" && <AnswerCard data={m.data} {...handlers} />}
          </div>
        ))}
        {loading && <div className="typing">AI assistant is thinking…</div>}
        <div ref={endRef} />
      </div>
      <Composer loading={loading} onSend={send} />
      <ReportModal report={report} onClose={() => setReport(null)} />
    </section>
  );
}
