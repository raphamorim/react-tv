import React from 'react';

import TestRenderer from 'react-test-renderer';
import ShallowRenderer from 'react-test-renderer/shallow';

import {renderOnAppLoaded} from '../../ReactTVEntry';

let mockIsWebOS = false;
jest.mock('../Platform', () => jest.fn(() => mockIsWebOS));

describe('renderOnAppLoaded', () => {
  const Component = () => <div />;
  const App = renderOnAppLoaded(Component);

  describe('on WebOS Platform', () => {
    beforeEach(() => {
      mockIsWebOS = true;
    });

    it('starts not rendered', () => {
      const renderer = new ShallowRenderer();
      renderer.render(<App />);

      const result = renderer.getRenderOutput();
      expect(result).toBeNull();
    });

    it('listen to "webOSLaunch" event', () => {
      const testRenderer = TestRenderer.create(<App />);

      const event = document.createEvent('Event');
      event.initEvent('webOSLaunch', true, true);
      document.dispatchEvent(event);

      expect(testRenderer.toTree().rendered.type).toEqual(Component);
    });
  });

  describe('on any other Platform', () => {
    beforeEach(() => {
      mockIsWebOS = false;
    });

    it('renders Component', () => {
      const testRenderer = TestRenderer.create(<App />);
      expect(testRenderer.toTree().rendered.type).toEqual(Component);
    });
  });
});
