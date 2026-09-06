import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { orders } from "../data/orders";
import StatusBadge from "../components/StatusBadge";

export default function Orders() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customer.toLowerCase().includes(q) ||
        (o.rider || "").toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="page">
      <div className="page-header">
        <p className="eyebrow">Fleet</p>
        <h1 className="page-title">Orders</h1>
        <p className="page-sub">
          Every delivery currently on the board. Open one to see full details.
        </p>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>{filtered.length} order{filtered.length === 1 ? "" : "s"}</h2>
          <input
            className="search-input"
            placeholder="Search by order, customer, or rider"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="table-wrap">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Rider</th>
                <th>Route</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} onClick={() => navigate(`/orders/${o.id}`)}>
                  <td className="order-id">{o.id}</td>
                  <td>{o.customer}</td>
                  <td>{o.rider || "Not assigned"}</td>
                  <td className="route-cell">
                    {o.pickup} → {o.delivery}
                  </td>
                  <td>
                    <StatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="track-empty">
                    No orders match “{query}”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
