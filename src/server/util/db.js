'use strict';

import MongoClient from 'mongodb';

export default function dbConnect(dbString) {
  return new Promise(function(resolve, reject) {
    MongoClient.connect(dbString, function(err, db) {
      if (err) reject(err);

      setUpDatabase(db).catch((err) => {
        console.error(`\n\nFailed to init database:\n\n\t Err: ${err}\n\n`)
        reject(err);
      })

      resolve(db);
    })
  });
}

async function setUpDatabase(db) {
  let breakingNewsCollection = db.collection('BreakingNewsAlert');
  let result = await breakingNewsCollection.ensureIndex('createdAt', {
    expireAfterSeconds: 60 * 60 * 24, // 1 day
    background: true,
  });

  return
}
