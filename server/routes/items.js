const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/items', (req, res) => {
  const { sessionId } = req.query;

  try {
    const query = `
      SELECT f.id, f.name, f.country, f.region, f.description,
        f.image_url AS imageUrl,
        COALESCE(SUM(CASE WHEN v.vote = 'yes' THEN 1 ELSE 0 END), 0) AS yesCount,
        COALESCE(SUM(CASE WHEN v.vote = 'no' THEN 1 ELSE 0 END), 0) AS noCount,
        COUNT(v.id) AS totalVotes
      FROM items f
      LEFT JOIN votes v ON f.id = v.item_id
      ${sessionId ? 'WHERE f.id NOT IN (SELECT item_id FROM votes WHERE session_id = ?)' : ''}
      GROUP BY f.id
      ORDER BY RANDOM()
    `;

    const items = sessionId ? db.prepare(query).all(sessionId) : db.prepare(query).all();
    const totalCount = db.prepare('SELECT COUNT(*) as count FROM items').get().count;

    res.json({
      items,
      total: totalCount,
      remaining: items.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

module.exports = router;
