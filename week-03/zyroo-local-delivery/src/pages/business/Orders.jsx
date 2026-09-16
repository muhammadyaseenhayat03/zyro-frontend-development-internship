import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useOrders } from "../../context/OrdersContext";
import { useToast } from "../../context/ToastContext";
import { useAsyncAction } from "../../hooks/useAsyncAction";
import { STATUS, STATUS_LABELS, canEditOrder, canCancelOrder } from "../../data/orders";
import StatusBadge from "../../components/StatusBadge";
import PriorityBadge from "../../components/PriorityBadge";
import ConfirmDialog from "../../components/ConfirmDialog";
import EmptyState from "../../components/EmptyState";
import Icon from "../../components/Icon";

const FILTERS = ["all", STATUS.PENDING, STATUS.ASSIGNED, STATUS.ACCEPTED, STATUS.PICKED_UP, STATUS.IN_TRANSIT, STATUS.DELIVERED, STATUS.CANCELLED];

// One row component, memoized, instead of re-creating (and re-diffing) seven
// inline onClick closures per row on every render — matters once the order
// board has real volume on it. Edit and Cancel use their own permission
// rules (see src/data/orders.js): editing locks at Picked up, but
// cancellation stays available through Picked up and In transit.
const OrderTableRow = memo(function OrderTableRow({ order, onOpen, onEdit, onCancelRequest }) {
  const editLocked = !canEditOrder(order.status);
  const cancelLocked = !canCancelOrder(order.status);
  return (
    <tr className={order.priority === "Urgent" ? "row-urgent" : ""} onClick={() => onOpen(order.id)}>
      <td className="order-id">{order.id}</td>
      <td>{order.customerName}</td>
      <td className="route-cell">
        {order.pickup} → {order.delivery}
      </td>
      <td>
        <PriorityBadge priority={order.priority} size="sm" />
      </td>
      <td>{order.riderName || "Not assigned"}</td>
      <td>
        <StatusBadge status={order.status} />
      </td>
      <td className="route-cell">{order.createdAt.slice(0, 10)}</td>
      <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
        <button className="icon-btn" title="Edit" onClick={() => onEdit(order.id)} disabled={editLocked}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
        </button>
        <button className="icon-btn icon-btn-danger" title="Cancel order" onClick={() => onCancelRequest(order)} disabled={cancelLocked}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </td>
    </tr>
  );
});

export default function BusinessOrders() {
  const { user } = useAuth();
  const { orders, cancelOrder } = useOrders();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [cancelling, runCancel] = useAsyncAction();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [cancelTarget, setCancelTarget] = useState(null);

  // Land here after a successful rider assignment (see OrderDetails) with a
  // one-shot toast in navigation state. The ref guards against showing the
  // same message twice — e.g. React 18 Strict Mode intentionally re-fires
  // effects once in development — by remembering exactly which message was
  // already shown, then the state is cleared so it can't replay later either.
  const shownToastRef = useRef(null);
  useEffect(() => {
    const message = location.state?.toast;
    if (message && shownToastRef.current !== message) {
      shownToastRef.current = message;
      showToast(message);
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  // Without this useMemo, `orders.filter(...)` returns a brand-new array on
  // every render, which would silently defeat the `filtered` useMemo below —
  // its dependency would never look "unchanged" even when nothing changed.
  const userId = user?.id;
  const mine = useMemo(() => orders.filter((o) => o.businessId === userId), [orders, userId]);

  const filtered = useMemo(() => {
    return mine.filter((o) => {
      if (filter !== "all" && o.status !== filter) return false;
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        (o.riderName || "").toLowerCase().includes(q)
      );
    });
  }, [mine, query, filter]);

  const openOrder = useCallback((id) => navigate(`/business/orders/${id}`), [navigate]);
  const editOrder = useCallback((id) => navigate(`/business/orders/${id}/edit`), [navigate]);
  const requestCancel = useCallback((order) => setCancelTarget(order), []);

  function handleCancelConfirm() {
    const target = cancelTarget;
    runCancel(() => {
      const result = cancelOrder(target.id);
      if (!result.ok) {
        showToast(result.reason, "error");
        setCancelTarget(null);
        return;
      }
      showToast(`Order ${target.id} cancelled.`, "info");
      setCancelTarget(null);
    });
  }

  return (
    <div className="page">
      <div className="page-header page-header-row">
        <div>
          <p className="eyebrow">Fleet</p>
          <h1 className="page-title">Orders</h1>
          <p className="page-sub">Every order you've created, and where it stands.</p>
        </div>
        <Link to="/business/orders/new" className="btn btn-amber">
          <Icon name="package" size={15} />
          New order
        </Link>
      </div>

      <div className="filter-row">
        {FILTERS.map((f) => (
          <button key={f} className={"filter-chip" + (filter === f ? " active" : "")} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>
            {filtered.length} order{filtered.length === 1 ? "" : "s"}
          </h2>
          <div className="search-field">
            <Icon name="search" size={14} className="search-field-icon" />
            <input className="search-input" placeholder="Search by order, customer, or rider" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Icon name="inbox" size={22} />}
            title={mine.length === 0 ? "No orders yet" : "No orders match your filters"}
            body={mine.length === 0 ? "Create your first order to start building your delivery board." : "Try a different status filter or search term."}
            action={
              mine.length === 0 ? (
                <Link to="/business/orders/new" className="btn btn-amber btn-sm">
                  Create an order
                </Link>
              ) : null
            }
          />
        ) : (
          <div className="table-wrap">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Route</th>
                  <th>Priority</th>
                  <th>Rider</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <OrderTableRow key={o.id} order={o} onOpen={openOrder} onEdit={editOrder} onCancelRequest={requestCancel} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        title="Cancel this order?"
        body={cancelTarget ? `Are you sure you want to cancel order ${cancelTarget.id}? This can't be undone.` : ""}
        confirmLabel="Cancel order"
        pendingLabel="Cancelling…"
        loading={cancelling}
        onConfirm={handleCancelConfirm}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
