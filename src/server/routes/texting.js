'use strict';

import { Router } from 'express';
import debug from 'debug';
import twilio from 'twilio';

import { sendMessage } from '../texting/send-message';
import handleResponse, { NO_RESP } from '../texting/handle-text-response';
import Config from '../../config';
import { isValidPhoneNumber } from '../util/parse';
import { csrfProtection } from './middleware/csrf';

const logger = debug('app:twilio');

export default function registerRoutes(app) {
  const router = new Router();
  const db = app.get('db');

  router.post('/text-mobile-link/', csrfProtection(app), (req, res, next) => {
    const phoneNumber = req.body.phoneNumber;

    if (!isValidPhoneNumber(phoneNumber)) {
      const error = 'Please only input 10 numbers (area code + phone number)';
      res.status(442).send({ error });
      return next();
    }

    async function sendMessageWrapper() {
      const body = `Check out ${Config.appName} on your phone!\n\n${Config.appUrl}`;
      const resp = await sendMessage(phoneNumber, body);

      res.status(200).send({ resp });
      return next();
    }

    return sendMessageWrapper().catch((error) => {
      logger(`texting mobile link error: ${error}`);
      res.status(500).send({ error });
      return next();
    });
  });

  /**
   * Route hit by twilio to respond to text messages. Sends an XML resposne as
   * per twilio docs
   */
  router.post('/handle-text-response/', (req, res) => {
    const phoneNumber = req.body.From;
    const body = req.body.Body;

    async function handleResponseWrapper(num, txt) {
      return await handleResponse(db, num, txt).catch((e) => { throw new Error(e); });
    }

    function sendTwilioResp(to, response) {
      const twilioResp = new twilio.TwimlResponse();

      // If we wanna receive a text and dont want to respond, we need to send a
      // blank message. Only make a response if we have text we wanna respond with
      if (response !== NO_RESP) {
        twilioResp.message(response, {
          to,
          from: Config.twilioPhoneNumber,
        });
      }
      return res.status(200).type('text/xml').send(twilioResp.toString());
    }

    return handleResponseWrapper(phoneNumber, body)
      .then((resp) => { sendTwilioResp(phoneNumber, resp); })
      .catch(() => (
        sendTwilioResp(
          phoneNumber,
          'Looks like we\'re having some trouble handling your message, sorry about that'
        )
      ));
  });

  app.use('/', router);
}
