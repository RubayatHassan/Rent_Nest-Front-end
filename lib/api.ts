export type Role = "TENANT" | "LANDLORD" | "ADMIN";
export type PropertyStatus = "AVAILABLE" | "UNAVAILABLE" | "RENTED";
export type RentalStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  profilePhoto?: string | null;
  phone?: string | null;
  address?: string | null;
  activeStatus?: "ACTIVE" | "BLOCKED";
};

export type Category = {
  id: string;
  name: string;
  description?: string | null;
  _count?: { properties: number };
};
export type Property = {
  id: string;
  title: string;
  description: string;
  location: string;
  address?: string | null;
  rentAmount: number | string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  areaSqft?: number | null;
  amenities: string[];
  images: string[];
  status: PropertyStatus;
  category?: Category;
  landlord?: User;
  reviews?: Review[];
  _count?: { rentalRequests: number; reviews: number };
};
export type RentalRequest = {
  id: string;
  message?: string | null;
  status: RentalStatus;
  moveInDate?: string | null;
  durationMonths?: number | null;
  property: Property;
  tenant?: User;
  payment?: Payment | null;
  review?: Review | null;
  createdAt?: string;
};
export type Payment = {
  id: string;
  amount: number | string;
  provider: string;
  method?: string | null;
  status: PaymentStatus;
  transactionId?: string | null;
  paidAt?: string | null;
  rentalRequest?: RentalRequest;
  createdAt?: string;
  gatewayResponse?: { checkoutUrl?: string; [key: string]: unknown };
};
export type PaymentCheckoutResponse = {
  payment: Payment;
  paymentUrl?: string;
  stripeSessionId?: string;
  successUrl?: string;
  cancelUrl?: string;
};
export type Review = {
  id: string;
  rating: number;
  comment?: string | null;
  property?: Property;
  tenant?: User;
  rentalRequestId: string;
};
export type Meta = {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
};
export type ListResponse<T> = { data: T[]; meta?: Meta };

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function formatApiError(body: unknown) {
  if (!body || typeof body !== "object") return "Something went wrong";
  const payload = body as Record<string, unknown>;
  const values = [payload.message, payload.issues, payload.errors];
  const messages = values.flatMap((value) => {
    if (!Array.isArray(value)) return typeof value === "string" ? [value] : [];
    return value.map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "message" in item) {
        const issue = item as { message?: unknown; path?: unknown };
        const message = typeof issue.message === "string" ? issue.message : "Invalid value";
        const path = Array.isArray(issue.path) && issue.path.length ? `${issue.path.join(".")}: ` : "";
        return `${path}${message}`;
      }
      return "Invalid value";
    });
  });
  return [...new Set(messages)].join("\n") || "Something went wrong";
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });

  if (response.status === 401 && path !== "/auth/refresh-token") {
    const refreshResponse = await fetch(`${API_URL}/auth/refresh-token`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (refreshResponse.ok) {
      response = await fetch(`${API_URL}${path}`, {
        ...options,
        credentials: "include",
        cache: "no-store",
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      });
    }
  }

  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(formatApiError(body));
  // The backend returns pagination metadata beside `data`. Preserve it for
  // list endpoints while keeping the existing convenient `data` return for
  // ordinary detail/auth endpoints.
  return (body.meta ? { data: body.data, meta: body.meta } : body.data) as T;
}

export const getMe = () => api<User>("/auth/me");
export const login = (payload: { email: string; password: string }) =>
  api<{ id: string; name: string; email: string; role: Role }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const logout = () => api<null>("/auth/logout", { method: "POST" });
export const refreshToken = () => api<{ message?: string }>("/auth/refresh-token", { method: "POST" });
export const register = (payload: {
  name: string;
  email: string;
  password: string;
  role: Role;
}) =>
  api<{ user: User }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const getProperties = (query = "") =>
  api<ListResponse<Property> | Property[]>(
    `/properties${query ? `?${query}` : ""}`
  ).then((result) =>
    Array.isArray(result)
      ? { data: result }
      : {
          ...result,
          data: Array.isArray(result?.data) ? result.data : [],
        }
  );
export const getProperty = (id: string) => api<Property>(`/properties/${id}`);
export const getCategories = () =>
  api<ListResponse<Category> | Category[]>("/categories").then((result) =>
    Array.isArray(result) ? { data: result } : result,
  );
