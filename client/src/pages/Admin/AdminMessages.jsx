import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./AdminMessages.css";

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [replyModal, setReplyModal] = useState({
    open: false,
    email: "",
    subject: "",
    message: "",
  });
  const [searchUser, setSearchUser] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [searchField, setSearchField] = useState("message");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAdmin, setFilterAdmin] = useState(false);

  const nav = useNavigate();

  // === Load messages ===
  useEffect(() => {
    async function loadMessages() {
      try {
        const res = await api.get("/admin/messages");
        setMessages(res.data);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    }
    loadMessages();
  }, []);

  // === Load users (optional, for future use) ===
  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await api.get("/users");
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    }
    loadUsers();
  }, []);

  // === Send reply ===
  const sendReply = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/send-email", {
        email: replyModal.email,
        subject: replyModal.subject,
        message: replyModal.message,
      });
      alert("✅ Message sent successfully!");
      setReplyModal({ open: false, email: "", subject: "", message: "" });

      const res = await api.get("/admin/messages");
      setMessages(res.data);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to send message");
    }
  };

  // === Sorting ===
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "⇅";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  // === Filter by search ===
  const filteredMessages = messages.filter((msg) => {
    const term = searchTerm.toLowerCase();
    const fieldValue = msg[searchField]?.toString().toLowerCase() || "";
    const matchesField = fieldValue.includes(term);
    const adminFilter = filterAdmin ? msg.from === "admin" : true;
    return matchesField && adminFilter;
  });

  // === Sort messages ===
  const sortedMessages = [...filteredMessages].sort((a, b) => {
    const { key, direction } = sortConfig;
    const dir = direction === "asc" ? 1 : -1;
    if (key === "createdAt") {
      return (new Date(a.createdAt) - new Date(b.createdAt)) * dir;
    }
    const aVal = (a[key] || "").toString().toLowerCase();
    const bVal = (b[key] || "").toString().toLowerCase();
    if (aVal < bVal) return -1 * dir;
    if (aVal > bVal) return 1 * dir;
    return 0;
  });

  return (
    <div className="admin-messages">
      {/* === Header === */}
      <div className="admin-messages-header">
        <h2>📨 Admin Messages Center</h2>

        <div className="admin-messages-controls">
          {/* Search Field Dropdown */}
          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
            className="search-select"
          >
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="subject">Subject</option>
            <option value="message">Message</option>
          </select>

          {/* Search Box */}
          <input
            type="text"
            placeholder={`Search by ${searchField}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Filter toggle */}
          <label className="filter-toggle">
            <input
              type="checkbox"
              checked={filterAdmin}
              onChange={() => setFilterAdmin(!filterAdmin)}
            />
            Show only Admin Messages
          </label>

          {/* ✉ New Message Button */}
          <button className="btn-new" onClick={() => nav("/admin/messages/new")}>
            ✉ New
          </button>
        </div>
      </div>

      {/* === Messages Table === */}
      {messages.length === 0 ? (
        <p style={{ color: "var(--text-color)", opacity: 0.7 }}>
          No messages found.
        </p>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th onClick={() => requestSort("from")}>
                  From {getSortIcon("from")}
                </th>
                <th onClick={() => requestSort("email")}>
                  Email {getSortIcon("email")}
                </th>
                <th onClick={() => requestSort("subject")}>
                  Subject {getSortIcon("subject")}
                </th>
                <th>Message</th>
                <th onClick={() => requestSort("createdAt")}>
                  Date {getSortIcon("createdAt")}
                </th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedMessages.map((msg) => (
                <tr
                  key={msg._id}
                  className={msg.from === "admin" ? "admin-sent-row" : ""}
                >
                  <td>{msg.from === "admin" ? "👑 Admin" : msg.name}</td>
                  <td>{msg.email}</td>
                  <td>{msg.subject || "(No subject)"}</td>
                  <td className="message-preview">{msg.message}</td>
                  <td>{new Date(msg.createdAt).toLocaleString()}</td>
                  <td>
                    {msg.from === "admin" ? (
                      <span className="sent-badge">✅ Sent</span>
                    ) : (
                      <button
                        className="btn-reply"
                        onClick={() =>
                          setReplyModal({
                            open: true,
                            email: msg.email,
                            subject: `Re: ${msg.subject || "Your message"}`,
                            message: "",
                          })
                        }
                      >
                        ✉ Reply
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* === Reply Modal === */}
      {replyModal.open && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Reply to {replyModal.email}</h3>
            <form onSubmit={sendReply}>
              <input
                type="text"
                placeholder="Subject"
                value={replyModal.subject}
                onChange={(e) =>
                  setReplyModal({ ...replyModal, subject: e.target.value })
                }
              />
              <textarea
                placeholder="Type your message..."
                rows="5"
                value={replyModal.message}
                onChange={(e) =>
                  setReplyModal({ ...replyModal, message: e.target.value })
                }
              />
              <div className="modal-buttons">
                <button type="submit" className="btn-primary">
                  Send Message
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setReplyModal({ open: false })}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
