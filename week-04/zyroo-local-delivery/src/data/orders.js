// Mock order data and the delivery status pipeline. No backend — orders live in
// OrdersContext state (seeded from here) and are mutated in memory / localStorage.

export const STATUS = {
  PENDING: "pending",
  ASSIGNED: "assigned",
  ACCEPTED: "accepted",
  PICKED_UP: "picked_up",
  IN_TRANSIT: "in_transit",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

// Order of the main pipeline, used to render the delivery timeline.
export const STATUS_FLOW = [
  STATUS.PENDING,
  STATUS.ASSIGNED,
  STATUS.ACCEPTED,
  STATUS.PICKED_UP,
  STATUS.IN_TRANSIT,
  STATUS.DELIVERED,
];

export const STATUS_LABELS = {
  [STATUS.PENDING]: "Pending",
  [STATUS.ASSIGNED]: "Assigned",
  [STATUS.ACCEPTED]: "Accepted",
  [STATUS.PICKED_UP]: "Picked up",
  [STATUS.IN_TRANSIT]: "In transit",
  [STATUS.DELIVERED]: "Delivered",
  [STATUS.CANCELLED]: "Cancelled",
};

export const PRIORITIES = ["Standard", "Urgent"];
export const PAYMENT_METHODS = ["Cash on delivery", "Card", "Online wallet"];

// Single source of truth for what a Business Account can do to an order at
// each stage of its lifecycle. Every component that needs to enable/disable
// Edit, Assign/Reassign, or Cancel reads from these — the mutating context
// functions (editOrderDetails / assignRider / cancelOrder) re-check the same
// rules against the live order right before writing, so the rule is actually
// enforced, not just reflected in a disabled button.
//
//   Status      | Edit Order | Assign/Reassign Rider | Cancel Order
//   ------------|------------|------------------------|-------------
//   Pending     | ENABLED    | ENABLED                | ENABLED
//   Assigned    | ENABLED    | ENABLED                | ENABLED
//   Accepted    | ENABLED    | DISABLED               | ENABLED
//   Picked up   | DISABLED   | DISABLED               | ENABLED
//   In transit  | DISABLED   | DISABLED               | ENABLED
//   Delivered   | DISABLED   | DISABLED               | DISABLED
//   Cancelled   | DISABLED   | DISABLED               | DISABLED
export function canEditOrder(status) {
  return [STATUS.PENDING, STATUS.ASSIGNED, STATUS.ACCEPTED].includes(status);
}

export function canAssignRider(status) {
  return [STATUS.PENDING, STATUS.ASSIGNED].includes(status);
}

export function canCancelOrder(status) {
  return ![STATUS.DELIVERED, STATUS.CANCELLED].includes(status);
}

// "Locked" order info/rider — true from Picked up onward. Named for the
// business rule it represents ("once picked up, order details are locked"),
// distinct from cancellability, which stays open longer.
export function isOrderLocked(status) {
  return !canEditOrder(status);
}

export const RIDERS = [
  { id: "rider-1", name: "Hamza", phone: "+92 333 1010101", vehicle: "Honda CD 70 · Red · MD-1042" },
  { id: "rider-2", name: "Bilal", phone: "+92 333 2020202", vehicle: "Yamaha YBR 125 · Black · MD-2077" },
  { id: "rider-3", name: "Faizan", phone: "+92 333 3030303", vehicle: "Honda CG 125 · Blue · MD-3311" },
  { id: "rider-4", name: "Usman", phone: "+92 333 4040404", vehicle: "Suzuki GD 110 · Silver · MD-4488" },
];

export function getRider(id) {
  return RIDERS.find((r) => r.id === id);
}

// A rider's plain-language "current status" for the tracking view — distinct
// from the order's own status badge, this describes what the rider is doing.
export function riderCurrentStatus(orderStatus) {
  switch (orderStatus) {
    case STATUS.ASSIGNED:
      return "Assigned — awaiting acceptance";
    case STATUS.ACCEPTED:
      return "Heading to pickup";
    case STATUS.PICKED_UP:
    case STATUS.IN_TRANSIT:
      return "On delivery";
    case STATUS.DELIVERED:
      return "Delivery complete";
    default:
      return "Not yet assigned";
  }
}

// Simulated delivery estimate — this app has no real routing/ETA service, so
// the minutes shown are a plausible, status-driven placeholder rather than a
// live calculation, exactly as the task spec allows.
export function estimatedDeliveryLabel(status) {
  switch (status) {
    case STATUS.PENDING:
      return "Awaiting rider assignment";
    case STATUS.ASSIGNED:
      return "Awaiting rider acceptance";
    case STATUS.ACCEPTED:
      return "Estimated delivery: 35 minutes";
    case STATUS.PICKED_UP:
      return "Estimated delivery: 22 minutes";
    case STATUS.IN_TRANSIT:
      return "Estimated delivery: 10 minutes";
    case STATUS.DELIVERED:
      return "Delivered";
    case STATUS.CANCELLED:
      return "Cancelled — no delivery";
    default:
      return "—";
  }
}

// Simulated map progress, 0–100, for how far along the pickup → delivery
// route the rider currently is. Feeds the route/map visual.
export function routeProgress(status) {
  switch (status) {
    case STATUS.ACCEPTED:
      return 0;
    case STATUS.PICKED_UP:
      return 0;
    case STATUS.IN_TRANSIT:
      return 50;
    case STATUS.DELIVERED:
      return 100;
    default:
      return 0;
  }
}

// A simulated rider waypoint label for the route/map — a real map/GPS API
// isn't available here, so seed orders carry a plausible en-route town
// (`order.waypoint`) and everything else falls back to a plain-language
// description of progress instead of inventing a fake place name.
export function simulatedWaypointLabel(order) {
  if (order.status === STATUS.DELIVERED) return order.delivery;
  if (order.status === STATUS.CANCELLED) return "—";
  if (order.status === STATUS.PICKED_UP) return order.pickup;
  if (order.status === STATUS.ACCEPTED) return order.waypoint || `Near ${order.pickup}`;
  if (order.status === STATUS.IN_TRANSIT) return order.waypoint || "En route";
  return "Not yet en route";
}

// businessId / customerId map to seed users so the demo accounts see relevant orders.
// Dates are spread across the last two weeks so the board feels like a real,
// actively-managed operation rather than a handful of placeholder rows.
export const seedOrders = [
  {
    id: "DL001",
    businessId: "biz-1",
    customerId: "cust-1",
    customerName: "Ali Khan",
    customerPhone: "+92 300 1234567",
    pickup: "Mardan",
    delivery: "Timergara",
    packageDetails: "Grocery bag, 4.2 kg",
    priority: "Standard",
    paymentMethod: "Cash on delivery",
    riderId: "rider-1",
    riderName: "Hamza",
    status: STATUS.IN_TRANSIT,
    createdAt: "2026-09-11T09:12:00",
    updatedAt: "2026-09-12T08:40:00",
    waypoint: "Chakdara",
  },
  {
    id: "DL002",
    businessId: "biz-1",
    customerId: "cust-1",
    customerName: "Ahmed Raza",
    customerPhone: "+92 301 2223344",
    pickup: "Peshawar",
    delivery: "Nowshera",
    packageDetails: "Documents envelope",
    priority: "Urgent",
    paymentMethod: "Card",
    riderId: "rider-2",
    riderName: "Bilal",
    status: STATUS.DELIVERED,
    createdAt: "2026-09-03T14:40:00",
    updatedAt: "2026-09-03T17:05:00",
  },
  {
    id: "DL003",
    businessId: "biz-1",
    customerId: null,
    customerName: "Sara Bibi",
    customerPhone: "+92 302 5556677",
    pickup: "Swabi",
    delivery: "Mardan",
    packageDetails: "Bakery order, 2 boxes",
    priority: "Standard",
    paymentMethod: "Cash on delivery",
    riderId: null,
    riderName: null,
    status: STATUS.PENDING,
    createdAt: "2026-09-13T08:05:00",
    updatedAt: "2026-09-13T08:05:00",
  },
  {
    id: "DL004",
    businessId: "biz-1",
    customerId: null,
    customerName: "Imran Yousaf",
    customerPhone: "+92 333 8899001",
    pickup: "Mardan",
    delivery: "Charsadda",
    packageDetails: "Electronics, 1 box",
    priority: "Urgent",
    paymentMethod: "Online wallet",
    riderId: "rider-3",
    riderName: "Faizan",
    status: STATUS.PICKED_UP,
    createdAt: "2026-09-12T10:30:00",
    updatedAt: "2026-09-12T12:15:00",
    waypoint: "Prang",
  },
  {
    id: "DL005",
    businessId: "biz-1",
    customerId: null,
    customerName: "Rabia Noor",
    customerPhone: "+92 345 1122330",
    pickup: "Mardan",
    delivery: "Takht Bhai",
    packageDetails: "Clothing parcel",
    priority: "Standard",
    paymentMethod: "Cash on delivery",
    riderId: "rider-1",
    riderName: "Hamza",
    status: STATUS.ASSIGNED,
    createdAt: "2026-09-12T11:02:00",
    updatedAt: "2026-09-12T11:20:00",
  },
  {
    id: "DL006",
    businessId: "biz-1",
    customerId: "cust-1",
    customerName: "Ali Khan",
    customerPhone: "+92 300 1234567",
    pickup: "Mardan",
    delivery: "Risalpur",
    packageDetails: "Spare parts, 1 crate",
    priority: "Urgent",
    paymentMethod: "Card",
    riderId: "rider-2",
    riderName: "Bilal",
    status: STATUS.ACCEPTED,
    createdAt: "2026-09-13T09:50:00",
    updatedAt: "2026-09-13T10:05:00",
    waypoint: "Mardan Bypass",
  },
  {
    id: "DL007",
    businessId: "biz-1",
    customerId: null,
    customerName: "Zainab Malik",
    customerPhone: "+92 312 7788990",
    pickup: "Mardan",
    delivery: "Katlang",
    packageDetails: "Gift box",
    priority: "Standard",
    paymentMethod: "Cash on delivery",
    riderId: null,
    riderName: null,
    status: STATUS.CANCELLED,
    createdAt: "2026-09-09T13:00:00",
    updatedAt: "2026-09-09T13:40:00",
  },
  {
    id: "DL008",
    businessId: "biz-1",
    customerId: null,
    customerName: "Kamran Sheikh",
    customerPhone: "+92 321 4455667",
    pickup: "Mardan",
    delivery: "Sheikh Maltoon",
    packageDetails: "Furniture hardware, 3 boxes",
    priority: "Standard",
    paymentMethod: "Cash on delivery",
    riderId: null,
    riderName: null,
    status: STATUS.PENDING,
    createdAt: "2026-09-13T07:15:00",
    updatedAt: "2026-09-13T07:15:00",
  },
  {
    id: "DL009",
    businessId: "biz-1",
    customerId: null,
    customerName: "Fatima Hameed",
    customerPhone: "+92 302 9988776",
    pickup: "Mardan",
    delivery: "Jamal Garhi",
    packageDetails: "Pharmacy order — refrigerated",
    priority: "Urgent",
    paymentMethod: "Online wallet",
    riderId: null,
    riderName: null,
    status: STATUS.PENDING,
    createdAt: "2026-09-13T06:50:00",
    updatedAt: "2026-09-13T06:50:00",
  },
  {
    id: "DL010",
    businessId: "biz-1",
    customerId: null,
    customerName: "Noman Aziz",
    customerPhone: "+92 315 3322110",
    pickup: "Mardan",
    delivery: "Rustam",
    packageDetails: "Auto parts, 2 crates",
    priority: "Standard",
    paymentMethod: "Card",
    riderId: "rider-4",
    riderName: "Usman",
    status: STATUS.IN_TRANSIT,
    createdAt: "2026-09-11T15:20:00",
    updatedAt: "2026-09-12T09:10:00",
    waypoint: "Rustam Road",
  },
  {
    id: "DL011",
    businessId: "biz-1",
    customerId: null,
    customerName: "Hina Gul",
    customerPhone: "+92 333 6677889",
    pickup: "Mardan",
    delivery: "Toru",
    packageDetails: "Bridal order, fragile",
    priority: "Urgent",
    paymentMethod: "Cash on delivery",
    riderId: "rider-3",
    riderName: "Faizan",
    status: STATUS.DELIVERED,
    createdAt: "2026-09-08T10:00:00",
    updatedAt: "2026-09-08T14:30:00",
  },
  {
    id: "DL012",
    businessId: "biz-1",
    customerId: null,
    customerName: "Adeel Farooq",
    customerPhone: "+92 300 5544332",
    pickup: "Mardan",
    delivery: "Katlang Road",
    packageDetails: "Stationery carton",
    priority: "Standard",
    paymentMethod: "Cash on delivery",
    riderId: "rider-4",
    riderName: "Usman",
    status: STATUS.DELIVERED,
    createdAt: "2026-09-06T11:40:00",
    updatedAt: "2026-09-06T15:00:00",
  },
  {
    id: "DL013",
    businessId: "biz-1",
    customerId: null,
    customerName: "Shazia Perveen",
    customerPhone: "+92 302 1199887",
    pickup: "Mardan",
    delivery: "Baghdada",
    packageDetails: "Cosmetics parcel",
    priority: "Standard",
    paymentMethod: "Online wallet",
    riderId: null,
    riderName: null,
    status: STATUS.CANCELLED,
    createdAt: "2026-09-10T09:25:00",
    updatedAt: "2026-09-10T09:55:00",
  },
];

export function nextOrderId(existingOrders) {
  const nums = existingOrders
    .map((o) => parseInt(o.id.replace(/\D/g, ""), 10))
    .filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `DL${String(next).padStart(3, "0")}`;
}

export function statusIndex(status) {
  return STATUS_FLOW.indexOf(status);
}
