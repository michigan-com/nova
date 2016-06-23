'use strict';

module.exports = (w, d) => {
  const e = d.documentElement;
  const g = d.getElementsByTagName('body')[0];
  const x = w.innerWidth || e.clientWidth || g.clientWidth;
  const y = w.innerHeight || e.clientHeight || g.clientHeight;

  return { width: x, height: y };
};
