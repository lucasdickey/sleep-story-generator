import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Key To Sleep - Custom Sleep Stories",
  description:
    "Create personalized bedtime stories crafted just for your child",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
