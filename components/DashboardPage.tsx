"use client";
import Link from "next/link";
import {
  ArrowUpRight,
  Bookmark,
  CreditCard,
  Home,
  Users,
  CalendarDays,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSavedHomes } from "../hooks/useSavedHomes";
import {
  getAdminPayments,
  getAdminProperties,
  getAdminRentals,
  getAdminUsers,
  getLandlordRequests,
  getMyPayments,
  getMyProperties,
  getMyRentals,
  Role,
} from "../lib/api";

type Activity = {
  title: string;
  description: string;
  timestamp?: string;
  tone: "green" | "blue" | "orange";
};

function itemTimestamp(item: unknown) {
  if (!item || typeof item !== "object") return undefined;
  const record = item as { createdAt?: string; updatedAt?: string };
  return record.createdAt || record.updatedAt;
}

function formatActivityTime(timestamp?: string) {
  if (!timestamp) return "Recent";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "Recent";
  const days = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return date.toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function recentActivities(items: Activity[]) {
  return items
    .sort(
      (a, b) =>
        new Date(b.timestamp || 0).getTime() -
        new Date(a.timestamp || 0).getTime(),
    )
    .slice(0, 3);
}

export function DashboardPage({ role }: { role: Role }) {
  const isAdmin = role === "ADMIN";
  const isLandlord = role === "LANDLORD";
  const { count: savedHomesCount } = useSavedHomes();
  const [counts, setCounts] = useState({
    users: 0,
    properties: 0,
    rentals: 0,
    payments: 0,
    reviewedHomes: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  useEffect(() => {
    const load = async () => {
      try {
        if (isAdmin) {
          const [users, properties, rentals, payments] = await Promise.all([
            getAdminUsers("limit=1"),
            getAdminProperties("limit=1"),
            getAdminRentals("limit=1"),
            getAdminPayments("limit=100"),
          ]);
          setCounts({
            users: users.meta?.total || users.data.length,
            properties: properties.meta?.total || properties.data.length,
            rentals: rentals.meta?.total || rentals.data.length,
            payments: payments.data.reduce(
              (sum, item) => sum + Number(item.amount || 0),
              0,
            ),
            reviewedHomes: 0,
          });
          setActivities(
            recentActivities([
              ...users.data.map((user) => ({
                title: `New ${user.role.toLowerCase()} registered`,
                description: `${user.name} joined the marketplace`,
                timestamp: itemTimestamp(user),
                tone: "green" as const,
              })),
              ...properties.data.map((property) => ({
                title: "New property listed",
                description: property.title,
                timestamp: itemTimestamp(property),
                tone: "blue" as const,
              })),
              ...rentals.data.map((rental) => ({
                title: `Rental request ${rental.status.toLowerCase()}`,
                description:
                  rental.property?.title || rental.tenant?.name || "Rental request",
                timestamp: itemTimestamp(rental),
                tone: "orange" as const,
              })),
              ...payments.data.map((payment) => ({
                title: `Payment ${payment.status.toLowerCase()}`,
                description: `${payment.provider} · ৳${Number(payment.amount || 0).toLocaleString("en-BD")}`,
                timestamp: itemTimestamp(payment),
                tone: "green" as const,
              })),
            ]),
          );
        } else if (isLandlord) {
          const [properties, rentals] = await Promise.all([
            getMyProperties(),
            getLandlordRequests(),
          ]);
          setCounts({
            users: 0,
            properties: properties.meta?.total || properties.data.length,
            rentals: rentals.length,
            payments: rentals.filter((item) => item.status === "ACTIVE").length,
            reviewedHomes: 0,
          });
          setActivities(
            recentActivities([
              ...properties.data.map((property) => ({
                title: "Property listed",
                description: property.title,
                timestamp: itemTimestamp(property),
                tone: "blue" as const,
              })),
              ...rentals.map((rental) => ({
                title: `Rental request ${rental.status.toLowerCase()}`,
                description:
                  rental.property?.title || rental.tenant?.name || "Rental request",
                timestamp: itemTimestamp(rental),
                tone: "orange" as const,
              })),
            ]),
          );
        } else {
          const [rentals, payments] = await Promise.all([
            getMyRentals(),
            getMyPayments(),
          ]);
          setCounts({
            users: 0,
            properties: 0,
            rentals: rentals.length,
            payments: payments.reduce(
              (sum, item) => sum + Number(item.amount || 0),
              0,
            ),
            reviewedHomes: rentals.filter((item) => Boolean(item.review))
              .length,
          });
          setActivities(
            recentActivities([
              ...rentals.map((rental) => ({
                title: `Rental ${rental.status.toLowerCase()}`,
                description: rental.property?.title || "Your rental request",
                timestamp: itemTimestamp(rental),
                tone: "blue" as const,
              })),
              ...payments.map((payment) => ({
                title: `Payment ${payment.status.toLowerCase()}`,
                description: `${payment.provider} · ৳${Number(payment.amount || 0).toLocaleString("en-BD")}`,
                timestamp: itemTimestamp(payment),
                tone: "green" as const,
              })),
            ]),
          );
        }
      } catch {
        setCounts({
          users: 0,
          properties: 0,
          rentals: 0,
          payments: 0,
          reviewedHomes: 0,
        });
        setActivities([]);
      }
    };
    load();
  }, [isAdmin, isLandlord]);
  const cards = isAdmin
    ? [
        {
          label: "Total users",
          value: counts.users.toLocaleString(),
          change: "Live from API",
          icon: Users,
        },
        {
          label: "Listed properties",
          value: counts.properties.toLocaleString(),
          change: "Live from API",
          icon: Home,
        },
        {
          label: "Active rentals",
          value: counts.rentals.toLocaleString(),
          change: "Live from API",
          icon: CalendarDays,
        },
        {
          label: "Recorded payments",
          value: `৳${counts.payments.toLocaleString()}`,
          change: "Live from API",
          icon: CreditCard,
        },
      ]
    : isLandlord
      ? [
          {
            label: "My properties",
            value: counts.properties.toLocaleString(),
            change: "Live from API",
            icon: Home,
          },
          {
            label: "Rental requests",
            value: counts.rentals.toLocaleString(),
            change: "Live from API",
            icon: CalendarDays,
          },
          {
            label: "Active requests",
            value: counts.payments.toLocaleString(),
            change: "Live from API",
            icon: CreditCard,
          },
        ]
      : [
          {
            label: "Saved homes",
            value: savedHomesCount.toLocaleString(),
            change: "Your shortlist",
            icon: Bookmark,
            href: "/user-dashboard/saved-homes",
          },
          {
            label: "Reviewed homes",
            value: counts.reviewedHomes.toLocaleString(),
            change: "Live from API",
            icon: Home,
            href: "/user-dashboard/reviews",
          },
          {
            label: "Active rentals",
            value: counts.rentals.toLocaleString(),
            change: "Live from API",
            icon: CalendarDays,
          },
          {
            label: "Total paid",
            value: `৳${counts.payments.toLocaleString()}`,
            change: "Live from API",
            icon: CreditCard,
          },
        ];
  return (
    <>
      <section className="stats-grid">
        {cards.map(({ label, value, change, icon: Icon, href }) =>
          href ? (
            <Link href={href} className="stat-card stat-card-link" key={label}>
              <div className="stat-icon">
                <Icon size={19} />
              </div>
              <p>{label}</p>
              <strong>{value}</strong>
              <small>{change}</small>
            </Link>
          ) : (
            <div className="stat-card" key={label}>
              <div className="stat-icon">
                <Icon size={19} />
              </div>
              <p>{label}</p>
              <strong>{value}</strong>
              <small>{change}</small>
            </div>
          ),
        )}
      </section>
      <section className="content-grid">
        <div className="panel large-panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Recent activity</p>
              <h2>{isAdmin ? "Platform snapshot" : "Your latest activity"}</h2>
            </div>
            <Link
              href={
                isAdmin
                  ? "/admin-dashboard/rentals"
                  : isLandlord
                    ? "/landlord-dashboard/rentals"
                    : "/user-dashboard/my-rentals"
              }
            >
              View all <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="activity-list">
            {activities.length ? (
              activities.map((activity) => (
                <div key={`${activity.title}-${activity.timestamp || activity.description}`}>
                  <span className={`activity-dot ${activity.tone}`} />
                  <div>
                    <b>{activity.title}</b>
                    <p>{activity.description}</p>
                  </div>
                  <em>{formatActivityTime(activity.timestamp)}</em>
                </div>
              ))
            ) : (
              <p className="muted">No recent activity yet.</p>
            )}
            {false && <>
            <div>
              <span className="activity-dot green" />
              <div>
                <b>
                  {isAdmin
                    ? "New landlord registered"
                    : isLandlord
                      ? "New rental request received"
                      : "Payment completed successfully"}
                </b>
                <p>
                  {isAdmin
                    ? "A new account joined the marketplace"
                    : "Today · 2 hours ago"}
                </p>
              </div>
              <em>Today</em>
            </div>
            <div>
              <span className="activity-dot blue" />
              <div>
                <b>
                  {isAdmin
                    ? "Property approved"
                    : isLandlord
                      ? "Monthly payment received"
                      : "New home recommendation"}
                </b>
                <p>Everything is up to date</p>
              </div>
              <em>Yesterday</em>
            </div>
            <div>
              <span className="activity-dot orange" />
              <div>
                <b>
                  {isAdmin ? "Review reported" : "Keep your profile updated"}
                </b>
                <p>Review your workspace for more details</p>
              </div>
              <em>2 days ago</em>
            </div>
            </>}
          </div>
        </div>
        <div className="panel welcome-panel">
          <div className="welcome-art">⌂</div>
          <p className="eyebrow">
            {role === "TENANT" ? "Find your next place" : "Keep things moving"}
          </p>
          <h2>
            {role === "TENANT"
              ? "A home that feels like yours."
              : "Your workspace, at a glance."}
          </h2>
          <p>
            {role === "TENANT"
              ? "Browse verified listings and make renting feel simple."
              : "Manage your RentNest activity from one calm, focused space."}
          </p>
          <Link
            href={
              role === "TENANT"
                ? "/properties"
                : isAdmin
                  ? "/admin-dashboard/properties"
                  : "/landlord-dashboard/properties"
            }
            className="button"
          >
            {role === "TENANT" ? "Explore properties" : "Open workspace"}
          </Link>
        </div>
      </section>
    </>
  );
}
