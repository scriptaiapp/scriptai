import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import { getBlogBySlug } from "@/lib/blog-data";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = getBlogBySlug(id);

  if (!post) {
    return createMetadata({
      title: "Post Not Found",
      description: "The blog post you're looking for doesn't exist.",
    });
  }

  return createMetadata({
    title: `${post.title} | Creator AI Blog`,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      url: `/blog/${post.slug}`,
      type: "article",
      title: post.title,
      description: post.excerpt,
    },
    keywords: [
      ...post.tags,
      "Creator AI",
      "YouTube",
      "content creation",
    ],
  });
}

export default function BlogPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
