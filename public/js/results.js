'use strict';

var MEDALS = ['medal-gold', 'medal-silver', 'medal-bronze'];
var pollingInterval = null;

function startPolling() {
  stopPolling();
  pollingInterval = setInterval(function() {
    if (document.getElementById('screen-results').classList.contains('active')) {
      loadResults(true);
    } else {
      stopPolling();
    }
  }, 5000);
}

function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}

async function loadResults(silent) {
  var sort = document.getElementById('sort-select').value;
  var region = document.getElementById('region-select').value;
  var regionParam = region ? '&region=' + encodeURIComponent(region) : '';

  try {
    var data = await api('GET', '/results?sort=' + sort + regionParam);
    var analytics = await api('GET', '/analytics');
    renderResults(data, analytics);
    if (!silent) startPolling();
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

function renderResults(data, analytics) {
  var banner = document.getElementById('global-stats-banner');
  var bannerText = data.totalVotes + ' votes from ' + data.totalSessions + ' tasters';
  if (analytics && analytics.totalSwipes > 0) {
    bannerText += '  |  ' + analytics.globalYesRate + '% global yes rate';
    if (analytics.avgDecisionTimeSec > 0) {
      bannerText += '  |  ' + analytics.avgDecisionTimeSec + 's avg decision';
    }
  }
  banner.textContent = bannerText;

  var list = document.getElementById('results-list');
  list.innerHTML = '';

  if (data.results.length === 0) {
    list.innerHTML = '<div class="empty-state">No votes yet. Start swiping to see global rankings!</div>';
    return;
  }

  data.results.forEach(function(item, index) {
    var percent = item.totalVotes > 0 ? Math.round(item.yesPercent) : 0;
    var medalClass = index < 3 ? MEDALS[index] : '';
    var rankLabel = index < 3 ? '' : '#' + (index + 1);

    var div = document.createElement('div');
    div.className = 'result-item' + (medalClass ? ' ' + medalClass : '');

    var medalIcon = '';
    if (index === 0) medalIcon = '<div class="rank-badge rank-gold">1</div>';
    else if (index === 1) medalIcon = '<div class="rank-badge rank-silver">2</div>';
    else if (index === 2) medalIcon = '<div class="rank-badge rank-bronze">3</div>';
    else medalIcon = '<div class="rank-badge">' + (index + 1) + '</div>';

    div.innerHTML =
      medalIcon +
      '<img src="' + item.imageUrl + '" class="result-img" alt="' + item.name + '">' +
      '<div class="result-info">' +
        '<div class="result-title">' + item.name + '</div>' +
        '<div class="result-country">' + item.country + '</div>' +
        '<div class="result-bar-row">' +
          '<div class="bar-container">' +
            '<div class="bar-yes" style="width:' + percent + '%"></div>' +
          '</div>' +
          '<span class="result-pct">' + percent + '%</span>' +
        '</div>' +
        '<div class="result-meta">' +
          '<span class="meta-yes">' + (item.yesCount || 0) + ' yes</span>' +
          '<span class="meta-no">' + (item.noCount || 0) + ' no</span>' +
          '<span>' + item.totalVotes + ' total</span>' +
        '</div>' +
      '</div>';
    list.appendChild(div);
  });
}

function renderMatches(matches) {
  var list = document.getElementById('matches-list');
  list.innerHTML = '';

  if (matches.length === 0) {
    list.innerHTML = '<div class="empty-state">No matches yet. Swipe YES on foods you love to find what the world agrees on!</div>';
    return;
  }

  matches.forEach(function(item) {
    var percent = Math.round(item.yesPercent);
    var div = document.createElement('div');
    div.className = 'result-item match-item';
    div.innerHTML =
      '<img src="' + item.imageUrl + '" class="result-img" alt="' + item.name + '">' +
      '<div class="result-info">' +
        '<div class="result-title">' + item.name + '</div>' +
        '<div class="result-country">' + item.country + '</div>' +
        '<div class="result-bar-row">' +
          '<div class="bar-container">' +
            '<div class="bar-yes" style="width:' + percent + '%"></div>' +
          '</div>' +
          '<span class="result-pct match-pct">' + percent + '%</span>' +
        '</div>' +
      '</div>';
    list.appendChild(div);
  });
}
