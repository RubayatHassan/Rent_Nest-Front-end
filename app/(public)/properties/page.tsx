"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  Category,
  Property,
} from "../../../lib/api";
import { money } from "../../../lib/mappers";
import { OptimizedImage } from "../../../components/OptimizedImage";
import {
  useCategories,
  useProperties,
} from "../../../hooks/useRentNestQueries";
export default function PropertiesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ searchTerm: "", categoryId: "" });
  const [page, setPage] = useState(1);
  const { data: properties, isPending, isError } = useProperties(
    page,
    6,
    filters,
  );
  const { data: categoryResult } = useCategories();
  const homes: Property[] = Array.isArray(properties?.data)
    ? properties.data
    : [];
  const categories: Category[] = Array.isArray(categoryResult?.data)
    ? categoryResult.data
    : [];
  const totalPages = Math.max(1, properties?.meta?.totalPages || 1);
  const visibleHomes = homes;
  const search = (event: FormEvent) => {
    event.preventDefault();
    setPage(1);
    setFilters((current) => ({ ...current, searchTerm: searchTerm.trim() }));
    document
      .querySelector(".property-grid")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  );
  return (
    <main className="section">
      <div className="section-head">
        <div>
          <p className="eyebrow">Explore properties</p>
          <h2>Make room for what matters.</h2>
        </div>
        <span className="muted">
          Page {page} of {totalPages}
        </span>
      </div>
      <form
        onSubmit={search}
        className="table-tools"
        style={{ marginBottom: 24 }}
      >
        <input
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value);
          }}
          placeholder="Search location or property..."
        />
        <select
          value={filters.categoryId}
          onChange={(event) => {
            setFilters((current) => ({
              ...current,
              categoryId: event.target.value,
            }));
            setPage(1);
          }}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <button className="button button-small">Search</button>
      </form>
      {isError ? (
        <p className="form-error">Unable to load properties</p>
      ) : isPending ? (
        <div className="property-grid" aria-label="Loading properties">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div className="property-card skeleton-card" key={item} />
          ))}
        </div>
      ) : (
        <div className="property-grid">
          {visibleHomes.map((home, i) => (
            <Link
              href={`/properties/${home.id}`}
              className="property-card"
              key={home.id}
            >
              <div
                className={`property-image ${i % 3 === 1 ? "two" : i % 3 === 2 ? "three" : ""}`}
              >
                {home.images?.[0] && (
                  <OptimizedImage
                    src={home.images[0]}
                    alt={home.title}
                    sizes="(max-width: 600px) 100vw, (max-width: 850px) 50vw, 33vw"
                  />
                )}
              </div>
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
      <div className="pagination" aria-label="Property pages">
        <button
          className="button button-ghost pagination-button"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>
        <div className="pagination-pages">
          {pageNumbers.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              className={`pagination-number ${pageNumber === page ? "active" : ""}`}
              aria-current={pageNumber === page ? "page" : undefined}
              onClick={() => setPage(pageNumber)}
            >
              {pageNumber}
            </button>
          ))}
        </div>
        <button
          className="button button-ghost pagination-button"
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </main>
  );
}
