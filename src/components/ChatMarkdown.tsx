"use client";

import ReactMarkdown from "react-markdown";

const SAFE_PROTOCOLS = ["http:", "https:", "mailto:"];

/** Returns the URL only when it is an absolute http(s) or mailto link; everything else becomes "". */
function safeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return SAFE_PROTOCOLS.includes(parsed.protocol) ? url : "";
  } catch {
    return "";
  }
}

const linkClass = "text-accent underline underline-offset-[3px] hover:text-accent-hover break-words";

/** Renders an assistant answer as formatted text. Raw HTML is dropped, only a small allow-list of elements is kept. */
export function ChatMarkdown({ source }: { source: string }) {
  return (
    <div className="min-w-0 break-words text-foreground">
      <ReactMarkdown
        skipHtml
        allowedElements={["p", "strong", "em", "ul", "ol", "li", "a", "code", "br"]}
        unwrapDisallowed
        urlTransform={safeUrl}
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="mb-2 list-disc pl-5 last:mb-0">{children}</ul>,
          ol: ({ children }) => <ol className="mb-2 list-decimal pl-5 last:mb-0">{children}</ol>,
          code: ({ children }) => <code className="break-words rounded bg-surface-2 px-1 font-mono text-[0.9em]">{children}</code>,
          a: ({ href, children }) => {
            if (!href) return <span>{children}</span>;
            if (href.startsWith("mailto:")) {
              return <a href={href} className={linkClass}>{children}</a>;
            }
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                {children}
              </a>
            );
          },
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
