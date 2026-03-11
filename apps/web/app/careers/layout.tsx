import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Careers",
  description:
    "Join the Creator AI team! Explore open positions and help us build the future of AI-powered content creation for YouTube.",
  alternates: { canonical: "/careers" },
  openGraph: { url: "/careers" },
});

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
