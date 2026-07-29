"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarDays, CheckCircle2, CreditCard, Eye, Search, X } from "lucide-react";
import { confirmPayment, getAdminPayments, Payment } from "../../../lib/api";
import { money } from "../../../lib/mappers";

export default function Page() {
  const [items, setItems] = useState<Payment[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Payment | null>(null);
  const [returnStatus, setReturnStatus] = useState("");
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmingPayment, setConfirmingPayment] = useState<Payment | null>(null);

  const loadPayments = () => getAdminPayments("limit=100").then((result) => setItems(result.data || []));

  useEffect(() => {
    loadPayments().catch((err) => setError(err instanceof Error ? err.message : "Unable to load payments"));
    const params = new URLSearchParams(window.location.search);
    setReturnStatus(params.get("payment") || params.get("status") || "");
  }, []);

  const cancelPayment = async (payment: Payment) => {
    if (payment.status !== "PENDING") return;
    setCancellingId(payment.id);
    setError("");
    try {
      await confirmPayment({
        paymentId: payment.id,
        status: "FAILED",
        gatewayResponse: { source: "admin", reason: "Cancelled by admin" },
      });
      setSelected(null);
      setConfirmingPayment(null);
      await loadPayments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to cancel payment");
    } finally {
      setCancellingId(null);
    }
  };

  const filtered = useMemo(() => items.filter((payment) => `${payment.rentalRequest?.property?.title || ""} ${payment.rentalRequest?.tenant?.name || ""} ${payment.rentalRequest?.property?.landlord?.name || ""} ${payment.rentalRequest?.property?.landlord?.email || ""} ${payment.provider} ${payment.method || ""} ${payment.status} ${payment.transactionId || ""}`.toLowerCase().includes(query.toLowerCase())), [items, query]);

  return <div>
    <div className="resource-head"><div><p className="eyebrow">Finance</p><h1>Payments</h1></div><span className="review-count">{filtered.length} payments</span></div>
    {returnStatus && <div className={`payment-return-banner ${returnStatus.toLowerCase()}`}><strong>Gateway return: {returnStatus.toUpperCase()}</strong><span>Payment result received from the success/cancel callback.</span></div>}
    {error && <p className="form-error">{error}</p>}
    <div className="panel table-panel"><div className="table-tools"><div className="search-box"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search payment, tenant, landlord or status..." /></div><span className="muted">{filtered.length} results</span></div><table className="data-table"><thead><tr><th>Payment</th><th>Tenant</th><th>Landlord</th><th>Details</th><th>Status</th><th>Amount</th><th>Action</th></tr></thead><tbody>{filtered.map((payment) => <tr key={payment.id}><td><b>{payment.rentalRequest?.property?.title || payment.transactionId || "Payment"}</b><br /><small>{payment.rentalRequest?.property?.location || "RentNest payment"}</small></td><td>{payment.rentalRequest?.tenant?.name || "Not available"}<br /><small>{payment.rentalRequest?.tenant?.email || ""}</small></td><td>{payment.rentalRequest?.property?.landlord?.name || "Not available"}<br /><small>{payment.rentalRequest?.property?.landlord?.email || ""}</small></td><td>{payment.provider} · {payment.method || "—"}<br /><small>{payment.transactionId || "No transaction ID"}</small></td><td><span className={`payment-status ${payment.status.toLowerCase()}`}>{payment.status}</span></td><td>{money(payment.amount)}</td><td><button type="button" className="text-button payment-view-button" onClick={() => setSelected(payment)}><Eye size={14} /> View</button></td></tr>)}</tbody></table>{!filtered.length && <div className="payment-empty">No payments found.</div>}</div>
    {selected && <div className="confirmation-backdrop payment-details-backdrop" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><aside className="payment-details-panel" role="dialog" aria-modal="true" aria-labelledby="admin-payment-details-title"><div className="drawer-head"><div><p className="eyebrow">Admin payment details</p><h2 id="admin-payment-details-title">{selected.rentalRequest?.property?.title || "RentNest payment"}</h2></div><button type="button" className="drawer-close" onClick={() => setSelected(null)} aria-label="Close payment details"><X size={18} /></button></div><div className="payment-detail-status"><span className="payment-detail-icon"><CheckCircle2 size={20} /></span><div><strong>{selected.status}</strong><p>{selected.status === "COMPLETED" ? "Payment completed successfully" : selected.status === "FAILED" ? "Payment failed or was cancelled" : "Payment status from the gateway"}</p></div></div><div className="payment-detail-grid"><div><span>Amount</span><strong>{money(selected.amount)}</strong></div><div><span>Provider</span><strong>{selected.provider}</strong></div><div><span>Method</span><strong>{selected.method || "Not available"}</strong></div><div><span>Paid date</span><strong>{selected.paidAt ? new Date(selected.paidAt).toLocaleDateString("en-BD") : "Not available"}</strong></div><div><span>Tenant</span><strong>{selected.rentalRequest?.tenant?.name || "Not available"}</strong></div><div><span>Tenant email</span><strong>{selected.rentalRequest?.tenant?.email || "Not available"}</strong></div><div><span>Landlord</span><strong>{selected.rentalRequest?.property?.landlord?.name || "Not available"}</strong></div><div><span>Landlord email</span><strong>{selected.rentalRequest?.property?.landlord?.email || "Not available"}</strong></div></div><div className="payment-transaction"><CreditCard size={16} /><div><span>Transaction ID</span><strong>{selected.transactionId || "Not available"}</strong></div></div>{selected.gatewayResponse && <div className="payment-gateway-response"><span>Gateway response</span><pre>{JSON.stringify(selected.gatewayResponse, null, 2)}</pre></div>}<div className="payment-detail-footer"><CalendarDays size={15} /> Created {selected.createdAt ? new Date(selected.createdAt).toLocaleDateString("en-BD") : "date not available"}</div>{selected.status === "PENDING" && <button type="button" className="button payment-cancel-button" disabled={cancellingId === selected.id} onClick={() => setConfirmingPayment(selected)}>{cancellingId === selected.id ? "Cancelling…" : "Cancel payment"}</button>}</aside></div>}
    {confirmingPayment && <div className="confirmation-backdrop" role="presentation" onClick={(event) => { if (event.target === event.currentTarget && !cancellingId) setConfirmingPayment(null); }}><div className="confirmation-modal" role="dialog" aria-modal="true" aria-labelledby="cancel-payment-title"><div className="confirmation-icon"><AlertTriangle size={23} /></div><h2 id="cancel-payment-title">Cancel payment?</h2><p>This pending payment for <strong>{confirmingPayment.rentalRequest?.property?.title || "this rental"}</strong> will be marked as failed. This action cannot be undone.</p><div className="confirmation-actions"><button type="button" className="button button-ghost" disabled={Boolean(cancellingId)} onClick={() => setConfirmingPayment(null)}>Keep payment</button><button type="button" className="danger-confirm-button" disabled={Boolean(cancellingId)} onClick={() => cancelPayment(confirmingPayment)}>{cancellingId ? "Cancelling…" : "Yes, cancel payment"}</button></div></div></div>}
  </div>;
}
