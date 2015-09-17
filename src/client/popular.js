'use strict';

import io from 'socket.io-client';

import renderList from './jsx/popular.jsx';

var socket = io('https://api.michigan.com', {transports: ['websocket', 'xhr-polling']});
var articleList = renderList([], document.getElementById('articles'));

socket.emit('get_popular');
socket.on('got_popular', function(data) {
  var snapshot = data.snapshot.articles;
  console.log(snapshot[0]);

  // sort by visits desc then sort by title asc
  snapshot.sort(function(a, b) {
    var visitsA = parseInt(a.visits);
    var visitsB = parseInt(b.visits);

    if (visitsA == visitsB) {
      return a.headline.localeCompare(b.headline);
    }
    return visitsB - visitsA;
  });

  let max_articles = 25;
  let articleMap = {};
  let articles = [];
  for (let i = 0; i < snapshot.length && i <= max_articles; i++) {
    let article = snapshot[i];

    if (!articleMap.hasOwnProperty(article.article_id)) {
      articleMap[article.article_id] = 1;
      articles.push(article);
    }
  }

  articleList.setState({ data: articles });
});
