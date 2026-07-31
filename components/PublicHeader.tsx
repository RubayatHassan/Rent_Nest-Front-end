"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "../lib/api";
import { useCurrentUser } from "../hooks/useRentNestQueries";
import { useQueryClient } from "@tanstack/react-query";

export function PublicHeader() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const { data: user } = useCurrentUser();

  const dashboardPath =
    user?.role === "ADMIN"
      ? "/admin-dashboard"
      : user?.role === "LANDLORD"
        ? "/landlord-dashboard"
        : "/user-dashboard";

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      queryClient.removeQueries({ queryKey: ["auth", "me"] });
      router.push("/");
      router.refresh();
    }
  };

  return (
    <header className="site-header">
      <Link href="/" className="brand">
        <span>R</span> RentNest
      </Link>
      <nav>
        <Link href="/properties">Explore homes</Link>
        {user ? (
          <>
            <Link href={dashboardPath} className="button button-small">
              Dashboard
            </Link>
            <button
              type="button"
              className="nav-login nav-button"
              style={{
                border: 0,
                background: "transparent",
                cursor: "pointer",
                padding: 0,
              }}
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href={pathname === "/" ? "/login?returnTo=/" : "/login"}
              className="nav-login"
            >
              Log in
            </Link>
            <Link href="/register" className="button button-small">
              Get started
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
