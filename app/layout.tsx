import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "RentNest — Find a place to belong", description: "A calmer way to find and manage your next home." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
