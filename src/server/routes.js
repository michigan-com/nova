'use strict';

import express from 'express';
import debug from 'debug';
import xr from 'xr';

import Config from '../config';

var logger = debug('app:routes');

var router = express.Router();

router.get('/', (req, res, next) => {
  res.render('now', {
    title: Config.appName
  });
});

router.get('/article/:articleId/', (req, res, next) => {
  let articleId = req.params.articleId;
  if (isNaN(articleId)) {
    res.status(404)
    next();
    return;
  }

  res.render('now', {
    title: Config.appName,
  });
});

module.exports = router;
