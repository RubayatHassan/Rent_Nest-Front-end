"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Bookmark, ChevronDown, ChevronUp, Star } from "lucide-react";
import {
  createRentalRequest,
  getProperty,
  Property,
} from "../../../../lib/api";
import { money } from "../../../../lib/mappers";
import { useSavedHomes } from "../../../../hooks/useSavedHomes";
import { OptimizedImage } from "../../../../components/OptimizedImage";
import { useCurrentUser } from "../../../../hooks/useRentNestQueries";

export default function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [message, setMessage] = useState("");
  const [duration, setDuration] = useState("12");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const isAuthenticated = isUserLoading ? null : Boolean(user);
  const isTenant = user?.role === "TENANT";
  const [showReviews, setShowReviews] = useState(false);
  const { isSaved, toggle: toggleSaved } = useSavedHomes();

  useEffect(() => {
    if (id)
      getProperty(id)
        .then(setProperty)
        .catch((err) =>
          setError(
            err instanceof Error ? err.message : "Unable to load property",
          ),
        );
  }, [id]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await createRentalRequest({
        propertyId: id,
        message,
        durationMonths: Number(duration),
      });
      setSuccess("Rental request submitted successfully.");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  if (error && !property)
    return (
      <main className="section">
        <p className="form-error">{error}</p>
      </main>
    );
  if (!property)
    return (
      <main className="section">
        <p className="muted">Loading property…</p>
      </main>
    );

  const reviews = property.reviews || [];
  const saved = isSaved(property.id);
  const averageRating = reviews.length
    ? (
        reviews.reduce((total, review) => total + review.rating, 0) /
        reviews.length
      ).toFixed(1)
    : "0.0";

  return (
    <main className="section">
      <Link href="/properties" className="muted">
        ← Back to properties
      </Link>
      <div className="detail-grid">
        <div>
          <div className="property-image detail-image">
            {property.images?.[0] && (
              <OptimizedImage
                src={property.images[0]}
                alt={property.title}
                priority
                sizes="(max-width: 850px) 100vw, 50vw"
              />
            )}
          </div>
          {property.images?.length > 1 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 12,
                marginTop: 12,
              }}
            >
              {property.images.slice(1).map((image) => (
                <div
                  key={image}
                  className="property-image"
                  style={{ height: 150, borderRadius: 12 }}
                >
                  <OptimizedImage
                    src={image}
                    alt={`${property.title} photo`}
                    sizes="(max-width: 850px) 50vw, 25vw"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <p className="eyebrow">
            {property.category?.name || "Featured home"}
          </p>
          <h1 className="detail-title">{property.title}</h1>
          <p className="hero-copy">
            {property.location}
            {property.address ? ` · ${property.address}` : ""}
          </p>
          <p className="muted">{property.description}</p>
          {property.landlord?.name && (
            <div className="landlord-card">
              <div className="landlord-avatar">
                {property.landlord.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="eyebrow">Listed by</p>
                <strong>{property.landlord.name}</strong>
                <p className="muted">Property landlord</p>
              </div>
            </div>
          )}
          <div className="price detail-price">
            <strong>{money(property.rentAmount)}</strong>
            <span>per month</span>
            {isAuthenticated === true && isTenant && (
              <button
                type="button"
                className={`save-home-button ${saved ? "saved" : ""}`}
                onClick={() => toggleSaved(property)}
              >
                <Bookmark size={16} fill={saved ? "currentColor" : "none"} />{" "}
                {saved ? "Saved" : "Save home"}
              </button>
            )}
          </div>
          <div className="panel property-facts">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 16,
              }}
            >
              <div>
                <strong>{property.bedrooms ?? "—"}</strong>
                <p className="muted">Bedrooms</p>
              </div>
              <div>
                <strong>{property.bathrooms ?? "—"}</strong>
                <p className="muted">Bathrooms</p>
              </div>
              <div>
                <strong>
                  {property.areaSqft ? `${property.areaSqft} ft²` : "—"}
                </strong>
                <p className="muted">Area</p>
              </div>
            </div>
          </div>
          {property.amenities?.length > 0 && (
            <div className="amenities-block">
              <p className="eyebrow">Amenities</p>
              <div className="amenities-list">
                {property.amenities.map((amenity) => (
                  <span className="badge" key={amenity}>
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="tenant-reviews-section">
            <button
              type="button"
              className="tenant-reviews-toggle"
              onClick={() => setShowReviews((current) => !current)}
            >
              <span>
                <Star size={17} fill="currentColor" /> Tenant reviews{" "}
                <b>({reviews.length})</b>
              </span>
              <span className="tenant-reviews-summary">
                {reviews.length ? `${averageRating}/5` : "No reviews yet"}{" "}
                {showReviews ? (
                  <ChevronUp size={17} />
                ) : (
                  <ChevronDown size={17} />
                )}
              </span>
            </button>
            {showReviews && (
              <div className="tenant-reviews-list">
                {reviews.length ? (
                  reviews.map((review) => (
                    <article className="tenant-review-card" key={review.id}>
                      <div className="tenant-review-top">
                        <strong>{review.tenant?.name || "Tenant"}</strong>
                        <span className="review-stars">
                          {"★".repeat(review.rating)}
                          {"☆".repeat(5 - review.rating)}
                        </span>
                      </div>
                      <p>{review.comment || "No comment added."}</p>
                    </article>
                  ))
                ) : (
                  <p className="tenant-reviews-empty">
                    No tenant reviews have been posted for this property yet.
                  </p>
                )}
              </div>
            )}
          </div>
          {isAuthenticated === false && (
            <Link
              href={`/login?returnTo=${encodeURIComponent(`/properties/${id}`)}`}
              className="button"
            >
              Book this property
            </Link>
          )}
          {isTenant && (
            <form className="panel" onSubmit={submit}>
              <h2>Request this property</h2>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Write a message to the landlord"
                required
              />
              <label htmlFor="duration-months">Duration (months)</label>
              <input
                id="duration-months"
                type="number"
                min="1"
                max="120"
                step="1"
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                aria-label="Duration in months"
              />
              <button className="button" type="submit" disabled={submitting}>
                {submitting ? "Sending request…" : "Send rental request"}
              </button>
              {success && <p className="success-message">{success}</p>}
              {error && <p className="form-error">{error}</p>}
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
