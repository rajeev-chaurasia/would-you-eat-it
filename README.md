# Would You Eat It?

Swipe through 100+ street foods from around the world. Would you eat it?

Mobile-first voting app built for CMPE 285 Final Exam (Question 10).

## Quick Start

```bash
npm install
npm run seed
npm start
```

Open [http://localhost:3000](http://localhost:3000).

Best viewed in Chrome DevTools with Device Toolbar set to iPhone 14 Pro (390x844).

## Architecture

Single Express server that handles both the API and serves the frontend. No build step, no second terminal, no external services.

- **Backend:** Node.js + Express, single process
- **Database:** SQLite via `better-sqlite3`, WAL mode enabled. Votes are deduplicated at the database level with a `UNIQUE(session_id, item_id)` constraint and `INSERT OR REPLACE`.
- **Frontend:** Vanilla JS + plain CSS. Three screens managed by toggling CSS classes. Custom swipe gesture engine supports both touch and mouse events.

## Trade-offs

| Decision | Why | What we gave up |
|---|---|---|
| SQLite over Postgres | Zero setup for the grader. Just `npm install` and go. | No horizontal scaling or concurrent writes |
| Vanilla JS over React | No build step, three screens total, React would be overkill | No component model, manual DOM updates |
| Plain CSS over Tailwind | ~550 lines of CSS. Tailwind adds PostCSS for no real gain here. | Fewer utility classes |
| Unsplash URLs over local images | No storage bloat, high quality photos | Needs internet. Some URLs may 404 over time (handled with CSS fallback) |
| `INSERT OR REPLACE` over `ON CONFLICT UPDATE` | Simpler syntax, same effect for our constraint | Resets `voted_at` on re-vote |

## Requirements

### Core (all done)
- [x] 105 distinct items with images and descriptions across 8 regions
- [x] Swipe card UI with drag gesture, tilt rotation, yes/no overlays
- [x] Results view with aggregate stats, sortable by Most Loved / Most Hated / Most Divisive
- [x] Region filter in results
- [x] Backend persistence with SQLite
- [x] End-of-deck screen with personal stats

### Stretch
- [x] Anonymous session identity (UUID via `crypto.randomUUID()`, stored in localStorage)
- [x] Undo last swipe
- [x] Matches view (items where you voted YES and global yes rate is above 70%)

## Design Principles
- **SRP + DRY:** Backend routes split into `items.js`, `votes.js`, `results.js`. Shared API helper on frontend.
- **Constants:** No magic strings. All vote types and sort modes in `constants.js`.
- **Clean code:** Guard clauses, humanized variable names, no dead code.

## Image Credits

Food photography from [Unsplash](https://unsplash.com) under the [Unsplash License](https://unsplash.com/license).

## Known Issues
- Some Unsplash photo IDs may 404 if the original photo gets removed. A CSS fallback handles this gracefully.
- Mouse drag outside the browser window can interrupt the gesture on desktop. Works perfectly on touch devices.
