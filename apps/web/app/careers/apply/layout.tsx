import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Apply - Careers",
  description:
    "Apply to join the Creator AI team. Submit your application and help us build the future of AI-powered content creation.",
  alternates: { canonical: "/careers/apply" },
  openGraph: { url: "/careers/apply" },
});

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
