import React from 'react';
import ReactTVRenderer from '../ReactTVFiberEntry';

const render = ReactTVRenderer.render;

// mock stateless components
const Base = () => React.createElement('div');
const Page1 = () => React.createElement('div');
const Page2 = () => React.createElement('div');

// helper for <Route path={path} component={component}>{children}</Route>
const Route = (path, component, children) =>
  React.createElement(
    'Route',
    {path: path, component: component, key: path},
    children
  );

const Rte = (path, component, children) =>
  React.createElement(
    'Route',
    {path: path, component: component, key: path, toJSON: () => {}},
    children
  );

describe('render', () => {
  it('should transform props into attribute', () => {
    const root = document.createElement('div');
    const reactElement = React.createElement(
      'div',
      {attr: 'custom'},
      'cowboy bebop'
    );

    const expectedElement = document.createElement('div');
    expectedElement.setAttribute('attr', 'custom');
    expectedElement.textContent = 'cowboy bebop';

    expect(render(reactElement, root)).toEqual(expectedElement);
  });

  it('should transform onClick into onclick attribute', () => {
    function fn() {
      console.log('hatake kakashi...');
    }

    const textNode = 'uzumaki naruto!';

    const root = document.createElement('div');
    const reactElement = React.createElement('div', {onClick: fn}, textNode);

    const expectedElement = document.createElement('div');
    expectedElement.setAttribute('onclick', fn);
    expectedElement.textContent = textNode;

    expect(render(reactElement, root)).toEqual(expectedElement);
  });

  // it('should render with the default toJSON behavior', () => {
  //   const rootDOM = document.createElement('div')
  //   const element = render(
  //     Route('/', Base, [
  //       Route('/page/1', Page1),
  //       Route('/page/2', Page2)
  //     ]), rootDOM
  //   );

  //   expect(element).toEqual(
  //     {
  //       path: '/',
  //       component: Base,
  //       children: [
  //         {
  //           path: '/page/1',
  //           component: Page1
  //         },
  //         {
  //           path: '/page/2',
  //           component: Page2
  //         }
  //       ]
  //     }
  //   );
  // });

  // it('should render children as string', () => {
  //   const reactElement = React.createElement(
  //     'h1',
  //     { babyComeBack: 'come back to me!' },
  //     'my-custom-text'
  //   );
  //   const element = render(reactElement);

  //   expect(element).toEqual(
  //     {'babyComeBack':'come back to me!','children': 'my-custom-text'}
  //   );
  // });

  // it('should render nested children', () => {
  //   const reactElement = React.createElement(
  //     'div',
  //     {fatherProps: 123},
  //     React.createElement(
  //       'h1',
  //       {abc: 1},
  //       React.createElement('p', {}, 'text')
  //     )
  //   );
  //   const element = render(reactElement);

  //   expect(element).toEqual(
  //     {'fatherProps': 123, 'children': {'abc': 1,'children': {'children': 'text'}}}
  //   );
  // });

  // it('should render with a custom toJSON method', () => {
  //   const element = render(
  //     Rte('/', Base, [
  //       Rte('/page/1', Page1, [Rte('lol')]),
  //       Rte('/page/2', Page2)
  //     ])
  //   );

  //   expect(element).toEqual(
  //     {
  //       path: '/',
  //       childRoutes: [
  //         {path: '/page/1', childRoutes: [{path: 'lol'}]},
  //         {path: '/page/2'}
  //       ]
  //     }
  //   );
  // });
});
