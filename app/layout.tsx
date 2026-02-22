import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "TakeHomeUSA — Salary After Tax Calculator (2026)",
    template: "%s | TakeHomeUSA",
  },
  description:
    "Free salary after-tax calculator for all 50 U.S. states. Uses 2026 federal and state tax brackets, standard deduction, and FICA for single filers.",
  alternates: {
    canonical: "https://www.takehomeusa.com/",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
