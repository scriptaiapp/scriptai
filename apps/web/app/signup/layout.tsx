import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Sign Up",
  description:
    "Create your free Creator AI account and start generating AI-powered scripts, thumbnails, and subtitles for YouTube.",
  alternates: { canonical: "/signup" },
  openGraph: { url: "/signup" },
});

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
