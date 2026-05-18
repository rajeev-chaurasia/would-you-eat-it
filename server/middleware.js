const { VOTE, SESSION_ID_MAX_LENGTH } = require('./constants');

function validateVotePayload(req, res, next) {
  const { itemId, choice, sessionId } = req.body;
  
  if (!Number.isInteger(itemId)) {
    return res.status(400).json({ error: 'Invalid itemId' });
  }
  
  if (!Object.values(VOTE).includes(choice)) {
    return res.status(400).json({ error: 'Invalid choice' });
  }
  
  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ error: 'Invalid sessionId' });
  }
  
  if (sessionId.length > SESSION_ID_MAX_LENGTH) {
    return res.status(400).json({ error: 'sessionId too long' });
  }
  
  next();
}

function validateUndoPayload(req, res, next) {
  const { sessionId } = req.body;
  
  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ error: 'Invalid sessionId' });
  }
  
  if (sessionId.length > SESSION_ID_MAX_LENGTH) {
    return res.status(400).json({ error: 'sessionId too long' });
  }
  
  next();
}

module.exports = {
  validateVotePayload,
  validateUndoPayload
};
