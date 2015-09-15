'use strict';

//import Framework from './framework/index';
import DashSocket from './lib/socket';
import renderList from './jsx/popular.jsx';

var articleList = renderList([], document.getElementById('articles'));
var dash = new DashSocket(['toppages', 'quickstats']);

dash.room('toppages').on('data', function(data) {
  data.articles.sort(function(a, b) {
      var visitsA = parseInt(a.visits);
      var visitsB = parseInt(b.visits);

      if (visitsA == visitsB) {
          return a.title.localeCompare(b.title);
      }
      return visitsB - visitsA;
  });

  let articleMap = {};
  let max_articles = 25;
  let articles = [];
  for (let i = 0; i < data.articles.length && i <= max_articles; i++) {
    let article = data.articles[i];

    let re_id = /\/(\d+)\/$/.exec(article.path);
    if (!re_id.length) continue;
    article.id = parseInt(re_id[1]);

    if (!articleMap.hasOwnProperty(article.id)) {
      articleMap[article.id] = 1;
      articles.push(article);
    }
  }

  articleList.setState({ data: articles });
});

dash.room('quickstats').on('data', function(data) {
  let value = 0;
  for (let stats in data) {
    value += data[stats].visits;
  }
  document.getElementById('totalReaders').innerHTML = value;
});
