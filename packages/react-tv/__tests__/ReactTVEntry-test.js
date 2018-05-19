import React from 'react';
import ReactTV, {Platform} from '../ReactTVEntry.js';

describe('[render] Integration between renderer and modules', () => {
  it('should renderer to expected Element', () => {
    const root = document.createElement('div');
    function MyComponent() {
      let currentPlatform = 'LG WebOS';
      if (!Platform('webos')) {
        currentPlatform = 'Browser';
      }

      return (
        <div class="container">
          <p>{currentPlatform}</p>
        </div>
      );
    }

    const renderedElement = ReactTV.render(MyComponent(), root);

    const expectedElement = document.createElement('div');
    expectedElement.setAttribute('class', 'container');
    const paragraph = document.createElement('p');
    paragraph.textContent = 'Browser';
    expectedElement.appendChild(paragraph);

    expect(renderedElement).toEqual(expectedElement);
  });
});
