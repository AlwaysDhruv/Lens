import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import "./MessagesCenter.css";

export default function MessagesCenter() {
  const [threads, setThreads] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    api.get("/messages/threads").then((res) => setThreads(res.data));
  }, []);

  return (
    <div className="messages-center">
      <header>
        <h2>💬 Conversations</h2>
        <button className="btn-new" onClick={() => nav("/messages/new")}>
          ✉ Start New
        </button>
      </header>

      <div className="messages-list">
        {threads.length === 0 ? (
          <p>No conversations yet.</p>
        ) : (
          threads.map((t) => (
            <div
              key={t.threadId}
              className="message-card"
              onClick={() => nav(`/messages/${t.threadId}`)}
            >
              <div className="message-header">
                <strong>{t.subject}</strong>
                <span>{new Date(t.lastUpdated).toLocaleString()}</span>
              </div>
              <p className="message-body">
                {t.lastMessage.length > 80
                  ? t.lastMessage.slice(0, 80) + "..."
                  : t.lastMessage}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
