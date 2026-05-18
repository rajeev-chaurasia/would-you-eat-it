const express = require('express');
const db = require('../db');
const { SORT } = require('../constants');
const router = express.Router();

router.get('/results', (req, res) => {
  const { sort = SORT.POPULAR, region } = req.query;

  try {
    let query = `
      SELECT
        i.id, i.name, i.country, i.region, i.description,
        i.image_url AS imageUrl,
        COALESCE(COUNT(v.id), 0) as totalVotes,
        COALESCE(SUM(CASE WHEN v.choice = 'yes' THEN 1 ELSE 0 END), 0) as yesCount,
        COALESCE(SUM(CASE WHEN v.choice = 'no' THEN 1 ELSE 0 END), 0) as noCount,
        COALESCE(
          CAST(SUM(CASE WHEN v.choice = 'yes' THEN 1 ELSE 0 END) AS FLOAT) /
          NULLIF(COUNT(v.id), 0) * 100,
          0
        ) as yesPercent
      FROM items i
      LEFT JOIN votes v ON i.id = v.item_id
    `;

    const params = [];
    if (region) {
      query += ` WHERE i.region = ?`;
      params.push(region);
    }

    query += ` GROUP BY i.id`;

    if (sort === SORT.POPULAR) {
      query += ` ORDER BY yesPercent DESC, totalVotes DESC`;
    } else if (sort === SORT.HATED) {
      query += ` ORDER BY yesPercent ASC, totalVotes DESC`;
    } else if (sort === SORT.DIVISIVE) {
      query += ` ORDER BY ABS(yesPercent - 50) ASC, totalVotes DESC`;
    }

    const results = db.prepare(query).all(...params);
    const totalVotes = db.prepare('SELECT COUNT(*) as count FROM votes').get().count;
    const totalSessions = db.prepare('SELECT COUNT(DISTINCT session_id) as count FROM votes').get().count;

    res.json({ results, totalVotes, totalSessions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

router.get('/matches', (req, res) => {
  const { sessionId } = req.query;

  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId required' });
  }

  try {
    const matches = db.prepare(`
      SELECT
        i.id, i.name, i.country, i.region, i.description,
        i.image_url AS imageUrl,
        CAST(SUM(CASE WHEN global_v.choice = 'yes' THEN 1 ELSE 0 END) AS FLOAT) /
          NULLIF(COUNT(global_v.id), 0) * 100 as yesPercent
      FROM items i
      JOIN votes user_v ON i.id = user_v.item_id AND user_v.session_id = ? AND user_v.choice = 'yes'
      LEFT JOIN votes global_v ON i.id = global_v.item_id
      GROUP BY i.id
      HAVING yesPercent > 70
      ORDER BY yesPercent DESC
    `).all(sessionId);

    res.json({ matches });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

router.get('/stats', (req, res) => {
  const { sessionId } = req.query;
  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId required' });
  }

  try {
    const userStats = db.prepare(`
      SELECT
        COALESCE(SUM(CASE WHEN choice = 'yes' THEN 1 ELSE 0 END), 0) as yesCount,
        COALESCE(SUM(CASE WHEN choice = 'no' THEN 1 ELSE 0 END), 0) as noCount
      FROM votes WHERE session_id = ?
    `).get(sessionId);

    res.json(userStats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

module.exports = router;
