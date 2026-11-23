import React from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../ui.jsx";

const FEATURES = [
  { to: "/", icon: "🏠", name: "Home", who: "Everyone",
    what: "Your overview: new, outstanding, resolved and escalated tickets, SLA breaches, and the estimated work remaining.",
    use: "Start the day here to see what needs attention. Employees see only their own numbers; agents see the whole desk." },
  { to: "/chat", icon: "💬", name: "AI Chat", who: "Everyone",
    what: "Describe a problem in plain words. The AI classifies it, searches the IT knowledge base, answers with cited steps and creates a ticket automatically. Attach screenshots, logs or any file (paperclip), add emoji, or speak instead of typing (microphone).",
    use: "Try it before raising a ticket. Click “It worked” to close the ticket, or “Still broken” to escalate it to a human team." },
  { to: "/incidents", icon: "🎫", name: "Tickets", who: "Everyone",
    what: "A ticket (incident) is a record of one IT problem, with category, priority, status, owner, SLA deadline, comments and history.",
    use: "Search and filter tickets, open one to read the timeline, add comments, run suggested fixes, escalate, or rate the support." },
  { to: "/catalog", icon: "🧾", name: "Service catalog", who: "Everyone",
    what: "Ready-made forms for routine requests: new software, VPN access, hardware, new account, phishing report.",
    use: "Use it when you need something, not when something is broken. Each submission becomes a “request” ticket." },
  { to: "/knowledge", icon: "📚", name: "Knowledge base", who: "Everyone (upload: agents)",
    what: "The IT documents (PDF, TXT, MD) the AI learns from. Search returns matching passages with source citations.",
    use: "Find fix-it guides yourself. Agents can upload new documents so the AI gives better answers." },
  { to: "/analytics", icon: "📈", name: "Analytics", who: "Agents and admins",
    what: "Charts for tickets by category, status and day, average resolution time, SLA compliance, customer satisfaction and AI resolution rate.",
    use: "Spot recurring problems (e.g. many VPN tickets), measure how well the desk and the AI perform, and decide where to improve." },
  { to: "/admin", icon: "🛡️", name: "Admin", who: "Admins",
    what: "Manage users and roles, deactivate accounts, and check which AI providers (Gemini, Groq, OpenRouter) are configured and healthy.",
    use: "Promote someone to agent, remove access when staff leave, or see which AI provider is currently cooling down." },
];

const CONCEPTS = [
  ["Priority P1–P4", "P1 = critical (outage, security breach), P2 = high (user cannot work), P3 = normal, P4 = low / how-to. Higher priority means a shorter SLA."],
  ["SLA", "The deadline to resolve a ticket (P1 1 h, P2 4 h, P3 8 h, P4 24 h). A ticket past its deadline shows as breached."],
  ["Status", "Open → In progress → Resolved. “Escalated” means a human team has taken over."],
  ["Escalation", "Handing a ticket to a human team (Network Ops, Security, etc.) when the AI cannot find or verify an answer, or when you say the fix failed."],
  ["Suggested actions", "Safe, pre-approved fixes (flush DNS, clear cache…). Risky ones (reset password, unlock account, quarantine device) need an agent's approval."],
  ["Sources / citations", "The knowledge-base passages the AI used, shown as [1], [2]… so you can check the answer."],
  ["CSAT rating", "After a ticket closes you can rate the support from 1 to 5 stars. Analytics averages these."],
  ["Roles", "Employee: own tickets. Agent: all tickets, comments, approvals, knowledge upload, analytics. Admin: everything plus user management."],
];

export default function Help() {
  return (
    <>
      <PageHeader title="Feature guide" crumbs={[{ label: "Help" }]} />
      <p className="muted">What each part of IT Helpdesk does and when to use it.</p>
      <div className="feature-grid">
        {FEATURES.map((f) => (
          <Link key={f.name} to={f.to} className="feature">
            <span className="feature-icon">{f.icon}</span>
            <h4>{f.name}</h4>
            <span className="badge">{f.who}</span>
            <p><b>What it is:</b> {f.what}</p>
            <p><b>How to use it:</b> {f.use}</p>
          </Link>
        ))}
      </div>
      <div className="section-head"><h3>Key terms</h3></div>
      <div className="card">
        <dl className="props terms">
          {CONCEPTS.map(([k, v]) => (<React.Fragment key={k}><dt>{k}</dt><dd>{v}</dd></React.Fragment>))}
        </dl>
      </div>
    </>
  );
}
