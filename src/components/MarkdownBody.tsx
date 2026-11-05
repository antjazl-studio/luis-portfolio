import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const isExternal = (href?: string) => !!href && /^https?:\/\//i.test(href);

export function MarkdownBody({ source }: { source: string }) {
  return (
    <div
      className={[
        "prose prose-invert max-w-none",
        "prose-headings:font-medium prose-headings:text-white",
        "prose-p:text-neutral-400 prose-li:text-neutral-400 prose-strong:text-neutral-200",
        "prose-blockquote:border-white/10 prose-blockquote:text-neutral-400",
        "prose-a:text-[var(--accent)] prose-a:no-underline hover:prose-a:text-[var(--accent-hover)]",
        "prose-code:rounded prose-code:bg-white/5 prose-code:px-1 prose-code:text-neutral-200",
        "prose-code:before:content-none prose-code:after:content-none",
        "prose-pre:overflow-x-auto prose-pre:border prose-pre:border-white/[0.07] prose-pre:bg-[var(--surface)]",
        "prose-hr:border-white/10",
      ].join(" ")}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{
          a({ href, children }) {
            return isExternal(href) ? (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ) : (
              <a href={href}>{children}</a>
            );
          },
          img({ src, alt }) {
            if (typeof src !== "string" || !src.startsWith("/")) return <>{alt ?? ""}</>;
            return (
              <Image
                src={src}
                alt={alt ?? ""}
                width={0}
                height={0}
                sizes="100vw"
                className="my-6 h-auto w-full rounded-lg ring-1 ring-white/[0.07]"
              />
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto">
                <table>{children}</table>
              </div>
            );
          },
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
