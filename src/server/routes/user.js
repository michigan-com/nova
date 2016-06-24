'use strict';

import { Router } from 'express';
import debug from 'debug';
import { ObjectID } from 'mongodb';

import { loginRequired } from './middleware/login';

const logger = debug('app:user');


export default function registerRoutes(app) {
  const db = app.get('db');
  const User = db.collection('User');
  const BreakingNewsSignup = db.collection('BreakingNewsSignup');
  const router = new Router();

  router.get('/get-user-info/', loginRequired, (req, res, next) => {
    async function getUser(userId) {
      const user = await User.find({ _id: new ObjectID(userId) }).limit(1).next();
      if (user === null) throw new Error('user not found');

      const phoneNumber = user.phoneNumber;
      const breakingNewsSignup = await BreakingNewsSignup.find({ phoneNumber }).limit(1).next();
      const userInfo = {
        userId: user._id,
        phoneNumber: user.phoneNumber,
        breakingNewsSignup: breakingNewsSignup !== null,
      };
      res.status(200).json(userInfo);
      return next();
    }

    getUser(req.user._id)
      .catch((error) => {
        logger(error);
        res.status(500).json({ error });
        return next();
      });
  });

  router.post('/breaking-news-signup/',
    loginRequired,
    (req, res, next) => {
      async function signupUser(userId, phoneNumber) {
        const user = await User.find({ phoneNumber }).limit(1).next();
        if (`${user._id}` !== `${userId}`) {
          res.status(401).send('Forbidden');
          return next();
        }
        await BreakingNewsSignup.update({ phoneNumber }, { phoneNumber }, { upsert: true });
        res.status(200).json({ success: true });
        return next();
      }

      const phoneNumber = req.body.phoneNumber;
      const userId = req.user._id;
      signupUser(userId, phoneNumber)
        .catch((error) => {
          logger(error);
          res.status(500).json({ error });
          return next();
        });
    }
  );

  router.post('/breaking-news-signup-remove/',
    loginRequired,
    (req, res, next) => {
      async function signupUser(userId, phoneNumber) {
        const user = await User.find({ phoneNumber }).limit(1).next();
        if (`${user._id}` !== `${userId}`) {
          res.status(401).send('Forbidden');
          return next();
        }
        await BreakingNewsSignup.remove({ phoneNumber });
        res.status(200).json({ success: true });
        return next();
      }

      const phoneNumber = req.body.phoneNumber;
      const userId = req.user._id;
      signupUser(userId, phoneNumber)
        .catch((error) => {
          logger(e);
          res.status(500).json({ error });
          return next();
        });
    }
  );

  app.use('/user', router);
}
