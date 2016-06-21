'use strict';

import { Router } from 'express';
import request from 'request';

import Config from '../../config';
import { csrfProtection } from './middleware/csrf';


export default function registerRoutes(app) {
  const router = new Router();

  router.get('/', csrfProtection(app), (req, res) => {
    const csrfToken = req.csrfToken ? req.csrfToken() : '';

    res.render('now', {
      title: Config.appName,
      csrfToken,
    });
  });

  // TODO login required
  router.get('/stream/', (req, res) => {
    res.render('stream', {
      title: Config.appName,
    });
  });

  router.get('/article/:articleId/', csrfProtection(app), (req, res, next) => {
    const articleId = req.params.articleId;
    if (isNaN(articleId)) {
      res.status(404);
      next();
      return;
    }

    const url = `${Config.socketUrl}/v1/article/${articleId}/`;
    request.get(url, (err, response, body) => {
      if (err || response.statusCode === 404) {
        res.status(404);
        next();
        return;
      }

      const article = JSON.parse(body);
      const title = article.headline;
      const description = article.subheadline;
      let photoUrl = '';
      if (article.photo) {
        photoUrl = article.photo.full.url;
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

  router.get('/pricing/', (req, res) => {
    res.render('pricing');
  });

  app.use('/', router);
}
