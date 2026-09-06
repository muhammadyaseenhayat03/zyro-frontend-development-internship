import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getOrder } from "../data/orders";
import StatusBadge from "../components/StatusBadge";
import DeliveryTimeline from "../components/DeliveryTimeline";

export default function Track() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initial = searchParams.get("order") || "";
  const [input, setInput] = useState(initial);
  const [submitted, setSubmitted] = useState(initial);

  function handleSubmit(e) {
    e.preventDefault();
    const value = input.trim();
    setSubmitted(value);
    setSearchParams(value ? { order: value } : {});
  }

  const order = submitted ? getOrder(submitted) : null;

  return (
    <div className="page">
      <div className="page-header">
        <p className="eyebrow">Customer tracking</p>
        <h1 className="page-title">Track delivery</h1>
        <p className="page-sub">
          Enter an order number to see exactly where it is right now.
        </p>
      </div>

      <form className="track-search" onSubmit={handleSubmit}>
        <input
          className="search-input"
          placeholder="e.g. DL001"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="btn btn-amber" type="submit">
          Track
        </button>
      </form>

      {!submitted && (
        <div className="panel track-empty">
          Try tracking order <strong>DL001</strong> to see it in transit.
        </div>
      )}

      {submitted && !order && (
        <div className="panel track-empty">
          No order found for “{submitted}”. Check the order number and try again.
        </div>
      )}

      {order && (
        <div className="detail-grid">
          <div className="panel detail-card">
            <div className="detail-row">
              <span className="detail-label">Order</span>
              <span className="detail-value order-id">{order.id}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Rider</span>
              <span className="detail-value">{order.rider || "Not assigned"}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Current status</span>
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
              <h2>Status</h2>
            </div>
            <DeliveryTimeline status={order.status} />
          </div>
        </div>
      )}
    </div>
  );
}
