# Zyroo Frontend Development Internship

8-week frontend internship submissions, organized by week.

## Structure

```
zyro-frontend-development-internship/
├── week-01/
│   ├── avatar.jpg
│   ├── index.html
│   ├── style.css
│   ├── script.js
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
├── README.md
└── .gitignore
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
