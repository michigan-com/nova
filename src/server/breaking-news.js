'use strict';

import io from 'socket.io-client';
import debug from 'debug';

import Config from '../config';
import { sendMessage } from './twilio';

const logger = debug('app:breaking-news')

export default function breakingNews(app) {
  let db = app.get('db');

  let socket = io(Config.socketUrl, {transports: ['websocket', 'xhr-polling']});
  socket.emit('get_breaking_news');
  socket.on('got_breaking_news', (data) => {
    let articles = data.snapshot.articles;
    ingestBreakingNews(db, articles);
  });
}

async function ingestBreakingNews(db, articles) {
  let col = db.collection('BreakingNewsAlert');
  for (let article of articles) {
    let articleId = article.article_id;

    let breakingNews = await col.find({ articleId }).limit(1).next();
    if (breakingNews == null) {
      sendBreakingNewsText(article);
      await col.insertOne({
        createdAt: new Date(),
        articleId: articleId,
      })
    }
  }
}

async function sendBreakingNewsText(article) {

  // TODO pull this from the User collection
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
