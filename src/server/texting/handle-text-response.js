'use strict';

export const ALERTS_ON = 'ALERTS ON';
export const ALERTS_OFF = 'ALERTS OFF';

// Legally required stuff
export const HELP = 'HELP';
export const STOP = 'STOP';

// outgoing Text messages
export const USER_UNSUBSCRIBED =
  `You have been unsubscribed from breaking news alerts.\n\nRe-subscribe using ${ALERTS_ON}`;
export const USER_SUBSCRIBED =
  `You have subscribed to breaking news alerts.\n\nUn-subscribe using ${ALERTS_OFF}`;
export const HELP_RESPONSE =
  `${ALERTS_ON} - activate breaking news alerts\n${ALERTS_OFF} - stop breaking news alerts`;
export const COMMAND_NOT_REGOGNIZED =
  `Command not recognized:\n\n${HELP_RESPONSE}`;
export const NO_RESP = ''; // for unsubscribing

/**
 * Compare a text response to see what the user is trying to tell us
 *
 * @param {String} body - Body of the text message someone's sending us
 * @param {String} testCase - example text to compare the text message body to
 * @returns {Boolean} whether the text body matches the testcase
 */
function compareMessages(body, testCase) {
  const lowerBody = body.toLowerCase();
  const lowerTest = testCase.toLowerCase();
  return lowerBody === lowerTest;
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
  const BreakingNewsSignup = db.collection('BreakingNewsSignup');

  // Check the user
  const phoneNumber = fromNumber.replace(/^\+\d/, '');

  let resp = COMMAND_NOT_REGOGNIZED;
  if (compareMessages(message, ALERTS_OFF) || compareMessages(message, STOP)) {
    await BreakingNewsSignup.remove({ phoneNumber });
    if (compareMessages(message, STOP)) resp = NO_RESP;
    else resp = USER_UNSUBSCRIBED;
  } else if (compareMessages(message, ALERTS_ON)) {
    await BreakingNewsSignup.updateOne({ phoneNumber }, { phoneNumber }, { upsert: true });
    resp = USER_SUBSCRIBED;
  } else if (compareMessages(message, HELP)) {
    resp = HELP_RESPONSE;
  }
  return resp;
}
