"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

// useState (not a module-level client) so each browser session gets its own
// cache instead of leaking data across users — see TanStack's SSR guide.
// No server-side prefetching here: every consumer fetches client-side after
// mount, so the simpler client-only setup is enough (no streamed hydration).
export function ReactQueryProvider({ children }: React.PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient());
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
