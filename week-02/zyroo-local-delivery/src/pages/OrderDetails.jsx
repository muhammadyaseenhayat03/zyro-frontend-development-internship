import { Link, useParams } from "react-router-dom";
import { getOrder } from "../data/orders";
import StatusBadge from "../components/StatusBadge";
import DeliveryTimeline from "../components/DeliveryTimeline";

export default function OrderDetails() {
  const { id } = useParams();
  const order = getOrder(id);

  if (!order) {
    return (
      <div className="notfound">
        <p className="eyebrow">Not found</p>
        <h1 className="page-title">No order matches “{id}”</h1>
        <p className="page-sub" style={{ margin: "0 auto 20px" }}>
          Double check the order number, or browse the full list.
        </p>
        <Link to="/orders" className="btn btn-amber">
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <p className="eyebrow">Order details</p>
        <h1 className="page-title">
          Order #{order.id}
        </h1>
        <p className="page-sub">
          Placed {order.placed} by {order.customer}
        </p>
      </div>

      <div className="detail-grid">
        <div className="panel detail-card">
          <div className="detail-row">
            <span className="detail-label">Customer</span>
            <span className="detail-value">{order.customer}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Phone</span>
            <span className="detail-value">{order.phone}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Rider</span>
            <span className="detail-value">{order.rider || "Not assigned"}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Items</span>
            <span className="detail-value">{order.items}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Status</span>
            <span className="detail-value">
              <StatusBadge status={order.status} />
            </span>
          </div>
          <div style={{ marginTop: 14 }}>
            <span className="detail-label">Route</span>
            <div className="route-line">
              <span>{order.pickup}</span>
              <span className="divider" />
              <span>{order.delivery}</span>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>Delivery timeline</h2>
          </div>
          <DeliveryTimeline status={order.status} />
        </div>
      </div>
    </div>
  );
}
