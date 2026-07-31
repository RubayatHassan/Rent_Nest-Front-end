"use client";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { getMe, login } from "../../../lib/api";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [returnTo, setReturnTo] = useState<string | null>(null);

  useEffect(() => {
    const requestedPath = new URLSearchParams(window.location.search).get(
      "returnTo",
    );

    // Only allow internal paths so the login redirect cannot send users to an
    // external site.
    if (requestedPath?.startsWith("/") && !requestedPath.startsWith("//")) {
      setReturnTo(requestedPath);
    }
  }, []);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      const user = await login({
        email: String(f.get("email")),
        password: String(f.get("password")),
      });
      // Login response does not include profilePhoto, so refresh the full
      // profile before dashboard components read the cached auth user.
      try {
        const fullUser = await getMe();
        queryClient.setQueryData(["auth", "me"], fullUser);
      } catch {
        queryClient.setQueryData(["auth", "me"], user);
      }
      const destination =
        user.role === "ADMIN"
          ? "/admin-dashboard"
          : user.role === "LANDLORD"
            ? "/landlord-dashboard"
            : returnTo || "/";
      router.push(destination);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };
  return (
    <main className="auth-page">
      <div className="auth-copy">
        <Link href="/" className="brand">
          <span>R</span> RentNest
        </Link>
        <h1>Welcome back to your place.</h1>
        <p>
          Pick up where you left off. Your next chapter is closer than you
          think.
        </p>
      </div>
      <div className="auth-form-wrap">
        <form className="auth-form" onSubmit={submit}>
          <p className="eyebrow">Welcome back</p>
          <h1>Log in</h1>
          <p>Enter your details to continue.</p>
          <div className="form-group">
            <label>Email address</label>
            <input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button className="button full">Log in</button>
          <p className="muted">
            New to RentNest?{" "}
            <Link href="/register" className="nav-login">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
