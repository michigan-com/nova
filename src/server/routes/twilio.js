'use strict';

import { Router } from 'express';
import debug from 'debug';
import twilio from 'twilio';

import { sendMessage } from '../texting/send-message';
import { handleResponse } from '../texting/handle-text-response';
import Config from '../../config';
import { isValidPhoneNumber } from '../util/parse';
import { csrfProtection } from './middleware/csrf';

var logger = debug('app:twilio');

export default function registerRoutes(app) {
  var router = Router();
  var db = app.get('db');

  router.post('/text-mobile-link/', csrfProtection(app), (req, res, next) => {
    let phoneNumber = req.body.phoneNumber;
    logger(`sending to ${phoneNumber}`)
    logger(req.body);

    if (!isValidPhoneNumber(phoneNumber)) {
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
      logger(`texting mobile link error: ${error}`);
      res.status(500).send({ error });
      return next();
    });
  });

  /**
   * Route hit by twilio to respond to text messages. Sends an XML resposne as
   * per twilio docs
   */
  router.post('/handle-text-response/', (req, res, next) => {
    async function _handleResponse() {
      let phoneNumber = req.query.from;
      let body = req.query.body;

      let response = await handleResponse(db, phoneNumber, body).catch((e) => { throw new Error(e); });

      let twilioResp = new twilio.TwimlResponse();
      twilioResp.message(response, {
        to: `+1${user.phoneNumber}`,
        from: Config.twilioPhoneNumber,
      });
      res.status(200).type('text/xml').send(response);
      return next();
    }

    _handleResponse().catch((error) => {
      logger(`Error handling text response: ${error}`);
      res.status(500).send({ error: 'Error receiving message' });
      return next();
    });

  });

  app.use('/', router);
}
