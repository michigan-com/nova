'use strict';

import { equal, notEqual } from 'assert';
import request from 'supertest';
import { parseString } from 'xml2js';

import { CatchAsync } from '../../helpers';
import { testPostRoute } from './helpers';
import dbConnect from '../../../dist/util/db';
import { createApp } from '../../../dist/app';
import { ALERTS_ON,
  ALERTS_OFF,
  HELP,
  STOP,
  USER_UNSUBSCRIBED,
  USER_SUBSCRIBED,
  COMMAND_NOT_REGOGNIZED,
  HELP_RESPONSE,
  NO_RESP } from '../../../dist/texting/handle-text-response';

var db, agent, app, User, BreakingNewsSignup;
var testPhoneNumber = '3135550123';

function confirmResponseMessage(xmlResp, expectedPhoneNumber, expectedText) {
  return new Promise((resolve, reject) => {
    parseString(xmlResp, (err, res) => {
      if (err) reject(true);

      if (expectedText === '') {
        let msg = res.Response;
        equal(msg, expectedText, 'Empty response expected');
      } else {
        let msg = res.Response.Message[0];
        equal(msg._, expectedText, 'Expected text does not match');
        equal(msg.$.to, `+1${expectedPhoneNumber}`, 'Phone number doesnt match');
      }
      resolve(res);
    });
  });
}

async function testTextResponse(fromNumber, fromMessage, expectedResponse) {
  let phoneNumber = fromNumber;
  let params = { From: `+1${fromNumber}`, Body: fromMessage };
  let res = await testPostRoute(agent, '/handle-text-response/', params, 200);
  equal(res.type, 'text/xml', 'XML response is required');
  await confirmResponseMessage(res.text, phoneNumber, expectedResponse);
}

describe('Testing twilio texting routes', () => {
  before(CatchAsync(async (done) => {
    db = await dbConnect('mongodb://localhost:27017/nova-test');
    User = db.collection('User');
    BreakingNewsSignup = db.collection('BreakingNewsSignup');

    app = createApp(db, false);
    agent = request.agent(app);
    done();
  }));

  afterEach(CatchAsync(async (done) => {
    await db.dropDatabase();
    done();
  }));

  after(CatchAsync(async (done) => {
    await db.dropDatabase();
    await db.close();
    done();
  }));

  it('Tests invalid calls to /text-mobile-link/', CatchAsync(async (done) => {
    let invalidNumbers = [
      'asdfasdfas',
      '313313313313313',
      '313000',
      '+13134210982',
      'The path of the righteous man is beset on all sides by the iniquities of the selfish and the tyranny of evil men',
    ];

    for (let phoneNumber of invalidNumbers) {
      let params = { phoneNumber };
      let res = await testPostRoute(agent, '/text-mobile-link/', params, 442);
    }
    done();
  }));

  it('Tests valid calls to /text-mobile-link/', CatchAsync(async (done) => {
    let validNumbers = [
      '3135550123',
      '3130123456',
    ];

    for (let phoneNumber of validNumbers) {
      let params = { phoneNumber };
      let res = await testPostRoute(agent, '/text-mobile-link/', params, 200);
      equal(res.body.resp.to, `+1${phoneNumber}`, '\'To\' phone numbers dont match');
    }
    done();
  }));

  it('Tests checking for bad text responses on /handle-text-response/', CatchAsync(async (done) => {
    await testTextResponse(testPhoneNumber, 'asdasdf', COMMAND_NOT_REGOGNIZED);
    done();
  }));

  it('Tests the help command on /handle-text-response/', CatchAsync(async (done) => {
    await testTextResponse(testPhoneNumber, HELP, HELP_RESPONSE);
    done();
  }));

  it('Tests the stop commands on /handle-text-response/', CatchAsync(async (done) => {
    let stopCommands = [
      STOP,
      ALERTS_OFF,
    ];
    let phoneNumber = testPhoneNumber;

    for (let cmd of stopCommands) {
      await BreakingNewsSignup.update({ phoneNumber }, { phoneNumber }, { upsert: true });
      let signup = await BreakingNewsSignup.find({ phoneNumber }).limit(1).next();
      notEqual(signup, null, 'Oops, signup didnt get inserted correctly');

      if (cmd === STOP) await testTextResponse(phoneNumber, cmd, NO_RESP);
      else await testTextResponse(phoneNumber, cmd, USER_UNSUBSCRIBED);

      signup = await BreakingNewsSignup.find({ phoneNumber }).limit(1).next();
      equal(signup, null, 'Signup should no longer exist');
    }
    done();
  }));

  it('Tests subscribing and unsubscribing through /handle-text-response/', CatchAsync(async (done) => {
    let phoneNumber = testPhoneNumber;
    await testTextResponse(phoneNumber, ALERTS_ON, USER_SUBSCRIBED);
    let signup = await BreakingNewsSignup.find({ phoneNumber }).limit(1).next();
    notEqual(signup, null, 'Oops, signup didnt get inserted correctly');

    await testTextResponse(phoneNumber, ALERTS_OFF, USER_UNSUBSCRIBED);
    signup = await BreakingNewsSignup.find({ phoneNumber }).limit(1).next();
    equal(signup, null, 'Signup shouldnt exist');

    await testTextResponse(phoneNumber, ALERTS_ON, USER_SUBSCRIBED);
    signup = await BreakingNewsSignup.find({ phoneNumber }).limit(1).next();
    notEqual(signup, null, 'Oops, signup didnt get inserted correctly');

    await testTextResponse(phoneNumber, STOP, NO_RESP);
    signup = await BreakingNewsSignup.find({ phoneNumber }).limit(1).next();
    equal(signup, null, 'Signup shouldnt exist');

    done();
  }));
});
