import { useCallback, useRef, useState } from "react";

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
//
// Deliberately does NOT gate `setPending` behind an "is this component still
// mounted" ref. That pattern used to be needed to avoid a console warning on
// React 17 and earlier, but React (18+, and this app uses 19) already
// silently no-ops a state update on an unmounted component — there's nothing
// left to protect against. Worse, a *cleanup-only* mounted ref is actively
// dangerous: Strict Mode's development-only mount → cleanup → mount cycle
// fires that cleanup once right after the very first real mount, and with no
// setup phase to reset it, the ref is permanently stuck "false" from then on
// even though the component is genuinely mounted — so `finally` would
// silently skip clearing `pending` forever. That was a real, reproduced bug
// here, most visible on Navbar's Logout button (which — unlike Sign in/up or
// order forms — never unmounts after the action completes, so a stuck
// pending state stays on screen instead of disappearing with the page).
export function useAsyncAction(delayMs = 350) {
  const [pending, setPending] = useState(false);
  const runningRef = useRef(false);

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
          setPending(false);
        });
    },
    [delayMs]
  );

  return [pending, run];
}
