"use client";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getAdminRentals,
  RentalRequest,
  RentalStatus,
  updateAdminRentalStatus,
} from "../../../lib/api";
export default function Page() {
  const [items, setItems] = useState<RentalRequest[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const load = () =>
    getAdminRentals("limit=100")
      .then((r) => setItems(r.data || []))
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Unable to load rentals"),
      );
  useEffect(() => {
    load();
  }, []);
  const update = async (id: string, status: RentalStatus) => {
    try {
      await updateAdminRentalStatus(id, status);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to update rental");
    }
  };
  const filtered = items.filter((r) =>
    `${r.property?.title || ""} ${r.tenant?.name || ""} ${r.status}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <div>
      <div className="resource-head">
        <div>
          <p className="eyebrow">Rental operations</p>
          <h1>Rentals</h1>
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
              placeholder="Search rentals by property, tenant or status..."
            />
          </div>
          <span className="muted">{filtered.length} results</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Property</th>
              <th>Tenant</th>
              <th>Status</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td>{r.property?.title}</td>
                <td>{r.tenant?.name}</td>
                <td>{r.status}</td>
                <td>
                  <select
                    value={r.status}
                    onChange={(e) =>
                      update(r.id, e.target.value as RentalStatus)
                    }
                  >
                    <option>PENDING</option>
                    <option>APPROVED</option>
                    <option>REJECTED</option>
                    <option>ACTIVE</option>
                    <option>COMPLETED</option>
                    <option>CANCELLED</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
