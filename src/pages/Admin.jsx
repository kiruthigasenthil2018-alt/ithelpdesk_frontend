import React, { useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import { ErrorBox, PageHeader, Spinner, useAsync } from "../ui.jsx";

export default function Admin() {
  const { user: me } = useAuth();
  const users = useAsync(api.users, []);
  const llm = useAsync(api.llmStatus, []);
  const [msg, setMsg] = useState("");

  const change = async (u, body) => {
    setMsg("");
    try { await api.updateUser(u.id, body); users.reload(); } catch (e) { setMsg(e.message); }
  };

  return (
    <>
      <PageHeader title="Administration" crumbs={[{ label: "Admin" }]} />
      <ErrorBox message={msg || users.error} />
      <section className="card"><h4>AI providers</h4>
        <p className="muted">Tried in order. When one hits its free limit it cools down and the next one answers.</p>
        {llm.loading ? <Spinner /> : llm.error ? <ErrorBox message={llm.error} /> : (
          <div className="providers">{llm.data.providers.map((p, i) => (
            <div key={p.provider} className="provider">
              <b>{i + 1}. {p.provider}</b>
              <span className={"status " + (p.configured ? "st-resolved" : "")}>{p.configured ? "key set" : "no key"}</span>
              {p.cooling_down_seconds > 0 && <span className="status st-escalated">rate-limited · {p.cooling_down_seconds}s</span>}
              {llm.data.last_provider === p.provider && <span className="status st-in_progress">last used</span>}
            </div>))}
          </div>)}
        <button className="btn small" onClick={llm.reload}>Refresh</button>
      </section>
      <section className="card"><h4>Users</h4>
        {users.loading ? <Spinner /> : (
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Active</th></tr></thead>
            <tbody>{(users.data || []).map((u) => (
              <tr key={u.id}>
                <td>{u.name}{u.id === me.id && " (you)"}</td><td>{u.email}</td>
                <td><select value={u.role} disabled={u.id === me.id} onChange={(e) => change(u, { role: e.target.value })}>
                  {["employee", "agent", "admin"].map((r) => <option key={r}>{r}</option>)}</select></td>
                <td><input type="checkbox" checked={u.is_active} disabled={u.id === me.id} onChange={(e) => change(u, { is_active: e.target.checked })} /></td>
              </tr>))}</tbody>
          </table>)}
      </section>
    </>
  );
}
