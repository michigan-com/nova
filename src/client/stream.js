'use strict';

import React from 'react';
import { render } from 'react-dom';
import xr from 'xr';

import Config from '../../config';
import Dashboard from './stream/dashboard';
import Store from './stream/store';
import { articlesFetched } from './stream/actions/articles';

function renderDashboard() {
  let store = Store.getState();
  render(
    <Dashboard store={ store }/>,
    document.getElementById('stream')
  )
}

document.addEventListener('DOMContentLoaded', init);
function init() {
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
