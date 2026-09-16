import { useEffect, useState } from "react";

// There's no real network in this app, but a brief, consistent loading state
// on data-heavy screens signals "the interface is doing something" instead
// of content just snapping into place. Kept short on purpose.
export function useLoadingDelay(ms = 420) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);

  return loading;
}
