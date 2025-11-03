import React, { useEffect, useMemo, useState, useContext } from "react";
import api from "../services/api";
import socket from "../services/socket";
import { AuthContext } from "../context/AuthContext";
import "./UniversalMessages.css";

function ReplyBox({ onSend })
{
  const [text, setText] = useState("");

  return (
    <div className="reply-box">
      <textarea
        rows="3"
        placeholder="Reply..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        className="btn-primary"
        style={{ marginTop: "8px" }}
        onClick={() => {
          if (!text.trim()) return;
          onSend(text);
          setText("");
        }}
      >
        Send Reply
      </button>
    </div>
  );
}

function ComposeModal({ open, onClose, onSend, users })
{
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() =>
  {
    if (open) { setTo(""); setSubject(""); setMessage(""); }
  }, [open]);

  if (!open) return null;

  return (
    <div className="mail-modal-overlay" onClick={onClose}>
      <div className="mail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mail-modal-header">
          <h3>Compose</h3>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>

        <div className="compose-row">
          <label>To</label>
          <select value={to} onChange={(e) => setTo(e.target.value)}>
            <option value="">Select recipient…</option>
            {users.map(u => <option key={u._id} value={u._id}>{u.name} — {u.email}</option>)}
          </select>
        </div>

        <div className="compose-row">
          <label>Subject</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
        </div>

        <div className="compose-row">
          <label>Message</label>
          <textarea rows="8" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your message…" />
        </div>

        <div className="compose-actions">
          <button
            className="btn-primary"
            onClick={() =>
            {
              if (!to || !message.trim()) return;
              onSend({ receiverId: to, subject, message });
            }}
          >
            Send
          </button>
          <button className="btn-ghost" onClick={onClose}>Discard</button>
        </div>
      </div>
    </div>
  );
}

