import type { Review, RentalRequest, User } from "./api";
export const profileRows = (items: unknown[]) => (items as User[]).map((item) => ({ id: item.id, name: item.name, meta: `${item.email}${item.phone ? ` · ${item.phone}` : ""}`, status: item.activeStatus || "ACTIVE" }));
export const reviewRows = (items: unknown[]) => (items as RentalRequest[]).filter((item) => item.review).map((item) => ({ id: (item.review as Review).id, name: item.property.title, meta: `Your review · ${(item.review as Review).rating}/5`, status: "Published" }));
