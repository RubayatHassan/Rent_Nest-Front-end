"use client";
import { FormEvent, useEffect, useState } from "react";
import { createPayment, createReview, getMyRentals, RentalRequest } from "../../../lib/api";

const PENDING_PAYMENT_KEY = "rentnest.pendingPaymentRentalId";

export default function Page() {
  const [items, setItems] = useState<RentalRequest[]>([]);
  const [error, setError] = useState("");
  const [review, setReview] = useState<Record<string, { rating: string; comment: string }>>({});
  const [openReviewId, setOpenReviewId] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);

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
      const pendingId = params.get("rentalRequestId") || sessionStorage.getItem(PENDING_PAYMENT_KEY);
      const paymentCancelled = params.get("payment") === "cancelled" || params.get("status") === "cancelled";
      const paymentSucceeded = !paymentCancelled && (params.get("payment") === "success" || params.get("status") === "success" || Boolean(pendingId));
      const rentals = await load();

      // The payment gateway/webhook may need a moment to update the rental.
      // Refresh briefly after returning so the review form opens as soon as it is eligible.
      if (paymentSucceeded && pendingId) {
        for (let attempt = 0; attempt < 5; attempt += 1) {
          const rental = rentals.find((item) => item.id === pendingId);
          if (rental?.payment?.status === "COMPLETED") break;
          await new Promise((resolve) => window.setTimeout(resolve, 1000));
          const refreshed = await load();
          if (refreshed.find((item) => item.id === pendingId)?.payment?.status === "COMPLETED") break;
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
      const paymentUrl = checkout.paymentUrl || checkout.payment?.gatewayResponse?.checkoutUrl;
      if (!paymentUrl) throw new Error("Checkout URL was not returned by the payment API");
      sessionStorage.setItem(PENDING_PAYMENT_KEY, id);
      window.location.assign(paymentUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed");
      setPayingId(null);
    }
  };

  const submitReview = async (e: FormEvent, id: string) => {
    e.preventDefault();
    const value = review[id] || { rating: "5", comment: "" };
    try {
      await createReview({ rentalRequestId: id, rating: Number(value.rating), comment: value.comment });
      setOpenReviewId(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to submit review");
    }
  };

  return <div><div className="resource-head"><div><p className="eyebrow">Your home</p><h1>My rentals</h1></div></div>{error && <p className="form-error">{error}</p>}<div className="panel table-panel"><table className="data-table"><thead><tr><th>Property</th><th>Message</th><th>Status</th><th>Payment</th><th>Review</th></tr></thead><tbody>{items.map((r) => { const value = review[r.id] || { rating: "5", comment: "" }; const canReview = r.payment?.status === "COMPLETED" && !r.review; return <tr key={r.id}><td>{r.property?.title}</td><td>{r.message}</td><td>{r.status}</td><td>{r.status === "APPROVED" && r.payment?.status !== "COMPLETED" ? <button className="button button-small" disabled={payingId === r.id} onClick={() => pay(r.id)}>{payingId === r.id ? "Opening checkout…" : "Pay now"}</button> : r.payment?.status || "Not available"}</td><td>{canReview && openReviewId === r.id ? <form onSubmit={(e) => submitReview(e, r.id)}><select value={value.rating} onChange={(e) => setReview({ ...review, [r.id]: { ...value, rating: e.target.value } })}><option value="5">5 stars</option><option value="4">4 stars</option><option value="3">3 stars</option><option value="2">2 stars</option><option value="1">1 star</option></select><input value={value.comment} onChange={(e) => setReview({ ...review, [r.id]: { ...value, comment: e.target.value } })} placeholder="Comment" required /><button className="text-button">Submit</button></form> : r.review ? `${r.review.rating}/5: ${r.review.comment || ""}` : canReview ? <button className="text-button" onClick={() => setOpenReviewId(r.id)}>Write review</button> : "-"}</td></tr>; })}</tbody></table></div></div>;
}
