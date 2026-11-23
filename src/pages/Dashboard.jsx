import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { isStaff, useAuth } from "../auth.jsx";
import { useChat } from "../chat.jsx";
import IncidentTable from "../components/IncidentTable.jsx";
import { EMPTY_STATS, PriorityWidget, SourceWidget } from "../components/StatsPanel.jsx";
import { ErrorBox, Spinner, useAsync } from "../ui.jsx";

const Kpi = ({ label, value, tone }) => (<div className={"kpi " + (tone || "")}><span>{label}</span><b>{value}</b></div>);

export default function Dashboard() {
  const { user } = useAuth();
  const { version } = useChat();
  const navigate = useNavigate();
  const stats = useAsync(api.stats, [version]);
  const list = useAsync(() => api.incidents({ limit: 6 }), [version]);
  const s = stats.data || EMPTY_STATS;
  const staff = isStaff(user);

  return (
    <>
      <div className="hero">
        <div>
          <span className="eyebrow">{staff ? "Service desk overview" : "Employee self-service"}</span>
          <h2>Welcome back, {user.name.split(" ")[0]}</h2>
          <p>{staff ? "Monitor, triage and resolve incidents across your organisation." : "Describe an IT problem, raise a request or track your tickets."}</p>
          <div className="page-actions"><Link className="btn dark" to="/chat">Ask AI assistant</Link><Link className="btn" to="/catalog">Raise a request</Link></div>
        </div>
        <div className="hero-art" aria-hidden="true"><i /><i /><i /></div>
      </div>
      <ErrorBox message={stats.error} />
      <div className="kpi-row">
        <Kpi label={staff ? "Incoming (24h)" : "My new tickets (24h)"} value={s.incoming} />
        <Kpi label="Outstanding" value={s.outstanding} />
        <Kpi label="Resolved" value={s.resolved} tone="good" />
        <Kpi label="Escalated" value={s.escalated} />
        <Kpi label="SLA breached" value={s.sla_breached} tone={s.sla_breached ? "bad" : ""} />
        <Kpi label="Estimated time" value={s.estimated_time} />
      </div>
      {stats.loading && !stats.data ? <Spinner /> : (
        <div className="widgets">
          <PriorityWidget stats={s} />
          <SourceWidget stats={s} />
          <div className="widget quick">
            <h4>Quick actions</h4>
            <button className="btn" onClick={() => navigate("/chat")}>💬 Describe a problem to the AI</button>
            <button className="btn" onClick={() => navigate("/knowledge")}>📚 Search the knowledge base</button>
            <button className="btn" onClick={() => navigate("/catalog")}>🧾 Request hardware or access</button>
            {staff && <button className="btn" onClick={() => navigate("/analytics")}>📈 View analytics</button>}
          </div>
        </div>
      )}
      <div className="section-head"><h3>{staff ? "Highest-priority tickets" : "My recent tickets"}</h3><Link to="/incidents">View all →</Link></div>
      {list.loading && !list.data ? <Spinner /> : <IncidentTable rows={list.data || []} onOpen={(r) => navigate(`/incidents/${r.id}`)} />}
    </>
  );
}
