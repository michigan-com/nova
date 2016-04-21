'use strict';

import { Router } from 'express';
import debug from 'debug';
import csrf from 'csurf';

import { sendMessage } from '../twilio';
import Config from '../../config';

var logger = debug('app:twilio');
var csrfProtection = csrf({ cookie: true });

export default function registerRoutes(app) {
  var router = Router();

  router.post('/text-mobile-link/', csrfProtection, (req, res, next) => {
    let phoneNumber = req.body.phoneNumber;
    logger(`sending to ${phoneNumber}`)
    logger(req.body);

    if (isNaN(phoneNumber) || `${phoneNumber}`.length != 10) {
      let error = `Please only input 10 numbers (area code + phone number)`;
      res.status(442).send({ error });
      return next();
    }

    async function _sendMessage() {
      let body = `Check out ${Config.appName} on your phone!\n\n${Config.appUrl}`;
      let resp = await sendMessage(phoneNumber, body);

      res.status(200).send({ resp });
      return next();
    }

    _sendMessage().catch((error) => {
      logger(`twiloi error: ${error}`)
      res.status(500).send({ error });
      return next();
    });
  });

  app.use('/', router);
}
