"use client";
import { FormEvent, useEffect, useState } from "react";
import { Check, MessageSquare, Send, Star, X } from "lucide-react";
import {
  confirmPayment,
  createPayment,
  createReview,
  getMyRentals,
  RentalRequest,
} from "../../../lib/api";
import { useToast } from "../../../hooks/useToast";

const PENDING_PAYMENT_KEY = "rentnest.pendingPaymentRentalId";

export default function Page() {
  const [items, setItems] = useState<RentalRequest[]>([]);
  const [error, setError] = useState("");
  const [review, setReview] = useState<
    Record<string, { rating: string; comment: string }>
  >({});
  const [openReviewId, setOpenReviewId] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const { toast, showToast, dismissToast } = useToast();

  const load = async () => {
    try {
      const rentals = await getMyRentals();
      setItems(rentals);
      return rentals;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load rentals");
      return [];
    }
  };

  useEffect(() => {
    const loadAfterCheckout = async () => {
      const params = new URLSearchParams(window.location.search);
      const pendingId =
        params.get("rentalRequestId") ||
        sessionStorage.getItem(PENDING_PAYMENT_KEY);
      const paymentResult = (
        params.get("payment") ||
        params.get("status") ||
        ""
      ).toLowerCase();
      const paymentSucceeded =
        paymentResult === "success" || paymentResult === "completed";
      const paymentFailed =
        paymentResult === "failed" || paymentResult === "failure";
      const paymentRejected =
        paymentResult === "rejected" ||
        paymentResult === "cancelled" ||
        paymentResult === "canceled";
      const rentals = await load();

      if ((paymentSucceeded || paymentFailed || paymentRejected) && pendingId) {
        const returnedRental = rentals.find((item) => item.id === pendingId);
        const paymentId =
          params.get("paymentId") ||
          params.get("payment_id") ||
          returnedRental?.payment?.id;
        const transactionId =
          params.get("transactionId") ||
          params.get("transaction_id") ||
          undefined;
        if (paymentId) {
          try {
            await confirmPayment({
              paymentId,
              transactionId,
              status: paymentSucceeded ? "COMPLETED" : "FAILED",
              gatewayResponse: { returnStatus: paymentResult },
            });
            await load();
          } catch {
            // The payment gateway webhook may already have confirmed this payment.
          }
        }
      }

      if (paymentSucceeded)
        showToast({
          tone: "success",
          title: "Payment successful",
          message: "Your payment was completed successfully.",
        });
      if (paymentFailed)
        showToast({
          tone: "error",
          title: "Payment failed",
          message: "Your payment could not be completed. Please try again.",
        });
      if (paymentRejected)
        showToast({
          tone: "warning",
          title: "Payment rejected",
          message: "The payment was cancelled or rejected by the gateway.",
        });

      // The payment gateway/webhook may need a moment to update the rental.
      // Refresh briefly after returning so the review form opens as soon as it is eligible.
      if ((paymentSucceeded || paymentFailed || paymentRejected) && pendingId) {
        if (!paymentSucceeded) {
          sessionStorage.removeItem(PENDING_PAYMENT_KEY);
          window.history.replaceState({}, "", "/user-dashboard/my-rentals");
          return;
        }
        for (let attempt = 0; attempt < 5; attempt += 1) {
          const rental = rentals.find((item) => item.id === pendingId);
          if (rental?.payment?.status === "COMPLETED") break;
          await new Promise((resolve) => window.setTimeout(resolve, 1000));
          const refreshed = await load();
          if (
            refreshed.find((item) => item.id === pendingId)?.payment?.status ===
            "COMPLETED"
          )
            break;
        }
        setOpenReviewId(pendingId);
        sessionStorage.removeItem(PENDING_PAYMENT_KEY);
        window.history.replaceState({}, "", "/user-dashboard/my-rentals");
      }
    };
    loadAfterCheckout();
  }, []);

  const pay = async (id: string) => {
    setError("");
    setPayingId(id);
    try {
      const returnPath = "/user-dashboard/my-rentals";
      const successUrl = `${window.location.origin}${returnPath}?payment=success&rentalRequestId=${encodeURIComponent(id)}`;
      const cancelUrl = `${window.location.origin}${returnPath}?payment=cancelled&rentalRequestId=${encodeURIComponent(id)}`;
      const result = await createPayment({
        rentalRequestId: id,
        provider: "STRIPE",
        method: "CARD",
        successUrl,
        cancelUrl,
      });
      const checkout = "payment" in result ? result : { payment: result };
      const paymentUrl =
        checkout.paymentUrl || checkout.payment?.gatewayResponse?.checkoutUrl;
      if (!paymentUrl)
        throw new Error("Checkout URL was not returned by the payment API");
      sessionStorage.setItem(PENDING_PAYMENT_KEY, id);
      window.location.assign(paymentUrl);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Payment failed";
      setError(message);
      showToast({ tone: "error", title: "Payment failed", message });
      setPayingId(null);
    }
  };

  const submitReview = async (e: FormEvent, id: string) => {
    e.preventDefault();
    const value = review[id] || { rating: "5", comment: "" };
    try {
      await createReview({
        rentalRequestId: id,
        rating: Number(value.rating),
        comment: value.comment,
      });
      setOpenReviewId(null);
      showToast({
        tone: "success",
        title: "Review submitted",
        message: "Thanks for sharing your experience.",
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to submit review");
    }
  };

  return (
    <div>
      {toast && (
        <div className={`status-toast ${toast.tone}`} role="status">
          <span className="status-toast-icon">
            {toast.tone === "success" ? <Check size={17} /> : <X size={17} />}
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
          <p className="eyebrow">Your home</p>
          <h1>My rentals</h1>
        </div>
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="panel table-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Property</th>
              <th>Message</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Review</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => {
              const value = review[r.id] || { rating: "5", comment: "" };
              const canReview = r.payment?.status === "COMPLETED" && !r.review;
              return (
                <tr key={r.id}>
                  <td>{r.property?.title}</td>
                  <td>{r.message}</td>
                  <td>{r.status}</td>
                  <td>
                    {r.status === "APPROVED" &&
                    r.payment?.status !== "COMPLETED" ? (
                      <button
                        className="button button-small"
                        disabled={payingId === r.id}
                        onClick={() => pay(r.id)}
                      >
                        {payingId === r.id ? "Opening checkout…" : "Pay now"}
                      </button>
                    ) : (
                      <span
                        className={`payment-status ${r.payment?.status?.toLowerCase() || "none"}`}
                      >
                        {r.payment?.status || "Not available"}
                      </span>
                    )}
                  </td>
                  <td>
                    {canReview && openReviewId === r.id ? (
                      <form
                        className="review-form"
                        onSubmit={(e) => submitReview(e, r.id)}
                      >
                        <div className="review-form-head">
                          <span className="review-icon">
                            <MessageSquare size={17} />
                          </span>
                          <div>
                            <strong>How was your stay?</strong>
                            <small>Your feedback helps other renters.</small>
                          </div>
                        </div>
                        <div
                          className="star-picker"
                          aria-label="Choose a rating"
                        >
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              className={
                                Number(value.rating) >= star ? "selected" : ""
                              }
                              aria-label={`${star} star${star > 1 ? "s" : ""}`}
                              onClick={() =>
                                setReview({
                                  ...review,
                                  [r.id]: { ...value, rating: String(star) },
                                })
                              }
                            >
                              <Star size={24} fill="currentColor" />
                            </button>
                          ))}
                        </div>
                        <span className="rating-label">
                          {value.rating} out of 5
                        </span>
                        <textarea
                          value={value.comment}
                          onChange={(e) =>
                            setReview({
                              ...review,
                              [r.id]: { ...value, comment: e.target.value },
                            })
                          }
                          placeholder="Tell us what made this home feel right…"
                          rows={4}
                          required
                        />
                        <div className="review-actions">
                          <button
                            type="button"
                            className="text-button"
                            onClick={() => setOpenReviewId(null)}
                          >
                            Cancel
                          </button>
                          <button className="button button-small">
                            <Send size={14} /> Submit review
                          </button>
                        </div>
                      </form>
                    ) : r.review ? (
                      <div className="review-summary">
                        <span className="review-stars">
                          {"★".repeat(r.review.rating)}
                          {"☆".repeat(5 - r.review.rating)}
                        </span>
                        <span>{r.review.comment || "No comment"}</span>
                      </div>
                    ) : canReview ? (
                      <button
                        className="text-button"
                        onClick={() => setOpenReviewId(r.id)}
                      >
                        Write review
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
