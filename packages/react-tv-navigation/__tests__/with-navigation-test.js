import React from 'react';

import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new Adapter() });

import SpatialNavigation from '../src/spatial-navigation';
import withNavigation from '../src/with-navigation';

describe('withNavigation', () => {
  const Component = () => <div />;
  const EnhancedComponent = withNavigation(Component);
  const renderComponent = () => mount(<EnhancedComponent />);

  let component;

  describe('#setFocus', () => {
    beforeEach(() => {
      spyOn(SpatialNavigation, 'setCurrentFocusedPath').and.callThrough();
      component = renderComponent();
    });

    describe('for the same focusPath', () => {
      it('does nothing', () => {
        component.setState({ currentFocusPath: 'focusPath' });
        component.children().props().setFocus('focusPath');
        expect(SpatialNavigation.setCurrentFocusedPath).not.toHaveBeenCalled();
      });
    });

    describe('for a different focusPath', () => {
      it('updates navigation currentFocusPath', () => {
        component.setState({ currentFocusPath: 'focusPath' });
        component.children().props().setFocus('anotherFocusPath');
        expect(SpatialNavigation.getCurrentFocusedPath())
          .toEqual('anotherFocusPath');
      });

      it('updates currentFocusPath state', () => {
        component.setState({ currentFocusPath: 'focusPath' });
        component.children().props().setFocus('anotherFocusPath');
        expect(component.state().currentFocusPath).toEqual('anotherFocusPath');
      });
    });
  });

  describe('lifecycle', () => {
    beforeEach(() => {
      spyOn(SpatialNavigation, 'init');
      spyOn(SpatialNavigation, 'destroy');
    });

    it('initializes after component mounts', () => {
      component = renderComponent();
      expect(SpatialNavigation.init).toHaveBeenCalled();
    });

    it('initializes after component updates', () => {
      component = renderComponent();

      SpatialNavigation.init.calls.reset();
      expect(SpatialNavigation.init).not.toHaveBeenCalled();
      component.setProps({ prop: 'test' });
      expect(SpatialNavigation.init).toHaveBeenCalled();
    });

    it('destroys after component unmounts', () => {
      component = renderComponent();

      component.unmount();
      expect(SpatialNavigation.destroy).toHaveBeenCalled();
    });
  });
});
