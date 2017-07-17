'use strict';

import { equal, notEqual } from 'assert';

import handleResponse, {
  START_BREAKING,
  STOP_BREAKING,
  HELP,
  STOP,
  USER_UNSUBSCRIBED,
  USER_SUBSCRIBED,
  COMMAND_NOT_REGOGNIZED,
  HELP_RESPONSE } from '../../../dist/texting/handle-text-response';
import dbConnect from '../../../dist/util/db';
import { CatchAsync } from '../../helpers';

var db, UserCollection, BreakingNewsSignup;

let testPhoneNumber = '3135550123';

async function insertDummyUser(phoneNumber) {
  await UserCollection.updateOne({ phoneNumber }, { phoneNumber }, { upsert: true });
}

describe('Testing text message handling', () => {

  before(CatchAsync(async (done) => {
    db = await dbConnect('mongodb://localhost:27017/nova-test');
    UserCollection = db.collection('User');
    BreakingNewsSignup = db.collection('BreakingNewsSignup');

    done();
  }));

  afterEach(CatchAsync(async (done) => {
    await db.dropDatabase();
    insertDummyUser(testPhoneNumber);
    done();
  }));

  after(CatchAsync(async (done) => {
    await db.dropDatabase();
    await db.close();
    done();
  }));

  it('Tests a bunch of random texts that shouldnt be recognzied', CatchAsync(async (done) => {
    let notRealCommands = [
      'this isnt a command',
      'and neither is this',
      'asdfasdf',
      'query',
      "Look, just because I don't be givin' no man a foot massage don't make it right for Marsellus to throw Antwone into a glass motherfuckin' house",
      "The path of the righteous man is beset on all sides by the iniquities of the selfish and the tyranny of evil men",
      "This gun is advertised as the most popular gun in American crime. Do you believe that shit? It actually says that in the little book that comes with it: the most popular gun in American crime. Like they're actually proud of that shit."
    ];

    for (let command of notRealCommands) {
      let resp = await handleResponse(db, testPhoneNumber, command);
      equal(resp, COMMAND_NOT_REGOGNIZED, `Command ${command} should not have been recognized`);
    }
    done();
  }));

  it('Tests the help command', CatchAsync(async (done) => {
    let resp = await handleResponse(db, testPhoneNumber, HELP);
    equal(resp, HELP_RESPONSE, `Should have responded with help command`);
    done();
  }));

  it('Tests the stop commands', CatchAsync(async (done) => {
    let stopCommands = [
      STOP_BREAKING,
      STOP,
    ];

    for (let cmd of stopCommands) {
      let resp = await handleResponse(db, testPhoneNumber, cmd);
      equal(resp, USER_UNSUBSCRIBED, 'Should have unsubscribed user');
      let signup = await BreakingNewsSignup.find({ phoneNumber: testPhoneNumber }).limit(1).next();
      equal(signup, null, `Phone number shouldnt show up in collection`)
    }
    done();
  }));

  it('Tests the start commands', CatchAsync(async (done) => {
    let resp = await handleResponse(db, testPhoneNumber, START_BREAKING);
    equal(resp, USER_SUBSCRIBED, 'Should have subscribed user');
    let signup = await BreakingNewsSignup.find({ phoneNumber: testPhoneNumber }).limit(1).next();
    notEqual(signup, null, `Should have a valid signup`);
    done();
  }));


  it('Test subscribing and unsubscribing', CatchAsync(async (done) => {
    let signup = await BreakingNewsSignup.find({ phoneNumber: testPhoneNumber }).limit(1).next();
    equal(signup, null, `Phone number shouldnt show up in collection`)

    let resp = await handleResponse(db, testPhoneNumber, START_BREAKING);
    equal(resp, USER_SUBSCRIBED, 'Should have subscribed user');
    signup = await BreakingNewsSignup.find({ phoneNumber: testPhoneNumber }).limit(1).next();
    notEqual(signup, null, `Should have a valid signup`);

    resp = await handleResponse(db, testPhoneNumber, STOP);
    equal(resp, USER_UNSUBSCRIBED, 'Should have unsubscribed user');
    signup = await BreakingNewsSignup.find({ phoneNumber: testPhoneNumber }).limit(1).next();
    equal(signup, null, `Phone number shouldnt show up in collection`)

    resp = await handleResponse(db, testPhoneNumber, START_BREAKING);
    equal(resp, USER_SUBSCRIBED, 'Should have subscribed user');
    signup = await BreakingNewsSignup.find({ phoneNumber: testPhoneNumber }).limit(1).next();
    notEqual(signup, null, `Should have a valid signup`);

    resp = await handleResponse(db, testPhoneNumber, STOP_BREAKING);
    equal(resp, USER_UNSUBSCRIBED, 'Should have unsubscribed user');
    signup = await BreakingNewsSignup.find({ phoneNumber: testPhoneNumber }).limit(1).next();
    equal(signup, null, `Phone number shouldnt show up in collection`)

    done();
  }));

});
