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
    <Dashboard store={store} />,
    document.getElementById('stream')
  );
}

function historyChange() {
  const state = History.getState();

  const articleIdMatch = articleIdUrlRegex.exec(window.location.pathname);

  if (/^\/stream/.test(window.location.pathname)) {
    const idMatch = articleIdUrlRegex.exec(state.url);
    if (idMatch) Store.dispatch(closeActiveArticle(idMatch[1], false));
  } else if (articleIdMatch) {
    const articleId = parseInt(articleIdMatch[1], 10);
    Store.dispatch(articleSelected(articleId));
  }
}

function init() {
  // History stuff
  window.onpopstate = historyChange;

  renderDashboard();
  Store.subscribe(renderDashboard);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  xr.get(`${Config.socketUrl}/v1/article/?fromDate=${yesterday}`)
    .then((resp) => {
      const articles = resp.sort((a, b) => (
        new Date(b.created_at)) - (new Date(a.created_at)
      ));
      Store.dispatch(articlesFetched(articles));
    }, (err) => {
      console.log(`something went wrong: ${err}`);
    });
}

document.addEventListener('DOMContentLoaded', init);
