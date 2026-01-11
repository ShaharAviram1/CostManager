---
# Cost Manager – Frontend Project

A React-based cost management web application developed as the **final project** for a Front-End Development course.

The app allows users to add expenses, generate monthly reports, and visualize costs using charts, with full support for multiple currencies and external exchange-rate sources.

---

## Features

- Add cost items (sum, currency, category, description)
- Monthly reports by year, month, and currency
- Pie chart (by category) and bar chart (by month)
- Currency conversion using rates fetched via `fetch`
- Configurable external rates URL (Settings page)
- Persistent storage using IndexedDB

---

## Tech Stack

- React + Vite
- Material UI (MUI)
- IndexedDB (via custom `idb.js` library)

Two versions of `idb.js` are included:
- React version (used by the app)
- Vanilla JS version (submitted separately for testing)

---

## Deployment

The application is deployed as a static frontend and supports client-side routing (e.g. `/charts`, `/settings`).

An example external currency rates file:
```
https://shaharaviram1.github.io/CostManager/rates.json
```

---

