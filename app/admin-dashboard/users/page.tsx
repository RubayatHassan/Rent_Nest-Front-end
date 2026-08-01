"use client";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { getAdminUsers, updateUserStatus, User } from "../../../lib/api";
export default function Page() {
  const [items, setItems] = useState<User[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const load = () =>
    getAdminUsers("limit=100")
      .then((r) => setItems(r.data || []))
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Unable to load users"),
      );
  useEffect(() => {
    load();
  }, []);
  const toggle = async (user: User) => {
    try {
      await updateUserStatus(
        user.id,
        user.activeStatus === "BLOCKED" ? "ACTIVE" : "BLOCKED",
      );
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to update user");
    }
  };
  const filtered = items.filter((u) =>
    `${u.name} ${u.email} ${u.phone || ""} ${u.address || ""} ${u.role} ${u.activeStatus}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <div>
      <div className="resource-head">
        <div>
          <p className="eyebrow">Administration</p>
          <h1>Users</h1>
        </div>
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="panel table-panel">
        <div className="table-tools">
          <div className="search-box">
            <Search size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users by name, email or role..."
            />
          </div>
          <span className="muted">{filtered.length} results</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>
                  <div className="user-contact-cell">
                    <div className="user-contact-row">
                      <span>Email</span>
                      <strong>{u.email}</strong>
                    </div>
                    <div className="user-contact-row">
                      <span>Phone</span>
                      <strong>{u.phone || "Not added"}</strong>
                    </div>
                    <div className="user-contact-row">
                      <span>Address</span>
                      <strong>{u.address || "Not added"}</strong>
                    </div>
                  </div>
                </td>
                <td>{u.role}</td>
                <td>{u.activeStatus}</td>
                <td>
                  <button className="text-button" onClick={() => toggle(u)}>
                    {u.activeStatus === "BLOCKED" ? "Unblock" : "Block"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
