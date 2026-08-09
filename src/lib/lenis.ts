import type Lenis from "lenis";

// Module-level reference to the active Lenis instance so other client
// components (e.g. PageTransition) can drive scroll without re-instantiating.
export const lenisStore: { instance: Lenis | null } = { instance: null };
