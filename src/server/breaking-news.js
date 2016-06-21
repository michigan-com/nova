'use strict';

import io from 'socket.io-client';

import Config from '../config';
import { sendMessage } from './texting/send-message';

/**
 * Ingest the articles reported from the breaking news socket. We only wanna send
 * a text once per article. This function filters out all the articles that we've
 * already sent breaking news texts for
 *
 * @param {Object} db - MongoDB instance
 * @param {Array} articles - Breaking news articles
 * @returns {Array} A filtered array of articles that still need to be texted
 */
export async function ingestBreakingNews(db, articles) {
  const col = db.collection('BreakingNewsAlert');
  const toSend = [];
  for (const article of articles) {
    const articleId = article.article_id;

    const breakingNewsObj = await col.find({ articleId }).limit(1).next();
    if (breakingNewsObj == null) {
      await col.insertOne({
        createdAt: new Date(),
        articleId,
      });

      toSend.push(article);
    }
  }
  return toSend;
}

function sendBreakingNewsText(article) {
  // TODO pull this from the BreakingNewsSignup collection
  const phoneNumbers = [
    '3134210982',
    '3046408876',
    '8652193556',
    '3133386378',
    '3134620026',
    '3139805390',
  ];
  const articleUrl = `${Config.appUrl}/article/${article.article_id}/`;
  let photoUrl = '';

  if (article.photo !== null) {
    photoUrl = article.photo.full.url;
  }
  for (const number of phoneNumbers) {
    sendMessage(
      number,
      `BREAKING: ${article.headline}\n\n${articleUrl}`,
      photoUrl
    );
  }
}

export default function breakingNews(app) {
  const db = app.get('db');

  const socket = io(Config.socketUrl, { transports: ['websocket', 'xhr-polling'] });
  socket.emit('get_breaking_news');
  socket.on('got_breaking_news', async (data) => {
    const articles = data.snapshot.articles;
    const articlesToSend = await ingestBreakingNews(db, articles);
    for (const article of articlesToSend) {
      sendBreakingNewsText(article);
    }
  });
}
