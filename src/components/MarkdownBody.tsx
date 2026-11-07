import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const isExternal = (href?: string) => !!href && /^https?:\/\//i.test(href);

export function MarkdownBody({ source }: { source: string }) {
  return (
    <div
      className={[
        "prose prose-invert max-w-none",
        "prose-headings:font-medium prose-headings:text-foreground",
        "prose-p:text-muted prose-li:text-muted prose-strong:text-foreground",
        "prose-blockquote:border-border prose-blockquote:text-muted",
        "prose-a:text-accent prose-a:underline prose-a:underline-offset-[3px] hover:prose-a:text-accent-hover",
        "prose-code:rounded prose-code:bg-surface prose-code:px-1 prose-code:text-foreground",
        "prose-code:before:content-none prose-code:after:content-none",
        "prose-pre:overflow-x-auto prose-pre:border prose-pre:border-border prose-pre:bg-surface",
        "prose-hr:border-border",
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
