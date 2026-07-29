"use client";
import { Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { categoryRows, paymentRows, paymentRowsFromRentals, propertyRows, rentalRows, userRows } from "../lib/mappers";
import { profileRows, reviewRows } from "../lib/resourceMappers";

export type ResourceRow = { id?: string; name: string; meta: string; status: string };
export type ResourceMapper = "categoryRows" | "paymentRows" | "paymentRowsFromRentals" | "propertyRows" | "rentalRows" | "userRows" | "profileRows" | "reviewRows";
const mappers: Record<ResourceMapper, (data: unknown[]) => ResourceRow[]> = { categoryRows, paymentRows, paymentRowsFromRentals, propertyRows, rentalRows, userRows, profileRows, reviewRows };
export function ResourcePage({ title, eyebrow, action, endpoint, mapRows }: { title: string; eyebrow?: string; action?: string; endpoint: string; mapRows: ResourceMapper }) {
  const [data, setData] = useState<unknown[]>([]); const [query, setQuery] = useState(""); const [error, setError] = useState("");
  useEffect(() => { api<unknown>(endpoint).then((result) => setData(Array.isArray(result) ? result : Array.isArray((result as { data?: unknown[] }).data) ? (result as { data: unknown[] }).data : [result])).catch((err) => setError(err instanceof Error ? err.message : "Unable to load data")); }, [endpoint]);
  const rows = useMemo(() => mappers[mapRows](data).filter((row) => `${row.name} ${row.meta} ${row.status}`.toLowerCase().includes(query.toLowerCase())), [data, mapRows, query]);
  return <><div className="resource-head"><div><p className="eyebrow">{eyebrow || "Workspace"}</p><h1>{title}</h1></div>{action && <button className="button" type="button"><Plus size={16}/>{action}</button>}</div><div className="panel table-panel"><div className="table-tools"><div className="search-box"><Search size={16}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search…"/></div><span className="muted">{rows.length} records</span></div>{error ? <p className="form-error">{error}</p> : <table className="data-table"><thead><tr><th>Name</th><th>Details</th><th>Status</th><th>Action</th></tr></thead><tbody>{rows.map((row, index) => <tr key={row.id || `${row.name}-${index}`}><td><b>{row.name}</b></td><td>{row.meta}</td><td><span className="badge">{row.status}</span></td><td><button className="text-button" type="button">View</button></td></tr>)}</tbody></table>}</div></>;
}
