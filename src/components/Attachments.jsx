import React, { useEffect, useRef, useState } from "react";
import { api, downloadAttachment, fetchAttachmentBlob } from "../api.js";

const size = (n) => (n > 1048576 ? (n / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1024)) + " KB");

function Preview({ att }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    let u;
    fetchAttachmentBlob(att.id, true).then((b) => { u = URL.createObjectURL(b); setUrl(u); }).catch(() => {});
    return () => u && URL.revokeObjectURL(u);
  }, [att.id]);
  return url ? <a href={url} target="_blank" rel="noreferrer"><img className="att-thumb" src={url} alt={att.filename} /></a> : <span className="file-ico">🖼️</span>;
}

/** Attachments card for the ticket page: list, download, upload, delete. */
export default function Attachments({ incidentId, canDeleteAll, userId, onChange }) {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const load = () => api.attachments(incidentId).then(setItems).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, [incidentId]);

  const upload = async (files) => {
    if (!files.length) return;
    setBusy(true); setErr("");
    try { await api.uploadFiles(Array.from(files), incidentId); await load(); onChange?.(); }
    catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  const remove = async (a) => {
    if (!window.confirm(`Delete ${a.filename}?`)) return;
    try { await api.deleteAttachment(a.id); await load(); } catch (e) { setErr(e.message); }
  };

  return (
    <section className="card">
      <h4>Attachments <span className="count">{items.length}</span></h4>
      {err && <div className="error">{err}</div>}
      {items.length === 0 && <p className="muted">No files yet. Add screenshots, logs or documents.</p>}
      <ul className="att-list">
        {items.map((a) => (
          <li key={a.id}>
            {a.is_image ? <Preview att={a} /> : <span className="file-ico">📄</span>}
            <div><b>{a.filename}</b><small>{size(a.size)}</small></div>
            <button className="btn small" onClick={() => downloadAttachment(a).catch((e) => setErr(e.message))}>Download</button>
            {(canDeleteAll || a.uploaded_by === userId) && <button className="btn small" onClick={() => remove(a)}>Delete</button>}
          </li>))}
      </ul>
      <input ref={fileRef} type="file" multiple hidden onChange={(e) => { upload(e.target.files); e.target.value = ""; }} />
      <button className="btn small primary" disabled={busy} onClick={() => fileRef.current.click()}>{busy ? "Uploading…" : "＋ Add files or images"}</button>
    </section>
  );
}
