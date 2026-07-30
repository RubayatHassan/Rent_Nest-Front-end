"use client";
import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe, Role } from "../lib/api";
export function RoleGate({
  role,
  children,
}: {
  role: Role;
  children: ReactNode;
}) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    getMe()
      .then((user) => {
        if (user.role !== role) {
          router.replace(
            user.role === "ADMIN"
              ? "/admin-dashboard"
              : user.role === "LANDLORD"
                ? "/landlord-dashboard"
                : "/user-dashboard",
          );
        } else setAllowed(true);
      })
      .catch(() => router.replace("/login"));
  }, [role, router]);
  return allowed ? (
    <>{children}</>
  ) : (
    <div className="loading-state">Loading your workspace…</div>
  );
}
