import React, { useEffect, useState, useContext } from "react";
import api from "../services/api";
import socket from "../services/socket";
import { AuthContext } from "../context/AuthContext";
import "./UniversalMessages.css";

export default function UniversalMessages() {
  const { user } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedUserDisplay, setSelectedUserDisplay] = useState("");

  const [newMsg, setNewMsg] = useState({
    receiverId: "",
    subject: "",
    message: "",
  });

  // Load users + messages & enable real-time updates
  useEffect(() => {
    async function load() {
      try {
        const [msgRes, usersRes] = await Promise.all([
          api.get("/messages"),
          api.get("/users"),
        ]);

        setUsers(usersRes.data);
        setFilteredUsers(usersRes.data);
        setMessages(msgRes.data);
      } catch (err) {
        console.error("❌ Load error:", err);
      }
    }
    load();

    socket.emit("register_user", user._id);

    socket.on("new_message", (msg) => {
      setMessages((prev) => [msg, ...prev]);
    });

    return () => socket.off("new_message");
  }, [user._id]);


  // Search filter
  useEffect(() => {
    const s = search.toLowerCase();
    setFilteredUsers(
      users.filter(
        (u) =>
          u.name.toLowerCase().includes(s) ||
          u.email.toLowerCase().includes(s) ||
          u.role.toLowerCase().includes(s)
      )
    );
  }, [search, users]);


  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.receiverId || !newMsg.message.trim()) return;
    await api.post("/messages/send", newMsg);
    setNewMsg({ receiverId: "", subject: "", message: "" });
    setSelectedUserDisplay("");
  };

  return (
    <div className="universal-msg-center">
      <h2>📨 Messaging Center</h2>

      {/* Recipient Search Field */}
      <div className="recipient-box">
        <input
          type="text"
          placeholder="Search recipient by name, email, or role..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
        />

        {showSuggestions && filteredUsers.length > 0 && (
          <div className="suggestion-list">
            {filteredUsers.map((u) => (
              <div
                key={u._id}
                className="suggestion-item"
                onClick={() => {
                  setNewMsg({ ...newMsg, receiverId: u._id });
                  setSelectedUserDisplay(`${u.name} (${u.role})`);
                  setSearch("");
                  setShowSuggestions(false);
                }}
              >
                <strong>{u.name}</strong> <span>({u.role})</span>
                <div className="email">{u.email}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected User Display */}
      {selectedUserDisplay && (
        <div className="selected-user-display">
          To: <span>{selectedUserDisplay}</span>
        </div>
      )}

      {/* Message Composer */}
      <div className="composer">
        <input
          type="text"
          placeholder="Subject"
          value={newMsg.subject}
          onChange={(e) => setNewMsg({ ...newMsg, subject: e.target.value })}
        />

        <textarea
          placeholder="Type your message..."
          value={newMsg.message}
          onChange={(e) => setNewMsg({ ...newMsg, message: e.target.value })}
        />

        <button onClick={sendMessage}>Send</button>
      </div>

      {/* Message Feed */}
      <div className="msg-feed">
        {messages.map((m) => (
          <div key={m._id} className="msg-card">
            <strong>{m.subject || "(no subject)"}</strong>
            <p>{m.message}</p>
            <small>
              {m.sender?.name} → {m.receiver?.name} (
              {new Date(m.createdAt).toLocaleTimeString()})
            </small>
          </div>
        ))}
      </div>
    </div>
  );
}
