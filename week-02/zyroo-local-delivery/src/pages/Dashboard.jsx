import { Link, useNavigate } from "react-router-dom";
import { dashboardStats, orders } from "../data/orders";
import StatusBadge from "../components/StatusBadge";

export default function Dashboard() {
  const navigate = useNavigate();
  const recent = orders.slice(0, 4);

  return (
    <div className="page">
      <div className="page-header">
        <p className="eyebrow">Overview</p>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-sub">
          A quick read on how deliveries are moving today.
        </p>
      </div>

      <div className="stat-grid">
        <div className="stat-card stat-amber">
          <p className="stat-label">Total orders</p>
          <p className="stat-value">{dashboardStats.total}</p>
        </div>
        <div className="stat-card stat-gold">
          <p className="stat-label">Pending orders</p>
          <p className="stat-value">{dashboardStats.pending}</p>
        </div>
        <div className="stat-card stat-blue">
          <p className="stat-label">In delivery</p>
          <p className="stat-value">{dashboardStats.inDelivery}</p>
        </div>
        <div className="stat-card stat-green">
          <p className="stat-label">Completed</p>
          <p className="stat-value">{dashboardStats.completed}</p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>Recent orders</h2>
          <Link to="/orders" className="btn btn-dark">
            View all
          </Link>
        </div>
        <div className="table-wrap">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Rider</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o.id} onClick={() => navigate(`/orders/${o.id}`)}>
                  <td className="order-id">{o.id}</td>
                  <td>{o.customer}</td>
                  <td>{o.rider || "Not assigned"}</td>
                  <td>
                    <StatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
