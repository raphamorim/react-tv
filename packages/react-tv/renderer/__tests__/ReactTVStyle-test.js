import React from 'react';
import {render} from '../../ReactTVEntry';

describe('[render] Style Map tests', () => {
  it('should transform style object into inline style', () => {
    const style = {
      div: {
        fontSize: 19,
        fontFamily: ['Helvetica', 'arial'],
        backgroundColor: 'blue',
        border: '1px solid yellow',
      },
      paragraph: {
        display: 'flex',
        opacity: 0.5,
        zIndex: 99,
      },
      empty: {},
    };

    const inlineStyle = {
      div:
        'font-size: 19px; font-family: Helvetica,arial; background-color: blue; border: 1px solid yellow;',
      paragraph: 'display: flex; opacity: 0.5; z-index: 99;',
    };

    const root = document.createElement('div');
    const ReactElement = (
      <div style={style.div}>
        <div style={style.empty}>
          <p style={style.paragraph}>cowboy bebop</p>
        </div>
      </div>
    );

    const expectedElement = document.createElement('div');
    expectedElement.setAttribute('style', inlineStyle.div);
    const emptyElement = expectedElement.appendChild(
      document.createElement('div')
    );
    const paragraphElement = emptyElement.appendChild(
      document.createElement('p')
    );
    paragraphElement.setAttribute('style', inlineStyle.paragraph);

    paragraphElement.textContent = 'cowboy bebop';

    expect(render(ReactElement, root)).toEqual(expectedElement);
  });
});
