'use strict';

import { equal, notEqual } from 'assert';

import request from 'supertest';

import dbConnect from '../../../dist/util/db';
import { createApp }  from '../../../dist/app';
import { hash } from '../../../dist/util/hash';
import { testPostRoute, testGetRoute } from './helpers';
import { CatchAsync } from '../../helpers';

var db, UserCollection, app, agent;

var testPhoneNumber = '3135550123';
var testCode = '1234';

describe('Testing login routes', () => {
  before(CatchAsync(async (done) => {
    async function _before() {
      db = await dbConnect('mongodb://localhost:27017/nova-test');
      UserCollection = db.collection('User');

      app = createApp(db, false);
      agent = request.agent(app);

      done();
    }

    await _before().catch((e) => { done(e); });
  }));

  afterEach(CatchAsync(async (done) => {
    await db.dropDatabase()
    done();
  }));

  after (CatchAsync(async (done) => {
    await db.close();
    done();
  }));


  it('Tests the creation of a user when generating login code', CatchAsync(async (done) => {
    let user = await UserCollection.find({ phoneNumber: testPhoneNumber }).limit(1).next();
    equal(user, null, `Shouldnt be a user for phone number ${testPhoneNumber}`);

    let res = await testPostRoute(agent, '/generate-login-code/', { phoneNumber: testPhoneNumber});

    user = await UserCollection.find({ phoneNumber: testPhoneNumber }).limit(1).next();
    notEqual(user, null, `A user should exist now`)
    equal(user.phoneNumber, testPhoneNumber, `Phone numbers dont match`)

    done();
  }));

  it('Tests to make sure the short codes change', CatchAsync(async (done) => {
    let res = await testPostRoute(agent, '/generate-login-code/', { phoneNumber: testPhoneNumber});
    let user = await UserCollection.find({ phoneNumber: testPhoneNumber }).limit(1).next();
    notEqual(user, null, `User should be created`);

    let firstCode = user.code;
    res = await testPostRoute(agent, '/generate-login-code/', { phoneNumber: testPhoneNumber});

    user = await UserCollection.find({ phoneNumber: testPhoneNumber }).limit(1).next();
    notEqual(user, null, `User should be created`);
    notEqual(firstCode, user.code, `Codes should be different`)
    done();
  }));

  it('tests to make sure the login works', CatchAsync(async (done) => {
    // create a fake user
    let code = hash(testCode);
    let phoneNumber = testPhoneNumber;
    await UserCollection.insert({ phoneNumber, code });

    let res = await testPostRoute(agent, '/generate-login-code/', { phoneNumber, code });
    equal(res.body.success, true, `should have returned { success: true }`);

    // Now test the route
    res = await testGetRoute(agent, '/');
    done();
  }));
});
