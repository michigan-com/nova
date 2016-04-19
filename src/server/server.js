'use strict';

import debug from 'debug';

import { createApp } from './app';
import dbConnect from './util/db';

var logger = debug('app:server');

// Connect to the db then start the app
async function startServer() {
  logger("start server")
  let db = await dbConnect(process.env.MONGO_URI);
  logger("DB Connected")

  var app = createApp(db);
  var port = normalizePort(process.env.NODE_PORT || '3000');
  app.set('port', port);

  // Create the app
  var app = createApp(db, true);
  var port = normalizePort(process.env.NODE_PORT || '3000');
  app.set('port', port);

  logger(`[SERVER] Environment: ${app.get('env')}`);
  var server = app.listen(port, '0.0.0.0', function(err) {
    if (err) throw new Error(err);

    let host = this.address();
    logger(`[SERVER] Started on ${host.address}:${host.port}`);
  });

  server.on('close', function() {
    logger("[SERVER] Closed nodejs application ...");
    db.close();
  });

  process.on('SIGTERM', function () {
    db.close();
    server.close();
  });
}

function normalizePort(val) {
  var port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
}

startServer();
