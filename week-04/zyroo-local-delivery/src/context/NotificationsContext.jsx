import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useOrders } from "./OrdersContext";
import { seedNotifications, NOTIFICATION_COPY } from "../data/notifications";

const NotificationsContext = createContext(null);
const KEY = "waypoint.notifications";
let seq = 0;

function loadNotifications() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore malformed storage and fall back to seed data
  }
  return seedNotifications;
}

function makeNotification(order, type) {
  const build = NOTIFICATION_COPY[type];
  return {
    id: `ntf-${Date.now()}-${++seq}`,
    orderId: order.id,
    businessId: order.businessId,
    riderId: order.riderId,
    customerId: order.customerId,
    customerName: order.customerName,
    type,
    message: build ? build(order) : `Order #${order.id} was updated.`,
    createdAt: new Date().toISOString(),
    read: false,
  };
}

// Watches order data and turns lifecycle changes (new order, rider assigned,
// accepted, picked up, in transit, delivered, cancelled) into notification
// entries — the same event types "Create Order" and "Assign Rider" etc.
// already produce toasts for, just kept as a running, role-scoped history
// instead of disappearing after a few seconds. Nested inside OrdersProvider
// so it can watch `orders` without either context needing to know about the
// other's internals.
export function NotificationsProvider({ children }) {
  const { orders } = useOrders();
  const [notifications, setNotifications] = useState(loadNotifications);
  // Tracks each order's last-seen status so only genuine transitions produce
  // a new notification — not every render, and not a flood of "created"
  // entries for the pre-existing seed orders on first load (those already
  // have their own seed notification history).
  const seenRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (seenRef.current === null) {
      seenRef.current = new Map(orders.map((o) => [o.id, o.status]));
      return;
    }

    const seen = seenRef.current;
    const fresh = [];
    for (const order of orders) {
      const prevStatus = seen.get(order.id);
      if (prevStatus === undefined) {
        fresh.push(makeNotification(order, "created"));
      } else if (prevStatus !== order.status) {
        fresh.push(makeNotification(order, order.status));
      }
    }
    if (fresh.length) {
      setNotifications((prev) => [...fresh, ...prev].slice(0, 100));
    }
    seenRef.current = new Map(orders.map((o) => [o.id, o.status]));
  }, [orders]);

  const forUser = useCallback(
    (user) => {
      if (!user) return [];
      if (user.role === "business") return notifications.filter((n) => n.businessId === user.id);
      if (user.role === "rider") return notifications.filter((n) => n.riderId === user.id);
      if (user.role === "customer") {
        return notifications.filter((n) => n.customerId === user.id || n.customerName === user.name);
      }
      return [];
    },
    [notifications]
  );

  const markAllRead = useCallback((user) => {
    setNotifications((prev) =>
      prev.map((n) => {
        const belongsToUser =
          (user.role === "business" && n.businessId === user.id) ||
          (user.role === "rider" && n.riderId === user.id) ||
          (user.role === "customer" && (n.customerId === user.id || n.customerName === user.name));
        return belongsToUser ? { ...n, read: true } : n;
      })
    );
  }, []);

  const markOneRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id && !n.read ? { ...n, read: true } : n))
    );
  }, []);

  const value = useMemo(() => ({ forUser, markAllRead, markOneRead }), [forUser, markAllRead, markOneRead]);

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within a NotificationsProvider");
  return ctx;
}
