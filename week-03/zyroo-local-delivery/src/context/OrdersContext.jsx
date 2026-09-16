import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  seedOrders,
  nextOrderId,
  STATUS,
  canEditOrder,
  canAssignRider,
  canCancelOrder,
} from "../data/orders";

const OrdersContext = createContext(null);
const ORDERS_KEY = "waypoint.orders";

function loadOrders() {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore malformed storage and fall back to seed data
  }
  return seedOrders;
}

function touch(order) {
  return { ...order, updatedAt: new Date().toISOString() };
}

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState(loadOrders);

  useEffect(() => {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }, [orders]);

  const getOrder = useCallback(
    (id) => orders.find((o) => o.id.toLowerCase() === String(id).toLowerCase()),
    [orders],
  );

  const createOrder = useCallback(
    (data, businessId) => {
      const id = nextOrderId(orders);
      const order = {
        id,
        businessId,
        customerId: null,
        riderId: null,
        riderName: null,
        status: STATUS.PENDING,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data,
      };
      setOrders((prev) => [order, ...prev]);
      return order;
    },
    [orders],
  );

  const updateOrder = useCallback((id, patch) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? touch({ ...o, ...patch }) : o)),
    );
  }, []);

  const editOrderDetails = useCallback(
    (id, patch) => {
      const current = orders.find((o) => o.id === id);
      if (!current || !canEditOrder(current.status)) {
        return { ok: false, reason: "This order can no longer be edited." };
      }
      updateOrder(id, patch);
      return { ok: true };
    },
    [orders, updateOrder],
  );

  const assignRider = useCallback(
    (id, rider) => {
      const current = orders.find((o) => o.id === id);
      if (!current || !canAssignRider(current.status)) {
        return {
          ok: false,
          reason: "Rider assignment is locked for this order.",
        };
      }
      updateOrder(id, {
        riderId: rider.id,
        riderName: rider.name,
        status: STATUS.ASSIGNED,
      });
      return { ok: true };
    },
    [orders, updateOrder],
  );

  const cancelOrder = useCallback(
    (id) => {
      const current = orders.find((o) => o.id === id);
      if (!current || !canCancelOrder(current.status)) {
        return { ok: false, reason: "This order can no longer be cancelled." };
      }
      updateOrder(id, { status: STATUS.CANCELLED });
      return { ok: true };
    },
    [orders, updateOrder],
  );

  const acceptDelivery = useCallback(
    (id) => updateOrder(id, { status: STATUS.ACCEPTED }),
    [updateOrder],
  );

  const markPickedUp = useCallback(
    (id) => updateOrder(id, { status: STATUS.PICKED_UP }),
    [updateOrder],
  );

  const startTransit = useCallback(
    (id) => updateOrder(id, { status: STATUS.IN_TRANSIT }),
    [updateOrder],
  );

  const markDelivered = useCallback(
    (id) => updateOrder(id, { status: STATUS.DELIVERED }),
    [updateOrder],
  );

  const value = useMemo(
    () => ({
      orders,
      getOrder,
      createOrder,
      updateOrder,
      editOrderDetails,
      assignRider,
      cancelOrder,
      acceptDelivery,
      markPickedUp,
      startTransit,
      markDelivered,
    }),
    [
      orders,
      getOrder,
      createOrder,
      updateOrder,
      editOrderDetails,
      assignRider,
      cancelOrder,
      acceptDelivery,
      markPickedUp,
      startTransit,
      markDelivered,
    ],
  );

  return (
    <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within an OrdersProvider");
  return ctx;
}
