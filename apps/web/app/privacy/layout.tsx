import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Privacy Policy",
  description:
    "Read Creator AI's privacy policy. Learn how we collect, use, and protect your data.",
  alternates: { canonical: "/privacy" },
  openGraph: { url: "/privacy" },
});

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
