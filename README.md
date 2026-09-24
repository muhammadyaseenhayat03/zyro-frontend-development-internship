# Zyroo Frontend Development Internship

8-week frontend internship submissions, organized by week.

## Structure

```
zyro-frontend-development-internship/
├── week-01/
│   ├── avatar.jpg
│   ├── index.html
│   ├── script.js
│   ├── style.css
│   └── evidence/                 # screenshots for submission
├── week-02/
│   └── zyroo-local-delivery/     # React + Vite frontend MVP
│       ├── src/
│       │   ├── components/       # Navbar, Footer, StatusBadge, DeliveryTimeline
│       │   ├── data/              # mock orders
│       │   ├── pages/             # Home, Dashboard, Orders, OrderDetails, Track
│       │   ├── App.jsx
│       │   ├── main.jsx
│       │   └── styles.css
│       ├── public/
│       ├── screenshots/          # submission screenshots
│       ├── index.html
│       ├── package.json
│       ├── vite.config.js
│       └── README.md
├── week-03/
│   └── zyroo-local-delivery/     # React + Vite — order & delivery management
│       ├── src/
│       │   ├── components/       # Navbar, Footer, StatusBadge, PriorityBadge,
│       │   │                     # DeliveryTimeline, ProtectedRoute, ConfirmDialog,
│       │   │                     # EmptyState, Icon, Loader, Skeleton, Spinner
│       │   ├── context/          # AuthContext, OrdersContext, ToastContext
│       │   ├── data/              # mock orders, mock users/roles
│       │   ├── hooks/             # useAsyncAction, useLoadingDelay
│       │   ├── pages/
│       │   │   ├── auth/          # Login, Register
│       │   │   ├── business/      # Dashboard, Orders, OrderForm (create/edit)
│       │   │   ├── rider/         # RiderDashboard
│       │   │   ├── customer/      # CustomerOrders
│       │   │   ├── Home.jsx
│       │   │   ├── Track.jsx      # public order lookup
│       │   │   ├── OrderDetails.jsx  # shared, role-aware actions
│       │   │   └── NotFound.jsx
│       │   ├── App.jsx
│       │   ├── main.jsx
│       │   └── styles.css
│       ├── public/
│       ├── screenshots/          # submission screenshots
│       ├── .oxlintrc.json
│       ├── index.html
│       ├── package.json
│       ├── package-lock.json
│       ├── vite.config.js
│       └── README.md
├── week-04/
│   └── zyroo-local-delivery/     # React + Vite — delivery tracking & notifications
│       ├── src/
│       │   ├── components/       # ConfirmDialog, DeliveryMap, DeliveryTimeline,
│       │   │                     # EmptyState, Footer, Icon, Loader, Navbar,
│       │   │                     # NotificationBell, PriorityBadge, ProtectedRoute,
│       │   │                     # RiderInfoCard, Skeleton, Spinner, StatusBadge
│       │   ├── context/          # AuthContext, NotificationsContext,
│       │   │                     # OrdersContext, ToastContext
│       │   ├── data/              # notifications, orders, users
│       │   ├── hooks/             # useAsyncAction, useLoadingDelay, useMyNotifications
│       │   ├── pages/             # auth (Login, Register), business (Dashboard, OrderForm, Orders),
│       │   │                     # customer (CustomerOrders), rider (RiderDashboard),
│       │   │                     # Home, NotFound, OrderDetails, Track
│       │   ├── App.jsx
│       │   ├── main.jsx
│       │   └── styles.css
│       ├── public/
│       ├── screenshots/          # submission screenshots
│       ├── .oxlintrc.json
│       ├── index.html
│       ├── package.json
│       ├── package-lock.json
│       ├── vite.config.js
│       └── README.md
├── .gitignore
└── README.md
```

## Week 1 — Onboarding & Environment Setup

- Environment: VS Code, Chrome DevTools, Git, GitHub, Node.js + npm
- Test page: `week-01/index.html` — a personal intro page verifying HTML/CSS/JS
  are correctly linked (heading, avatar placeholder, styled layout, responsive
  down to mobile, and a button wired to a JavaScript interaction)
- Evidence (Node/npm version, Git version, page screenshot, DevTools console,
  repo screenshot, community/channel proof) goes in `week-01/evidence/`

## Setup

```bash
git init
git add .
git commit -m "Week 1 frontend setup"
git remote add origin <your-repo-url>
git push -u origin main
```

## Week 2 — Local Delivery & Logistics Frontend MVP

- Project: `week-02/zyroo-local-delivery/` — React (Vite) + React Router
- Pages: Home, Dashboard, Orders, Order Details, Customer Tracking
- Mock data only, no backend; responsive down to mobile
- See `week-02/zyroo-local-delivery/README.md` for setup and page details

## Week 3 — Order & Delivery Management

- Project: `week-03/zyroo-local-delivery/` — carries the Week 2 app forward
- Adds mock login/registration with three roles: Business, Rider, Customer
  (Context API for auth, orders, and toast state; role-protected routes)
- Business: create/edit/cancel orders, assign or reassign a rider, searchable
  and filterable order list
- Rider: dashboard grouped into Today / Pending / Active / Completed, accept
  delivery, mark picked up, start transit, mark delivered
- Customer: current/previous orders, order details with a live delivery
  timeline; a public Track page still works without logging in
- Mock data + demo accounts persisted to `localStorage`, still no backend
- See `week-03/zyroo-local-delivery/README.md` for demo accounts, the full
  delivery flow, and setup details

## Week 4 — Delivery Tracking & Notifications

- Project: `week-04/zyroo-local-delivery/` — carries the Week 3 app forward
- Delivery tracking view (public Track page + order details): a simulated
  route/map showing pickup, delivery, and the rider's position along the
  route, driven by the order's status
- Rider info card: name, avatar, phone, vehicle, and current delivery status
- Simulated estimated delivery time alongside the tracking view
- In-app notifications: a bell icon in the nav with an unread badge, scoped
  per role, generated live as orders are created/assigned/accepted/picked
  up/in transit/delivered/cancelled — seeded with a short realistic history
- Business Orders page: Rider and Date-range filters added alongside the
  existing Status filter and Order ID/customer/rider search
- Same mock-data, no-backend, `localStorage`-persisted architecture as
  Week 3 — see `week-04/zyroo-local-delivery/README.md` for details
