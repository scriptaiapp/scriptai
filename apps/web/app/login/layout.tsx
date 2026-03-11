import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Log In",
  description:
    "Log in to Creator AI and access your personalized YouTube content creation dashboard.",
  alternates: { canonical: "/login" },
  openGraph: { url: "/login" },
  robots: { index: false, follow: true },
});

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
