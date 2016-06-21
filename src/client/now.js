'use strict';

import io from 'socket.io-client';

/** Browser history stuff */
require('historyjs/scripts/bundled/html4+html5/native.history.js');

import Config from '../../config';
import Store from './now/store';
import { closeActiveArticle, articleSelected } from './common/actions/active-article';
import { gotTopArticles, gotQuickstats } from './now/actions/article-list';
import { initDashboard } from './now/dashboard';
import { articleIdUrlRegex } from './lib/parse';

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

function init() {
  // Initialize the dashboard, will subscribe to Dispatcher events
  initDashboard();

  // History stuff
  window.onpopstate = historyChange;

  // Connect the socket
  const socket = io(Config.socketUrl, { transports: ['websocket', 'xhr-polling'] });
  socket.emit('get_popular');
  socket.emit('get_quickstats');
  socket.on('got_popular', (data) => {
    Store.dispatch(gotTopArticles(data.snapshot.articles));
  });
  socket.on('got_quickstats', (data) => { Store.dispatch(gotQuickstats(data.snapshot.stats)); });

  // See if we have an ?articleId= url param
  const match = articleIdUrlRegex.exec(window.location.pathname);
  if (match) Store.dispatch(articleSelected(parseInt(match[1], 10), 0, false));
}

document.addEventListener('DOMContentLoaded', init);
