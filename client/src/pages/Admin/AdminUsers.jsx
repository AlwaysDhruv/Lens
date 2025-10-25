import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./AdminUsers.css";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchField, setSearchField] = useState("name");
  const [selectedUser, setSelectedUser] = useState(null); // For "More" modal

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await api.get("/users");
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to load users:", err);
      }
    }
    loadUsers();
  }, []);

  // Filter users based on search
  const filteredUsers = users.filter((u) =>
    u[searchField]?.toLowerCase().includes(search.toLowerCase())
  );

  // Helper to create initials for avatars
  const getInitials = (name = "") => {
    const parts = name.split(" ");
    return parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name[0]?.toUpperCase() || "?";
  };

  return (
    <div className="admin-users">
      {/* --- Header --- */}
      <div className="admin-users-header">
        <h2>All Users</h2>
        <div className="admin-users-search">
          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
          >
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="role">Role</option>
          </select>
          <input
            type="text"
            placeholder={`Search by ${searchField}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* --- User Cards Grid --- */}
      <div className="admin-users-content">
        {filteredUsers.length ? (
          filteredUsers.map((u) => (
            <div key={u._id} className="user-card">
              <div className="user-card-header">
                <div className="user-avatar">{getInitials(u.name)}</div>
                <div className="user-info">
                  <h4>{u.name}</h4>
                  <span>{u.email}</span>
                </div>
              </div>

              <span className={`role-badge ${u.role}`}>{u.role}</span>

              <div className="user-actions">
                <button
                  className="btn-small"
                  onClick={() => setSelectedUser(u)}
                >
                  ⋯ More
                </button>
              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center", color: "#888", width: "100%" }}>
            No matching users found.
          </p>
        )}
      </div>

      {/* --- User Details Modal --- */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()} // prevent closing on inner click
          >
            <h3>User Details</h3>
            <div className="user-details">
              <p><strong>Name:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Role:</strong> {selectedUser.role}</p>
              {selectedUser.createdAt && (
                <p>
                  <strong>Joined:</strong>{" "}
                  {new Date(selectedUser.createdAt).toLocaleDateString()}
                </p>
              )}
              {selectedUser._id && (
                <p><strong>User ID:</strong> {selectedUser._id}</p>
              )}
            </div>
            <div className="modal-buttons">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
