"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export type Article = {
  title:        string;
  summary:      string;
  category:     string;
  date:         string;
  source:       string;
  url:          string;
  slug:         string;
  thumbnail?:   string;
  fullContent?: string;
};

export function BlogCard({ article, index }: { article: Article; index: number }) {
  return (
    <Link href={`/blog/${article.slug}`} className="block">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.07 }}
        className="flex items-start py-6 border-b border-white/[0.06] hover:bg-[#0f0f0f] transition-colors duration-150 cursor-pointer"
      >
        {/* Left */}
        <div className="flex-1 min-w-0">
          <span className="inline-block text-[10px] uppercase tracking-wider text-cyan-400 border border-cyan-400/20 px-2 py-0.5 rounded-full mb-2">
            {article.category || "Tech"}
          </span>
          <h3 className="text-[15px] font-medium text-white leading-snug mb-1 pr-4">
            {article.title}
          </h3>
          <p className="text-[13px] text-neutral-500 leading-relaxed line-clamp-2 pr-4">
            {article.summary}
          </p>
          <p className="mt-2 text-[12px] text-neutral-600">
            {article.source} · {article.date}
          </p>
        </div>

        {/* Right — thumbnail */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {article.thumbnail && (
          <img
            src={article.thumbnail}
            alt=""
            className="w-24 h-16 rounded-md object-cover ml-6 flex-shrink-0"
          />
        )}
      </motion.div>
    </Link>
  );
}
