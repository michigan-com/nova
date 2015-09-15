'use strict';

import request from 'request';

export default function getAsync(url, options) {
  return new Promise(function(resolve, reject) {
    request.get(url, options, function(err, response) {
      if (err) reject(err);
      resolve(response);
    });
  });
}