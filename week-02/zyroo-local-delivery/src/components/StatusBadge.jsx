import { STAGE_LABELS } from "../data/orders";

export default function StatusBadge({ status }) {
  return (
    <span className={`badge badge-${status}`}>
      <span className="badge-dot" />
      {STAGE_LABELS[status] || status}
    </span>
  );
}
