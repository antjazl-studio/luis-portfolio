import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LocalizedPost } from "@/components/LocalizedPost";
import { MarkdownBody } from "@/components/MarkdownBody";
import { getPost, getVisiblePosts } from "@/lib/blog";

export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getVisiblePosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const post = getPost(params.slug);
  if (!post) return {};
  return {
    title: post.en.title,
    description: post.en.summary,
    openGraph: {
      type: "article",
      title: post.en.title,
      description: post.en.summary,
      url: `/blog/${post.slug}`,
      publishedTime: post.en.date,
    },
  };
}

export default async function PostPage(props: Props) {
  const params = await props.params;
  const post = getPost(params.slug);
  if (!post) notFound();

  const version = (v: typeof post.en) => ({
    title: v.title,
    date: v.date,
    readingTime: v.readingTime,
    content: <MarkdownBody source={v.body} />,
  });

  return <LocalizedPost en={version(post.en)} es={version(post.es)} />;
}
