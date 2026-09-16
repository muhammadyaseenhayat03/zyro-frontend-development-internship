import { memo } from "react";
import { STATUS_LABELS } from "../data/orders";

// Rendered once per row in every order list in the app, so a cheap memo
// avoids re-rendering every badge whenever its list re-renders for an
// unrelated reason (e.g. a sibling row's status changing).
function StatusBadge({ status }) {
  return (
    <span className={`badge badge-${status}`}>
      <span className="badge-dot" />
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export default memo(StatusBadge);
