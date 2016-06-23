'use strict';

import React from 'react';
import { render } from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();
// import xr from 'xr';

// import { appName } from '../../config';
import Signup from './signup/signup';
import Store from './signup/store';

function drawLogin() {
  const store = Store.getState();
  render(
    <MuiThemeProvider>
      <Signup store={store} />
    </MuiThemeProvider>,
    document.getElementById('signup-form')
  );
}

document.addEventListener('DOMContentLoaded', () => {
  drawLogin();
  Store.subscribe(drawLogin);
});
