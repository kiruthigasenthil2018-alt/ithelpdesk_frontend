import React, { useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CATEGORIES, api } from "../api.js";
import { useAuth } from "../auth.jsx";
import { Empty, ErrorBox, PageHeader, Spinner, useAsync } from "../ui.jsx";

export function KnowledgeHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [results, setResults] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const fileRef = useRef(null);
  const articles = useAsync(api.kbArticles, []);

  const search = async (e) => {
    e.preventDefault();
    if (q.trim().length < 2) return setResults(null);
    setBusy(true); setMsg("");
    try { setResults((await api.kbSearch(q.trim(), category)).results); } catch (ex) { setMsg(ex.message); } finally { setBusy(false); }
  };
  const upload = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try { const r = await api.kbUpload(f); setMsg(`Added ${r.file} (${r.chunks} chunks).`); articles.reload(); } catch (ex) { setMsg(ex.message); }
    e.target.value = "";
  };
  const reindex = async () => { try { const r = await api.kbReindex(); setMsg(`Re-indexed ${r.files} files (${r.chunks} chunks).`); articles.reload(); } catch (ex) { setMsg(ex.message); } };

  const shown = (articles.data || []).filter((a) => !category || a.category === category);
  return (
    <>
      <PageHeader title="Knowledge base" crumbs={[{ label: "Knowledge" }]}>
        {user.role === "admin" && (<>
          <input ref={fileRef} type="file" accept=".pdf,.txt,.md" hidden onChange={upload} />
          <button className="btn" onClick={() => fileRef.current.click()}>⬆ Upload document</button>
          <button className="btn" onClick={reindex}>Re-index</button></>)}
      </PageHeader>
      <form className="filters" onSubmit={search}>
        <input className="search" value={q} onChange={(e) => { setQ(e.target.value); if (!e.target.value) setResults(null); }} placeholder="Search IT articles (e.g. VPN authentication failed)…" aria-label="Search knowledge base" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category"><option value="">All categories</option>
          {[...CATEGORIES, "general"].map((c) => <option key={c}>{c}</option>)}</select>
        <button className="btn dark" disabled={busy}>{busy ? "Searching…" : "Search"}</button>
      </form>
      {msg && <div className="notice-line" onClick={() => setMsg("")}>{msg}</div>}
      {results ? (
        <>
          <div className="section-head"><h3>{results.length} result(s)</h3><button className="link-btn" onClick={() => setResults(null)}>Clear</button></div>
          {results.length === 0 && <Empty>No matching articles.</Empty>}
          <div className="kb-list">{results.map((r) => (
            <button key={r.citation} className="kb-card" onClick={() => navigate(`/knowledge/${encodeURIComponent(r.source)}`)}>
              <div className="kb-top"><b>{r.title || r.source}</b><span className="badge">{r.category}</span><small>relevance {r.score.toFixed(2)}</small></div>
              <p>{r.text.slice(0, 220)}{r.text.length > 220 ? "…" : ""}</p><small className="muted">{r.citation}</small>
            </button>))}</div>
        </>
      ) : articles.loading ? <Spinner /> : (
        <>
          <ErrorBox message={articles.error} />
          {shown.length === 0 && <Empty>No articles yet.</Empty>}
          <div className="catalog">{shown.map((a) => (
            <button key={a.source} className="cat-card" onClick={() => navigate(`/knowledge/${encodeURIComponent(a.source)}`)}>
              <span className="cat-icon">{a.doc_type === "pdf" ? "📄" : "📝"}</span><b>{a.title}</b>
              <span className="badge cap">{a.category}</span><small className="muted">{a.source} · {a.chunks} chunk(s)</small>
            </button>))}</div>
        </>
      )}
    </>
  );
}

export function KnowledgeArticle() {
  const { source } = useParams();
  const { data, loading, error } = useAsync(() => api.kbArticle(source), [source]);
  return (
    <>
      <PageHeader title={source} crumbs={[{ label: "Knowledge", to: "/knowledge" }, { label: source }]}>
        <Link className="btn" to="/knowledge">← All articles</Link>
      </PageHeader>
      <ErrorBox message={error} />
      {loading ? <Spinner /> : data && <article className="card article"><pre>{data.content}</pre></article>}
    </>
  );
}
