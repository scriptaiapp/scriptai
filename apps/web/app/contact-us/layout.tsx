import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Contact Us",
  description:
    "Get in touch with the Creator AI team. We'd love to hear your feedback, answer questions, or discuss partnerships.",
  alternates: { canonical: "/contact-us" },
  openGraph: { url: "/contact-us" },
});

export default function ContactUsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
