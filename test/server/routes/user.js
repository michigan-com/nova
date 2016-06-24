'use strict';

import request from 'supertest';

import dbConnect from '../../../dist/util/db';
import { createApp } from '../../../dist/app';
import { hash } from '../../../dist/util/hash';
import { CatchAsync } from '../../helpers';
import { testPostRoute, testGetRoute } from './helpers';

var db, BreakingNewsCollection, User, app, agent;
const testPhoneNumber = '313550123';
const testCode = '1234';

describe('Tests the login-protected user routes', function () {
  before(CatchAsync(async (done) => {
    async function _before() {
      db = await dbConnect('mongodb://localhost:27017/nova-test');
      BreakingNewsCollection = db.collection('BreakingNewsSignup');
      User = db.collection('User');

      app = createApp(db, false);
      agent = request.agent(app);

      let res = await User.insert({
        phoneNumber: testPhoneNumber,
        code: hash(testCode),
      });

      done();
    }

    await _before().catch((e) => { done(e); });
  }));

  afterEach(CatchAsync(async (done) => {
    done();
  }));

  after(CatchAsync(async (done) => {
    await db.close();
    done();
  }));

  it('Test user routes while unauthenticated', CatchAsync(async (done) => {
    const userPostRoutes = [
      '/user/breaking-news-signup/',
      '/user/breaking-news-signup-remove/',
    ];
    const userGetRoutes = [
      '/user/get-user-info/',
    ];

    const phoneNumber = testPhoneNumber;
    for (const route of userPostRoutes) {
      const res = await testPostRoute(agent, route, { phoneNumber }, 401);
    }

    for (const route of userGetRoutes) {
      const res = await testGetRoute(agent, route, 401);
    }
    done();
  }));

  it('Tests user routes while authenticaed', CatchAsync(async (done) => {
    this.timeout(1000);
    const phoneNumber = testPhoneNumber;
    const code = '1234';
    let res = await testPostRoute(agent, '/login/', { phoneNumber, code });
    should.exist(res.headers['set-cookie']);
    // TODO Figure out logins
    // await testGetRoute(agent, '/user/get-user-info/');

    done();
  }));
});
