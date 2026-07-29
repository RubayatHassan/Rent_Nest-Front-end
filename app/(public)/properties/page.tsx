"use client";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { getCategories, getProperties, Category, Property } from "../../../lib/api";
import { money } from "../../../lib/mappers";
export default function PropertiesPage() {
  const [homes, setHomes] = useState<Property[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState({ searchTerm: "", categoryId: "" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");
  const load = (nextPage = page, nextQuery = query) => {
    const params = new URLSearchParams({ page: String(nextPage), limit: "6" });
    if (nextQuery.searchTerm.trim()) params.set("searchTerm", nextQuery.searchTerm.trim());
    if (nextQuery.categoryId) params.set("categoryId", nextQuery.categoryId);
    getProperties(params.toString())
      .then(result => { setHomes(Array.isArray(result?.data) ? result.data : []); setTotalPages(result.meta?.totalPages || 1); })
      .catch(err => setError(err instanceof Error ? err.message : "Unable to load properties"));
  };
  useEffect(() => {
    getCategories().then(result => setCategories(Array.isArray(result.data) ? result.data : [])).catch(() => undefined);
  }, []);
  useEffect(() => { load(); }, [page]);
  const search = (event: FormEvent) => { event.preventDefault(); setPage(1); load(1, query); };
  return (
    <main className="section">
      <div className="section-head">
        <div>
          <p className="eyebrow">Explore properties</p>
          <h2>Make room for what matters.</h2>
        </div>
        <span className="muted">Page {page} of {totalPages}</span>
      </div>
      <form onSubmit={search} className="table-tools" style={{ marginBottom: 24 }}><input value={query.searchTerm} onChange={event => setQuery({ ...query, searchTerm: event.target.value })} placeholder="Search location or property..." /><select value={query.categoryId} onChange={event => { const nextQuery = { ...query, categoryId: event.target.value }; setQuery(nextQuery); setPage(1); load(1, nextQuery); }}><option value="">All categories</option>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select><button className="button button-small">Search</button></form>
      {error ? (
        <p className="form-error">{error}</p>
      ) : (
        <div className="property-grid">
          {homes.map((home, i) => (
            <Link
              href={`/properties/${home.id}`}
              className="property-card"
              key={home.id}
            >
              <div
                className={`property-image ${i % 3 === 1 ? "two" : i % 3 === 2 ? "three" : ""}`}
                style={
                  home.images?.[0]
                    ? {
                        backgroundImage: `url(${home.images[0]})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : undefined
                }
              />
              <div className="property-info">
                <h3>{home.title}</h3>
                <p>{home.location}</p>
                <div className="price">
                  <strong>{money(home.rentAmount)}</strong>
                  <span>per month</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      <div className="hero-actions"><button className="button button-ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><button className="button button-ghost" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button></div>
    </main>
  );
}
