# Waypoint — Local Delivery Platform

Week 2 frontend MVP for the ZYROO internship: a local delivery & logistics
management prototype. Everything runs on mock data — no backend yet.

## Technologies used

- React 19
- React Router (HashRouter)
- Plain CSS (custom design system, no framework)
- Vite

## Pages

| Route         | Page                                           |
| ------------- | ---------------------------------------------- |
| `/`           | Home — hero, features, CTA                     |
| `/dashboard`  | Dashboard — delivery numbers at a glance       |
| `/orders`     | Orders — searchable list of deliveries         |
| `/orders/:id` | Order details — info + delivery timeline       |
| `/track`      | Customer tracking — look up an order by number |

Flow: **Home → Dashboard → Orders → Order Details → Customer Tracking**

## Setup instructions

```bash
npm install
npm run dev       # start the dev server
npm run build     # production build to /dist
npm run preview   # preview the production build
```

## Mock data

Sample orders live in `src/data/orders.js`. Try order `DL001` on the
tracking page to see one currently in transit.

## Screenshots

See the `screenshots/` folder.

## Not included this week

Real-time GPS, maps, payments, notifications, complex authentication, and a
real backend — planned for later weeks.
