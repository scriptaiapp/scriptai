import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Blog",
  description:
    "Tips, guides, and insights on YouTube content creation, AI tools, scripting, and growing your channel — from the Creator AI team.",
  alternates: { canonical: "/blog" },
  openGraph: { url: "/blog" },
});

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
