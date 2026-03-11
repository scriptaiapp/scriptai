import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Features",
  description:
    "Explore Creator AI features: AI script writing, thumbnail generation, subtitle creation, video dubbing, story builder, research tools, and more for YouTube creators.",
  alternates: { canonical: "/features" },
  openGraph: { url: "/features" },
});

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
