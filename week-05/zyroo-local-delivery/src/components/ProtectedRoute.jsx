import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../context/OrdersContext";
import Loader from "./Loader";
import Icon from "./Icon";

export default function ProtectedRoute({ role, children }) {
  const { user, authLoading } = useAuth();
  const { ordersLoading, ordersError, refreshOrders } = useOrders();
  const location = useLocation();

  if (authLoading || ordersLoading) {
    return <Loader fullPage size="lg" label="Loading your account…" />;
  }

  if (!user) {
    const fromPath = location.pathname + (location.search || "");
    return <Navigate to="/login" state={{ from: fromPath }} replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  if (ordersError) {
    return (
      <div className="notfound">
        <div className="empty-state-icon" style={{ margin: "0 auto 16px" }}>
          <Icon name="alert" size={22} />
        </div>
        <p className="eyebrow">Couldn't load your data</p>
        <h1 className="page-title">{ordersError}</h1>
        <button className="btn btn-amber" onClick={refreshOrders}>
          <Icon name="refresh" size={15} />
          Retry
        </button>
      </div>
    );
  }

  return children;
}
