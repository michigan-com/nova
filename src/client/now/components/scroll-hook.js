'use strict';

import assign from 'object-assign';

export default class ScrollHook {
  defaultProps = {
    ref: '', // string or array
    scrollTopThreshold: '0px',
    scrollDownHook: () => {},
    scrollUpHook: () => {}
  }

  constructor(opts) {
    this.opts = assign({}, ScrollHook.defaultProps, opts);
    if (!this.opts.ref) throw new Error('Need a ref to find a DOM Node');

    this.lastScrollTop = null;
    this.scrollTop = null;
  }

  shouldTriggerHook(scrollNode) {
    if (this.lastScrollTop === null || this.scrollTop === null) return false;

    let threshold = this.getThreshold(scrollNode);
    if (threshold === null) return false;

    if (this.scrollTop >= threshold) {
      if (this.lastScrollTop <= threshold) {
        return true;
      }
    } else {
      if (this.lastScrollTop >= threshold) {
        return true;
      }
    }

    return false;
  }

  triggerHook(node) {
    if (this.scrollTop < this.lastScrollTop) {
      this.opts.scrollUpHook();
    } else {
      this.opts.scrollDownHook();
    }
  }

  getThreshold(scrollNode) {
    let pxMatch = /^(\d+)px$/.exec(this.opts.scrollTopThreshold);
    if (pxMatch) {
      return pxMatch(1);
    }

    let percentMatch = /^(\d+)%$/.exec(this.opts.scrollTopThreshold);
    if (percentMatch) {
      return (document.body.clientHeight - window.innerHeight) * (percentMatch[1] / 100);
      //return (scrollNode.scrollHeight - scrollNode.clientHeight) * (percentMatch[1]) / 100
    }

    return null;
  }

  storeClientTop(top) {
    this.lastScrollTop = this.scrollTop;
    this.scrollTop = top;
  }

  scrollDown(node) { this.opts.scrollDownHook(node); }
  scrollUp(node) { this.opts.scrollUpHook(node); }

  getScrollTop = () => { return this.scrollTop; }
  getRef = () => { return this.opts.ref; }
}
