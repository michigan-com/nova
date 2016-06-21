'use strict';

import React from 'react';
import { render } from 'react-dom';
// import xr from 'xr';

// import { appName } from '../../config';
import Login from './login';

document.addEventListener('DOMContentLoaded', () => {
  render(
    <Login />,
    document.getElementById('login-form')
  );
});
