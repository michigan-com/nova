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
    res.render('login', {
      csrfToken: req.csrfToken()
    });
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

  router.post('/login/', csrfProtection, passport.authenticate('local', {
    failureRedirect: '/login/',
    failureFlash: 'Code does not match'
  }), (req, res, next) => {
    res.redirect('/');
  });

  app.use('/', router);
}
