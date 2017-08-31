'use strict';

require('babel-register')({});

const assert = require('assert');
const React = require('react');
const args = process.argv.slice(2);

const TEST_FILE = args[0] === '-f' || args[0] === '--fiber'
  ? 'fiber'
  : 'stack';

console.log('Running %s tests', TEST_FILE);
const TinyRenderer = require('../src/renderers/' + TEST_FILE);
const render = TinyRenderer.render;
const toJSON = (props) => {
  if (props.children) {
    let childRoutes;
    if (Array.isArray(props.children)) {
      childRoutes = props.children.map(child => (
        typeof child.props.toJSON === 'function'
        ? child.props.toJSON(child.props)
        : toJSON(child.props)
      ));
    } else {
      childRoutes = {};
    }
    return {path: props.path, childRoutes};
  }

  return {path: props.path};
};

// mock stateless components
const Base = () => React.createElement('div');
const Page1 = () => React.createElement('div');
const Page2 = () => React.createElement('div');

// helper for <Route path={path} component={component}>{children}</Route>
const Route = (path, component, children) =>
  React.createElement('Route', {path: path, component: component, key: path}, children);

const Rte = (path, component, children) =>
  React.createElement('Route', {path: path, component: component, key: path, toJSON: toJSON}, children);

const ok = [];
const fail = [];
const skipped = [];
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  reset: '\x1b[37m',
};

const it = (desc, fn) => {
  try {
    fn.call(null);
    console.log('%s✓ %s%s', colors.green, colors.reset, desc);
    ok.push({desc});
  } catch (err) {
    fail.push({desc, err});
    console.log('%s𝘅 %s%s',colors.red, colors.reset,  desc);
    console.error('%s. Expected\n  %j\n to equal\n  %j\n', err.name, err.actual, err.expected)
  }
};

it.skip = (desc, fn) => skipped.push({desc});

it('should render with the default toJSON behavior', () => {
  const element = render(
    Route('/', Base, [
      Route('/page/1', Page1),
      Route('/page/2', Page2)
    ])
  );

  assert.deepEqual(
    element,
    {
      path: '/',
      component: Base,
      children: [
        {
          path: '/page/1',
          component: Page1
        },
        {
          path: '/page/2',
          component: Page2
        }
      ]
    }
  );
});

it('should render with a custom toJSON method', () => {
  const element = render(
    Rte('/', Base, [
      Rte('/page/1', Page1, [Rte('lol')]),
      Rte('/page/2', Page2)
    ])
  );

  assert.deepEqual(
    element,
    {
      path: '/',
      childRoutes: [
        {path: '/page/1', childRoutes: [{path: 'lol'}]},
        {path: '/page/2'}
      ]
    }
  );
});

if (fail.length > 0) {
  console.log('%s tests passed', ok.length);
  if (skipped.length) console.log('%s tests skipped', skipped.length);
  console.log('%s tests failed', fail.length);
  process.exit(1);
} else {
  console.log('%s tests passed', ok.length);
  if (skipped.length) console.log('%s tests skipped', skipped.length);
}

console.log('');
