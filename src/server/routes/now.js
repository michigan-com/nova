'use strict';

import { Router } from 'express';
import request from 'request';
import csrf from 'csurf';

import Config from '../../config';

const csrfProtection = csrf({ cookie: true });

export default function registerRoutes(app) {
  var router = new Router();

  router.get('/', csrfProtection, (req, res, next) => {
    res.render('now', {
      title: Config.appName,
      csrfToken: req.csrfToken(),
    });
  });

  // TODO login required
  router.get('/stream/', (req, res, next) => {
    res.render('stream', {
      title: Config.appName
    });
  });

  router.get('/article/:articleId/', csrfProtection, (req, res, next) => {
    let articleId = req.params.articleId;
    if (isNaN(articleId)) {
      res.status(404);
      next();
      return;
    }

    let url = `${Config.socketUrl}/v1/article/${articleId}/`;
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
        csrfToken: req.csrfToken(),
      });
    });
  });

  router.get('/pricing/', (req, res, next) => {
    res.render('pricing');
  });

  app.use('/', router);
}
