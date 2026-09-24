# Waypoint — Local Delivery Platform

Week 4 build for the ZYROO internship: delivery tracking, rider info,
in-app notifications, and search/filtering on top of the Week 3 order and
delivery management system for Business, Rider, and Customer. Still
frontend-only, with mock data persisted to `localStorage` so demo accounts,
orders, and notifications survive a refresh.

## Technologies used

- React 19
- React Router (HashRouter)
- Context API for auth, orders, and toast state (no external state library)
- Plain CSS (custom design system, no framework)
- Vite

## Project Structure

```
zyroo-local-delivery/
├── public/
├── screenshots/               # Submission screenshots
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── ConfirmDialog.jsx  # Confirmation modal dialog (e.g. for order cancellation)
│   │   ├── DeliveryMap.jsx     # Visual tracking map with simulated waypoint & rider route positioning
│   │   ├── DeliveryTimeline.jsx# Step-by-step visual order status timeline
│   │   ├── EmptyState.jsx     # Reusable empty state view with icons and call-to-actions
│   │   ├── Footer.jsx         # Global footer component
│   │   ├── Icon.jsx           # Unified SVG stroke icon system
│   │   ├── Loader.jsx         # Full-page loading screen component
│   │   ├── Navbar.jsx         # Header navigation bar with role badge & NotificationBell
│   │   ├── NotificationBell.jsx# Unread notification badge counter & dropdown menu
│   │   ├── PriorityBadge.jsx  # Urgent / Normal order priority badge indicator
│   │   ├── ProtectedRoute.jsx # Role-based & authentication route guard
│   │   ├── RiderInfoCard.jsx  # Card displaying assigned rider info, phone, vehicle & current activity status
│   │   ├── Skeleton.jsx       # Content placeholder loaders for loading states
│   │   ├── Spinner.jsx        # Button-level inline loading spinner
│   │   └── StatusBadge.jsx    # Color-coded order status indicator badge
│   ├── context/               # Global state contexts & providers
│   │   ├── AuthContext.jsx         # Authentication session, user login/logout & permissions
│   │   ├── NotificationsContext.jsx# Live order lifecycle event notification generator & storage
│   │   ├── OrdersContext.jsx       # Orders state, CRUD operations & status transition permissions
│   │   └── ToastContext.jsx        # Global toast message notification system
│   ├── data/                  # Mock data stores & helpers
│   │   ├── notifications.js   # Seed notification history with role-scoped events
│   │   ├── orders.js          # Seed orders data, waypoint routes & status permission helpers
│   │   └── users.js           # Demo accounts for Business, Rider, and Customer roles
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAsyncAction.js    # Async operation handling with inline loading & error management
│   │   ├── useLoadingDelay.js   # Controlled minimum loading delay simulation hook
│   │   └── useMyNotifications.js# Helper hook filtering notifications for current logged-in user
│   ├── pages/                 # Application views / routes
│   │   ├── auth/              # Authentication pages (Login, Register)
│   │   ├── business/          # Business portal (Dashboard, Orders list with filters, OrderForm)
│   │   ├── customer/          # Customer portal (CustomerOrders)
│   │   ├── rider/             # Rider portal (RiderDashboard)
│   │   ├── Home.jsx           # Landing page with role-tailored dashboard metrics
│   │   ├── NotFound.jsx       # 404 page not found view
│   │   ├── OrderDetails.jsx   # Detailed order view with live map tracking, timeline & rider info
│   │   └── Track.jsx          # Public delivery tracking lookup page with map & ETA
│   ├── App.jsx                # Root app component, provider wrapping & lazy route definitions
│   ├── main.jsx               # Application DOM mounting entry point
│   └── styles.css             # Custom CSS design system stylesheet
├── .gitignore
├── .oxlintrc.json             # Oxlint linter configuration
├── index.html                 # HTML entry point
├── package.json               # Dependencies & build scripts
├── package-lock.json          # Dependency lockfile
├── README.md                  # Project documentation
└── vite.config.js             # Vite configuration
```


## Roles & what each can do

| Role | Can do |
| --- | --- |
| **Business** | Create orders (optionally linked to a registered customer account), view/search/filter the order list, edit an order, assign or reassign a rider, cancel an order (with confirmation) |
| **Rider** | See deliveries grouped into Today / Pending / Active / Completed, accept an assigned delivery, mark picked up, start transit, mark delivered |
| **Customer** | View current and previous orders that are linked to their account, open order details with a live delivery timeline |

Anyone (logged in or not) can also look up an order on the public **Track
delivery** page.

## How Business, Rider, and Customer connect

An order is the one shared record all three roles read from — nobody gets a
duplicate copy:

- **`order.businessId`** — the business that created it → shows up in that
  business's Orders/Dashboard
- **`order.riderId`** — set when a business assigns a rider → shows up on
  that rider's dashboard, and only that rider can act on it
- **`order.customerId`** — set when a business links the order to a
  registered customer account on the create/edit form → shows up under that
  customer's **My orders**