export const getCategory = (categoryId: string) => api<Category>(`/categories/${categoryId}`);
export const getMyProfile = () => api<User>("/users/me");
export type UpdateProfilePayload = {
  name?: string;
  phone?: string;
  address?: string;
  profilePhoto?: string;
};
export const updateMyProfile = (payload: UpdateProfilePayload) =>
  api<User>("/users/me", { method: "PATCH", body: JSON.stringify(payload) });
export const deleteMyProfilePhoto = () =>
  api<User>("/users/me/profile-photo", { method: "DELETE" });
export const deleteMyAccount = () => api<null>("/users/me", { method: "DELETE" });
export const getMyProperties = () =>
  api<ListResponse<Property>>("/landlord/properties");
export const getLandlordRequests = () =>
  api<RentalRequest[]>("/landlord/requests");
export const getMyRentals = () => api<RentalRequest[]>("/rentals");
export const getMyPayments = () => api<Payment[]>("/payments");
export const getAdminUsers = (query = "") =>
  api<ListResponse<User>>(`/admin/users${query ? `?${query}` : ""}`);
export const getAdminProperties = (query = "") =>
  api<ListResponse<Property>>(`/admin/properties${query ? `?${query}` : ""}`);
export const getAdminRentals = (query = "") =>
  api<ListResponse<RentalRequest>>(`/admin/rentals${query ? `?${query}` : ""}`);
export const getAdminPayments = (query = "") =>
  api<ListResponse<Payment>>(`/admin/payments${query ? `?${query}` : ""}`);
export const getAdminCategories = () =>
  api<ListResponse<Category>>("/admin/categories");
export const createCategory = (payload: { name: string; description?: string }) =>
  api<Category>("/admin/categories", { method: "POST", body: JSON.stringify(payload) });
export const updateCategory = (id: string, payload: { name?: string; description?: string }) =>
  api<Category>(`/admin/categories/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
export type PropertyPayload = { title: string; description: string; location: string; address?: string; rentAmount: number; bedrooms?: number; bathrooms?: number; areaSqft?: number; amenities?: string[]; images?: string[]; categoryId: string; status?: PropertyStatus };
export const createProperty = (payload: PropertyPayload) =>
  api<Property>("/landlord/properties", { method: "POST", body: JSON.stringify(payload) });
export const updateProperty = (id: string, payload: Partial<PropertyPayload>) =>
  api<Property>(`/landlord/properties/${id}`, { method: "PUT", body: JSON.stringify(payload) });
export const deleteProperty = (id: string) => api<null>(`/landlord/properties/${id}`, { method: "DELETE" });
export const createRentalRequest = (payload: { propertyId: string; message?: string; moveInDate?: string; durationMonths?: number }) =>
  api<RentalRequest>("/rentals", { method: "POST", body: JSON.stringify(payload) });
export const cancelRentalRequest = (id: string) => api<RentalRequest>(`/rentals/${id}/cancel`, { method: "PATCH" });
export const updateLandlordRequest = (id: string, status: "APPROVED" | "REJECTED") =>
  api<RentalRequest>(`/landlord/requests/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
export const createPayment = (payload: {
  rentalRequestId: string;
  provider: "STRIPE" | "SSLCOMMERZ";
  method?: "CARD" | "MOBILE_BANKING" | "BANK_TRANSFER";
  successUrl?: string;
  cancelUrl?: string;
}) =>
  api<Payment | PaymentCheckoutResponse>("/payments/create", { method: "POST", body: JSON.stringify(payload) });
export const confirmPayment = (payload: { paymentId?: string; transactionId?: string; status: PaymentStatus; gatewayResponse?: Record<string, unknown> }) =>
  api<Payment>("/payments/confirm", { method: "POST", body: JSON.stringify(payload) });
export const createReview = (payload: { rentalRequestId: string; rating: number; comment?: string }) =>
  api<Review>("/reviews", { method: "POST", body: JSON.stringify(payload) });
export const updateReview = (id: string, payload: { rating?: number; comment?: string }) =>
  api<Review>(`/reviews/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
export const deleteReview = (id: string) => api<Review>(`/reviews/${id}`, { method: "DELETE" });
export const updateUserStatus = (id: string, activeStatus: "ACTIVE" | "BLOCKED") =>
  api<User>(`/admin/users/${id}`, { method: "PATCH", body: JSON.stringify({ activeStatus }) });
export const updateAdminPropertyStatus = (id: string, status: PropertyStatus) =>
  api<Property>(`/admin/properties/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
export const updateAdminRentalStatus = (id: string, status: RentalStatus) =>
  api<RentalRequest>(`/admin/rentals/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
export const deleteAdminReview = (id: string) => api<Review>(`/admin/reviews/${id}`, { method: "DELETE" });
