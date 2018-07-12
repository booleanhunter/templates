'use strict';

require('mocha');
const assert = require('assert');
const Templates = require('..');
const handlebars = require('../lib/engines');
let app, render, hbs;

describe('handlebars - partials', function() {
  beforeEach(function() {
    const engine = handlebars(require('handlebars'));
    hbs = engine.instance;

    hbs.registerPartial('custom', 'a partial');
    hbs.registerPartial('baz', 'partial baz');
    hbs.registerHelper('partialName', function(options) {
      return options && options.hash.name ? options.hash.name : this.customName;
    });

    app = new Templates({ sync: true, handlers: ['onLoad'] });
    app.engine('hbs', engine);

    app.create('pages');
    app.create('partials', { kind: 'partial' });
    app.partials.set('button.hbs', { contents: Buffer.from('<button>Click me!</button>') });

    render = (str, locals) => {
      const view = app.pages.set('fixture.hbs', { contents: Buffer.from(str) });
      app.render(view, locals);
      return view.contents.toString();
    };
  });

  it('should precompile partials', () => {
    assert.equal(render('Partial: {{> button }}'), 'Partial: <button>Click me!</button>');
  });

  it('should resolve a dynamic partial from a string name on options.hash', () => {
    hbs.registerPartial('foo', 'a partial');
    assert.equal(render('{{> (partialName name="foo") }}'), 'a partial');
  });

  it('should resolve a dynamic partial from a variable name on options.hash', () => {
    hbs.registerPartial('foo', 'a partial');
    assert.equal(render('{{> (partialName name=bar) }}', { bar: 'foo' }), 'a partial');
  });
});