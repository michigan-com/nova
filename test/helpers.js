'use strict';

export function CatchAsync(fn) {
  return (done) => {
    fn(done).catch((e) => { done(e); });
  };
}
