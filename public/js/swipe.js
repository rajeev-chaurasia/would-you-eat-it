'use strict';

let startX = 0;
let currentX = 0;
let isDragging = false;

function initSwipeListeners() {
  const card = document.getElementById('card');

  card.addEventListener('touchstart', onDragStart, { passive: true });
  card.addEventListener('mousedown', onDragStart);
  document.addEventListener('touchmove', onDragMove, { passive: false });
  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('touchend', onDragEnd);
  document.addEventListener('mouseup', onDragEnd);
}

function onDragStart(e) {
  if (state.currentIndex >= state.items.length) return;

  isDragging = true;
  startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;

  const card = document.getElementById('card');
  card.style.transition = 'none';
}

function onDragMove(e) {
  if (!isDragging) return;
  if (e.type.includes('touch')) e.preventDefault();

  currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
  const deltaX = currentX - startX;

  const rotation = Math.max(-CONSTANTS.MAX_ROTATION, Math.min(CONSTANTS.MAX_ROTATION, deltaX * 0.1));
  const card = document.getElementById('card');
  card.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;

  const yesOverlay = card.querySelector('.overlay-yes');
  const noOverlay = card.querySelector('.overlay-no');

  if (yesOverlay && noOverlay) {
    const progress = Math.min(Math.abs(deltaX) / CONSTANTS.SWIPE_THRESHOLD, 1);
    if (deltaX > 0) {
      yesOverlay.style.opacity = progress;
      noOverlay.style.opacity = 0;
    } else {
      noOverlay.style.opacity = progress;
      yesOverlay.style.opacity = 0;
    }
  }
}

async function onDragEnd() {
  if (!isDragging) return;
  isDragging = false;

  const deltaX = currentX - startX;
  const card = document.getElementById('card');

  if (Math.abs(deltaX) > CONSTANTS.SWIPE_THRESHOLD) {
    const choice = deltaX > 0 ? CONSTANTS.VOTE.YES : CONSTANTS.VOTE.NO;
    await handleVote(choice, deltaX > 0 ? 'right' : 'left');
  } else {
    card.style.transition = 'transform 0.3s ease';
    card.style.transform = '';
    card.querySelectorAll('.card-overlay').forEach(o => o.style.opacity = 0);
  }

  currentX = 0;
  startX = 0;
}

async function handleVote(choice, direction) {
  if (state.currentIndex >= state.items.length) return;

  var currentItem = state.items[state.currentIndex];
  var decisionTimeMs = state.cardShownAt ? Date.now() - state.cardShownAt : 0;
  var card = document.getElementById('card');

  var xOffset = direction === 'right' ? window.innerWidth : -window.innerWidth;
  card.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
  card.style.transform = 'translateX(' + xOffset + 'px) rotate(' + (direction === 'right' ? 20 : -20) + 'deg)';
  card.style.opacity = 0;

  try {
    var res = await api('POST', '/vote', {
      itemId: currentItem.id,
      choice: choice,
      sessionId: state.sessionId,
      decisionTimeMs: decisionTimeMs,
    });

    state.currentIndex++;

    setTimeout(() => {
      renderCurrentCard();
      updateProgress(res.remaining);
    }, 400);
  } catch (error) {
    console.error('Vote failed', error);
    card.style.transform = '';
    card.style.opacity = 1;
  }
}
