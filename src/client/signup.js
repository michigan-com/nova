'use strict';

import React from 'react';
import { render } from 'react-dom';
// import xr from 'xr';

// import { appName } from '../../config';
import Signup from './signup/signup';
import Store from './signup/store';

function drawLogin() {
  const store = Store.getState();
  render(
    <Signup store={store} />,
    document.getElementById('signup-form')
  );
}

document.addEventListener('DOMContentLoaded', () => {
  drawLogin();
  Store.subscribe(drawLogin);
});
