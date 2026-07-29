"use client";

import { useEffect, useState } from "react";
import { getLandlordRequests, RentalRequest, updateLandlordRequest } from "../../../lib/api";

export default function Page() {
  const [items, setItems] = useState<RentalRequest[]>([]);
  const [error, setError] = useState("");
  const load = () => getLandlordRequests().then(setItems).catch((e) => setError(e instanceof Error ? e.message : "Unable to load requests"));
  useEffect(() => { load(); }, []);
  const update = async (id: string, status: "APPROVED" | "REJECTED") => {
    try { await updateLandlordRequest(id, status); load(); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to update request"); }
  };
  return <div><div className="resource-head"><div><p className="eyebrow">Property management</p><h1>Rental requests</h1></div></div>{error && <p className="form-error">{error}</p>}<div className="panel table-panel"><table className="data-table"><thead><tr><th>Property</th><th>Tenant</th><th>Message</th><th>Status</th><th>Action</th></tr></thead><tbody>{items.map((r) => <tr key={r.id}><td>{r.property?.title}</td><td>{r.tenant?.name}</td><td>{r.message}</td><td>{r.status}</td><td>{r.status === "PENDING" && <div className="rental-actions"><button className="text-button" onClick={() => update(r.id, "APPROVED")}>Approve</button><button className="text-button" onClick={() => update(r.id, "REJECTED")}>Reject</button></div>}</td></tr>)}</tbody></table></div></div>;
}
