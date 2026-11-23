import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CATEGORIES, STATUSES, api } from "../api.js";
import { useChat } from "../chat.jsx";
import IncidentTable from "../components/IncidentTable.jsx";
import { ErrorBox, PageHeader, Spinner, useAsync } from "../ui.jsx";

const ORDER = { priority: (a) => a.priority || "P9", title: (a) => a.title.toLowerCase(), category: (a) => a.category || "",
  created_at: (a) => a.created_at, status: (a) => a.status };

export default function Incidents() {
  const navigate = useNavigate();
  const { version, refresh } = useChat();
  const [filters, setFilters] = useState({ q: "", status: "", category: "", priority: "" });
  const [q, setQ] = useState("");
  const [sort, setSort] = useState({ key: "priority", dir: "asc" });
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [err, setErr] = useState("");

  useEffect(() => { const t = setTimeout(() => setFilters((f) => ({ ...f, q })), 300); return () => clearTimeout(t); }, [q]); // debounce search
  const { data, loading, error } = useAsync(() => api.incidents(filters), [filters, version]);

  const rows = useMemo(() => {
    const get = ORDER[sort.key];
    const sorted = [...(data || [])].sort((a, b) => (get(a) > get(b) ? 1 : get(a) < get(b) ? -1 : 0));
    return sort.dir === "asc" ? sorted : sorted.reverse();
  }, [data, sort]);

  const toggleSort = (key) => setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  const sel = (k, opts, label) => (
    <select value={filters[k]} onChange={(e) => setFilters({ ...filters, [k]: e.target.value })} aria-label={label}>
      <option value="">{label}</option>{opts.map((o) => <option key={o} value={o}>{o.replace("_", " ")}</option>)}
    </select>
  );

  const create = async (e) => {
    e.preventDefault(); setErr("");
    try { const inc = await api.createIncident(form.title, form.description); refresh(); navigate(`/incidents/${inc.id}`); }
    catch (ex) { setErr(ex.message); }
  };

  return (
    <>
      <PageHeader title="Tickets" crumbs={[{ label: "Tickets" }]}>
        <button className="btn dark" onClick={() => setCreating(!creating)}>{creating ? "Cancel" : "+ New ticket"}</button>
      </PageHeader>
      {creating && (
        <form className="card form" onSubmit={create}>
          <ErrorBox message={err} />
          <label>Title<input required minLength={3} maxLength={200} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
          <label>Describe the problem<textarea required minLength={5} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <button className="btn primary">Create ticket</button>
        </form>
      )}
      <div className="filters">
        <input className="search" placeholder="Search by title, description or ID…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search tickets" />
        {sel("status", STATUSES, "All statuses")}
        {sel("category", CATEGORIES, "All categories")}
        {sel("priority", ["P1", "P2", "P3", "P4"], "All priorities")}
        <span className="muted">{rows.length} ticket(s)</span>
      </div>
      <ErrorBox message={error} />
      {loading && !data ? <Spinner /> : <IncidentTable rows={rows} sort={sort} onSort={toggleSort} onOpen={(r) => navigate(`/incidents/${r.id}`)} />}
    </>
  );
}
