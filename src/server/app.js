'use strict';

import path from 'path';
import express from 'express';

import configureMiddleware from './middleware';
import configureRoutes from './routes';
import createPassport from './passport';
import breakingNews from './breaking-news';

var BASE_DIR = path.dirname(__dirname);

export function createApp(db, enableCsrf=true) {
  var app = express();
  app.set('db', db);
  app.set('passport', createPassport(app));
  app.set('use csrf', enableCsrf);

  configureViewEngine(app);
  configureMiddleware(app);
  configureRoutes(app);
  breakingNews(app);

  function configureViewEngine(app) {
    app.set('views', path.join(BASE_DIR, 'views'));
    app.set('view engine', 'jade');
    if (app.get('env') == 'development') app.locals.pretty = true;
  }
  return app
}
