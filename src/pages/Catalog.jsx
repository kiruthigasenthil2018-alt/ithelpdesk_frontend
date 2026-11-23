import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useChat } from "../chat.jsx";
import { ErrorBox, PageHeader, PriorityTag, Spinner, useAsync } from "../ui.jsx";

export default function Catalog() {
  const { data, loading, error } = useAsync(api.catalog, []);
  const [item, setItem] = useState(null);
  const [details, setDetails] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const { refresh } = useChat();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr("");
    try { const inc = await api.requestItem(item.id, details); refresh(); navigate(`/incidents/${inc.id}`); }
    catch (ex) { setErr(ex.message); } finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader title="Service catalog" crumbs={[{ label: "Catalog" }]} />
      <p className="muted">Choose a standard request. We create a tracked ticket with the right category and priority.</p>
      <ErrorBox message={error} />
      {loading ? <Spinner /> : (
        <div className="catalog">
          {data.map((c) => (
            <button key={c.id} className="cat-card" onClick={() => { setItem(c); setDetails(""); setErr(""); }}>
              <span className="cat-icon">{c.icon}</span>
              <b>{c.name}</b><span>{c.description}</span>
              <span><PriorityTag p={c.priority} /></span>
            </button>
          ))}
        </div>
      )}
      {item && (
        <div className="modal-bg" onClick={() => setItem(null)}>
          <form className="modal form" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
            <h3>{item.icon} {item.name}</h3>
            <ErrorBox message={err} />
            <label>Details<textarea rows={4} maxLength={3000} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="What do you need, and by when?" /></label>
            <div className="btn-row"><button className="btn primary" disabled={busy}>{busy ? "Submitting…" : "Submit request"}</button>
              <button type="button" className="btn" onClick={() => setItem(null)}>Cancel</button></div>
          </form>
        </div>
      )}
    </>
  );
}
