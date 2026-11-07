import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

const noopSubscribe = () => () => {};

/**
 * The pathname to render URL-dependent markup from, safe for hydration.
 *
 * The prerendered 404 shell is built without the requested URL, but on the client `usePathname()` is the
 * real one, so rendering from it on the first client render mismatches the server HTML (React #418).
 * Known prerendered routes keep their real pathname (their server HTML already contains it); any other
 * URL renders as the neutral shell ("") until hydration is done, then follows the real pathname.
 */
export function useStablePathname(prerenderedPaths: readonly string[]): string {
  const pathname = usePathname() ?? "";
  // false on the server and during hydration, true afterwards (same pattern as reduceMotion in LanguageContext).
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  return hydrated || prerenderedPaths.includes(pathname) ? pathname : "";
}
