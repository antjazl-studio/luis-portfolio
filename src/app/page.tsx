import type { Metadata } from "next";
import { Hero }      from "@/components/sections/Hero";
import { About }      from "@/components/sections/About";
import { Experience } from "@/components/sections/Experience";
import { Skills }     from "@/components/sections/Skills";
import { Projects }   from "@/components/sections/Projects";
import { Contact }    from "@/components/sections/Contact";

// Home-only sharing tags: the tab title is just the name, the role lives here (and in the layout
// description) so search snippets and link cards still say what Luis does. Kept out of the root layout
// so the blog index, posts and 404 do not inherit it. Metadata stays English (owner decision 2026-11-06).
const shareTitle = "Luis Jacho Zambrano — Senior Full Stack Developer";
// Must stay identical to the description in layout.tsx.
const shareDescription =
  "Senior Full Stack Developer with 9 years of experience in .NET, Angular, and Azure. Azure Developer Associate certified.";

export const metadata: Metadata = {
  openGraph: { type: "website", title: shareTitle, description: shareDescription },
  twitter: { card: "summary", title: shareTitle, description: shareDescription },
};

export default function Home() {
  return (
    <main id="main" tabIndex={-1} className="focus:outline-none">
      <Hero />
      <About />
      <Experience />
      <Skills />
      <Projects />
      <Contact />
    </main>
  );
}
