'use strict';

import passport from 'passport';
import LocalStrategy from 'passport-local';
import { ObjectID } from 'mongodb';
import debug from 'debug';

import { passwordMatch } from './util/hash';

export default function createPassport(app) {
  const db = app.get('db');
  const User = db.collection('User');

  async function checkLogin(phoneNumber, code, done) {
    const user = await User.find({ phoneNumber }).limit(1).next();
    if (!user || !passwordMatch(code, user.code)) {
      return done(null, false);
    }
    return done(null, user);
  }

  passport.use(new LocalStrategy({
    usernameField: 'phoneNumber',
    passwordField: 'code',
  },

    // called when a user logs in
    (phoneNumber, code, done) => {
      checkLogin(phoneNumber, code, done)
        .catch((e) => {
          console.error(`Error verifying login ${e}`);
        });
    }
  ));

  passport.serializeUser((user, done) => (
    done(null, user._id)
  ));

  passport.deserializeUser(async (userId, done) => {
    async function deserialize(mongoId) {
      const user = await User.find({ _id: new ObjectID(mongoId) }).limit(1).next();
      return user;
    }

    try {
      const user = await deserialize(userId);
      done(null, user);
    } catch (e) {
      done(e, false);
    }
  });


  return passport;
}
