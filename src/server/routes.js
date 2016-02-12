'use strict';

import express from 'express';
import debug from 'debug';
import request from 'request';

import Config from '../config';

var logger = debug('app:routes');

var router = express.Router();

router.get('/', (req, res, next) => {
  res.render('now', {
    title: Config.appName,
    initialPage: 'list-view'
  });
});

router.get('/article/:articleId/', (req, res, next) => {
  let articleId = req.params.articleId;
  if (isNaN(articleId)) {
    res.status(404);
    next();
    return;
  }

  let url = `${Config.socketUrl}/v1/article/${articleId}/`;
  logger(`Fetching ${url}`);
  request.get(url, (err, response, body) => {
    if (err) {
      res.status(404);
      next();
      return
    }

    let article = JSON.parse(body);
    let photoUrl = '';
    let title = article.headline;
    let description = article.subheadline;
    if (article.photo) {
      photoUrl = article.photo.full.url
    }

    res.render('now', {
      currentUrl: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
      metaTags: true,
      title,
      photoUrl,
      description,
      initialPage: `Article ${article.article_id}`
    });
  });
});

module.exports = router;
