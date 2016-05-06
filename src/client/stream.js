'use strict';

import React from 'react';
import { render } from 'react-dom';
import xr from 'xr';

/** Browser history stuff */
require('historyjs/scripts/bundled/html4+html5/native.history.js');

import Config from '../../config';
import Dashboard from './stream/dashboard';
import Store from './stream/store';
import { articleSelected, closeActiveArticle } from './common/actions/active-article';
import { articlesFetched } from './stream/actions/articles';
import { articleIdUrlRegex } from './lib/parse';

function renderDashboard() {
  let store = Store.getState();
  render(
    <Dashboard store={ store }/>,
    document.getElementById('stream')
  )
}

document.addEventListener('DOMContentLoaded', init);
function init() {

  // History stuff
  window.onpopstate = historyChange

  renderDashboard();
  Store.subscribe(renderDashboard);

  let yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  xr.get(`${Config.socketUrl}/v1/article/?fromDate=${yesterday}`)
    .then((resp) => {

      let articles = resp.sort( (a, b) => { return (new Date(b.created_at)) - (new Date(a.created_at)); });
      Store.dispatch(articlesFetched(articles));
    }, (err) => {
      console.log('something went wrong');
    });
}

function historyChange(e) {
  let state = History.getState();
  let stateTitle = state.title;

  let articleIdMatch = articleIdUrlRegex.exec(window.location.pathname);

  if (/^\/stream/.test(window.location.pathname)) {
    let articleIdMatch = articleIdUrlRegex.exec(state.url);
    if (articleIdMatch) Store.dispatch(closeActiveArticle(articleIdMatch[1], false));
  }
  else if (articleIdMatch) {
    let articleId = parseInt(articleIdMatch[1]);
    Store.dispatch(articleSelected(articleId));
  }
}
