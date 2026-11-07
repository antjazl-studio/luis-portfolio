import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        muted: "var(--muted)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        "focus-ring": "var(--focus-ring)",
        "status-available": "var(--status-available)",
      },
      // One quiet entrance for the hero. The global prefers-reduced-motion block in
      // globals.css collapses its duration, so it needs no JS handling.
      keyframes: {
        rise: {
          from: { opacity: "0", transform: "translateY(8px)" },
        },
      },
      animation: {
        rise: "rise 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [typography],
};
export default config;
