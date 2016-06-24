'use strict';

import { Router } from 'express';
import debug from 'debug';

import generateCode from '../util/generate-code';
import { hash } from '../util/hash';
import { sendMessage } from '../texting/send-message';
import { csrfProtection } from './middleware/csrf';
import { isValidPhoneNumber } from '../util/parse';

const logger = debug('app:login');

export default function registerRoutes(app) {
  const passport = app.get('passport');
  const db = app.get('db');
  const User = db.collection('User');
  const router = new Router();

  router.get('/signup/', csrfProtection(app), (req, res) => {
    if (req.user) return res.redirect('/');
    return res.render('signup', {
      csrfToken: req.csrfToken(),
      message: req.flash('error'),
    });
  });

  router.post('/logout/', (req, res) => {
    req.logout();
    return res.status(200).json({ success: true });
  });

  router.post('/generate-login-code/', csrfProtection(app), (req, res, next) => {
    async function generateLoginCode() {
      const phoneNumber = req.body.phoneNumber;

      if (!isValidPhoneNumber(phoneNumber)) {
        const error = 'Please only input 10 numbers (area code + phone number)';
        res.status(442).send({ error });
        return next();
      }

      const code = process.NODE_ENV === 'test' ? '1111' : generateCode();
      const hashedCode = hash(code);

      await User.updateOne({ phoneNumber }, { $set: { code: hashedCode } }, { upsert: true });

      await sendMessage(phoneNumber, `Detroit Now login code: ${code}`);
      res.status(200).json({ success: true });
      return next();
    }

    generateLoginCode().catch((error) => {
      logger(`twilio error: ${error}`);
      res.status(500).send({ error });
      return next();
    });
  });

  router.post('/login/', csrfProtection(app), (req, res, next) => {
    passport.authenticate('local', (err, user) => {
      if (err || !user) return res.status(401).json({ error: 'Invalid code' });
      return req.logIn(user, (error) => {
        if (error) return res.status(401).json({ error });
        return res.status(200).json({ success: 'true' });
      });
    })(req, res, next);
  });

  app.use('/', router);
}
