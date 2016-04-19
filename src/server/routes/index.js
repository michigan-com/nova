'use strict';

import express from 'express';
import debug from 'debug';
import request from 'request';
import twilio from 'twilio';

import Config from '../../config';

var logger = debug('app:routes');
var router = express.Router();

// Set process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN
var twilioClient = twilio();

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

router.post('/text-mobile-link/', (req, res, next) => {
  let phoneNumber = req.body.phoneNumber;
  logger(`sending to ${phoneNumber}`)
  logger(req.body);

  if (isNaN(phoneNumber) || `${phoneNumber}`.length != 10) {
    let error = `Please only input 10 numbers (area code + phone number)`;
    res.status(442).send({ error });
    return next();
  }



  twilioClient.sendMessage({
    to: `+1${phoneNumber}`,
    from: '+13133297340',
    body: `Check out ${Config.appName} on your phone!\n\n${Config.appUrl}`
  }, (error, responseData) => {
    if (error) {
      logger(`twiloi error: ${error}`)
      res.status(500).send({ error });
      return next();
    }
    logger(`twilo success: ${responseData}`);
    res.status(200).send({ resp: responseData });
    return next();
  });

});

module.exports = router;
