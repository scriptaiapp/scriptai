import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Reset Password",
  description: "Set a new password for your Creator AI account.",
  alternates: { canonical: "/reset-password" },
  robots: { index: false, follow: true },
});

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
