// ---------------------------------------------------------------------------
// React Query Provider
// ---------------------------------------------------------------------------
// Client component that wraps the app with QueryClientProvider.
// Configured with sensible defaults for an e-commerce app:
//   - 5-minute stale time to match the hooks' per-query staleTime.
//   - Retry once on failure (not three times — fast failure UX).
//   - refetchOnWindowFocus left as default (true) for data freshness.
// ---------------------------------------------------------------------------

'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes — aligned with per-hook defaults

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Create the QueryClient inside useState so it's stable across re-renders
  // but unique per server-request (no shared state between users in SSR).
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: STALE_TIME,
            retry: 1,
            refetchOnWindowFocus: true,
          },
          mutations: {
            retry: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