When creating or editing an order, the Business picks a **Customer account**
from a dropdown of registered customers (or leaves it as "walk-in customer"
for someone without a Waypoint account). That's what makes a new Customer
sign-up actually see something — a business has to place an order under
their account first, same as a real logistics platform.

## Business Account order permissions

What a Business can do to an order depends on its current status. This is
the single source of truth (`src/data/orders.js`) — every component that
enables/disables Edit, Assign/Reassign, or Cancel reads from the same three
functions, and the mutating context functions re-check the same rules
against the *live* order right before writing, so the rule is enforced even
if a button's disabled state were somehow bypassed:

| Status | Edit Order | Assign/Reassign Rider | Cancel Order |
| --- | --- | --- | --- |
| Pending | ENABLED | ENABLED | ENABLED |
| Assigned | ENABLED | ENABLED | ENABLED |
| Accepted | ENABLED | DISABLED | ENABLED |
| Picked up | DISABLED | DISABLED | ENABLED |
| In transit | DISABLED | DISABLED | ENABLED |
| Delivered | DISABLED | DISABLED | DISABLED |
| Cancelled | DISABLED | DISABLED | DISABLED |

The key rule: once a package is **picked up**, the order's details and rider
are locked — but **cancellation stays available** through Picked up and In
transit, only closing once the order is Delivered.

- `canEditOrder(status)` / `canAssignRider(status)` / `canCancelOrder(status)`
  — pure helpers used everywhere this needs checking (order list row icons,
  the order details page, the edit form).
- `editOrderDetails(id, patch)` and `assignRider(id, rider)` in
  `OrdersContext` re-validate against the current order status before
  writing and return `{ ok, reason }`; a rejected call surfaces `reason` as
  an error toast instead of silently doing nothing or silently succeeding.
- Navigating straight to `/business/orders/:id/edit` for a locked order
  (bookmarked link, browser back button, etc.) shows a "can no longer be
  edited" state instead of the form — the check isn't only client-side
  button disabling.
- If the order's status changes while a Business user has it open (e.g. a
  rider marks it picked up in another tab), the permissions on the page
  update on the next render since they're derived straight from the order's
  current status, not a value captured when the page first loaded.

## Home page, by role

The "right now" panel on the home page is scoped to whoever is logged in
instead of showing one global number to everyone:

- **Signed out** — generic explainer + "Create an account"
- **Business** — their own order count, pending count, out-for-delivery count
- **Rider** — deliveries assigned to them, how many are active, how many are
  waiting on their acceptance
- **Customer** — their own active order count and most recent order's status

## Delivery tracking & notifications (Week 4)

- **Tracking view** — the public Track page and every order's details page
  now show a `DeliveryMap`: pickup and delivery pins connected by a route
  track, with a rider marker positioned along it based on the order's
  current status. There's no real map/GPS integration here — the task spec
  explicitly allows a simulated location, so the rider's position is a
  status-driven percentage along the track, and seed orders carry a
  plausible en-route town (`order.waypoint`, e.g. Chakdara between Mardan
  and Timergara) for a realistic label.
- **Rider info** — `RiderInfoCard` shows the assigned rider's name, an
  initials avatar (no photo upload in this app), phone, vehicle, and a
  plain-language status ("Heading to pickup", "On delivery", etc.) distinct
  from the order's own status badge.
- **Estimated delivery** — a simulated, status-driven ETA line
  (`estimatedDeliveryLabel`) shown next to the tracking panel.
- **Notifications** — `NotificationsContext` watches order data for
  lifecycle events (created, assigned, accepted, picked up, in transit,
  delivered, cancelled) and turns each into a notification, scoped by role
  the same way orders themselves are (`businessId` / `riderId` /
  `customerId`). The bell icon in the navbar shows an unread badge; clicking
  it opens a dropdown listing recent notifications, each linking to its
  order. Seed data ships with a short realistic history so the panel isn't
  empty on first load — try creating an order, assigning a rider, or
  progressing a delivery to see a new one appear live.
- **Search & filters** — the Business Orders page already searched by Order
  ID, customer, and rider name; it now also has Rider and Date-range filters
  alongside the existing Status filter.



A small shared component set keeps every screen consistent:

- `Icon` — one stroke-based icon set used across nav, stat cards, buttons, and empty states
- `EmptyState`, `Spinner`, `Loader` — consistent empty and loading UI instead of blank screens
- Urgent orders get a left accent border, a bolt icon, and a stronger badge so they're
  impossible to miss while scanning a list
- Toasts carry a tone icon (success / info / error); modals use the same elevation and
  motion as the rest of the app

## Assigning a rider (Business)

Open an order → pick a rider → **Assign**. The button shows a brief in-progress state,
then the app returns you to the **Orders** page automatically with the updated row
(new status + rider) and a single success toast — so it's obvious the assignment went
through instead of leaving you on a page that looks unchanged. The toast is guarded so
it can only fire once per assignment, even under React's development Strict Mode.

