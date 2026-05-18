const VOTE = Object.freeze({
  YES: 'yes',
  NO: 'no',
});

const SORT = Object.freeze({
  POPULAR: 'popular',
  DIVISIVE: 'divisive',
  HATED: 'hated',
});

const SESSION_ID_MAX_LENGTH = 64;

module.exports = {
  VOTE,
  SORT,
  SESSION_ID_MAX_LENGTH,
};
