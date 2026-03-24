import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Pricing",
  description:
    "Choose the perfect Creator AI plan for your YouTube channel. Free, Pro, and Enterprise tiers with AI scripts, thumbnails, dubbing, and more.",
  alternates: { canonical: "/pricing" },
  openGraph: { url: "/pricing" },
});

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
