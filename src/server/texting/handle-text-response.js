'use strict';

import Config from '../../config';

export const START_BREAKING = 'START BREAKING';
export const STOP_BREAKING = 'STOP BREAKING';

// Legally required stuff
export const HELP = 'HELP';
export const STOP = 'STOP';


// outgoing Text messages
export const USER_NOT_REGOGNIZED = `Hi! Thanks for texting ${Config.appName}. We don\'t recognize you as a user in our system, but we\'re glad you got in touch!\n\nCheck us out at ${Config.appUrl}`;
export const USER_UNSUBSCRIBED = `You have been unsubscribed from breaking news alerts.\n\nRe-subscribe using ${START_BREAKING}`;
export const USER_SUBSCRIBED = `You have subscribed to breaking news alerts.\n\nUn-subscribe using ${STOP_BREAKING}`;
export const HELP_RESPONSE = `${START_BREAKING} - activate breaking news alerts\n${STOP_BREAKING} - stop breaking news alerts`;
export const COMMAND_NOT_REGOGNIZED = `Command not recognized:\n\n${HELP_RESPONSE}`;

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

/**
 * Based on a text from a user, do something with it.
 *
 * @param {Object} db - MongoDB database Object
 * @param {String} fromNumber - phone number that sent the text
 * @param {String} message - message sent from `fromNumber`
 * @returns {String} Text message to be sent back to the user.
 */
export default async function handleResponse(db, fromNumber, message) {
  let User = db.collection('User');
  let BreakingNewsSignup = db.collection('BreakingNewsSignup');

  // Check the user
  let phoneNumber = fromNumber.replace(/^\+\d/, '');
  let user = await User.find({ phoneNumber }).limit(1).next();
  if (!user) {
    return USER_NOT_REGOGNIZED;
  }

  let resp = COMMAND_NOT_REGOGNIZED;

  if (compareMessages(message, STOP_BREAKING) || compareMessages(message, STOP)) {
    await BreakingNewsSignup.remove({ phoneNumber });
    resp = USER_UNSUBSCRIBED;
  } else if (compareMessages(message, START_BREAKING)) {
    await BreakingNewsSignup.update({ phoneNumber }, { phoneNumber }, { upsert: true });
    resp = USER_SUBSCRIBED;
  } else if (compareMessages(message, HELP)) {
    resp = HELP_RESPONSE;
  }
  return resp;
}
