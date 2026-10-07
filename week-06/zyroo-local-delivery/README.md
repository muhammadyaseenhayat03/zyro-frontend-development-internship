# Waypoint — Local Delivery Platform

**Final build — Week 6: Final Product Completion.** A local delivery and
logistics management platform for three roles (Business, Rider, Customer),
built across six weeks of the ZYROO Frontend Internship.

## Overview & problem statement

Small local delivery businesses need a simple way to create orders, assign
riders, and let customers track their package — without a heavyweight
logistics platform. Waypoint is a frontend-only implementation of that
workflow: a business creates and manages orders, a rider works through their
assigned deliveries, and a customer can track an order live, all sharing one
underlying order record so nobody sees stale or duplicated data.

## Features

- Email/password auth with role-based registration and protected routes
- Business: create/edit orders, assign or reassign a rider, cancel an order,
  search + status/rider/date filters (combinable, with Clear filters),
  pagination, a dashboard with stats and an urgent-orders callout
- Rider: deliveries grouped into Today/Pending/Active/Completed, optimistic
  accept/pick-up/transit/deliver actions
- Customer: current and previous orders, live tracking with a simulated
  route map, rider info card, ETA, and delivery timeline
- Business-only edit/assign/cancel permissions enforced by order status, at
  both the UI and the data layer (not just a disabled button)
- In-app notifications (bell + badge), generated from real order lifecycle
  events, scoped per role
- A simulated real-time channel that can advance an in-flight delivery on
  its own, reflected live on every screen watching that order
- Loading, error+retry, empty, and unauthorized states throughout
- Debounced search, memoized derived data, lazy-loaded routes

## User roles

| Role | Can do |
| --- | --- |
| Business | Create/edit/cancel orders, assign/reassign riders, search/filter/paginate the order list |
| Rider | Accept and progress deliveries assigned to them |
| Customer | View and track their own orders |

## Technology stack

React 19 · React Router (HashRouter) · Context API · Vite · plain CSS (no
framework) · a hand-rolled mock API service layer standing in for a REST
backend (see below) — no real database.

## Project structure

```
src/
├── components/   Navbar, Footer, Icon, Loader, Spinner, StatusBadge,
│                 PriorityBadge, DeliveryTimeline, DeliveryMap,
│                 RiderInfoCard, NotificationBell, ConfirmDialog,
│                 EmptyState, ProtectedRoute
├── layouts/      AppLayout — persistent Navbar/Footer chrome
├── pages/        auth/, business/, rider/, customer/, Home, Track,
│                 OrderDetails, NotFound
├── context/      AuthContext, OrdersContext, NotificationsContext,
│                 ToastContext — state management, each calling services/
├── services/     api.js (central API layer), realtime.js (simulated
│                 live-update channel)
├── hooks/        useAsyncAction, useDebouncedValue, useMyNotifications
├── data/         seed data + pure helpers (orders, users, notifications)
├── utils/        datetime.js
├── config/       env.js
```

## Installation & environment setup

```bash
npm install
cp .env.example .env   # optional — tunes the mock API, see below
npm run dev
npm run build
npm run preview
```

| `.env` variable | Default | What it does |
| --- | --- | --- |
| `VITE_API_DELAY_MS` | `350` | Simulated latency on every mock API call |
| `VITE_API_FAILURE_RATE` | `0` | Chance (0–1) a call randomly fails — try `0.15` to see error/retry states |
| `VITE_REALTIME_INTERVAL_MS` | `20000` | How often the simulated real-time channel can advance a delivery |

No real secrets exist in this app (there's no real backend to hold
credentials for) — `.env` is still gitignored, and `.env.example` documents
every variable without real values, matching how a real API key would be
handled.

## API information

There's no live backend. `src/services/api.js` plays that role: every
read/write in the app goes through it instead of a component touching
`localStorage` directly. It simulates request latency and can simulate
failures (randomly, or deterministically via `window.__forceApiFailure =
true` in the browser console) so the loading/error/retry UI has something
real to exercise. Swapping its internals for real `fetch()` calls would not
require changing any component or context.

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Business | business@waypoint.demo | business123 |
| Rider | hamza@waypoint.demo | rider123 |
| Customer | ali@customer.demo | customer123 |

(Three more demo riders exist — see `src/data/users.js` — and new accounts
can be created from Sign up.)

## Testing

No automated test suite ships in this repo. Manual pass covered: sign
up/in/out for all three roles, session persistence across refresh, order
create/edit/cancel/assign with the permission matrix enforced per status,
the full Business → Rider → Customer delivery lifecycle, optimistic
accept/status-update with simulated-failure rollback, search/filter/clear
combinations, pagination boundaries, the unauthorized-access page, and the
initial-load error + Retry path. See prior weeks' README sections (git
history) for the specific scenarios checked at each stage.

## Known limitations & future improvements

- No real backend/database — all data lives in `localStorage` via the mock
  API layer; clearing site data resets everything
- No real map/GPS provider — the tracking "map" is a simulated route visual
- No push/browser notifications — notifications are in-app only
- No payments
- Rider capacity/availability isn't modeled (a rider can be assigned
  regardless of their current workload)
- Next steps: a real backend, image uploads for proof-of-delivery, SMS/email
  notifications, and multi-business support

## Deployment

This is a static Vite build (`npm run build` → `dist/`) with no server-side
requirements — it's deployable as-is to Vercel, Netlify, or any static
host. It uses `HashRouter`, so client-side routes live after a `#` in the
URL and need no server rewrite rules for deep links to work. Set the
`VITE_*` environment variables in the hosting platform's dashboard before
building (see "Environment setup" above) rather than committing a `.env`
file. No live deployment is included with this submission.

## Screenshots

See the `screenshots/` folder.
