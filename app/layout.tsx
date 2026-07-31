import type { Metadata } from "next";
import "./globals.css";
import "./step-overrides.css";
import { QueryProvider } from "../components/QueryProvider";

export const metadata: Metadata = {
  title: "RentNest — Find a place to belong",
  description: "A calmer way to find and manage your next home.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
