import React from "react";

export default function ReportModal({ report, onClose }) {
  if (!report) return null;
  const rows = [
    ["Incident ID", report.incident_id], ["Category", report.category], ["Priority", report.priority],
    ["Status", report.status], ["Problem", report.problem],
    ["Retrieved sources", report.retrieved_sources.join(", ") || "—"],
    ["Actions", report.actions.join(", ") || "—"], ["Resolution", report.resolution || "—"],
    ["Escalation", report.escalation_status],
  ];
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" role="dialog" aria-label="Incident report" onClick={(e) => e.stopPropagation()}>
        <h3>Incident report</h3>
        <dl>{rows.map(([k, v]) => (<React.Fragment key={k}><dt>{k}</dt><dd>{v}</dd></React.Fragment>))}</dl>
        <div className="btn-row">
          <button className="btn small" onClick={() => window.print()}>Print / Save PDF</button>
          <button className="btn small" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
