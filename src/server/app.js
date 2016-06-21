'use strict';

import path from 'path';
import express from 'express';

import configureMiddleware from './middleware';
import configureRoutes from './routes';
import createPassport from './passport';
import breakingNews from './breaking-news';

const BASE_DIR = path.dirname(__dirname);

function configureViewEngine(app) {
  app.set('views', path.join(BASE_DIR, 'views'));
  app.set('view engine', 'jade');
}

export function createApp(db, enableCsrf = true) {
  const app = express();
  app.set('db', db);
  app.set('passport', createPassport(app));
  app.set('use csrf', enableCsrf);

  if (app.get('env') === 'development') app.locals.pretty = true;

  configureViewEngine(app);
  configureMiddleware(app);
  configureRoutes(app);
  breakingNews(app);

  return app;
}
