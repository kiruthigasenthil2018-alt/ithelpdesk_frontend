import React, { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { api, fmtDateTime, parseTime } from "../api.js";
import { isStaff, useAuth } from "../auth.jsx";
import { useChat } from "../chat.jsx";
import * as I from "../Icons.jsx";
import { PRIORITY_LABEL } from "../api.js";

function useClickAway(ref, fn) {
  useEffect(() => {
    const h = (e) => ref.current && !ref.current.contains(e.target) && fn();
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, fn]);
}

function Sidebar() {
  const { user } = useAuth();
  const groups = [
    { title: "Workspace", items: [
      { to: "/", icon: I.Home, label: "Home", end: true },
      { to: "/chat", icon: I.Chat, label: "AI Chat" } ] },
    { title: "Service desk", items: [
      { to: "/incidents", icon: I.Ticket, label: "Tickets" },
      { to: "/catalog", icon: I.Grid, label: "Service catalog" } ] },
    { title: "Resources", items: [
      { to: "/knowledge", icon: I.Book, label: "Knowledge base" },
      { to: "/help", icon: I.Help, label: "Feature guide" } ] },
    ...(isStaff(user) ? [{ title: "Insights", items: [{ to: "/analytics", icon: I.Chart, label: "Analytics" }] }] : []),
    ...(user.role === "admin" ? [{ title: "Administration", items: [{ to: "/admin", icon: I.Shield, label: "Admin" }] }] : []),
  ];
  return (
    <aside className="sidebar">
      <div className="logo"><I.Logo size={34} /><div><b>IT Helpdesk</b><small>AI service desk</small></div></div>
      <nav>
        {groups.map((g) => (
          <div key={g.title} className="nav-group">
            <div className="nav-title">{g.title}</div>
            {g.items.map(({ to, icon: Icon, label, end }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => "nav-btn" + (isActive ? " active" : "")} title={label}>
                <Icon width={18} height={18} /><span>{label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="side-foot">{user.name} · {user.role}</div>
    </aside>
  );
}

function Notifications() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [seen, setSeen] = useState(() => Number(localStorage.getItem("helpdesk_seen") || 0));
  const ref = useRef(null);
  const navigate = useNavigate();
  const { version } = useChat();
  useClickAway(ref, () => setOpen(false));

  useEffect(() => { api.notifications().then(setItems).catch(() => {}); }, [version, open]);
  const unread = items.filter((e) => e.id > seen).length;
  const toggle = () => {
    setOpen((o) => !o);
    if (items[0]) { localStorage.setItem("helpdesk_seen", items[0].id); setSeen(items[0].id); }
  };
  return (
    <div className="popover-wrap" ref={ref}>
      <button className={"icon-btn big" + (unread ? " notif" : "")} aria-label="notifications" onClick={toggle}><I.Bell /></button>
      {open && (
        <div className="popover wide" role="menu">
          <h4>Recent activity</h4>
          {items.length === 0 && <div className="empty small">Nothing yet.</div>}
          {items.slice(0, 8).map((e) => (
            <button key={e.id} className="pop-item" onClick={() => { setOpen(false); navigate(`/incidents/${e.incident_id}`); }}>
              <b>{e.title}</b>
              <span>{e.message}</span>
              <small>{e.actor} · {fmtDateTime(e.created_at)}</small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickAway(ref, () => setOpen(false));
  const initials = user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="popover-wrap" ref={ref}>
      <button className="avatar" onClick={() => setOpen((o) => !o)} aria-label="account menu">{initials}</button>
      {open && (
        <div className="popover" role="menu">
          <div className="pop-head"><b>{user.name}</b><small>{user.email}</small><span className="badge">{user.role}</span></div>
          <button className="pop-item row-item" onClick={logout}><I.Logout width={16} height={16} /> Sign out</button>
        </div>
      )}
    </div>
  );
}

function TopBar({ health }) {
  const [text, setText] = useState("");
  const { send, recent, forget } = useChat();
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) { e.preventDefault(); inputRef.current?.focus(); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    navigate("/chat");
    send(text.trim());
    setText("");
  };
  return (
    <header className="topbar">
      <form className="ask" onSubmit={submit}>
        <I.Search />
        <input ref={inputRef} placeholder="Ask AI assistant" value={text} onChange={(e) => setText(e.target.value)} aria-label="Ask AI assistant" />
        <kbd>/</kbd>
      </form>
      <div className="chips">
        {recent.map((t) => (
          <div key={t.id} className={"chip" + (location.pathname === `/incidents/${t.id}` ? " active" : "")} onClick={() => navigate(`/incidents/${t.id}`)}>
            <span className="p-tag">{t.priority || "P3"}</span>
            <span className={"sev sev-" + (t.priority || "P3")}>{PRIORITY_LABEL[t.priority] || "Normal"}</span>
            <span className="chip-title">{t.title}</span>
            <button className="icon-btn" onClick={(e) => { e.stopPropagation(); forget(t.id); }} aria-label="close ticket"><I.Close width={16} height={16} /></button>
          </div>
        ))}
      </div>
      <div className="top-actions">
        <span className={"dot " + (health?.status === "ok" ? "ok" : "bad")} title={health ? `API ${health.status}` : "API offline"} />
        <Notifications />
        <UserMenu />
      </div>
    </header>
  );
}

export default function Layout() {
  const [health, setHealth] = useState(null);
  const location = useLocation();
  const mainRef = useRef(null);

  useEffect(() => {
    const load = () => api.health().then(setHealth).catch(() => setHealth(null));
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => { mainRef.current?.scrollTo({ top: 0 }); }, [location.pathname]); // scroll to top on navigation

  return (
    <div className="shell">
      <Sidebar />
      <div className="main">
        <TopBar health={health} />
        <div className="content" ref={mainRef}>
          <div className="page" key={location.pathname.split("/").slice(0, 2).join("/")}>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
