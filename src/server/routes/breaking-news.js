'use strict';

import { Router } from 'express';

import { csrfProtection } from './middleware/csrf';

export default function registerRoutes(app) {
  const db = app.get('db');
  const BreakingNewsSignup = db.collection('BreakingNewsSignup');
  const router = new Router();

  router.post('/breaking-news-signup/', csrfProtection(app), (req, res, next) => {
    async function userSignup(phoneNumber) {
      await BreakingNewsSignup.updateOne({ phoneNumber }, { phoneNumber }, { upsert: true });
      res.status(200).send({ success: true });
      return;
    }

    const phoneNumber = req.body.phoneNumber;
    userSignup(phoneNumber).catch((error) => {
      res.status(500).send({ error });
      return next();
    });
  });

  router.post('/breaking-news-signup-remove/', csrfProtection(app), (req, res, next) => {
    async function userRemove(phoneNumber) {
      await BreakingNewsSignup.remove({ phoneNumber });
      res.status(200).send({ success: true });
      return;
    }

    const phoneNumber = req.body.phoneNumber;
    userRemove(phoneNumber).catch((error) => {
      res.status(500).send({ error });
      return next();
    });
  });

  app.use('/', router);
}
