'use strict';

import io from 'socket.io-client';
import React from 'react';
import ReactDOM from 'react-dom';

import ArticleList from './popular/article-list';

var socket = io('https://api.michigan.com', {transports: ['websocket', 'xhr-polling']});

socket.emit('get_popular');
socket.on('got_popular', function(data) {
  var snapshot = data.snapshot.articles;

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

  ReactDOM.render(
    <ArticleList data={articles} />,
    document.getElementById('articles')
  );
});
