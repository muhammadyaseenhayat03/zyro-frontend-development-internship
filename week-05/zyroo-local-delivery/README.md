# Waypoint — Local Delivery Platform

Week 5 build for the ZYROO internship: **Advanced Platform Integration &
Real-Time Operations**. Everything from Weeks 2–4 (order/delivery
management, tracking, notifications, search/filters) now runs through a
central API service layer with genuine loading/error states, optimistic UI
updates, a simulated real-time delivery channel, pagination, and stronger
form validation. Still no real backend — a mock API service plays that role
— but every screen consumes data the same way it would if there were one.

## Technologies used

- React 19
- React Router (HashRouter)
- Context API for auth, orders, notifications, and toast state
- A hand-rolled mock API service layer (`src/services/api.js`) standing in
  for a REST backend — see "Architecture & API layer" below
- Plain CSS (custom design system, no framework)
- Vite, with `.env`-based configuration

## Project structure

```
zyroo-local-delivery/
├── public/
├── screenshots/
├── src/
│   ├── components/        # Reusable UI: Navbar, Footer, Icon, Loader, Spinner,
│   │                       # StatusBadge, PriorityBadge, DeliveryTimeline, DeliveryMap,
│   │                       # RiderInfoCard, NotificationBell, ConfirmDialog, EmptyState,
│   │                       # ProtectedRoute
│   ├── layouts/            # AppLayout — the persistent Navbar/Footer chrome around routes
│   ├── pages/
│   │   ├── auth/           # Login, Register
│   │   ├── business/       # Dashboard, Orders (search/filter/pagination), OrderForm
│   │   ├── rider/          # RiderDashboard
│   │   ├── customer/       # CustomerOrders
│   │   ├── Home.jsx, Track.jsx, OrderDetails.jsx, NotFound.jsx
│   ├── context/            # AuthContext, OrdersContext, NotificationsContext, ToastContext
│   │                       # — state management; each calls the services/ layer, never
│   │                       # localStorage or data/ directly
│   ├── services/           # api.js (central API/service layer), realtime.js (simulated
│   │                       # live-update channel)
│   ├── hooks/              # useAsyncAction (button pending state), useMyNotifications
│   ├── data/                # Seed data + pure helpers: orders.js, users.js, notifications.js
│   ├── utils/               # datetime.js — small shared formatting helpers
│   ├── config/              # env.js — reads import.meta.env in one place
│   ├── App.jsx, main.jsx, styles.css
├── .env.example              # Copy to .env — see "Environment configuration"
├── .gitignore
├── index.html, package.json, vite.config.js
└── README.md
```

## Architecture & API layer

Every read or write goes through `src/services/api.js` instead of a
component or context touching `localStorage` directly. It exposes the
functions a real REST client would: `login`, `getUsers`/`saveUsers`,
`getOrders`, `createOrder`, `updateOrder`, `assignRider`,
`updateDeliveryStatus`, `getNotifications`/`saveNotifications`. Each one:

- simulates real request latency (`VITE_API_DELAY_MS`)
- can simulate a failure — either a random rate (`VITE_API_FAILURE_RATE`) or
  deterministically via `window.__forceApiFailure = true` in the console,
  for testing error/retry paths on demand
- is the *only* place that reads/writes `localStorage` for its resource

Swapping this file's internals for real `fetch()` calls later wouldn't
require touching a single component or context — every caller already only
knows about the functions above, not how they're implemented.

## Advanced state management

`AuthContext` and `OrdersContext` now hold real async state, not just data:

| Piece | Where |
| --- | --- |
| Authenticated user + role | `AuthContext` → `user` |
| All users (for the customer-linking dropdown) | `AuthContext` → `users` |
| Current orders | `OrdersContext` → `orders` |
| Active delivery (order currently open in tracking) | `OrdersContext` → `activeDeliveryId` |
| Notifications | `NotificationsContext` |
| Loading states | `authLoading`, `ordersLoading`, `notificationsLoading` |
| API errors | `ordersError` (with a `refreshOrders()` retry) |

`ProtectedRoute` waits on `authLoading` **and** `ordersLoading` before
deciding anything — not just whether someone's logged in, but whether their
data has actually arrived yet. That closes a real gap: without it, a direct
link to an order's edit page could flash "not found" for the instant before
orders had finished loading. If the initial order fetch fails, `ProtectedRoute`
shows an error state with a **Retry** button instead of silently rendering
an empty board.

## Protected role-based actions

Unchanged in spirit from Week 3, reinforced this week: `ProtectedRoute`
gates every route by role, and the Business-only edit/assign/cancel rules
(`canEditOrder` / `canAssignRider` / `canCancelOrder` in `src/data/orders.js`)
are enforced again inside the context functions themselves — not just in
the UI — right before each write, against the order's *current* status.

