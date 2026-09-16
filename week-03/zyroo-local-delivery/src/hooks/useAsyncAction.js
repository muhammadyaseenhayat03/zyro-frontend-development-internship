import { useCallback, useEffect, useRef, useState } from "react";

// Shared "is this button doing something right now" primitive, used for every
// mutating action in the app (sign in, sign up, logout, create/edit/cancel
// order, assign rider, rider status updates). Wrapping an action here gives
// three things for free, consistently, everywhere:
//   1. A `pending` flag to disable the button and show a spinner.
//   2. A guard against double submission while already running.
//   3. A `finally` that always clears `pending` — success, failure, or a
//      thrown error — so a button can never get stuck loading forever.
// There's no real network in this app, so `delayMs` stands in for request
// latency; if `action` returns a promise it's awaited instead.
export function useAsyncAction(delayMs = 350) {
  const [pending, setPending] = useState(false);
  const runningRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true; // reset on every (re)mount, including StrictMode's simulated remount
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
    [delayMs]
  );

  return [pending, run];
}
