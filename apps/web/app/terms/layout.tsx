import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Terms of Service",
  description:
    "Review Creator AI's terms of service. Understand your rights and responsibilities when using our platform.",
  alternates: { canonical: "/terms" },
  openGraph: { url: "/terms" },
});

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
