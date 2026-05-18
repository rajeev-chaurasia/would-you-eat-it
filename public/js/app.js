'use strict';

const screens = {
  swipe: document.getElementById('screen-swipe'),
  results: document.getElementById('screen-results'),
  matches: document.getElementById('screen-matches'),
  complete: document.getElementById('screen-complete'),
};

function showScreen(name) {
  Object.values(screens).forEach(function(s) { s.classList.remove('active'); });
  screens[name].classList.add('active');
}

async function initApp() {
  setupImageErrorHandling();

  try {
    var data = await api('GET', '/items?sessionId=' + state.sessionId);
    state.items = data.items;
    state.totalCount = data.total;
    state.currentIndex = 0;

    updateProgress(data.remaining);
    renderCurrentCard();
    initSwipeListeners();

    document.getElementById('btn-no').addEventListener('click', function() { handleVote(CONSTANTS.VOTE.NO, 'left'); });
    document.getElementById('btn-yes').addEventListener('click', function() { handleVote(CONSTANTS.VOTE.YES, 'right'); });
    document.getElementById('btn-undo').addEventListener('click', handleUndo);

    document.getElementById('btn-results-nav').addEventListener('click', function() {
      loadResults();
      showScreen('results');
    });
    document.getElementById('btn-back-swipe').addEventListener('click', function() { showScreen('swipe'); });
    document.getElementById('btn-matches-nav').addEventListener('click', function() {
      loadMatches();
      showScreen('matches');
    });
    document.getElementById('btn-back-results').addEventListener('click', function() { showScreen('results'); });
    document.getElementById('btn-see-results-final').addEventListener('click', function() {
      loadResults();
      showScreen('results');
    });

    document.getElementById('sort-select').addEventListener('change', loadResults);
    document.getElementById('region-select').addEventListener('change', loadResults);
  } catch (error) {
    console.error('Failed to init app', error);
  }
}

function renderCurrentCard() {
  var card = document.getElementById('card');

  if (state.currentIndex >= state.items.length) {
    showCompleteScreen();
    return;
  }

  var item = state.items[state.currentIndex];

  card.style.transition = 'none';
  card.style.transform = '';
  card.style.opacity = 1;

  card.innerHTML =
    '<img src="' + item.imageUrl + '" class="card-img" alt="' + item.name + '">' +
    '<div class="card-info">' +
      '<div class="card-title">' + item.name + '</div>' +
      '<div class="card-country">' + item.country + '</div>' +
      '<div class="card-desc">' + item.description + '</div>' +
    '</div>' +
    '<div class="card-overlay overlay-yes"><div class="overlay-icon"><svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></div></div>' +
    '<div class="card-overlay overlay-no"><div class="overlay-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="48" height="48"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div></div>';
}

function updateProgress(remaining) {
  var voted = state.totalCount - remaining;
  document.getElementById('progress-text').textContent = voted + ' / ' + state.totalCount;
}

async function showCompleteScreen() {
  try {
    var stats = await api('GET', '/stats?sessionId=' + state.sessionId);
    document.getElementById('user-stats').textContent =
      'You said YES to ' + (stats.yesCount || 0) + ' foods and NO to ' + (stats.noCount || 0) + '.';
  } catch (err) {
    console.error(err);
  }
  showScreen('complete');
}

async function handleUndo() {
  try {
    var res = await api('POST', '/undo', { sessionId: state.sessionId });
    if (!res.success || !res.undoneItem) return;

    if (screens.complete.classList.contains('active')) {
      showScreen('swipe');
    }

    state.items.splice(state.currentIndex, 0, res.undoneItem);
    renderCurrentCard();

    var card = document.getElementById('card');
    card.style.transition = 'none';
    card.style.transform = 'translateY(100vh)';

    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        card.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        card.style.transform = 'translateY(0)';
      });
    });

    updateProgress(state.items.length - state.currentIndex);
  } catch (err) {
    console.error('Nothing to undo');
  }
}

document.addEventListener('DOMContentLoaded', initApp);