## Real-time delivery updates

There's no WebSocket/SSE server here, so `src/services/realtime.js` plays
that role: a simple interval-based channel that occasionally nudges one
eligible in-flight order forward (Assigned → Accepted → Picked up → In
transit → Delivered), applied through the same `updateDeliveryStatus` a
rider's own action would use. Every screen watching that order — a
Business's dashboard, a Customer's tracking page, the notification bell —
updates immediately, with no page refresh and no polling loop in the UI
layer itself.

To stay out of the way of manual testing, the simulator never touches
Pending or a terminal state, only advances one order per tick, and skips
any order a real user touched in the last 60 seconds. Tune or disable it via
`VITE_REALTIME_INTERVAL_MS` (see "Environment configuration").

## Optimistic UI updates

Rider delivery actions — Accept, Mark picked up, Start transit, Mark
delivered — update the order's status in the UI **immediately** when the
button is pressed, fire the request in the background, and only roll back
to the previous status (with an error toast, and a persisted "important
order error" notification) if that request fails. Marking a notification as
read follows the same pattern: the badge updates instantly and only reverts
if persisting the change fails. This is what makes these particular actions
feel instant instead of waiting on a round trip that, in a real app, usually
succeeds anyway.

Everything else (create/edit an order, assign a rider, cancel an order,
sign in/up) stays a plain request-then-confirm flow — those already show a
spinner via `useAsyncAction` and only navigate or update on a confirmed
success, which is the right call for actions with real consequences (you
don't want to *look* logged in before you actually are).

## Delivery tracking (Week 4, extended)

The tracking view (`Track.jsx`, and every order's details page) now also
shows a **Last updated** timestamp (`order.updatedAt`, formatted via
`src/utils/datetime.js`), alongside the existing simulated route map, rider
info card, current status, and delivery timeline — so it's clear not just
*what* the status is, but *when* it last changed (useful now that the
realtime simulator can change it without anyone clicking anything).

## Advanced search & filtering

The Business Orders page combines, all at once: free-text search (Order ID,
customer, or rider name), a Status filter, a Rider filter, and a Date-range
filter (Today / Last 7 days / Last 30 days) — plus a **Clear filters**
button that appears the moment any of them are active, and resets straight
back to an unfiltered view.

## Pagination

The same page paginates results at 6 per page once a filtered result set is
larger than that, with a "Showing X–Y of Z" count, Previous/Next controls,
and an automatic reset to page 1 whenever the search or filters change (so
narrowing a filter can never strand you on a now-empty page 3 with no
explanation).

## Data validation

- **Order form**: customer name required, phone checked against a basic
  pattern, pickup and delivery both required and can't be identical.
- **Sign up**: name required, email checked against a basic pattern,
  password minimum length — each with its own clear message instead of one
  generic "something's wrong."

## Environment configuration

Copy `.env.example` to `.env` (already gitignored) to tune the mock API:

```bash
cp .env.example .env
```

| Variable | Default | What it does |
| --- | --- | --- |
| `VITE_API_DELAY_MS` | `350` | Simulated latency on every mock API call |
| `VITE_API_FAILURE_RATE` | `0` | Chance (0–1) any given call randomly fails — try `0.15` to exercise error/retry states |
| `VITE_REALTIME_INTERVAL_MS` | `20000` | How often the simulated real-time channel can advance a delivery; `0` disables it |

There are no real secrets in this app (no real backend to hold credentials
for), but the pattern — reading config from `import.meta.env` in one place
(`src/config/env.js`) rather than scattering `import.meta.env.X` through
components — is the same one a real API base URL or key would follow.

## Roles & what each can do

| Role | Can do |
| --- | --- |
| **Business** | Create orders (optionally linked to a registered customer account), search/filter/paginate the order list, edit an order, assign or reassign a rider, cancel an order (with confirmation) |
| **Rider** | See deliveries grouped into Today / Pending / Active / Completed, accept an assigned delivery, mark picked up, start transit, mark delivered — all optimistic |
| **Customer** | View current and previous orders linked to their account, open order details with a live delivery timeline and tracking map |

Signed-in users can also look up an order on the **Track delivery** page.

## How Business, Rider, and Customer connect

An order is the one shared record all three roles read from — nobody gets a
duplicate copy:

- **`order.businessId`** — the business that created it
- **`order.riderId`** — set when a business assigns a rider
- **`order.customerId`** — set when a business links the order to a
  registered customer account on the create/edit form

When creating or editing an order, the Business picks a **Customer account**
from a dropdown of registered customers (or leaves it as "walk-in customer").
That's what makes a new Customer sign-up actually see something — a
business has to place an order under their account first.

## Business Account order permissions

| Status | Edit Order | Assign/Reassign Rider | Cancel Order |
| --- | --- | --- | --- |
| Pending | ENABLED | ENABLED | ENABLED |
| Assigned | ENABLED | ENABLED | ENABLED |
| Accepted | ENABLED | DISABLED | ENABLED |
| Picked up | DISABLED | DISABLED | ENABLED |
| In transit | DISABLED | DISABLED | ENABLED |
| Delivered | DISABLED | DISABLED | DISABLED |
| Cancelled | DISABLED | DISABLED | DISABLED |

Once a package is **picked up**, the order's details and rider are locked —
but **cancellation stays available** through Picked up and In transit, only
closing once the order is Delivered.

## Loading, error, and retry states

- **Session/data loading** — `ProtectedRoute` shows a full-page `Loader`
  while auth and orders are resolving, and an error + **Retry** state if the
  initial order fetch failed.
- **Route navigation** — every role-specific page is `React.lazy()`-loaded
  inside a `<Suspense fallback={<Loader fullPage />}>`; a page you've
  already visited shows nothing extra, since there's genuinely nothing left
  to wait for.
- **Button-level actions** — Sign in, Sign up, Create/Edit order, Assign
  rider, and Cancel order all go through the shared `useAsyncAction` hook:
  disabled button + inline `Spinner` + guaranteed cleanup in a `finally`, so
  a button can never get stuck loading regardless of success or failure.
  **Log out** has its own dedicated `isLoggingOut` state in `AuthContext`
  for the same reason, since it touches session storage directly.
- **Optimistic actions** — see "Optimistic UI updates" above for how these
  handle failure differently (rollback + toast + persisted notification,
  rather than just staying in a loading state).

## Performance notes

- `AuthContext`, `OrdersContext`, and `ToastContext` wrap their mutator
  functions in `useCallback` and their exposed `value` in `useMemo`, so a
  state change in one (e.g. a toast auto-dismissing) doesn't force every
  consumer of the *other* contexts to re-render.
- Business Orders, Rider Dashboard, and Customer Orders each memoize their
  filtered/derived order lists (including the base "my orders" array those
  memos depend on) so unrelated re-renders don't recompute them.
- Business Orders uses a memoized `OrderTableRow` (one click handler per row
  instead of several inline closures per row), and `StatusBadge` /
  `PriorityBadge` — rendered once per row in every order list — are wrapped
  in `React.memo`.

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Business | business@waypoint.demo | business123 |
| Rider | hamza@waypoint.demo | rider123 |
| Rider | bilal@waypoint.demo | rider123 |
| Rider | faizan@waypoint.demo | rider123 |
| Rider | usman@waypoint.demo | rider123 |
| Customer | ali@customer.demo | customer123 |

New accounts can also be created from **Sign up**.

## Delivery flow

```
Business creates order (pending), optionally linked to a customer account
        ↓
Business assigns a rider (assigned)
        ↓
Rider accepts the delivery (accepted)               ┐
        ↓                                            │ optimistic UI +
Rider marks picked up (picked_up)                     │ can also advance
        ↓                                            │ via the simulated
Rider starts transit (in_transit)                     │ real-time channel
        ↓                                            │
Rider marks delivered (delivered)                    ┘
        ↓
Customer sees the order's live status under "My orders"
```

An order can be cancelled by the business at any point before it's delivered.

## Setup instructions

```bash
cp .env.example .env   # optional — see "Environment configuration"
npm install
npm run dev             # start the dev server
npm run build            # production build to /dist
npm run preview           # preview the production build
```

## Mock data

Seed orders, users, and notifications live in `src/data/`. All changes made
in the app go through `src/services/api.js`, which persists them to
`localStorage` — so try creating an order as the business demo account,
assigning it to a rider, then watch it either as that rider or just wait:
the real-time simulator may progress it on its own within ~20 seconds.

## Screenshots

See the `screenshots/` folder.

## Not included this week

A real backend/database (the mock API service layer stands in for one), a
real map/GPS provider, push/browser notifications (these are in-app only),
and payments — planned for later weeks.

## Assigning a rider on create / edit

The Create order and Edit order forms include an **Assign rider** field.
Choosing a rider while creating an order saves it as Assigned straight away;
leaving it empty keeps it Pending. In Edit order the rider can be changed
(or cleared) until the delivery is accepted, after which the field is
locked. Any change is reflected in the order details, order list and
notifications immediately.
