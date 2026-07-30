"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Heart,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { getProperties, Property } from "../../lib/api";
import { money } from "../../lib/mappers";
import { OptimizedImage } from "../../components/OptimizedImage";

export default function HomePage() {
  const [homes, setHomes] = useState<Property[]>([]);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    getProperties("limit=100")
      .then((result) =>
        setHomes(Array.isArray(result?.data) ? result.data : []),
      )
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Unable to load homes"),
      );
  }, []);

  const visibleHomes = useMemo(() => {
    const term = search.trim().toLowerCase();
    const matches = term
      ? homes.filter((home) =>
          `${home.title} ${home.location} ${home.address || ""} ${home.category?.name || ""}`
            .toLowerCase()
            .includes(term),
        )
      : homes;
    return matches.slice(0, 3);
  }, [homes, search]);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    document
      .getElementById("featured-homes")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const faqs = [
    [
      "How do I find a home?",
      "Search verified listings, compare the details, and send a rental request directly to the landlord.",
    ],
    [
      "Are payments transparent?",
      "Yes. Your payment status and rental activity stay visible in your tenant dashboard.",
    ],
    [
      "Can landlords list their properties?",
      "Absolutely. Create a landlord account to add, manage, and track your properties.",
    ],
  ];

  return (
    <main>
      <section className="hero modern-hero">
        <div className="hero-content">
          <div className="hero-kicker">
            <span className="hero-kicker-dot" /> Rent better. Live easier.
          </div>
          <h1>
            Find a place that feels like <em>yours.</em>
          </h1>
          <p className="hero-copy">
            Beautiful homes, trusted landlords, and a simpler rental experience
            — all in one calm place.
          </p>
          <form className="home-search" onSubmit={submitSearch}>
            <MapPin size={18} />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setQuery(event.target.value.trim());
              }}
              placeholder="Search by city or neighborhood"
              aria-label="Search by city or neighborhood"
            />
            <button className="button" type="submit">
              <Search size={16} /> Search homes
            </button>
          </form>
          <div className="hero-actions">
            <Link href="/properties" className="button">
              Explore homes <ArrowRight size={16} />
            </Link>
            <Link href="/register" className="button button-ghost">
              List your property
            </Link>
          </div>
          <div className="hero-proof">
            <div className="proof-avatars">
              <span>R</span>
              <span>N</span>
              <span>+</span>
            </div>
            <span>
              <strong>Loved by renters</strong>
              <small>Find your next chapter with confidence</small>
            </span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card">
            <div className="hero-card-label">
              <Sparkles size={14} /> Featured home
            </div>
            <div className="house">
              <i className="window" />
              <i className="window right" />
            </div>
            <div className="hero-floating-card">
              <span className="floating-icon">
                <CheckCircle2 size={16} />
              </span>
              <span>
                <strong>Verified listing</strong>
                <small>Ready for your next chapter</small>
              </span>
            </div>
          </div>
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />
        </div>
      </section>
      <div className="trust-strip modern-trust">
        <strong>Renting, made human.</strong>
        <span>
          <ShieldCheck size={16} /> Verified listings
        </span>
        <span>
          <CheckCircle2 size={16} /> Transparent payments
        </span>
        <span>
          <Heart size={16} /> Support when you need it
        </span>
      </div>
      <section className="section featured-section" id="featured-homes">
        <div className="section-head">
          <div>
            <p className="eyebrow">Curated for you</p>
            <h2>
              {query ? `Homes near “${query}”` : "Homes worth coming home to."}
            </h2>
          </div>
          <Link href="/properties" className="view-link">
            View all homes <ArrowRight size={15} />
          </Link>
        </div>
        {error ? (
          <p className="form-error">{error}</p>
        ) : visibleHomes.length ? (
          <div className="property-grid">
            {visibleHomes.map((home, index) => (
              <Link
                href={`/properties/${home.id}`}
                className="property-card modern-property-card"
                key={home.id}
              >
                <div
                  className={`property-image ${index % 3 === 1 ? "two" : index % 3 === 2 ? "three" : ""}`}
                >
                  {home.images?.[0] && (
                    <OptimizedImage
                      src={home.images[0]}
                      alt={home.title}
                      sizes="(max-width: 600px) 100vw, (max-width: 850px) 50vw, 33vw"
                    />
                  )}
                  <span className="card-badge">
                    <Sparkles size={12} /> Featured
                  </span>
                </div>
                <div className="property-info">
                  <p className="property-location">
                    <MapPin size={13} /> {home.location}
                  </p>
                  <h3>{home.title}</h3>
                  <div className="price">
                    <strong>{money(home.rentAmount)}</strong>
                    <span>
                      per month <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="panel home-empty">
            <Search size={22} />
            <p>No homes matched that search yet.</p>
            <button
              className="text-button"
              onClick={() => {
                setSearch("");
                setQuery("");
              }}
            >
              Show all homes
            </button>
          </div>
        )}
      </section>
      <section className="section soft-section">
        <div className="section-head centered-head">
          <div>
            <p className="eyebrow">The RentNest difference</p>
            <h2>Everything feels easier here.</h2>
            <p className="section-intro">
              From the first search to the first payment, we keep renting
              simple, clear, and human.
            </p>
          </div>
        </div>
        <div className="benefit-grid">
          <article className="benefit-card">
            <span className="benefit-icon green-icon">
              <ShieldCheck size={21} />
            </span>
            <h3>Homes you can trust</h3>
            <p>
              Explore thoughtful listings and clear property details before you
              reach out.
            </p>
          </article>
          <article className="benefit-card">
            <span className="benefit-icon orange-icon">
              <Sparkles size={21} />
            </span>
            <h3>Less back and forth</h3>
            <p>
              Send requests, share your needs, and keep the rental conversation
              focused.
            </p>
          </article>
          <article className="benefit-card">
            <span className="benefit-icon blue-icon">
              <CheckCircle2 size={21} />
            </span>
            <h3>Clarity at every step</h3>
            <p>
              See your requests, payments, and reviews together in one calm
              dashboard.
            </p>
          </article>
        </div>
      </section>
      <section className="section steps-section">
        <div className="section-head">
          <div>
            <p className="eyebrow">A calmer journey</p>
            <h2>From search to settled.</h2>
          </div>
          <Link href="/register" className="view-link">
            Get started <ArrowRight size={15} />
          </Link>
        </div>
        <div className="steps-grid">
          <div className="step-item">
            <span>01</span>
            <div>
              <h3>Discover</h3>
              <p>Browse homes that match the way you want to live.</p>
            </div>
          </div>
          <div className="step-item">
            <span>02</span>
            <div>
              <h3>Connect</h3>
              <p>Send a thoughtful request to the right landlord.</p>
            </div>
          </div>
          <div className="step-item">
            <span>03</span>
            <div>
              <h3>Move forward</h3>
              <p>Track approval, payment, and your new beginning.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="section faq-section">
        <div className="faq-layout">
          <div>
            <p className="eyebrow">Need to know</p>
            <h2>Questions, answered.</h2>
            <p className="section-intro">
              A few quick notes to help you feel at home before you begin.
            </p>
          </div>
          <div className="faq-list">
            {faqs.map(([question, answer], index) => (
              <div
                className={`faq-item ${openFaq === index ? "open" : ""}`}
                key={question}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span>{question}</span>
                  {openFaq === index ? (
                    <ChevronDown size={17} />
                  ) : (
                    <ChevronDown size={17} />
                  )}
                </button>
                {openFaq === index && <p>{answer}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section cta-section">
        <div className="cta-card">
          <div>
            <p className="eyebrow">Your next chapter starts here</p>
            <h2>Ready to find your place?</h2>
            <p>Take the first step toward a home that feels like yours.</p>
          </div>
          <Link href="/properties" className="button">
            Explore homes <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}
