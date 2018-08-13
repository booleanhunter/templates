'use strict';

const assert = require('assert');
const Collection = require('../lib/collection');
const engines = require('../lib/engines');
let posts, other;

describe('collection.pager', () => {
  beforeEach(() => {
    posts = new Collection('posts', { sync: true });
    other = new Collection('other', { sync: true });
    posts.engine('hbs', engines(require('handlebars')));
    other.engine('hbs', engines(require('handlebars')));
    posts.handler('onPaginate');
    posts.handler('onPager');
  });

  describe('pages', () => {
    it('should create a list of pagination pages', () => {
      posts.set('aaa.hbs', { contents: Buffer.from('') });
      posts.set('bbb.hbs', { contents: Buffer.from('') });
      posts.set('ccc.hbs', { contents: Buffer.from('') });

      const pages = posts.pager();
      assert(Array.isArray(pages));
      assert.equal(pages.length, 3);
    });

    it('should handle onPager middleware', () => {
      let count = 0;
      posts.onPager(/\.hbs$/, view => {
        view.path = `/site/posts/${view.stem}/index.html`;
        count++;
      });

      posts.option('engine', 'hbs');
      posts.set('aaa.hbs', { contents: Buffer.from('') });
      posts.set('bbb.hbs', { contents: Buffer.from('') });
      posts.set('ccc.hbs', { contents: Buffer.from('') });

      const pages = posts.pager();
      assert.equal(count, 3);
      assert.equal(pages[0].path, '/site/posts/aaa/index.html');
      assert.equal(pages[1].path, '/site/posts/bbb/index.html');
      assert.equal(pages[2].path, '/site/posts/ccc/index.html');
    });

    it('should render pagination pages', () => {
      const buf = Buffer.from(`{{#with pagination.pages}}
  <a href="{{lookup (first) "path"}}">First</a>
  <a href="{{lookup (lookup this ../pager.prev) "path"}}">Prev</a>
  <span>{{lookup (lookup this ../pager.index) "path"}}</span>
  <a href="{{lookup (lookup this ../pager.next) "path"}}">Next</a>
  <a href="{{lookup (last) "path"}}">Last</a>
{{/with}}`);

      posts.onPaginate(/./, view => {
        view.path = `/site/posts/${view.stem}/index.html`;
      });

      posts.option('engine', 'hbs');
      posts.set('aaa.hbs', { contents: buf });
      posts.set('bbb.hbs', { contents: buf });
      posts.set('ccc.hbs', { contents: buf });

      const pages = posts.paginate();

      const data = { pagination: { pages } };

      for (const post of posts.list) {
        posts.render(post, data);
        console.log(post.contents.toString());
      }

      // console.log(posts);
    });

    it('should render pagination pages2', () => {
      posts.option('engine', 'hbs');
      posts.set('aaa.hbs', { contents: Buffer.from('') });
      posts.set('bbb.hbs', { contents: Buffer.from('') });
      posts.set('ccc.hbs', { contents: Buffer.from('') });
      posts.set('ddd.hbs', { contents: Buffer.from('') });
      posts.set('eee.hbs', { contents: Buffer.from('') });
      posts.set('fff.hbs', { contents: Buffer.from('') });
      posts.set('ggg.hbs', { contents: Buffer.from('') });
      posts.set('hhh.hbs', { contents: Buffer.from('') });

      for (const view of posts.paginate()) {
        console.log(view.data);
      }
    });

    it('should render pagination pages', () => {
      const buf = Buffer.from(`{{#with pagination.pages}}
  <a href="{{lookup (first) "path"}}">First</a>
  <a href="{{lookup (lookup this ../pager.prev) "path"}}">Prev</a>
  <span>{{lookup (lookup this ../pager.index) "path"}}</span>
  <a href="{{lookup (lookup this ../pager.next) "path"}}">Next</a>
  <a href="{{lookup (last) "path"}}">Last</a>
{{/with}}`);

      posts.set('aaa.hbs', { contents: buf });
      posts.set('bbb.hbs', { contents: buf });
      posts.set('ccc.hbs', { contents: buf });

      const index = other.set('index.hbs', {
        contents: Buffer.from(`{{#with pagination.pages}}
  <a href="{{lookup (first) "path"}}">First</a>
  {{log this}}
  <a href="{{lookup (lookup this ../pager.prev) "path"}}">Prev</a>
  <span>{{lookup (lookup this ../pager.index) "path"}}</span>
  <a href="{{lookup (lookup this ../pager.next) "path"}}">Next</a>
  <a href="{{lookup (last) "path"}}">Last</a>
{{/with}}`)
      });

      other.render(index, { pagination: { pages: posts.pager() }});
      console.log(index.contents.toString());
    });
  });
});
