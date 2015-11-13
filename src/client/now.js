'use strict';

import io from 'socket.io-client';
import Dispatcher from './dispatcher';
import { ArticleActions } from './store/article-store';
import { initDashboard } from './now/index';

document.addEventListener('DOMContentLoaded', init);

function init() {
  // Initialize the dashboard, will subscribe to Dispatcher events
  initDashboard();

  // Connect the socket
  var socket = io('https://api.michigan.com', {transports: ['websocket', 'xhr-polling']});
  socket.emit('get_popular');
  socket.on('got_popular', function(data) {
    Dispatcher.dispatch({
      type: ArticleActions.gotArticles,
      articles: data.snapshot.articles
    });
  });

  socket.emit('get_quickstats');
  socket.on('got_quickstats', function(data) {
    Dispatcher.dispatch({
      type: ArticleActions.gotQuickstats,
      quickstats: data.snapshot.stats
    })
  });
}