export default function UniversalMail()
{
  const { user } = useContext(AuthContext);

  const [allUsers, setAllUsers] = useState([]);
  const [mails, setMails] = useState([]);
  const [activeMail, setActiveMail] = useState(null);
  const [folder, setFolder] = useState("inbox");
  const [search, setSearch] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);

  const [sidebarWidth, setSidebarWidth] = useState(220);
  const [listWidth, setListWidth] = useState(380);

  useEffect(() =>
  {
    document.documentElement.style.setProperty("--sidebar-width", `${sidebarWidth}px`);
    document.documentElement.style.setProperty("--list-width", `${listWidth}px`);
  }, [sidebarWidth, listWidth]);

  function startSidebarResize(e)
  {
    e.preventDefault();
    document.addEventListener("mousemove", resizeSidebar);
    document.addEventListener("mouseup", stopSidebarResize);
  }
  function resizeSidebar(e) { setSidebarWidth(Math.min(Math.max(e.clientX, 120), 400)); }
  function stopSidebarResize()
  {
    document.removeEventListener("mousemove", resizeSidebar);
    document.removeEventListener("mouseup", stopSidebarResize);
  }

  function startListResize(e)
  {
    e.preventDefault();
    document.addEventListener("mousemove", resizeList);
    document.addEventListener("mouseup", stopListResize);
  }
  function resizeList(e) { setListWidth(Math.min(Math.max(e.clientX - sidebarWidth, 240), 700)); }
  function stopListResize()
  {
    document.removeEventListener("mousemove", resizeList);
    document.removeEventListener("mouseup", stopListResize);
  }

  useEffect(() =>
  {
    async function load()
    {
      const [usersRes, msgsRes] = await Promise.all([api.get("/users"), api.get("/messages")]);
      setAllUsers(usersRes.data);
      setMails(msgsRes.data);
    }
    load();

    socket.emit("register_user", user._id);
    socket.on("new_message", (msg) => setMails(prev => [msg, ...prev]));

    return () => socket.off("new_message");
  }, [user._id]);

  const counts = useMemo(() =>
  {
    const inbox = mails.filter(m => m.receiver?._id === user._id);
    const sent = mails.filter(m => m.sender?._id === user._id);
    const unreadInbox = inbox.filter(m => !m.isRead).length;
    return { inbox: inbox.length, sent: sent.length, unreadInbox };
  }, [mails, user._id]);

  const filtered = useMemo(() =>
  {
    let list = mails;
    if (folder === "inbox") list = list.filter(m => m.receiver?._id === user._id);
    if (folder === "sent") list = list.filter(m => m.sender?._id === user._id);
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(m =>
        (m.subject || "").toLowerCase().includes(s) ||
        (m.message || "").toLowerCase().includes(s)
      );
    }
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [mails, folder, search, user._id]);

  const openMail = (m) =>
  {
    setActiveMail(m);
    if (m.receiver?._id === user._id && !m.isRead)
    {
      setMails(prev => prev.map(x => x._id === m._id ? { ...x, isRead: true } : x));
      api.patch(`/messages/${m._id}/read`).catch(() => {});
    }
  };

  const sendMail = async ({ receiverId, subject, message }) =>
  {
    const res = await api.post("/messages/send", { receiverId, subject, message });
    const saved = res.data?.data || res.data;
    setMails(prev => [saved, ...prev]);
    setComposeOpen(false);
  };

  const snippet = t => (t.length > 120 ? t.slice(0, 117) + "..." : t);

  return (
<div className="mail-layout">

  <aside className="mail-sidebar">
    <button className="btn-primary" onClick={() => setComposeOpen(true)}>✉️ Compose</button>
    <nav className="mail-folders">
      <button className="folder" onClick={() => { setFolder("inbox"); setActiveMail(null); }}>
        <span className="text">Inbox</span>
        {counts.unreadInbox ? <span className="badge">{counts.unreadInbox}</span> : null}
      </button>
      <button className="folder" onClick={() => { setFolder("sent"); setActiveMail(null); }}>
        <span className="text">Sent</span>
        <span className="badge muted">{counts.sent}</span>
      </button>
      <button className="folder" onClick={() => { setFolder("all"); setActiveMail(null); }}>
        <span className="text">All</span>
        <span className="badge muted">{mails.length}</span>
      </button>
    </nav>
  </aside>

  <div className="mail-resizer" onMouseDown={startSidebarResize}></div>

  <section className="mail-list">
    <input className="mail-search" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
    <div className="mail-items">
      {filtered.map(m => (
        <div key={m._id} className="mail-item" onClick={() => openMail(m)}>
          <div className="mail-item-title">
            <span className="name">{m.sender?._id === user._id ? m.receiver?.name : m.sender?.name}</span>
            <span className="time">{new Date(m.createdAt).toLocaleString()}</span>
          </div>
          <div className="mail-item-subject">{m.subject || "(no subject)"}</div>
          <div className="mail-item-snippet">{snippet(m.message)}</div>
        </div>
      ))}
    </div>
  </section>

  <div className="mail-resizer-mid" onMouseDown={startListResize}></div>

  <section className="mail-view">
    {!activeMail ? (
      <div className="mail-view-empty">Select a message to read</div>
    ) : (
      <>
        <div className="mail-view-head">
          <div className="mail-view-subject">{activeMail.subject || "(no subject)"}</div>

          <div className="mail-view-meta">
            <div className="mail-meta-row">
              <span className="meta-label">From:</span>
              <strong>{activeMail.sender?.name}</strong>
              <span className="meta-email">&lt;{activeMail.sender?.email}&gt;</span>
            </div>

            <div className="mail-meta-row date">
              {new Date(activeMail.createdAt).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="mail-view-body">{activeMail.message}</div>

        <ReplyBox
          onSend={(msg) =>
            sendMail({
              receiverId:
                activeMail.sender?._id === user._id
                  ? activeMail.receiver?._id
                  : activeMail.sender?._id,
              subject: `Re: ${activeMail.subject || ""}`,
              message: msg,
            })
          }
        />
      </>
    )}
  </section>

  <ComposeModal open={composeOpen} onClose={() => setComposeOpen(false)} onSend={sendMail} users={allUsers.filter(u => u._id !== user._id)} />

</div>
  );
}