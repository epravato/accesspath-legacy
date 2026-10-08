import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Accessibility Pipeline",
  description: "WCAG 2.1 AA remediation for course materials",
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
