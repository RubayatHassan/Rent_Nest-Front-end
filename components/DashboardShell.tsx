"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  Home,
  Users,
  Tag,
  CalendarDays,
  CreditCard,
  Star,
  UserCircle,
  LogOut,
} from "lucide-react";
import { getLandlordRequests, getMyRentals, logout } from "../lib/api";
import type { Role } from "../lib/api";

const nav: Record<Role, { label: string; href: string; icon: typeof Home }[]> =
  {
    ADMIN: [
      { label: "Overview", href: "/admin-dashboard", icon: LayoutDashboard },
      { label: "Users", href: "/admin-dashboard/users", icon: Users },
      { label: "Properties", href: "/admin-dashboard/properties", icon: Home },
      { label: "Categories", href: "/admin-dashboard/categories", icon: Tag },
      {
        label: "Rentals",
        href: "/admin-dashboard/rentals",
        icon: CalendarDays,
      },
      {
        label: "Payments",
        href: "/admin-dashboard/payments",
        icon: CreditCard,
      },
      { label: "Reviews", href: "/admin-dashboard/reviews", icon: Star },
      { label: "Profile", href: "/admin-dashboard/profile", icon: UserCircle },
    ],
    LANDLORD: [
      { label: "Overview", href: "/landlord-dashboard", icon: LayoutDashboard },
      {
        label: "My properties",
        href: "/landlord-dashboard/properties",
        icon: Home,
      },
      {
        label: "Rental requests",
        href: "/landlord-dashboard/rentals",
        icon: CalendarDays,
      },
      {
        label: "Payments",
        href: "/landlord-dashboard/payments",
        icon: CreditCard,
      },
      {
        label: "Profile",
        href: "/landlord-dashboard/profile",
        icon: UserCircle,
      },
    ],
    TENANT: [
      { label: "Overview", href: "/user-dashboard", icon: LayoutDashboard },
      {
        label: "My rentals",
        href: "/user-dashboard/my-rentals",
        icon: CalendarDays,
      },
      { label: "Payments", href: "/user-dashboard/payments", icon: CreditCard },
      { label: "Reviews", href: "/user-dashboard/reviews", icon: Star },
      { label: "Profile", href: "/user-dashboard/profile", icon: UserCircle },
    ],
  };

export function DashboardShell({
  role,
  title,
  children,
}: {
  role: Role;
  title: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [pendingPayments, setPendingPayments] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  useEffect(() => {
    if (role === "LANDLORD") {
      getLandlordRequests()
        .then((requests) =>
          setPendingRequests(
            requests.filter((request) => request.status === "PENDING").length,
          ),
        )
        .catch(() => setPendingRequests(0));
      return;
    }
    if (role === "TENANT") {
      getMyRentals()
        .then((rentals) =>
          setPendingPayments(
            rentals.filter(
              (rental) =>
                rental.status === "APPROVED" &&
                rental.payment?.status !== "COMPLETED",
            ).length,
          ),
        )
        .catch(() => setPendingPayments(0));
    }
  }, [role, pathname]);

  const signOut = async () => {
    try {
      await logout();
    } finally {
      window.location.assign("/");
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <Link href="/" className="brand sidebar-brand">
          <span>R</span> RentNest
        </Link>
        <div className="role-pill">
          {role === "TENANT"
            ? "Tenant portal"
            : `${role[0]}${role.slice(1).toLowerCase()} portal`}
        </div>
        <nav className="side-nav">
          {nav[role].map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={pathname === href ? "active" : ""}
            >
              <Icon size={18} />
              <span className="nav-link-label">{label}</span>
              {role === "LANDLORD" &&
                href === "/landlord-dashboard/rentals" &&
                pendingRequests > 0 && (
                  <span
                    className="nav-notification"
                    aria-label={`${pendingRequests} pending rental requests`}
                  >
                    {pendingRequests > 99 ? "99+" : pendingRequests}
                  </span>
                )}
              {role === "TENANT" &&
                href === "/user-dashboard/my-rentals" &&
                pendingPayments > 0 && (
                  <span
                    className="nav-notification"
                    aria-label={`${pendingPayments} payments waiting`}
                  >
                    {pendingPayments > 99 ? "99+" : pendingPayments}
                  </span>
                )}
            </Link>
          ))}
        </nav>
        <Link href="/" className="logout">
          <LogOut size={18} /> Back to website
        </Link>
      </aside>
      <main className="dashboard-main">
        <div className="dashboard-top">
          <div>
            <p className="eyebrow">RentNest workspace</p>
            <h1>{title}</h1>
          </div>
          <div className="profile-menu" ref={menuRef}>
            <button
              type="button"
              className="avatar avatar-trigger"
              aria-label="Open profile menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {role === "ADMIN" ? "A" : role === "LANDLORD" ? "L" : "T"}
            </button>
            {menuOpen && (
              <div className="profile-dropdown">
                <p>
                  {role === "ADMIN"
                    ? "Administrator"
                    : role === "LANDLORD"
                      ? "Landlord"
                      : "Tenant"}
                </p>
                <button type="button" onClick={signOut}>
                  <LogOut size={16} /> Log out
                </button>
              </div>
            )}
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
