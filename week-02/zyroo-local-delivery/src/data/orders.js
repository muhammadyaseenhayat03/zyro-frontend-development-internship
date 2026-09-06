// Mock data — no backend / database in Week 1.
// Each order tracks the same delivery lifecycle: created -> assigned -> picked_up -> in_transit -> delivered

export const STAGES = ["created", "assigned", "picked_up", "in_transit", "delivered"];

export const STAGE_LABELS = {
  created: "Created",
  assigned: "Assigned",
  picked_up: "Picked up",
  in_transit: "In transit",
  delivered: "Delivered",
};

export const orders = [
  {
    id: "DL001",
    customer: "Ali Khan",
    phone: "+92 300 1234567",
    rider: "Hamza",
    pickup: "Mardan",
    delivery: "Timergara",
    status: "in_transit",
    placed: "2026-09-04 09:12",
    items: "Grocery bag, 4.2 kg",
  },
  {
    id: "DL002",
    customer: "Ahmed",
    phone: "+92 301 2223344",
    rider: "Bilal",
    pickup: "Peshawar",
    delivery: "Nowshera",
    status: "delivered",
    placed: "2026-09-03 14:40",
    items: "Documents envelope",
  },
  {
    id: "DL003",
    customer: "Sara",
    phone: "+92 302 5556677",
    rider: null,
    pickup: "Swabi",
    delivery: "Mardan",
    status: "created",
    placed: "2026-09-05 08:05",
    items: "Bakery order, 2 boxes",
  },
  {
    id: "DL004",
    customer: "Imran Yousaf",
    phone: "+92 333 8899001",
    rider: "Faizan",
    pickup: "Mardan",
    delivery: "Charsadda",
    status: "picked_up",
    placed: "2026-09-05 10:30",
    items: "Electronics, 1 box",
  },
  {
    id: "DL005",
    customer: "Rabia Noor",
    phone: "+92 345 1122330",
    rider: "Hamza",
    pickup: "Mardan",
    delivery: "Takht Bhai",
    status: "assigned",
    placed: "2026-09-05 11:02",
    items: "Clothing parcel",
  },
];

export function getOrder(id) {
  return orders.find((o) => o.id.toLowerCase() === String(id).toLowerCase());
}

export function stageIndex(status) {
  return STAGES.indexOf(status);
}

export const dashboardStats = {
  total: orders.length,
  pending: orders.filter((o) => o.status === "created").length,
  inDelivery: orders.filter((o) =>
    ["assigned", "picked_up", "in_transit"].includes(o.status)
  ).length,
  completed: orders.filter((o) => o.status === "delivered").length,
};
