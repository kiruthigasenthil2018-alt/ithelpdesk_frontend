import React, { useState } from "react";
import { api } from "../api.js";
import { BarList, LineChart } from "../components/Charts.jsx";
import { ErrorBox, PageHeader, Spinner, useAsync } from "../ui.jsx";

const pct = (v) => (v == null ? "—" : `${Math.round(v * 100)}%`);
const dur = (m) => (m == null ? "—" : m < 60 ? `${Math.round(m)} min` : `${(m / 60).toFixed(1)} h`);

export default function Analytics() {
  const [days, setDays] = useState(7);
  const { data: a, loading, error } = useAsync(() => api.analytics(days), [days]);
  return (
    <>
      <PageHeader title="Analytics" crumbs={[{ label: "Analytics" }]}>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))} aria-label="Range">
          {[7, 14, 30].map((d) => <option key={d} value={d}>Last {d} days</option>)}</select>
      </PageHeader>
      <ErrorBox message={error} />
      {loading && !a ? <Spinner /> : a && (
        <>
          <div className="kpi-row">
            <div className="kpi"><span>Avg. resolution time</span><b>{dur(a.avg_resolution_minutes)}</b></div>
            <div className="kpi good"><span>AI deflection rate</span><b>{pct(a.ai_deflection_rate)}</b></div>
            <div className="kpi"><span>SLA compliance</span><b>{pct(a.sla_compliance)}</b></div>
            <div className="kpi"><span>CSAT (1–5)</span><b>{a.csat_average ?? "—"}</b></div>
            <div className="kpi"><span>Tickets (90 days)</span><b>{a.total}</b></div>
          </div>
          <div className="grid-2">
            <section className="card"><h4>Tickets created vs resolved</h4>
              <LineChart labels={a.days} series={[{ name: "Created", color: "#2f80ed", values: a.created_per_day }, { name: "Resolved", color: "#22c55e", values: a.resolved_per_day }]} />
              <div className="legend-inline"><span><i style={{ background: "#2f80ed" }} />Created</span><span><i style={{ background: "#22c55e" }} />Resolved</span></div>
            </section>
            <section className="card"><h4>By category</h4><BarList data={a.by_category} /></section>
            <section className="card"><h4>By status</h4><BarList data={a.by_status} color="#7c3aed" /></section>
            <section className="card"><h4>How to read this</h4>
              <p className="muted"><b>AI deflection</b>: share of closed tickets resolved without human escalation. <b>SLA</b>: P1 1h, P2 4h, P3 8h, P4 24h. <b>CSAT</b> comes from ratings users give when confirming a fix.</p></section>
          </div>
        </>
      )}
    </>
  );
}
