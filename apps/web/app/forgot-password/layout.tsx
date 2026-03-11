import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Forgot Password",
  description: "Reset your Creator AI account password.",
  alternates: { canonical: "/forgot-password" },
  robots: { index: false, follow: true },
});

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
