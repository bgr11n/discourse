/*global virtualDom:true */

import PostStreamVDom from 'discourse/vdom/post-stream';
const { diff, patch } = virtualDom;

export default Ember.Component.extend({
  _vdom: null,
  _tree: null,

  didInsertElement() {
    const posts = this.get('posts') || [];
    this._vdom = new PostStreamVDom({ posts });
    this._tree = this.element;
    Ember.run.scheduleOnce('afterRender', this, this._checkRender);
  },

  _checkRender() {
    const tree = this._tree;
    if (tree) {
      const t0 = new Date().getTime();
      const newTree = this._vdom.render();
      const patches = diff(tree, newTree);
      this._tree = patch(tree, patches);
      console.log('render: ', new Date().getTime() - t0);
    }
    Ember.run.later(this, this._checkRender, 1000);
  },

});
