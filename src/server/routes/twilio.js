'use strict';

import { Router } from 'express';
import debug from 'debug';
import csrf from 'csurf';
import twilio from 'twilio';

import { sendMessage } from '../twilio';
import Config from '../../config';
import { isValidPhoneNumber } from '../lib/parse';

var logger = debug('app:twilio');
var csrfProtection = csrf({ cookie: true });

const START_BREAKING = 'START BREAKING';
const STOP_BREAKING = 'STOP BREAKING';

/**
 * Compare a text response to see what the user is trying to tell us
 *
 * @param {String} body - Body of the text message someone's sending us
 * @param {String} testCase - example text to compare the text message body to
 * @returns {Boolean} whether the text body matches the testcase
 */
function compareMessages(body, testCase) {
  body = body.toLowerCase();
  testCase = testCase.toLowerCase();
  return body === testCase;
}

function getCommandListText() {
  return `${START_BREAKING} - activate breaking news alerts\n${STOP_BREAKING} - stop breaking news alerts`
}

export default function registerRoutes(app) {
  var router = Router();
  var db = app.get('db');
  var User = db.collection('User');

  router.post('/text-mobile-link/', csrfProtection, (req, res, next) => {
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

  router.get('/handle-text-response/', (req, res, next) => {
    async function _handleResponse() {
      let phoneNumber = req.query.from;
      let body = req.query.body;

      // Check the user
      phoneNumber = phoneNumber.replace(/^\+\d/, '');
      let user = await User.find({ phoneNumber }).limit(1).next();
      if (!user) {
        throw new Error('User doesnt exist');
      }

      let twilioResp = new twilio.TwimlResponse();
      let resp = 'yay';

      if (compareMessages(body, STOP_BREAKING)) {
        await User.update({ phoneNumber: user.phoneNumber }, { $set: { breakingNews: false }});
        resp = `You have been unsubscribed from breaking news alerts.\n\nRe-subscribe using ${START_BREAKING}`;
      } else if (compareMessages(body, START_BREAKING)) {
        await User.update({ phoneNumber: user.phoneNumber }, { $set: { breakingNews: true }});
        resp = `You have subscribed to breaking news alerts.\n\nUn-subscribe using ${STOP_BREAKING}`;
      } else {
        resp = `Command not recognized:\n\n${getCommandListText()}`
      }

      twilioResp.message(resp, {
        to: `+1${user.phoneNumber}`,
        from: Config.twilioPhoneNumber,
      });

      res.status(200).type('text/xml').send(twilioResp.toString());
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
