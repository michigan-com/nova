'use strict';

import path from 'path';
import morgan from 'morgan';
import express from 'express';
import favicon from 'serve-favicon';
import bodyParser from 'body-parser';
import errorhandler from 'errorhandler';
import cookieParser from 'cookie-parser';
import Config from '../config';

var BASE_DIR = path.dirname(__dirname);

export default function configureMiddleware(app) {
  if (app.get('env') == 'development') {
    app.use(morgan('dev'));
    app.use(errorhandler());
  } else if (process.env.LOG_REQUEST) {
    app.use(morgan());
  }

  let faviconFile = 'favicon.ico';
  if (Config.brandIcon) faviconFile = `favicon-${Config.brandIcon}.ico`;
  console.log(faviconFile);
  app.use(favicon(`${__dirname}/../public/${faviconFile}`));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(BASE_DIR, 'public')));
  app.use(express.static(path.join(BASE_DIR, 'node_modules')));

  // Store locals for templates
  app.use((req, res, next) => {
    res.locals.googleAnalyticsId = Config.googleAnalyticsId;
    res.locals.brandIcon = Config.brandIcon || 'rabbit';
    next();
  });
}
