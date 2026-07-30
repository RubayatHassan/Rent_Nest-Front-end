"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Eye,
  Search,
  X,
} from "lucide-react";
import { getLandlordRequests, Payment } from "../../../lib/api";
import { money } from "../../../lib/mappers";

export default function Page() {
  const [items, setItems] = useState<Payment[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Payment | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getLandlordRequests()
      .then((requests) =>
        setItems(
          requests.flatMap((request) =>
            request.payment
              ? [{ ...request.payment, rentalRequest: request }]
              : [],
          ),
        ),
      )
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Unable to load payments",
        ),
      );
  }, []);

  const filtered = useMemo(
    () =>
      items.filter((payment) =>
        `${payment.rentalRequest?.property?.title || ""} ${payment.rentalRequest?.tenant?.name || ""} ${payment.provider} ${payment.method || ""} ${payment.status} ${payment.transactionId || ""}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [items, query],
  );

  return (
    <div>
      <div className="resource-head">
        <div>
          <p className="eyebrow">Your earnings</p>
          <h1>Payments</h1>
        </div>
        <span className="review-count">{filtered.length} payments</span>
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="panel table-panel">
        <div className="table-tools">
          <div className="search-box">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search property, tenant or status..."
            />
          </div>
          <span className="muted">{filtered.length} results</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Property</th>
              <th>Tenant</th>
              <th>Details</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((payment) => (
              <tr key={payment.id}>
                <td>
                  <b>{payment.rentalRequest?.property?.title || "Payment"}</b>
                  <br />
                  <small>
                    {payment.rentalRequest?.property?.location ||
                      "RentNest payment"}
                  </small>
                </td>
                <td>
                  {payment.rentalRequest?.tenant?.name || "Not available"}
                  <br />
                  <small>{payment.rentalRequest?.tenant?.email || ""}</small>
                </td>
                <td>
                  {payment.provider} · {payment.method || "Not available"}
                  <br />
                  <small>{payment.transactionId || "No transaction ID"}</small>
                </td>
                <td>
                  <span
                    className={`payment-status ${payment.status.toLowerCase()}`}
                  >
                    {payment.status}
                  </span>
                </td>
                <td>{money(payment.amount)}</td>
                <td>
                  <button
                    type="button"
                    className="text-button payment-view-button"
                    onClick={() => setSelected(payment)}
                  >
                    <Eye size={14} /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && (
          <div className="payment-empty">No payments found.</div>
        )}
      </div>
      {selected && (
        <div
          className="confirmation-backdrop payment-details-backdrop"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <aside
            className="payment-details-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="landlord-payment-details-title"
          >
            <div className="drawer-head">
              <div>
                <p className="eyebrow">Payment details</p>
                <h2 id="landlord-payment-details-title">
                  {selected.rentalRequest?.property?.title ||
                    "RentNest payment"}
                </h2>
              </div>
              <button
                type="button"
                className="drawer-close"
                onClick={() => setSelected(null)}
                aria-label="Close payment details"
              >
                <X size={18} />
              </button>
            </div>
            <div className="payment-detail-status">
              <span className="payment-detail-icon">
                <CheckCircle2 size={20} />
              </span>
              <div>
                <strong>{selected.status}</strong>
                <p>
                  {selected.status === "COMPLETED"
                    ? "Payment received successfully"
                    : "Payment status from the gateway"}
                </p>
              </div>
            </div>
            <div className="payment-detail-grid">
              <div>
                <span>Amount</span>
                <strong>{money(selected.amount)}</strong>
              </div>
              <div>
                <span>Provider</span>
                <strong>{selected.provider}</strong>
              </div>
              <div>
                <span>Method</span>
                <strong>{selected.method || "Not available"}</strong>
              </div>
              <div>
                <span>Paid date</span>
                <strong>
                  {selected.paidAt
                    ? new Date(selected.paidAt).toLocaleDateString("en-BD")
                    : "Not available"}
                </strong>
              </div>
              <div>
                <span>Tenant</span>
                <strong>
                  {selected.rentalRequest?.tenant?.name || "Not available"}
                </strong>
              </div>
              <div>
                <span>Tenant email</span>
                <strong>
                  {selected.rentalRequest?.tenant?.email || "Not available"}
                </strong>
              </div>
            </div>
            <div className="payment-transaction">
              <CreditCard size={16} />
              <div>
                <span>Transaction ID</span>
                <strong>{selected.transactionId || "Not available"}</strong>
              </div>
            </div>
            <div className="payment-detail-footer">
              <CalendarDays size={15} /> Created{" "}
              {selected.createdAt
                ? new Date(selected.createdAt).toLocaleDateString("en-BD")
                : "date not available"}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
