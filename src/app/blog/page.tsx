import type { Metadata } from "next";
import { BlogIndex } from "@/components/BlogIndex";
import { getVisiblePosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — Luis Jacho Zambrano",
  description: "Notes on how I build and ship software.",
};

export default function BlogPage() {
  const posts = getVisiblePosts().map((p) => {
    const card = ({ title, summary, date, readingTime }: typeof p.en) => ({
      title,
      summary,
      date,
      readingTime,
    });
    return { slug: p.slug, en: card(p.en), es: card(p.es) };
  });
  return <BlogIndex posts={posts} />;
}
