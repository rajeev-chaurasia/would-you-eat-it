const express = require('express');
const db = require('../db');
const { validateVotePayload, validateUndoPayload } = require('../middleware');
const router = express.Router();

router.post('/vote', validateVotePayload, (req, res) => {
  const { itemId, choice, sessionId, decisionTimeMs } = req.body;
  const timeMs = Number(decisionTimeMs) || 0;

  try {
    db.prepare(`
      INSERT OR REPLACE INTO votes (session_id, item_id, choice, decision_time_ms)
      VALUES (?, ?, ?, ?)
    `).run(sessionId, itemId, choice, timeMs);

    const remainingCount = db.prepare(`
      SELECT COUNT(*) as count FROM items
      WHERE id NOT IN (SELECT item_id FROM votes WHERE session_id = ?)
    `).get(sessionId).count;

    res.json({ success: true, remaining: remainingCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to record vote' });
  }
});

router.post('/undo', validateUndoPayload, (req, res) => {
  const { sessionId } = req.body;

  try {
    const lastVote = db.prepare(`
      SELECT item_id FROM votes
      WHERE session_id = ?
      ORDER BY voted_at DESC
      LIMIT 1
    `).get(sessionId);

    if (!lastVote) {
      return res.status(404).json({ error: 'No vote found to undo' });
    }

    db.prepare('DELETE FROM votes WHERE session_id = ? AND item_id = ?')
      .run(sessionId, lastVote.item_id);

    const item = db.prepare(
      'SELECT id, name, country, region, description, image_url AS imageUrl FROM items WHERE id = ?'
    ).get(lastVote.item_id);

    res.json({ success: true, undoneItem: item });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to undo vote' });
  }
});

module.exports = router;
