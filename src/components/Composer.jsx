import React, { useEffect, useRef, useState } from "react";
import * as I from "../Icons.jsx";

const EMOJIS = ["😀", "😊", "🙂", "😅", "😂", "😕", "😟", "😡", "😭", "🙏", "👍", "👎", "👌", "🎉", "❗", "❓", "⚠️", "🔥", "💻", "🖥️", "🖨️", "📶", "🔑", "🔒", "📧", "🛠️", "⏳", "✅", "❌", "🙌"];
const MAX_FILES = 5;
const MAX_MB = 10;

export function Thumb({ file }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (!file.type.startsWith("image/")) return;
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  return url ? <img src={url} alt={file.name} /> : <span className="file-ico">📄</span>;
}

export default function Composer({ loading, onSend }) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [emoji, setEmoji] = useState(false);
  const [listening, setListening] = useState(false);
  const [err, setErr] = useState("");
  const [drag, setDrag] = useState(false);
  const fileRef = useRef(null);
  const recRef = useRef(null);
  useEffect(() => () => recRef.current?.stop(), []);

  const addFiles = (list) => {
    const next = [...files];
    for (const f of Array.from(list)) {
      if (next.length >= MAX_FILES) { setErr(`You can attach up to ${MAX_FILES} files.`); break; }
      if (f.size === 0) { setErr(`${f.name} is empty.`); continue; }
      if (f.size > MAX_MB * 1024 * 1024) { setErr(`${f.name} is larger than ${MAX_MB} MB.`); continue; }
      next.push(f); setErr("");
    }
    setFiles(next);
  };

  const toggleMic = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setErr("Voice input is not supported in this browser. Please use Chrome or Edge."); return; }
    if (listening) { recRef.current?.stop(); return; }
    const rec = new SR();
    rec.lang = "en-IN"; rec.interimResults = true; rec.continuous = false;
    const base = text ? text.trimEnd() + " " : "";
    rec.onresult = (e) => setText((base + Array.from(e.results).map((r) => r[0].transcript).join("")).slice(0, 2000));
    rec.onerror = (e) => { setListening(false); setErr(e.error === "not-allowed" ? "Microphone permission was denied." : "Voice input stopped: " + e.error); };
    rec.onend = () => setListening(false);
    recRef.current = rec; setErr(""); setListening(true); rec.start();
  };

  const submit = (e) => {
    e.preventDefault();
    if ((!text.trim() && !files.length) || loading) return;
    recRef.current?.stop();
    onSend(text.trim(), files);
    setText(""); setFiles([]); setEmoji(false); setErr("");
  };

  return (
    <div className={"composer-wrap" + (drag ? " drag" : "")}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}>
      {err && <div className="composer-err" role="alert" onClick={() => setErr("")}>{err}</div>}
      {files.length > 0 && (
        <div className="file-chips">
          {files.map((f, i) => (
            <div key={i} className="file-chip">
              <Thumb file={f} /><span title={f.name}>{f.name}</span>
              <button type="button" aria-label={`Remove ${f.name}`} onClick={() => setFiles(files.filter((_, j) => j !== i))}>×</button>
            </div>))}
        </div>
      )}
      {emoji && (
        <div className="emoji-pop" role="dialog" aria-label="Emoji picker">
          {EMOJIS.map((em) => (<button key={em} type="button" onClick={() => setText((t) => (t + em).slice(0, 2000))}>{em}</button>))}
        </div>
      )}
      <form className="composer" onSubmit={submit}>
        <input ref={fileRef} type="file" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
        <button type="button" className="icon-btn" aria-label="Attach files or images" title="Attach files or images (or drop / paste them)" onClick={() => fileRef.current.click()}><I.Paperclip /></button>
        <span className="sep" />
        <button type="button" className={"icon-btn" + (emoji ? " on" : "")} aria-label="Emoji" title="Emoji" onClick={() => setEmoji(!emoji)}><I.Smile /></button>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={listening ? "Listening… speak now" : "Describe your IT issue…"}
          aria-label="Message" maxLength={2000}
          onPaste={(e) => { if (e.clipboardData.files.length) { e.preventDefault(); addFiles(e.clipboardData.files); } }} />
        <button type="button" className={"round white" + (listening ? " mic-on" : "")} aria-label="Voice input" title="Voice input" onClick={toggleMic}><I.Mic /></button>
        <button type="submit" className="round blue" aria-label="Send" disabled={loading}><I.Send /></button>
      </form>
    </div>
  );
}
