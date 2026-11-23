import React from "react";
import { PRIORITY_COLOR } from "../api.js";
import { Plus } from "../Icons.jsx";
import { Donut, Gauge } from "./Charts.jsx";

export const EMPTY_STATS = { incoming: 0, outstanding: 0, total: 0, resolved: 0, escalated: 0, sla_breached: 0,
  estimated_time: "00:00:00", priority: { P1: 0, P2: 0, P3: 0, P4: 0 }, source: { system: 0, customer: 0 }, system_ratio: 0 };

export function PriorityWidget({ stats }) {
  return (
    <div className="widget">
      <h4>Priority</h4>
      <div className="donut-row">
        <Donut data={stats.priority} />
        <ul className="legend">
          {Object.entries(stats.priority).map(([p, v]) => (
            <li key={p}><i style={{ background: PRIORITY_COLOR[p] }} />{p}<b>{v}</b></li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function SourceWidget({ stats }) {
  return (
    <div className="widget center">
      <h4 className="left">Ticket source</h4>
      <Gauge ratio={stats.system_ratio} />
      <div className="legend-inline">
        <span><i style={{ background: "#2f80ed" }} />System {stats.source.system}</span>
        <span><i style={{ background: "#bfe0ec" }} />Customer {stats.source.customer}</span>
      </div>
    </div>
  );
}

export default function StatsPanel({ stats }) {
  const s = stats || EMPTY_STATS;
  return (
    <aside className="stats">
      <div className="kpis">
        <div><span>Incoming tickets</span><b>{s.incoming}</b></div>
        <div><span>Outstanding tickets</span><b>{s.outstanding}</b></div>
        <div><span>Total tickets</span><b>{s.total}</b></div>
        <div><span>Estimated time</span><b>{s.estimated_time}</b></div>
      </div>
      <PriorityWidget stats={s} />
      <SourceWidget stats={s} />
      <button className="add-widget" disabled><Plus /><span>Add widget</span></button>
    </aside>
  );
}
