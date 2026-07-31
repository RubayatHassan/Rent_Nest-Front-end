"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getCategories,
  getLandlordRequests,
  getMe,
  getMyRentals,
  getProperties,
  hasStoredAccessToken,
} from "../lib/api";

export function useCurrentUser(required = false) {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
    staleTime: 5 * 60_000,
    retry: false,
    enabled: required || hasStoredAccessToken(),
  });
}

export function useProperties(
  page = 1,
  limit = 12,
  filters: { searchTerm?: string; categoryId?: string } = {},
) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (filters.searchTerm) params.set("searchTerm", filters.searchTerm);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);

  return useQuery({
    queryKey: ["properties", page, limit, filters],
    queryFn: () => getProperties(params.toString()),
    placeholderData: (previous) => previous,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 10 * 60_000,
  });
}

export function useDashboardNotificationData(
  role: "TENANT" | "LANDLORD" | "ADMIN",
) {
  return useQuery({
    queryKey: ["dashboard-notifications", role],
    queryFn: role === "TENANT" ? getMyRentals : getLandlordRequests,
    enabled: role !== "ADMIN",
    staleTime: 60_000,
    refetchOnMount: "always",
  });
}
