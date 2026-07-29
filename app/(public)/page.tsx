"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getProperties, Property } from "../../lib/api";
import { money } from "../../lib/mappers";

export default function HomePage() {
  const [homes, setHomes] = useState<Property[]>([]);
  useEffect(() => {
    getProperties("limit=3")
      .then(result => setHomes(Array.isArray(result?.data) ? result.data : []))
      .catch(() => setHomes([]));
  }, []);
  return (
    <>
      <main>
        <section className="hero">
          <div>
            <p className="eyebrow">A better way to rent</p>
            <h1>
              Find a place to <em>belong.</em>
            </h1>
            <p className="hero-copy">
              Beautiful homes, trusted landlords, and a simpler rental
              experience — all in one calm place.
            </p>
            <div className="hero-actions">
              <Link href="/properties" className="button">
                Explore homes →
              </Link>
              <Link href="/register" className="button button-ghost">
                List your property
              </Link>
            </div>
          </div>
          <div className="hero-card">
            <div className="house">
              <i className="window" />
              <i className="window right" />
            </div>
          </div>
        </section>
        <div className="trust-strip">
          <strong>Renting, made human.</strong>
          <span>Verified listings</span>
          <span>Transparent payments</span>
          <span>Support when you need it</span>
        </div>
        <section className="section">
          <div className="section-head">
            <div>
              <p className="eyebrow">Curated for you</p>
              <h2>Homes worth coming home to.</h2>
            </div>
            <Link href="/properties" className="muted">
              View all homes →
            </Link>
          </div>
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
        </section>
      </main>
    </>
  );
}
