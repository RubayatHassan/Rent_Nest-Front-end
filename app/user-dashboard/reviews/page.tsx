"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Check, Pencil, Save, Star, Trash2, X } from "lucide-react";
import {
  deleteReview,
  getMyRentals,
  RentalRequest,
  updateReview,
} from "../../../lib/api";
import { useToast } from "../../../hooks/useToast";

type ReviewDraft = { rating: number; comment: string };

export default function Page() {
  const [rentals, setRentals] = useState<RentalRequest[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ReviewDraft>({ rating: 5, comment: "" });
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const { toast, showToast, dismissToast } = useToast();

  const reviews = useMemo(() => rentals.filter((r) => r.review), [rentals]);

  const load = async () => {
    setLoading(true);
    try {
      setRentals(await getMyRentals());
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startEditing = (rental: RentalRequest) => {
    if (!rental.review) return;
    setEditingId(rental.id);
    setDraft({
      rating: rental.review.rating,
      comment: rental.review.comment || "",
    });
    setError("");
  };

  const saveReview = async (event: FormEvent, rental: RentalRequest) => {
    event.preventDefault();
    if (!rental.review) return;
    setSavingId(rental.review.id);
    setError("");
    try {
      await updateReview(rental.review.id, {
        rating: draft.rating,
        comment: draft.comment.trim(),
      });
      setEditingId(null);
      showToast({
        tone: "success",
        title: "Review updated",
        message: "Your review was updated successfully.",
      });
      await load();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Unable to update review";
      setError(message);
      showToast({ tone: "error", title: "Update failed", message });
    } finally {
      setSavingId(null);
    }
  };

  const removeReview = async (rental: RentalRequest) => {
    if (
      !rental.review ||
      !window.confirm("Are you sure you want to delete this review?")
    )
      return;
    setDeletingId(rental.review.id);
    setError("");
    try {
      await deleteReview(rental.review.id);
      showToast({
        tone: "success",
        title: "Review deleted",
        message: "Your review was removed.",
      });
      await load();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Unable to delete review";
      setError(message);
      showToast({ tone: "error", title: "Delete failed", message });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      {toast && (
        <div className={`status-toast ${toast.tone}`} role="status">
          <span className="status-toast-icon">
            <Check size={17} />
          </span>
          <div>
            <strong>{toast.title}</strong>
            <p>{toast.message}</p>
          </div>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={dismissToast}
          >
            <X size={15} />
          </button>
        </div>
      )}
      <div className="resource-head">
        <div>
          <p className="eyebrow">Your experience</p>
          <h1>My reviews</h1>
        </div>
        <span className="review-count">
          {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
        </span>
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="review-list">
        {loading ? (
          <div className="panel review-empty">Loading your reviews…</div>
        ) : reviews.length === 0 ? (
          <div className="panel review-empty">
            <Star size={28} />
            <h2>No reviews yet</h2>
            <p>
              After completing a payment, you can share your experience from My
              rentals.
            </p>
          </div>
        ) : (
          reviews.map((rental) => {
            const review = rental.review!;
            return (
              <article className="panel review-card" key={review.id}>
                <div className="review-card-top">
                  <div>
                    <p className="eyebrow">Your review</p>
                    <h2>{rental.property?.title || "Rental property"}</h2>
                    <p className="review-property-meta">
                      {rental.property?.location || "Your rented home"}
                    </p>
                  </div>
                  <span className="badge">Published</span>
                </div>
                {editingId === rental.id ? (
                  <form
                    className="review-edit-form"
                    onSubmit={(event) => saveReview(event, rental)}
                  >
                    <div className="edit-rating">
                      <span>Rating</span>
                      <div className="star-picker" aria-label="Choose a rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            className={draft.rating >= star ? "selected" : ""}
                            aria-label={`${star} star${star > 1 ? "s" : ""}`}
                            onClick={() => setDraft({ ...draft, rating: star })}
                          >
                            <Star size={23} fill="currentColor" />
                          </button>
                        ))}
                      </div>
                      <small>{draft.rating} out of 5</small>
                    </div>
                    <label htmlFor={`review-comment-${review.id}`}>
                      Comment
                    </label>
                    <textarea
                      id={`review-comment-${review.id}`}
                      value={draft.comment}
                      onChange={(event) =>
                        setDraft({ ...draft, comment: event.target.value })
                      }
                      rows={4}
                      maxLength={2000}
                    />
                    <div className="review-actions">
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                      <button
                        className="button button-small"
                        disabled={savingId === review.id}
                      >
                        <Save size={14} />
                        {savingId === review.id ? "Saving…" : "Save changes"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="review-rating">
                      <span className="review-stars">
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </span>
                      <span>{review.rating}/5</span>
                    </div>
                    <p className="review-comment">
                      {review.comment || "No comment added."}
                    </p>
                    <div className="review-card-actions">
                      <button
                        className="text-button"
                        type="button"
                        onClick={() => startEditing(rental)}
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        className="review-delete-button"
                        type="button"
                        disabled={deletingId === review.id}
                        onClick={() => removeReview(rental)}
                      >
                        <Trash2 size={14} />
                        {deletingId === review.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
