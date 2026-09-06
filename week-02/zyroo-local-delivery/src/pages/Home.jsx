import { Link } from "react-router-dom";
import { dashboardStats } from "../data/orders";

const FEATURES = [
  {
    title: "One dashboard, all orders",
    body: "See pending, in-delivery, and completed orders at a glance instead of digging through spreadsheets.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="white" strokeWidth="2" />
        <rect x="13" y="3" width="8" height="8" rx="1.5" stroke="white" strokeWidth="2" />
        <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="white" strokeWidth="2" />
        <rect x="13" y="13" width="8" height="8" rx="1.5" stroke="white" strokeWidth="2" />
      </svg>
    ),
  },
  {
    title: "Assign riders, not chaos",
    body: "Every order carries its pickup, drop-off, and rider in one place, from creation to delivery.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 18 L10 8 L15 14 L20 6"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Let customers track it themselves",
    body: "A customer types in an order number and sees exactly where their delivery stands, no calls needed.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2" />
        <path d="M20 20l-3.5-3.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <svg
          className="hero-route"
          viewBox="0 0 1120 420"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M-40 360 C 180 320, 260 180, 460 190 S 760 340, 980 140 S 1180 60, 1300 20"
            stroke="#ffffff"
            strokeOpacity="0.08"
            strokeWidth="2"
            strokeDasharray="2 10"
            fill="none"
          />
          <circle cx="460" cy="190" r="4" fill="#E2751B" opacity="0.6" />
          <circle cx="980" cy="140" r="4" fill="#E2751B" opacity="0.4" />
        </svg>

        <div className="hero-inner">
          <div>
            <h1>Local Delivery Platform</h1>
            <p>Manage your deliveries easily from one place — from the moment an order is placed to the moment it lands on a doorstep.</p>
            <div className="hero-actions">
              <Link to="/dashboard" className="btn btn-amber">
                Get started
              </Link>
              <Link to="/track" className="btn btn-ghost">
                Track a delivery
              </Link>
            </div>
          </div>

          <div className="hero-card">
            <div className="hero-card-row">
              <span className="hero-card-label">Order</span>
              <span className="hero-card-value">#DL001</span>
            </div>
            <div className="hero-card-row">
              <span className="hero-card-label">Route</span>
              <span className="hero-card-value">Mardan → Timergara</span>
            </div>
            <div className="hero-card-row">
              <span className="hero-card-label">Rider</span>
              <span className="hero-card-value">Hamza</span>
            </div>
            <div className="hero-card-row">
              <span className="hero-card-label">Status</span>
              <span className="hero-card-value">In transit</span>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        {FEATURES.map((f) => (
          <div className="feature" key={f.title}>
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.body}</p>
          </div>
        ))}
      </section>

      <section className="page" style={{ paddingTop: 0 }}>
        <div className="panel" style={{ padding: "22px 26px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <p className="eyebrow" style={{ margin: "0 0 4px" }}>Right now</p>
            <p style={{ margin: 0, fontSize: 15 }}>
              {dashboardStats.total} orders on the board · {dashboardStats.inDelivery} out for delivery
            </p>
          </div>
          <Link to="/orders" className="btn btn-dark">
            View all orders
          </Link>
        </div>
      </section>
    </>
  );
}