## Loading system

One consistent loading system covers the whole app, at three levels — no page has its
own ad-hoc loader:

- **App boot** — `App.jsx` shows the reusable `Loader` (full page) once, for every
  role alike, while session/auth and initial order data are being established.
  `ProtectedRoute` and all routes only ever mount *after* this resolves, so a
  protected page can never flash unauthorized/wrong-role content or redirect
  prematurely — there's no gap where `user` is unknown.
- **Route navigation** — every role-specific page (auth screens, all
  Business/Rider/Customer pages, and the shared order details page) is loaded with
  `React.lazy()` inside a single `<Suspense fallback={<Loader fullPage />}>` in
  `App.jsx`. Navigating to a page whose code hasn't been downloaded yet shows the
  same `Loader`; revisiting an already-loaded page shows nothing extra, since
  there's genuinely nothing left to wait for.
- **Button-level actions** — every mutating action (Sign in, Sign up,
  Create/Edit order, Assign rider, Cancel order, and each rider delivery
  action) is wrapped in the shared `useAsyncAction` hook. It disables the
  button, shows an inline `Spinner`, blocks double-submission while the
  action is in flight, and its `finally` always clears the pending state —
  on success *or* failure — so a button can never get stuck loading.
  `ConfirmDialog` accepts a `loading` prop so the Cancel-order confirmation
  follows the same pattern. **Log out** has its own dedicated `isLoggingOut`
  state in `AuthContext` instead, since it touches session/storage directly
  and needs the same success/failure/finally guarantee at the source of
  truth rather than in the button component.

There's no real backend here, so nothing is *actually* slow — `useAsyncAction`'s
brief delay stands in for request latency consistently across every action, rather
than some buttons responding instantly and others not. Once the boot gate resolves,
all order/user data lives in Context for the rest of the session, so list pages
(Dashboard, Orders, Rider deliveries, Customer orders, order details) render
straight from it — no per-page loading flicker on every navigation.

## Performance notes

- `AuthContext`, `OrdersContext`, and `ToastContext` wrap their mutator functions in
  `useCallback` and their exposed `value` in `useMemo`. Before this, each context
  handed out a brand-new object on every provider render, so *any* state change
  anywhere in that context (e.g. a toast auto-dismissing) re-rendered every
  consumer of it, even ones with nothing to do with what changed.
- Fixed a real memoization bug repeated across four pages: `orders.filter(...)`
  was being called directly in the component body to build a `mine` array,
  then passed into a `useMemo` as a dependency. Since `.filter()` returns a
  new array every render, that dependency never looked "unchanged" — the
  memo was silently doing nothing. `mine` is now itself memoized, so the
  memos built on top of it (search/filter results, rider delivery groups,
  dashboard stats) actually skip recomputation when nothing relevant changed.
- Table rows in Business Orders are a memoized `OrderTableRow` component
  (one click handler per row instead of seven inline closures per row), and
  `StatusBadge`/`PriorityBadge` — rendered once per row in every order list
  in the app — are wrapped in `React.memo`.
- `AuthProvider` no longer computes the users list twice on mount (it
  previously called the localStorage-reading `loadUsers()` once for its own
  state and a second time just to look up the saved session).

## Demo accounts

Use these on the login page, or tap the quick-login chips for the first three:

| Role | Email | Password |
| --- | --- | --- |
| Business | business@waypoint.demo | business123 |
| Rider | hamza@waypoint.demo | rider123 |
| Rider | bilal@waypoint.demo | rider123 |
| Rider | faizan@waypoint.demo | rider123 |
| Rider | usman@waypoint.demo | rider123 |
| Customer | ali@customer.demo | customer123 |

New accounts can also be created from **Sign up** — pick a role and it
routes to the right dashboard. Sign up as a new Customer, then log in as the
Business demo account and create (or edit) an order linked to that new
customer to see it flow all the way through.

## Delivery flow

```
Business creates order (pending), optionally linked to a customer account
        ↓
Business assigns a rider (assigned)
        ↓
Rider accepts the delivery (accepted)
        ↓
Rider marks picked up (picked_up)
        ↓
Rider starts transit (in_transit)
        ↓
Rider marks delivered (delivered)
        ↓
Customer sees the order's live status under "My orders"
```

An order can be cancelled by the business at any point before it's
delivered.

## Setup instructions

```bash
npm install
npm run dev       # start the dev server
npm run build      # production build to /dist
npm run preview    # preview the production build
```

## Mock data

Seed orders and demo users live in `src/data/orders.js` and
`src/data/users.js`. All order/account changes made in the app are written
to `localStorage`, so try creating an order as the business demo account,
then assigning it to a rider and completing it as that rider.

## Screenshots

See the `screenshots/` folder.

## Not included this week

A real map/GPS API, push/browser notifications (these are in-app only),
payments, and a real backend — planned for later weeks.
