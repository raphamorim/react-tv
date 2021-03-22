import React from 'react';
import ReactTV from 'react-tv';

import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new Adapter() });

import SpatialNavigation from '../src/spatial-navigation';
import withFocusable from '../src/with-focusable';

describe('withFocusable', () => {
  const Component = () => <div />;
  const renderComponent = ({
    currentFocusPath,
    setFocus = jest.fn(),
    ...props
  }) => {
    const EnhancedComponent = withFocusable(Component);
    return mount(
      <EnhancedComponent {...props} />,
      { context: { currentFocusPath, setFocus } }
    );
  };

  let element;
  let component;

  beforeEach(() => {
    element = document.createElement('div');
    spyOn(ReactTV, 'findDOMNode').and.returnValue(element);
  });

  afterEach(() => {
    if (component) {
      component.unmount();
    }
  });

  it('injects focusPath as prop', () => {
    component = renderComponent({ focusPath: 'focusPath' });
    expect(component.find(Component).prop('focusPath')).toEqual('focusPath');
  });

  describe('when element focusPath is the same as currentFocusPath', () => {
    it('injects focused prop as true', () => {
      const focusPath = 'focusPath1';
      component = renderComponent({ currentFocusPath: focusPath, focusPath });

      expect(component.find(Component).prop('focused')).toBe(true);
    });
  });

  describe('when element focusPath is different than currentFocusPath', () => {
    it('injects focused prop as true', () => {
      component = renderComponent({
        currentFocusPath: 'focusPath1',
        focusPath: 'focusPath2',
      });

      expect(component.find(Component).prop('focused')).toBe(false);
    });
  });

  describe('about setFocus injected prop', () => {
    it('injects function to children', () => {
      component = renderComponent({ focusPath: 'focusPath' });
      expect(component.find(Component).prop('setFocus')).not.toBeFalsy();
    });

    it('binds configured focusPath as first parameter', () => {
      const setFocusSpy = jest.fn();
      component = renderComponent({
        focusPath: 'focusPath',
        setFocus: setFocusSpy,
      });

      const setFocus = component.find(Component).prop('setFocus');
      setFocus();

      expect(setFocusSpy).toHaveBeenCalledWith('focusPath');
    });

    it('sends setFocus parameter as second parameter', () => {
      const setFocusSpy = jest.fn();
      component = renderComponent({
        focusPath: 'focusPath',
        setFocus: setFocusSpy,
      });

      const setFocus = component.find(Component).prop('setFocus');
      setFocus('otherFocusPath');

      expect(setFocusSpy).toHaveBeenCalledWith('focusPath', 'otherFocusPath');
    });
  });

  describe('lifecycle', () => {
    let onEnterPress;

    beforeEach(() => {
      onEnterPress = jest.fn();
      spyOn(SpatialNavigation, 'addFocusable').and.callThrough();
      spyOn(SpatialNavigation, 'removeFocusable').and.callThrough();
    });

    describe('when mounting component', () => {
      it('adds to focusable management', () => {
        component = renderComponent({ focusPath: 'focusPath' });
        expect(SpatialNavigation.addFocusable)
          .toHaveBeenCalledWith(
            element,
            expect.objectContaining({ focusPath: 'focusPath' })
          );
      });

      it('listens enter press event', () => {
        component = renderComponent({ focusPath: 'focusPath', onEnterPress });

        const event = new CustomEvent('sn:enter-down');
        element.dispatchEvent(event);
        expect(onEnterPress).toHaveBeenCalled();
      });
    });

    describe('when unmounting component', () => {
      it('removes from focusable management', () => {
        component = renderComponent({ focusPath: 'focusPath' });

        component.unmount();
        expect(SpatialNavigation.removeFocusable)
          .toHaveBeenCalledWith(element, expect.anything());
      });

      it('stops listening to enter press event', () => {
        component = renderComponent({ focusPath: 'focusPath', onEnterPress });
        component.unmount();

        const event = new CustomEvent('sn:enter-down');
        element.dispatchEvent(event);
        expect(onEnterPress).not.toHaveBeenCalled();
      });
    });
  });
});
