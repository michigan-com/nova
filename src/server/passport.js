'use strict';

import passport from 'passport';
import LocalStrategy from 'passport-local';
import { ObjectID } from 'mongodb';
import debug from 'debug';

import { passwordMatch } from './util/hash';

const logger = debug('app:passport');

export default function createPassport(app) {
  let db = app.get('db');
  let User = db.collection('User');

  passport.use(new LocalStrategy({
      usernameField: 'phoneNumber',
      passwordField: 'code'
    },

    // called when a user logs in
    function(phoneNumber, code, done) {
      checkLogin(phoneNumber, code, done).catch((e) => { console.error(`Error verifying login ${e}`) })
    }
  ));

  passport.serializeUser((user, done) => {
    return done(null, user._id);
  });

  passport.deserializeUser(async function(_id, done) {
    async function deserialize(_id) {
      let user = await User.find({ _id: ObjectID(_id) }).limit(1).next();
      return user;
    }

    try {
      let user = await deserialize(_id);
      done(null, user);
    } catch(e) {
      done(e, false);
    }
  });

  async function checkLogin(phoneNumber, code, done) {
    let user = await User.find({ phoneNumber }).limit(1).next();
    if (!user || !passwordMatch(code, user.code)) {
      return done(null, false);
    }
    return done(null, user);
  }

  return passport;
}
