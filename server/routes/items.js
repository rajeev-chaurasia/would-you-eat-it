const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/items', (req, res) => {
  const { sessionId } = req.query;

  try {
    const selectCols = 'id, name, country, region, description, image_url AS imageUrl';
    let items;

    if (!sessionId) {
      items = db.prepare(`SELECT ${selectCols} FROM items`).all();
    } else {
      items = db.prepare(`
        SELECT ${selectCols} FROM items
        WHERE id NOT IN (SELECT item_id FROM votes WHERE session_id = ?)
      `).all(sessionId);
    }

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
