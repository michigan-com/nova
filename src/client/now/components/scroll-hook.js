'use strict';

import assign from 'object-assign';

const SCROLL_UP = 'up';
const SCROLL_DOWN = 'down';

export default class ScrollHook {
  static defaultProps = {
    ref: '', // string or array
    scrollTopThresholdDown: '0px',
    scrollTopThresholdUp: '0px',
    scrollDownHook: () => {},
    scrollUpHook: () => {},
  }

  constructor(opts) {
    this.opts = assign({}, ScrollHook.defaultProps, opts);
    if (!this.opts.ref) throw new Error('Need a ref to find a DOM Node');

    this.lastScrollTop = null;
    this.scrollTop = null;
  }

  getScrollDirection() {
    return this.lastScrollTop > this.scrollTop ? SCROLL_UP : SCROLL_DOWN;
  }

  shouldTriggerHook(scrollNode) {
    if (this.lastScrollTop === null || this.scrollTop === null) return false;

    let scrollThreshold = this.opts.scrollTopThresholdDown;
    const scrollDirection = this.getScrollDirection();
    if (scrollDirection === SCROLL_UP) {
      scrollThreshold = this.opts.scrollTopThresholdUp;
    }

    const threshold = this.getThreshold(scrollNode, scrollThreshold);
    if (threshold === null) return false;

    if (this.scrollTop >= threshold && scrollDirection === SCROLL_DOWN) {
      return true;
    } else if (this.scrollTop < threshold && scrollDirection === SCROLL_UP) {
      return true;
    }

    return false;
  }

  triggerHook() {
    if (this.scrollTop < this.lastScrollTop) {
      this.opts.scrollUpHook();
    } else {
      this.opts.scrollDownHook();
    }
  }

  getThreshold(scrollNode, threshold) {
    const pxMatch = /^(\d+)px$/.exec(threshold);
    if (pxMatch) {
      return pxMatch(1);
    }

    const percentMatch = /^(\d+)%$/.exec(threshold);
    if (percentMatch) {
      return (document.body.clientHeight - window.innerHeight) * (percentMatch[1] / 100);
      // return (scrollNode.scrollHeight - scrollNode.clientHeight) * (percentMatch[1]) / 100
    }
    return null;
  }

  storeClientTop(top) {
    this.lastScrollTop = this.scrollTop;
    this.scrollTop = top;
  }

  scrollDown(node) { this.opts.scrollDownHook(node); }
  scrollUp(node) { this.opts.scrollUpHook(node); }

  getScrollTop = () => ( this.scrollTop; )
  getRef = () => ( this.opts.ref; )
}
