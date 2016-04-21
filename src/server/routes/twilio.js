'use strict';

import { Router } from 'express';
import twilio from 'twilio';
import debug from 'debug';
import csrf from 'csurf';

import Config from '../../config';

var logger = debug('app:twilio');
var csrfProtection = csrf({ cookie: true });

export default function registerRoutes(app) {
  var router = Router();
  var twilioClient = twilio();

  router.post('/text-mobile-link/', csrfProtection, (req, res, next) => {
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

  app.use('/', router);
}
