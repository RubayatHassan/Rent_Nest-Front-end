"use client";
import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Role } from "../lib/api";
import { useCurrentUser } from "../hooks/useRentNestQueries";
export function RoleGate({
  role,
  children,
}: {
  role: Role;
  children: ReactNode;
}) {
  const router = useRouter();
  const { data: user, isPending, isError } = useCurrentUser(true);

  useEffect(() => {
    if (isError) {
      router.replace("/login");
      return;
    }
    if (!isPending && user && user.role !== role) {
      router.replace(
        user.role === "ADMIN"
          ? "/admin-dashboard"
          : user.role === "LANDLORD"
            ? "/landlord-dashboard"
            : "/user-dashboard",
      );
    }
  }, [isError, isPending, role, router, user]);

  if (isError) {
    return <div className="loading-state">Redirecting to login…</div>;
  }

  if (!isPending && user && user.role !== role) {
    return <div className="loading-state">Opening your workspace…</div>;
  }

  return !isPending && user?.role === role ? (
    <>{children}</>
  ) : (
    <div className="loading-state">Loading your workspace…</div>
  );
}
