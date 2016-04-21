'use strict';

import io from 'socket.io-client';

/** Browser history stuff */
require('historyjs/scripts/bundled/html4+html5/native.history.js');

import Config from '../../config';
import Store from './now/store';
import { closeActiveArticle, articleSelected } from './now/actions/active-article';
import { gotTopArticles, gotQuickstats } from './now/actions/article-list';
import { initDashboard } from './now/dashboard';

const articleIdUrlRegex = /\/article\/(\d+)\/?$/;

document.addEventListener('DOMContentLoaded', init);

function init() {
  // Initialize the dashboard, will subscribe to Dispatcher events
  initDashboard();

  // History stuff
  window.onpopstate = historyChange

  // Connect the socket
  let socket = io(Config.socketUrl, {transports: ['websocket', 'xhr-polling']});
  socket.emit('get_popular');
  socket.emit('get_quickstats');
  socket.on('got_popular', (data) =>  { Store.dispatch(gotTopArticles(data.snapshot.articles)); });
  socket.on('got_quickstats', (data) => { Store.dispatch(gotQuickstats(data.snapshot.stats)); });

  // See if we have an ?articleId= url param
  let match = articleIdUrlRegex.exec(window.location.pathname);
  if (match) Store.dispatch(articleSelected(parseInt(match[1]), 0, false));
}

function historyChange(e) {
  let state = History.getState();
  let stateTitle = state.title;

  let articleIdMatch = articleIdUrlRegex.exec(window.location.pathname);

  if (/^\/$/.test(window.location.pathname)) {
    let articleIdMatch = articleIdUrlRegex.exec(state.url);
    if (articleIdMatch) Store.dispatch(closeActiveArticle(articleIdMatch[1], false));
  }
  else if (articleIdMatch) {
    let articleId = parseInt(articleIdMatch[1]);
    Store.dispatch(articleSelected(articleId));
  }
}
