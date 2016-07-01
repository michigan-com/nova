'use strict';

import io from 'socket.io-client';
import xr from 'xr';

/** Browser history stuff */
require('historyjs/scripts/bundled/html4+html5/native.history.js');

import Config from '../../config';
import Store from './store';
import { closeActiveArticle, articleSelected } from './actions/active-article';
import { gotTopArticles, gotQuickstats } from './actions/article-list';
import { updateBreakingNewsArticles } from './actions/breaking-news';
import { streamArticlesFetched } from './actions/stream-articles';
import { initDashboard } from './components/dashboard';
import { articleIdUrlRegex } from './util/format';

function historyChange() {
  const state = History.getState();

  const articleIdMatch = articleIdUrlRegex.exec(window.location.pathname);

  if (/^\/$/.test(window.location.pathname)) {
    const idMatch = articleIdUrlRegex.exec(state.url);
    if (idMatch) Store.dispatch(closeActiveArticle(idMatch[1], false));
  } else if (articleIdMatch) {
    const articleId = parseInt(articleIdMatch[1], 10);
    Store.dispatch(articleSelected(articleId));
  }
}

function fetchStreamArticles() {
  console.log('fetching articles');
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  xr.get(`${Config.socketUrl}/v1/article/?fromDate=${yesterday}`)
    .then((resp) => {
      const articles = resp.sort((a, b) => (
        new Date(b.created_at)) - (new Date(a.created_at)
      ));
      Store.dispatch(streamArticlesFetched(articles));
    }, (err) => {
      console.log('something went wrong:', err);
    });
}

function init() {
  // Initialize the dashboard, will subscribe to Dispatcher events
  initDashboard();

  // History stuff
  window.onpopstate = historyChange;

  // Connect the socket
  const socket = io(Config.socketUrl, { transports: ['websocket', 'xhr-polling'] });
  socket.emit('get_popular');
  socket.emit('get_quickstats');
  socket.emit('get_breaking_news');
  socket.on('got_popular', (data) => {
    Store.dispatch(gotTopArticles(data.snapshot.articles));
  });
  socket.on('got_quickstats', (data) => {
    Store.dispatch(gotQuickstats(data.snapshot.stats));
  });
  socket.on('got_breaking_news', (data) => {
    Store.dispatch(updateBreakingNewsArticles(data.snapshot.articles));
  });


  fetchStreamArticles();
  setInterval(fetchStreamArticles, 1000 * 60 * 2); // 2 minutes

  // See if we have an ?articleId= url param
  const match = articleIdUrlRegex.exec(window.location.pathname);
  if (match) Store.dispatch(articleSelected(parseInt(match[1], 10), 0, false));
}

document.addEventListener('DOMContentLoaded', init);
