/*global virtualDom:true */

const h = virtualDom.h;

class RawHtml {
  constructor(html) {
    this.html = html;
  }

  init() {
    return $(this.html)[0];
  }

  update(prev) {
    if (prev.html !== this.html) {
      return this.init();
    }
    return null;
  }

  destroy() { }
}

RawHtml.prototype.type = 'Widget';

export default class {
  constructor(attrs) {
    this.attrs = attrs || {};
  }

  render() {

    const posts = this.attrs.posts.map(p => {
      return h('div', new RawHtml(`<div class='cooked'>${p.get('cooked')}</div>`));
    });

    return h('div', posts);
  }
};
