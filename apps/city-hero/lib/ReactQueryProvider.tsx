import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

// useState (not a module-level client) keeps the cache scoped to the app
// instance instead of module-level state that would survive Fast Refresh in
// a stale, confusing way — see TanStack's SSR/client guide (n/a here beyond
// that reasoning, since Expo has no server-render step to worry about).
export function ReactQueryProvider({ children }: React.PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient());
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
