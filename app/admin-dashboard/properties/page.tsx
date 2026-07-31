"use client";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getAdminProperties,
  getAdminRentals,
  Property,
  updateAdminPropertyStatus,
} from "../../../lib/api";
export default function Page() {
  const [items, setItems] = useState<Property[]>([]);
  const [rentedBy, setRentedBy] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const load = () =>
    Promise.allSettled([
      getAdminProperties("limit=100"),
      getAdminRentals("status=ACTIVE&limit=100"),
    ]).then(([propertiesResult, rentalsResult]) => {
      if (propertiesResult.status === "rejected") {
        setError(
          propertiesResult.reason instanceof Error
            ? propertiesResult.reason.message
            : "Unable to load properties",
        );
        return;
      }

      setItems(propertiesResult.value.data || []);
      setError("");

      if (rentalsResult.status === "rejected") {
        setRentedBy({});
        return;
      }

      const tenants: Record<string, string> = {};
      rentalsResult.value.data.forEach((rental) => {
        const rentalRecord = rental as typeof rental & {
          propertyId?: string;
        };
        const propertyId = rental.property?.id || rentalRecord.propertyId;
        const tenantName = rental.tenant?.name || rental.tenant?.email;
        if (tenantName && propertyId) {
          if (!tenants[propertyId] || rental.status === "ACTIVE") {
            tenants[propertyId] = tenantName;
          }
        }
      });
      setRentedBy(tenants);
    });
  useEffect(() => {
    load();
  }, []);
  const status = async (id: string, value: Property["status"]) => {
    try {
      await updateAdminPropertyStatus(id, value);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to update property");
    }
  };
  const filtered = items.filter((p) =>
    `${p.title} ${p.landlord?.name || ""} ${p.category?.name || ""} ${p.location} ${rentedBy[p.id] || ""}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  return (
    <div>
      <div className="resource-head">
        <div>
          <p className="eyebrow">Marketplace</p>
          <h1>Properties</h1>
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
              placeholder="Search properties, landlords, tenants or categories..."
            />
          </div>
          <span className="muted">{filtered.length} results</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Property</th>
              <th>Landlord</th>
              <th>Category</th>
              <th>Rented by</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td>{p.landlord?.name}</td>
                <td>{p.category?.name}</td>
                <td>{p.status === "RENTED" ? rentedBy[p.id] || "—" : "—"}</td>
                <td>{p.status}</td>
                <td>
                  <select
                    value={p.status}
                    onChange={(e) =>
                      status(p.id, e.target.value as Property["status"])
                    }
                  >
                    <option>AVAILABLE</option>
                    <option>UNAVAILABLE</option>
                    <option>RENTED</option>
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
