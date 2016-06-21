'use strict';

import MongoClient from 'mongodb';

async function setUpDatabase(db) {
  const breakingNewsCollection = db.collection('BreakingNewsAlert');
  await breakingNewsCollection.ensureIndex('createdAt', {
    expireAfterSeconds: 60 * 60 * 24, // 1 day
    background: true,
  });

  return;
}

export default function dbConnect(dbString) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(dbString, (err, db) => {
      if (err) reject(err);

      setUpDatabase(db).catch((error) => {
        console.error(`\n\nFailed to init database:\n\n\t Err: ${error}\n\n`);
        reject(err);
      });

      resolve(db);
    });
  });
}
