import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PRIORITY_LABEL, fmtDateTime } from "./api.js";

/** Loads data, tracks loading/error, and can reload. */
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const run = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: "" }));
    let alive = true;
    fn().then((data) => alive && setState({ data, loading: false, error: "" }))
      .catch((e) => alive && setState({ data: null, loading: false, error: e.message }));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => run(), [run]);
  return { ...state, reload: run };
}

export const Spinner = ({ text = "Loading…" }) => <div className="spinner"><i />{text}</div>;
export const ErrorBox = ({ message }) => message ? <div className="error" role="alert">{message}</div> : null;

export function PageHeader({ title, crumbs = [], children }) {
  return (
    <div className="page-header">
      <div>
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          {crumbs.map((c) => (<React.Fragment key={c.label}> <span>›</span> {c.to ? <Link to={c.to}>{c.label}</Link> : <span>{c.label}</span>}</React.Fragment>))}
        </nav>
        <h2>{title}</h2>
      </div>
      <div className="page-actions">{children}</div>
    </div>
  );
}

export const PriorityTag = ({ p }) => (
  <>
    <span className="p-tag">{p || "P3"}</span>{" "}
    <span className={"sev sev-" + (p || "P3")}>{PRIORITY_LABEL[p] || "Normal"}</span>
  </>
);
export const StatusBadge = ({ s }) => <span className={"status st-" + s}>{s.replace("_", " ")}</span>;
export const SlaBadge = ({ incident }) => {
  if (incident.status === "resolved") return <span className="sla ok">Met</span>;
  if (incident.sla_breached) return <span className="sla bad">Breached</span>;
  return <span className="sla" title={fmtDateTime(incident.due_at)}>Due {fmtDateTime(incident.due_at)}</span>;
};
export const Empty = ({ children }) => <div className="empty">{children}</div>;
