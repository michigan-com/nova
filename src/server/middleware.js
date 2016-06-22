'use strict';

import path from 'path';
import express from 'express';
import favicon from 'serve-favicon';
import bodyParser from 'body-parser';
import errorhandler from 'errorhandler';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import connectMongo from 'connect-mongo';
import flash from 'connect-flash';
import passport from 'passport';

import Config from '../config';

const BASE_DIR = path.dirname(__dirname);
const MongoStore = connectMongo(session);

export default function configureMiddleware(app) {
  const db = app.get('db');
  let faviconFile = 'favicon.ico';

  if (app.get('env') === 'development') {
    app.use(errorhandler());
  }

  if (Config.brandIcon) faviconFile = `favicon-${Config.brandIcon}.ico`;
  app.use(favicon(`${__dirname}/../public/${faviconFile}`));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(BASE_DIR, 'public')));
  app.use(express.static(path.join(BASE_DIR, 'node_modules')));
  app.use(session({
    secret: 'Nova news now, \'na mean?',
    store: new MongoStore({ db }),
    resave: false,
    saveUninitialized: false,
  }));
  app.use(flash());

  app.use(passport.initialize());
  app.use(passport.session());

  // Store locals for templates
  app.use((req, res, next) => {
    res.locals.googleAnalyticsId = Config.googleAnalyticsId;
    res.locals.brandIcon = Config.brandIcon || 'rabbit';
    res.locals.userId = req.user ? req.user._id : '';
    res.locals.config = { ...Config };
    next();
  });
}
