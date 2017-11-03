import React from 'react';
import ReactTVRenderer from '../ReactTVFiberEntry';

const render = ReactTVRenderer.render;

describe('render', () => {
  it('should className props into class', () => {
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
});
