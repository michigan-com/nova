'use strict';

import debug from 'debug';
import twilio from 'twilio';

import Config from '../../config';

const twilioClient = twilio();
const logger = debug('app:twilio');

/**
 * Send out a text message using twilio
 *
 * @param {String} phoneNumber - 10 digit number, area code + 7 digits
 * @param {String} message to be sent
 */
export function sendMessage(phoneNumber, message, mediaUrl = '') {
  return new Promise((resolve, reject) => {
    if (phoneNumber.length !== 10) {
      const error = `Invalid phone number, must be exactly 10 characters: ${phoneNumber}`;
      return reject(error);
    }

    const twilioData = {
      to: `+1${phoneNumber}`,
      from: `${Config.twilioPhoneNumber}`,
      body: message,
    };

    if (mediaUrl !== '') {
      twilioData.mediaUrl = mediaUrl;
    }

    if (process.env.NODE_ENV === 'prod') {
      return twilioClient.sendMessage(twilioData, (err, responseData) => {
        if (err) return reject(err);
        return resolve(responseData);
      });
    }
    logger(twilioData);
    return resolve(twilioData);
  });
}
