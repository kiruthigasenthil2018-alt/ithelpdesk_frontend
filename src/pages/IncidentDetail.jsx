import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CATEGORIES, STATUSES, api, fmtDateTime } from "../api.js";
import { isStaff, useAuth } from "../auth.jsx";
import { useChat } from "../chat.jsx";
import Attachments from "../components/Attachments.jsx";
import ReportModal from "../components/ReportModal.jsx";
import { ErrorBox, PageHeader, PriorityTag, SlaBadge, Spinner, StatusBadge, useAsync } from "../ui.jsx";

const KIND_ICON = { created: "🆕", status: "🔄", assigned: "👤", comment: "💬", action: "⚙️", escalated: "⬆️", ai: "🤖" };

const CANNED = [
  "Thanks for reporting this. We are looking into it now and will update you shortly.",
  "Could you please share a screenshot or the exact error message you see?",
  "Please restart your device and try again, then let us know if the problem continues.",
  "We have applied a fix on our side. Please check and confirm that it works for you.",
  "This has been escalated to the specialist team. You will be notified when it is resolved.",
  "Closing this ticket as resolved. Please reopen it if the issue returns.",
];

export default function IncidentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { refresh, remember, version } = useChat();
  const navigate = useNavigate();
  const { data: inc, loading, error, reload } = useAsync(async () => { const i = await api.incident(id); remember(i); return i; }, [id, version]);
  const [comment, setComment] = useState("");
  const [report, setReport] = useState(null);
  const [rating, setRating] = useState(0);
  const [msg, setMsg] = useState("");
  const staff = isStaff(user);

  const act = (fn) => async (...args) => {
    setMsg("");
    try { await fn(...args); refresh(); reload(); } catch (e) { setMsg(e.message); }
  };
  const update = act((body) => api.updateIncident(id, body));
  const addComment = act(async (e) => { e.preventDefault(); if (comment.trim()) { await api.comment(id, comment.trim()); setComment(""); } });
  const runAction = act(async (a) => {
    if (a.requires_approval && !window.confirm(`Approve consequential action "${a.name}"?`)) return;
    await api.runAction(id, a.name);
  });
  const escalate = act(async () => { const reason = window.prompt("Reason for escalation?"); if (reason && reason.length >= 3) await api.escalate(id, reason); });
  const resolve = act(async (ok) => api.feedback(id, ok, rating || undefined, ok ? undefined : window.prompt("What is still wrong?") || undefined));

  if (loading && !inc) return <Spinner />;
  if (error) return (<><PageHeader title="Ticket" crumbs={[{ label: "Tickets", to: "/incidents" }]} /><ErrorBox message={error} /><Link to="/incidents">← Back to tickets</Link></>);

  const mine = inc.reporter_name === user.name;
  return (
    <>
      <PageHeader title={inc.title} crumbs={[{ label: "Tickets", to: "/incidents" }, { label: inc.id }]}>
        <button className="btn" onClick={async () => { try { setReport(await api.report(id)); } catch (e) { setMsg(e.message); } }}>View report</button>
        <button className="btn" onClick={() => navigate(-1)}>← Back</button>
      </PageHeader>
      <ErrorBox message={msg} />
      <div className="detail">
        <div className="detail-main">
          <section className="card"><h4>Description</h4><p className="answer">{inc.description}</p></section>

          {inc.recommendation && (
            <section className="card ai-card">
              <h4>🤖 AI recommendation</h4>
              <p className="answer">{inc.recommendation}</p>
              {inc.sources?.length > 0 && <div className="sources"><b>Sources</b>{inc.sources.map((s) => (
                <Link key={s.citation} className="src" to={`/knowledge/${encodeURIComponent(s.source)}`}>{s.citation}</Link>))}</div>}
            </section>
          )}

          {inc.actions?.length > 0 && (
            <section className="card"><h4>Recommended actions</h4>
              {inc.actions.map((a) => (
                <div key={a.name} className="action">
                  <span><code>{a.name}</code> {a.description}{a.requires_approval && <em className="needs"> · needs admin approval</em>}
                    {a.result && <div className="result">{a.result}</div>}</span>
                  {staff && a.status !== "executed" && (
                    <button className="btn small" disabled={a.requires_approval && user.role !== "admin"} onClick={() => runAction(a)}>
                      {a.requires_approval ? "Approve & run" : "Run"}</button>)}
                </div>))}
              {!staff && <small className="muted">IT staff will run these actions for you.</small>}
            </section>
          )}

          <Attachments incidentId={id} userId={user.id} canDeleteAll={staff} onChange={() => { refresh(); reload(); }} />

          <section className="card"><h4>Activity</h4>
            <ul className="timeline">
              {inc.events.map((e) => (
                <li key={e.id}><span className="ico">{KIND_ICON[e.kind] || "•"}</span>
                  <div><div>{e.message}</div><small>{e.actor} · {fmtDateTime(e.created_at)}</small></div></li>))}
            </ul>
            {staff && (
              <select className="canned" value="" aria-label="Canned responses" onChange={(e) => e.target.value && setComment(e.target.value)}>
                <option value="">Insert a canned response…</option>
                {CANNED.map((c) => <option key={c} value={c}>{c.slice(0, 60)}{c.length > 60 ? "…" : ""}</option>)}
              </select>)}
            <form className="comment-form" onSubmit={addComment}>
              <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment…" maxLength={2000} aria-label="Comment" />
              <button className="btn small primary">Post</button>
            </form>
          </section>
        </div>

        <aside className="detail-side">
          <section className="card">
            <h4>Details</h4>
            <dl className="props">
              <dt>Status</dt><dd><StatusBadge s={inc.status} /></dd>
              <dt>Priority</dt><dd><PriorityTag p={inc.priority} /></dd>
              <dt>Category</dt><dd className="cap">{inc.category || "—"}</dd>
              <dt>Type</dt><dd className="cap">{inc.type}</dd>
              <dt>Assigned to</dt><dd>{inc.assigned_to || "Unassigned"}</dd>
              <dt>Reporter</dt><dd>{inc.reporter_name || "—"}</dd>
              <dt>Created</dt><dd>{fmtDateTime(inc.created_at)}</dd>
              <dt>SLA</dt><dd><SlaBadge incident={inc} /></dd>
              {inc.resolved_at && (<><dt>Resolved</dt><dd>{fmtDateTime(inc.resolved_at)}</dd></>)}
              {inc.satisfaction && (<><dt>CSAT</dt><dd>{"★".repeat(inc.satisfaction)}</dd></>)}
            </dl>
          </section>

          {staff && (
            <section className="card form">
              <h4>Manage</h4>
              <label>Status<select value={inc.status} onChange={(e) => update({ status: e.target.value })}>{STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}</select></label>
              <label>Priority<select value={inc.priority || "P3"} onChange={(e) => update({ priority: e.target.value })}>{["P1", "P2", "P3", "P4"].map((p) => <option key={p}>{p}</option>)}</select></label>
              <label>Category<select value={inc.category || ""} onChange={(e) => e.target.value && update({ category: e.target.value })}><option value="">—</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
              <label>Assign to<input defaultValue={inc.assigned_to || ""} key={inc.assigned_to} placeholder="Name or team, then Enter"
                onKeyDown={(e) => { if (e.key === "Enter" && e.target.value.trim()) update({ assigned_to: e.target.value.trim() }); }} /></label>
              <button className="btn small" onClick={escalate}>Escalate…</button>
            </section>
          )}

          {(mine || staff) && inc.status !== "resolved" && (
            <section className="card">
              <h4>Did this fix it?</h4>
              <div className="stars" aria-label="Rating">{[1, 2, 3, 4, 5].map((n) => (
                <button key={n} className={n <= rating ? "on" : ""} onClick={() => setRating(n)} aria-label={`${n} stars`}>★</button>))}</div>
              <div className="btn-row">
                <button className="btn small primary" onClick={() => resolve(true)}>It worked</button>
                {inc.status !== "escalated" && <button className="btn small" onClick={() => resolve(false)}>Still broken</button>}
              </div>
            </section>
          )}
        </aside>
      </div>
      <ReportModal report={report} onClose={() => setReport(null)} />
    </>
  );
}
