import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import "./ThreadView.css";

export default function ThreadView()
{
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [subject, setSubject] = useState("");
  const [recipient, setRecipient] = useState("");
  const nav = useNavigate();

  useEffect(() =>
  {
    async function load()
    {
      const res = await api.get(`/messages/threads/${id}`);
      setMessages(res.data);
      if (res.data.length > 0)
      {
        const first = res.data[0];
        setSubject(first.subject);
        const other =
          first.fromEmail === user.email ? first.toEmail : first.fromEmail;
        setRecipient(other);
      }
    }
    load();
  }, [id]);

  const sendReply = async (e) =>
  {
    e.preventDefault();
    await api.post("/messages/send",
    {
      threadId: id,
      email: recipient,
      subject,
      message: reply,
    });
    setReply("");
    const res = await api.get(`/messages/threads/${id}`);
    setMessages(res.data);
  };

  return (
    <div className="thread-view">
      <button className="btn-back" onClick={() => nav("/messages")}>
        ← Back
      </button>

      <h3>{subject}</h3>

      <div className="thread-messages">
        {messages.map((m) => (
          <div
            key={m._id}
            className={`thread-msg ${
              m.fromEmail === user.email ? "sent" : "received"
            }`}
          >
            <div className="msg-meta">
              <strong>{m.fromEmail === user.email ? "You" : m.fromEmail}</strong>
              <span>{new Date(m.createdAt).toLocaleString()}</span>
            </div>
            <p>{m.message}</p>
          </div>
        ))}
      </div>

      <form onSubmit={sendReply} className="reply-form">
        <textarea
          placeholder="Type your reply..."
          value={reply}
          onChange={(e) => setReply(e.target.value)}
        />
        <button type="submit" className="btn-primary">
          Send Reply
        </button>
      </form>
    </div>
  );
}