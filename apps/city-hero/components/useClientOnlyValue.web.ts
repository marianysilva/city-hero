import { useEffect, useState } from "react";

// `useEffect` is not invoked during server rendering, meaning
// we can use this to determine if we're on the server or not.
export function useClientOnlyValue<S, C>(server: S, client: C): S | C {
  const [value, setValue] = useState<S | C>(server);
  useEffect(() => {
    // Intentional: this effect only ever runs after hydration on the client,
    // so this is how the hook detects "we're past SSR" and swaps the value —
    // not a synchronization side effect the set-state-in-effect rule targets.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue(client);
  }, [client]);

  return value;
}
