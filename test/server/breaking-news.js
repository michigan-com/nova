'use strict';

import { equal } from 'assert';

import { ingestBreakingNews } from '../../dist/breaking-news';
import dbConnect from '../../dist/util/db';
import { generateRandomNumber } from '../../dist/util/generate-code';

var db, BreakingNewsCollection;

function generateBreakingNewsArticle() {
  return {
    article_id: generateRandomNumber(100, 10000)
  }
}

describe('Tests breaking-news logic', () => {

  before((done) => {
    async function init(done) {
      db = await dbConnect('mongodb://localhost:27017/nova-test');
      BreakingNewsCollection = db.collection('BreakingNewsAlert');
      done();
    }

    init(done).catch((e) => { throw new Error(e); })
  });

  beforeEach(async (done) => {
    await BreakingNewsCollection.remove({});
    done();
  })

  after(async (done) => {
    await db.dropDatabase();
    done();
  });

  it('Tests a breaking news alert', (done) => {
    async function _test() {
      let testBreakingArticle = generateBreakingNewsArticle();

      let articlesToSend = await ingestBreakingNews(db, [ testBreakingArticle ]);
      equal(articlesToSend.length, 1, `Should have one article to send, there are ${articlesToSend.length}`);
      done();
    }

    _test().catch((e) => { throw new Error(e); });
  });

  it('Tests a simulated socket update', (done) => {
    async function _test() {
      let testBreakingArticle = generateBreakingNewsArticle();

      let articlesToSend = await ingestBreakingNews(db, [ testBreakingArticle ]);
      equal(articlesToSend.length, 1, `Should have one article to send, there are ${articlesToSend.length}`);

      articlesToSend = await ingestBreakingNews(db, [ testBreakingArticle ]);
      equal(articlesToSend.length, 0, `Should have no articles to send because we recorded this breaking article already: (actual count ${articlesToSend.length})`);

      let secondBreakingNewsArticle = generateBreakingNewsArticle();
      articlesToSend = await ingestBreakingNews(db, [ testBreakingArticle, secondBreakingNewsArticle ]);
      equal(articlesToSend.length, 1, `Should have one breaking news articles, instead have ${articlesToSend.length}`);

      done();
    }
    _test().catch((e) => { throw new Error(e); });
  });

  it('Tries a bunch of articles just for fun', (done) => {
    async function _test() {
      let articles = [];
      for (let i = 0; i < 10; i++) articles.push(generateBreakingNewsArticle());

      let articlesToSend = await ingestBreakingNews(db, articles);
      equal(articlesToSend.length, articles.length, `Should have been ${articles.length} articles, there are ${articlesToSend}`);

      articlesToSend = await ingestBreakingNews(db, articles);
      equal(articlesToSend.length, 0, 'Should be no articles to send');
      done();
    }

    _test().catch((e) => { throw new Error(e) ;})
  });
});
