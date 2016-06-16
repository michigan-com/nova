'use strict';

import io from 'socket.io-client';
import debug from 'debug';

import Config from '../config';
import { sendMessage } from './texting/send-message';

const logger = debug('app:breaking-news')

export default function breakingNews(app) {
  let db = app.get('db');

  let socket = io(Config.socketUrl, {transports: ['websocket', 'xhr-polling']});
  socket.emit('get_breaking_news');
  socket.on('got_breaking_news', async (data) => {
    let articles = data.snapshot.articles;
    let articlesToSend = await ingestBreakingNews(db, articles);
    for (let article of articlesToSend) {
      sendBreakingNewsText(article);
    }
  });
}

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
  let col = db.collection('BreakingNewsAlert');
  let toSend = [];
  for (let article of articles) {
    let articleId = article.article_id;

    let breakingNews = await col.find({ articleId }).limit(1).next();
    if (breakingNews == null) {
      await col.insertOne({
        createdAt: new Date(),
        articleId: articleId,
      });

      toSend.push(article);
    }
  }
  return toSend;
}

function sendBreakingNewsText(article) {

  // TODO pull this from the BreakingNewsSignup collection
  let phoneNumbers = ['3134210982', '3046408876', '8652193556', '3133386378', '3134620026', '3139805390'];
  let articleUrl = `${Config.appUrl}/article/${article.article_id}/`;
  let photoUrl = "";

  if (article.photo !== null) {
    photoUrl = article.photo.full.url
  }
  for (let number of phoneNumbers) {
    sendMessage(
      number,
      `BREAKING: ${article.headline}\n\n${articleUrl}`,
      photoUrl
    )
  }
}
