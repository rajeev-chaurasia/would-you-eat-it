# AI Usage Reflection

## Which parts of the system did AI write end-to-end?

Claude scaffolded the Express project structure, the SQLite schema with WAL mode, and the initial route handlers for items, votes, results, matches, and stats. The CSS design system (dark theme, glassmorphism bottom bar, card overlays, medal rank badges) was mostly AI-generated. Claude also wrote the swipe gesture engine that handles both touch and mouse drag events, and the community pulse badge logic that shows vote stats on each card.

The seed data structure was AI-generated, but I had to manually verify and replace most of the Unsplash image URLs because many of them were returning 404s.

## Where did you have to push back on, fix, or rewrite AI output?

The biggest one: Claude initially suggested Supabase + React + Tailwind. I pushed back. The assignment allows local grading, so adding a cloud database and a React build step just creates unnecessary failure points. I went with Express + SQLite + Vanilla JS instead. One command to start, zero config. This back-and-forth led to a much simpler architecture.

Second fix: the seed data. Claude originally generated 21 base foods and copy-pasted them with prefixes like "Spicy Pad Thai" and "Sweet Takoyaki" to hit 100. I caught this and had the dataset rebuilt with 105 genuinely different street foods from 8 world regions. I also hand-picked several Unsplash photos myself (Pani Puri, Chaat, Takoyaki, Falafel) because the AI-selected ones were showing the wrong food entirely.

Third fix: column naming mismatch. The votes table uses `choice` as the column name, but Claude wrote `v.vote` in one of the SQL queries. This caused a 500 error on the deployed Render instance. Same kind of bug with `image_url` vs `imageUrl` across the API boundary. Both were caught by actually running the app and checking the console, not by trusting the AI.

Fourth fix: the seed script was destructive. It ran `DELETE FROM votes` on every startup, which meant all user data got wiped whenever the server restarted. I rewrote it to be idempotent, so it only seeds if the items table is empty.

## One thing AI did better than expected, and one thing it did worse

**Better:** The SQL aggregation queries for the results view. The "Most Divisive" sort uses `ORDER BY ABS(yesPercent - 50) ASC`, which surfaces foods where opinions are most split. The analytics endpoint also came together quickly with `AVG(decision_time_ms)` and `COUNT(DISTINCT session_id)`. These were genuinely useful and required no corrections.

**Worse:** Data quality and URL verification. Claude generated Unsplash photo IDs that looked plausible but many of them 404'd. Out of 105 image URLs, roughly 20 were broken on first pass. I had to batch-test every single URL with curl and replace the broken ones. The lesson: never trust AI-generated external URLs without verifying them yourself.

## Other tools used

No other AI tools were used alongside Claude for this assignment.
