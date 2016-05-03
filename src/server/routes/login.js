'use strict';

import { Router } from 'express';
import csrf from 'csurf';
import twilio from 'twilio';

import generateCode from '../util/generate-code';
import { hash } from '../util/hash';
import { sendMessage } from '../twilio';

const csrfProtection = csrf({ cookie: true })

export default function registerRoutes(app) {
  let passport = app.get('passport');
  let db = app.get('db');
  let User = db.collection('User');
  let router = Router();
  let twilioClient = twilio();

  router.get('/login/', csrfProtection, (req, res, next) => {
    if (req.user) return res.redirect('/');
    res.render('login', {
      csrfToken: req.csrfToken(),
      message: req.flash('error')
    });
  });

  router.get('/logout/', (req, res, next) => {
    req.logout();
    req.flash('info', 'You have been logged out');
    res.redirect('/');
  });

  router.post('/generate-login-code/', csrfProtection, (req, res, next) => {
    async function generateLoginCode(req, res, next) {
      let phoneNumber = req.body.phoneNumber

      let user = await User.find({ phoneNumber }).limit(1).next();
      let code = generateCode();
      let hashedCode = hash(code);
      if (!user) {
        user = await User.insertOne({ phoneNumber, code: hashedCode });
      } else {
        await User.update({ phoneNumber }, { $set: { code: hashedCode } });
      }

      await sendMessage(phoneNumber, `Detroit Now login code: ${code}`);
      res.status(200).json({ success: true });
      return next();
    }

    generateLoginCode(req, res, next).catch((e) => {
      logger(`twilio error: ${error}`)
      res.status(500).send({ error });
      return next();
    });
  });

  router.post('/login/', csrfProtection, (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err || !user) return res.status(401).json({ error: 'Invalid code' });
      req.logIn(user, (err) => {
        if (err) return res.status(401).json({ error: err });
        return res.status(200).json({ success: 'true' });
      })
    })(req, res, next);
  });

  app.use('/', router);
}
