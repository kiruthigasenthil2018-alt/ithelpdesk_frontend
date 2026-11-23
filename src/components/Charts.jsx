import React from "react";
import { PRIORITY_COLOR } from "../api.js";

export function Donut({ data, size = 120 }) {
  const entries = Object.entries(data);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  const R = 52, C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <svg viewBox="0 0 140 140" width={size} height={size} role="img" aria-label="Priority breakdown">
      <circle cx="70" cy="70" r={R} fill="none" stroke="#eef0f6" strokeWidth="16" />
      {total > 0 && entries.map(([p, v]) => {
        const len = (v / total) * C;
        const el = <circle key={p} cx="70" cy="70" r={R} fill="none" stroke={PRIORITY_COLOR[p]} strokeWidth="16"
          strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset} transform="rotate(-90 70 70)" />;
        offset += len;
        return el;
      })}
      <text x="70" y="76" textAnchor="middle" fontSize="20" fontWeight="600" fill="#1a2233">{total}</text>
    </svg>
  );
}

export function Gauge({ ratio }) {
  const arc = Math.PI * 60;
  return (
    <svg viewBox="0 0 160 100" width="190" height="110" role="img" aria-label="Ticket source ratio">
      <path d="M20 85 A60 60 0 0 1 140 85" fill="none" stroke="#bfe0ec" strokeWidth="18" />
      <path d="M20 85 A60 60 0 0 1 140 85" fill="none" stroke="#2f80ed" strokeWidth="18" strokeDasharray={`${arc * ratio} ${arc}`} />
      <text x="80" y="68" textAnchor="middle" fontSize="18" fontWeight="600" fill="#1a2233">{ratio.toFixed(2)}</text>
    </svg>
  );
}

export function LineChart({ labels, series, height = 200 }) {
  const W = 560, H = height, pad = { l: 30, r: 10, t: 10, b: 24 };
  const max = Math.max(1, ...series.flatMap((s) => s.values));
  const x = (i) => pad.l + (i * (W - pad.l - pad.r)) / Math.max(1, labels.length - 1);
  const y = (v) => H - pad.b - (v / max) * (H - pad.t - pad.b);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Tickets per day">
      {[0, 0.5, 1].map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={W - pad.r} y1={y(max * t)} y2={y(max * t)} stroke="#e5e8f0" />
          <text x={pad.l - 6} y={y(max * t) + 4} fontSize="10" textAnchor="end" fill="#8a93a6">{Math.round(max * t)}</text>
        </g>
      ))}
      {labels.map((l, i) => (
        <text key={l} x={x(i)} y={H - 6} fontSize="10" textAnchor="middle" fill="#8a93a6">{l.slice(5)}</text>
      ))}
      {series.map((s) => (
        <g key={s.name}>
          <polyline fill="none" stroke={s.color} strokeWidth="2.5" points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")} />
          {s.values.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="3.5" fill={s.color}><title>{`${s.name}: ${v}`}</title></circle>)}
        </g>
      ))}
    </svg>
  );
}

export function BarList({ data, color = "#2f80ed" }) {
  const entries = Object.entries(data);
  const max = Math.max(1, ...entries.map(([, v]) => v));
  if (!entries.length) return <div className="empty">No data yet.</div>;
  return (
    <div className="bars">
      {entries.map(([k, v]) => (
        <div key={k} className="bar-row">
          <span className="cap">{k.replace("_", " ")}</span>
          <div className="bar"><i style={{ width: `${(v / max) * 100}%`, background: color }} /></div>
          <b>{v}</b>
        </div>
      ))}
    </div>
  );
}
