'use strict';

const CONSTANTS = Object.freeze({
  VOTE: { YES: 'yes', NO: 'no' },
  SORT: { POPULAR: 'popular', DIVISIVE: 'divisive', HATED: 'hated' },
  SWIPE_THRESHOLD: 100,
  MAX_ROTATION: 15,
});

function getSessionId() {
  let id = localStorage.getItem('sessionId');
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : 'id-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('sessionId', id);
  }
  return id;
}

async function api(method, path, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch('/api' + path, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error('API error: ' + res.status + ' - ' + text);
  }
  return res.json();
}

// Global image error handler — replaces broken images with fallback
function setupImageErrorHandling() {
  document.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG' && !e.target.dataset.fallback) {
      e.target.dataset.fallback = 'true';
      e.target.classList.add('img-error');
    }
  }, true);
}

const state = {
  items: [],
  currentIndex: 0,
  sessionId: getSessionId(),
  totalCount: 0,
};
