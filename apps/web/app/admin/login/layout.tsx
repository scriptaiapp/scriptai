import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Admin Login",
  description: "Admin access portal for Creator AI.",
  alternates: { canonical: "/admin/login" },
  openGraph: { url: "/admin/login" },
  robots: { index: false, follow: false },
});

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
