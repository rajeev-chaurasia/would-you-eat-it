# AI Usage Reflection

## Which parts of the system did AI write end-to-end?

Claude scaffolded the Express project structure, the SQLite schema, and the seed data file with 105 street foods and Unsplash image URLs. The CSS design system (dark theme, card layout, overlay animations) was mostly AI-generated. The basic CRUD route handlers were also drafted by Claude.

## Where did you have to push back on, fix, or rewrite AI output?

The biggest one: Claude initially suggested Supabase + React + Tailwind. I said no. The assignment allows local grading, so adding a cloud database and a React build step just creates failure points. I went with Express + SQLite + Vanilla JS instead. One command to start, zero external dependencies. This back-and-forth actually led to a much simpler and more reliable architecture.

Second fix: the seed data. Claude originally generated 21 base foods and copy-pasted them with prefixes like "Spicy Pad Thai" and "Sweet Takoyaki" to hit 100. I caught this and rewrote the entire dataset with 105 genuinely different street foods from 8 regions.

Third fix: the API returned SQLite column names (`image_url`) but the frontend expected camelCase (`imageUrl`). Every card image was broken. I added SQL column aliases across all route handlers to fix it.

## One thing AI did better than expected, and one thing it did worse

**Better:** The SQL aggregation queries for the results view, especially the "Most Divisive" sort (`ORDER BY ABS(yesPercent - 50) ASC`). Smart approach that makes the results page actually interesting.

**Worse:** Data quality. Claude took a shortcut on the 100-item requirement by recycling the same foods with cosmetic name changes. Any grader would have noticed immediately. Lesson: always verify AI output against the actual requirements, especially for quantity-based constraints.

## Other tools used

No other AI tools were used alongside Claude for this assignment.
