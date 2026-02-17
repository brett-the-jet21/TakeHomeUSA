import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TakeHomeUSA — Take Home Pay Calculator",
  description:
    "Estimate your after-tax take-home pay by state. Simple salary calculator for all 50 states.",
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
