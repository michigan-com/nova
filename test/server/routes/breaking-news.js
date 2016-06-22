'use strict';

import { equal, notEqual } from 'assert';

import request from 'supertest';

import dbConnect from '../../../dist/util/db';
import { createApp } from '../../../dist/app';
import { testPostRoute, testGetRoute } from './helpers';
import { CatchAsync } from '../../helpers';

var db, BreakingNewsCollection, app, agent;

var testPhoneNumber = '3135550123';

describe('Tests breaking news routes', () => {
  before(CatchAsync(async (done) => {
    async function _before() {
      db = await dbConnect('mongodb://localhost:27017/nova-test');
      BreakingNewsCollection = db.collection('BreakingNewsSignup');

      app = createApp(db, false);
      agent = request.agent(app);

      done();
    }

    await _before().catch((e) => { done(e); });
  }));

  afterEach(CatchAsync(async (done) => {
    await db.dropDatabase();
    done();
  }));

  after(CatchAsync(async (done) => {
    await db.close();
    done();
  }));

  it('Tests a basic breaking news signup', CatchAsync(async (done) => {
    const phoneNumber = testPhoneNumber;
    let result = await BreakingNewsCollection.find({ phoneNumber }).limit(1).next();
    equal(result, null, 'Should be no breaking news signup (yet)');

    let res = await testPostRoute(agent, '/breaking-news-signup/', { phoneNumber });

    result = await BreakingNewsCollection.find({ phoneNumber }).limit(1).next();
    notEqual(result, null, 'Should be a breaking news signup');
    equal(result.phoneNumber, testPhoneNumber, 'Phone number doesnt match');

    done();
  }));

  it('Tests breaking news signup and removal', CatchAsync(async (done) => {
    const phoneNumber = testPhoneNumber;
    let result = await BreakingNewsCollection.find({ phoneNumber }).limit(1).next();
    equal(result, null, 'Should be no breaking news signup (yet)');

    let res = await testPostRoute(agent, '/breaking-news-signup/', { phoneNumber });

    result = await BreakingNewsCollection.find({ phoneNumber }).limit(1).next();
    notEqual(result, null, 'Should be a breaking news signup');
    equal(result.phoneNumber, testPhoneNumber, 'Phone number doesnt match');

    res = await testPostRoute(agent, '/breaking-news-signup-remove/', { phoneNumber });
    result = await BreakingNewsCollection.find({ phoneNumber }).limit(1).next();
    equal(result, null, 'Should no longer be a breaking news signup');

    res = await testPostRoute(agent, '/breaking-news-signup/', { phoneNumber });
    result = await BreakingNewsCollection.find({ phoneNumber }).limit(1).next();
    notEqual(result, null, 'Should be a breaking news signup');
    equal(result.phoneNumber, testPhoneNumber, 'Phone number doesnt match');

    done();
  }));
});
