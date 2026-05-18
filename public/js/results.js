'use strict';

async function loadResults() {
  var sort = document.getElementById('sort-select').value;
  var region = document.getElementById('region-select').value;
  var regionParam = region ? '&region=' + encodeURIComponent(region) : '';

  try {
    var data = await api('GET', '/results?sort=' + sort + regionParam);
    renderResults(data);
  } catch (err) {
    console.error(err);
  }
}

async function loadMatches() {
  try {
    var data = await api('GET', '/matches?sessionId=' + state.sessionId);
    renderMatches(data.matches);
  } catch (err) {
    console.error(err);
  }
}

function renderResults(data) {
  document.getElementById('global-stats-banner').textContent =
    data.totalVotes + ' votes from ' + data.totalSessions + ' tasters worldwide';

  var list = document.getElementById('results-list');
  list.innerHTML = '';

  data.results.forEach(function(item, index) {
    var percent = item.totalVotes > 0 ? Math.round(item.yesPercent) : 0;
    var div = document.createElement('div');
    div.className = 'result-item';
    div.innerHTML =
      '<img src="' + item.imageUrl + '" class="result-img" alt="' + item.name + '">' +
      '<div class="result-info">' +
        '<div class="result-title">#' + (index + 1) + ' ' + item.name + '</div>' +
        '<div class="result-country">' + item.country + '</div>' +
        '<div class="result-meta">' +
          '<span>' + percent + '% YES</span>' +
          '<span>' + item.totalVotes + ' votes</span>' +
        '</div>' +
        '<div class="bar-container">' +
          '<div class="bar-yes" style="width:' + percent + '%"></div>' +
          '<div class="bar-no" style="width:' + (100 - percent) + '%"></div>' +
        '</div>' +
      '</div>';
    list.appendChild(div);
  });
}

function renderMatches(matches) {
  var list = document.getElementById('matches-list');
  list.innerHTML = '';

  if (matches.length === 0) {
    list.innerHTML = '<div class="empty-state">No matches yet. Swipe YES on foods you love to find global taste matches!</div>';
    return;
  }

  matches.forEach(function(item) {
    var percent = Math.round(item.yesPercent);
    var div = document.createElement('div');
    div.className = 'result-item';
    div.innerHTML =
      '<img src="' + item.imageUrl + '" class="result-img" alt="' + item.name + '">' +
      '<div class="result-info">' +
        '<div class="result-title">' + item.name + '</div>' +
        '<div class="result-country">' + item.country + '</div>' +
        '<div class="result-meta"><span>Global: ' + percent + '% YES</span></div>' +
      '</div>';
    list.appendChild(div);
  });
}
