import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./AdminNewMessage.css";

export default function AdminNewMessage() {
  const [users, setUsers] = useState([]);
  const [searchUser, setSearchUser] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const nav = useNavigate();

  // === Load all users ===
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

  // === Filter users ===
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  // === Send Message ===
  const handleSend = async (e) => {
    e.preventDefault();
    if (!selectedUser) return alert("Please select a recipient.");
    if (!subject || !message) return alert("Subject and message are required.");

    try {
      await api.post("/admin/send-email", {
        email: selectedUser.email,
        subject,
        message,
      });
      alert("✅ Message sent successfully!");
      setSelectedUser(null);
      setSubject("");
      setMessage("");
      nav("/admin/messages"); // Redirect back
    } catch (err) {
      console.error(err);
      alert("❌ Failed to send message.");
    }
  };

  return (
    <div className="admin-new-message">
      <div className="header">
        <h2>✉ Compose New Message</h2>
        <button className="btn-back" onClick={() => nav("/admin/messages")}>
          ← Back
        </button>
      </div>

      <div className="compose-container">
        {/* === User Search Section === */}
        <div className="user-search-panel">
          <h3>Select Recipient</h3>
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
          />

          <div className="user-list">
            {filteredUsers.length ? (
              filteredUsers.slice(0, 8).map((u) => (
                <div
                  key={u._id}
                  className={`user-item ${
                    selectedUser?._id === u._id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedUser(u)}
                >
                  <div className="user-avatar">
                    {u.name ? u.name[0].toUpperCase() : "?"}
                  </div>
                  <div>
                    <strong>{u.name}</strong>
                    <span>{u.email}</span>
                  </div>
                  <span className={`role-badge ${u.role}`}>{u.role}</span>
                </div>
              ))
            ) : (
              <p className="no-results">No users found.</p>
            )}
          </div>
        </div>

        {/* === Message Form Section === */}
        <div className="message-form-panel">
          <form onSubmit={handleSend}>
            {selectedUser ? (
              <div className="selected-user">
                Sending to: <strong>{selectedUser.name}</strong>{" "}
                <span>({selectedUser.email})</span>
              </div>
            ) : (
              <p className="placeholder">Select a user to begin.</p>
            )}

            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={!selectedUser}
            />

            <textarea
              rows="6"
              placeholder="Write your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={!selectedUser}
            ></textarea>

            <button
              type="submit"
              className="btn-send"
              disabled={!selectedUser}
            >
              🚀 Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
