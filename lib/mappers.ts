import type { Category, Payment, Property, RentalRequest, User } from "./api";
export const money = (value: number | string | undefined) => `৳${Number(value || 0).toLocaleString("en-BD")}`;
export const propertyRows = (items: unknown[]) => (items as Property[]).map((item) => ({ id: item.id, name: item.title, meta: `${item.location} · ${money(item.rentAmount)}/mo`, status: item.status }));
export const rentalRows = (items: unknown[]) => (items as RentalRequest[]).map((item) => ({ id: item.id, name: item.property?.title || item.tenant?.name || "Rental request", meta: `${item.property?.location || ""} · ${item.status}`, status: item.status }));
export const paymentRows = (items: unknown[]) => (items as Payment[]).map((item) => ({ id: item.id, name: item.rentalRequest?.property?.title || item.transactionId || "Payment", meta: `${item.provider} · ${money(item.amount)}`, status: item.status }));
export const paymentRowsFromRentals = (items: unknown[]) => paymentRows((items as RentalRequest[]).flatMap((item) => item.payment ? [item.payment] : []));
export const userRows = (items: unknown[]) => (items as User[]).map((item) => ({ id: item.id, name: item.name, meta: `${item.email} · ${item.role}`, status: item.activeStatus || "ACTIVE" }));
export const categoryRows = (items: unknown[]) => (items as Category[]).map((item) => ({ id: item.id, name: item.name, meta: `${item._count?.properties || 0} properties`, status: "Active" }));
