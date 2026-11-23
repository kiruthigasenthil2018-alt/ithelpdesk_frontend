import React from "react";
import { api } from "../api.js";
import { useChat } from "../chat.jsx";
import ChatPanel from "../components/ChatPanel.jsx";
import StatsPanel from "../components/StatsPanel.jsx";
import { useAsync } from "../ui.jsx";

export default function ChatPage() {
  const { version, prioritize, deduce } = useChat();
  const stats = useAsync(api.stats, [version]);
  return (
    <div className="chat-page">
      <div className="toolbar">
        <h2 className="inline-title">AI assistant</h2>
        <button className="btn dark" onClick={prioritize}>Prioritize with AI</button>
        <button className="btn dark" onClick={deduce}>Smart deduce</button>
      </div>
      <div className="panels">
        <ChatPanel />
        <StatsPanel stats={stats.data} />
      </div>
    </div>
  );
}
