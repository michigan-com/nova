'use strict';

import { equal, notEqual } from 'assert';

/**
 * Tests basic get route for a given status
 *
 * @param {Object} agent - from supertest.request.agent
 * @param {String} route - url to request
 * @return {Promise} WIll reject with err and resolve with the supertest response
 *  object
 */
export function testGetRoute(agent, route, status=200) {
  return new Promise((resolve, reject) => {
    agent
      .get(route)
      .end((err, res) => {
        if (err) return reject(err);

        equal(res.status, status, 'should have responded with 200');
        return resolve(res);
      });
  });
}

/**
 * Tests a route that should redirect
 *
 * @param {Object} agent - from supertest.request.agent
 * @param {String} route - url to request
 * @param {String} location - expected url re-route
 * @return {Promise} will reject with err and resolve with the supertest response
 *  object
 */
export function testExpectedRedirect(agent, route, location) {
  return new Promise((resolve, reject) => {
    agent
      .get(route)
      .expect('Location', location)
      .end((err, res) => {
        if (err) return reject(err);

        equal(res.status, 302, 'Should be a 302 redirect');
        return resolve(res);
      })
  });
}

/**
 * Tests a post-ing of a route, passing it the necessary data and verifying
 * the return status
 *
 * @param {Object} agent - from supertest.request.agent
 * @param {String} route - url to post
 * @param {Object} postData - data to post to the route
 * @param {Status} status - expected status code, default = 200
 * @return {Promise} will reject with err and resolve with the supertest response
 *  object
 */
export function testPostRoute(agent, route, postData={}, status=200) {
  return new Promise((resolve, reject) => {
    agent
      .post(route)
      .send(postData)
      .end((err, res) => {
        if (err) return reject(err);

        equal(res.status, status, `Status should be ${status}`);
        return resolve(res);
      });
  });
}
