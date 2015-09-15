'use strict';

import path from 'path';
import express from 'express.io';

import configureMiddleware from './middleware';
import routes from './routes';

var BASE_DIR = path.dirname(__dirname);

var app = express();
app.http().io();
export default app;

configureViewEngine(app);
configureMiddleware(app);
configureRoutes(app);

function configureRoutes(app) {
  app.use('/', routes);
}

function configureViewEngine(app) {
  app.set('views', path.join(BASE_DIR, 'views'));
  app.set('view engine', 'jade');
  if (app.get('env') == 'development') app.locals.pretty = true;
}
