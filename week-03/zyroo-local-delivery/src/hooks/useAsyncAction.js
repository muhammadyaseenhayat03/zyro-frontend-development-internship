import { useCallback, useEffect, useRef, useState } from "react";

export function useAsyncAction(delayMs = 350) {
  const [pending, setPending] = useState(false);
  const runningRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const run = useCallback(
    (action) => {
      if (runningRef.current) return;
      runningRef.current = true;
      setPending(true);

      Promise.resolve()
        .then(() => new Promise((resolve) => setTimeout(resolve, delayMs)))
        .then(() => action())
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          runningRef.current = false;
          if (mountedRef.current) setPending(false);
        });
    },
    [delayMs],
  );

  return [pending, run];
}
