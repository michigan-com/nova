'use strict';

import express from 'express';
import debug from 'debug';

import Config from '../config';

var logger = debug('app:routes');

var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('now', {
    title: Config.appName
  });
});

module.exports = router;
