import React from "react";
import { fmtTime } from "../api.js";
import { Empty, PriorityTag, SlaBadge, StatusBadge } from "../ui.jsx";

export default function IncidentTable({ rows, onOpen, onSort, sort, showSla = true }) {
  if (!rows.length) return <Empty>No tickets to show.</Empty>;
  const head = (key, label) => (
    <th className={onSort ? "sortable" : ""} onClick={() => onSort?.(key)}>
      {label}{sort?.key === key ? (sort.dir === "asc" ? " ▲" : " ▼") : ""}
    </th>
  );
  return (
    <div className="table-card">
      <table>
        <thead>
          <tr>
            {head("priority", "Priority")}
            {head("title", "Title")}
            {head("category", "Category")}
            {head("created_at", "Created")}
            <th>Assigned to</th>
            {showSla && <th>SLA</th>}
            {head("status", "Status")}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} onClick={() => onOpen?.(r)} className="row" tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onOpen?.(r)}>
              <td><PriorityTag p={r.priority} /></td>
              <td>
                <div className="t-title">{r.title}</div>
                <div className="t-sub">{r.id} · {r.type}{r.reporter_name ? ` · ${r.reporter_name}` : ""}</div>
              </td>
              <td className="cap">{r.category || "—"}</td>
              <td>{fmtTime(r.created_at)}</td>
              <td>{r.assigned_to || "Unassigned"}</td>
              {showSla && <td><SlaBadge incident={r} /></td>}
              <td><StatusBadge s={r.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
