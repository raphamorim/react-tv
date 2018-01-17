import React from 'react';
import {render} from '../../ReactTVEntry';

// TODO: move this to root, doesn't make sense include renderer here

const events = {
  click() {
    return 'clicked';
  },
  focus() {
    return 'focused';
  },
  blur() {
    return 'blurred';
  },
  press() {
    return 'pressed';
  },
};

describe('[render] Event tests', () => {
  it('should onClick propagate a click event', () => {
    const spy = jest.spyOn(events, 'click');
    const root = document.createElement('div');
    const ReactElement = <div onClick={spy}>cowboy bebop</div>;
    const rendered = render(ReactElement, root);

    rendered.click();

    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockReset();
    spy.mockRestore();
  });

  it('should onFocus propagate a focus event', () => {
    const spy = jest.spyOn(events, 'focus');
    const root = document.createElement('div');
    const ReactElement = <input onFocus={spy} />;
    const rendered = render(ReactElement, root);

    rendered.focus();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockReset();
    spy.mockRestore();
  });

  it('should onBlur propagate a blur event', () => {
    const spy = jest.spyOn(events, 'blur');
    const root = document.createElement('div');
    const ReactElement = <input onBlur={spy} />;
    const rendered = render(ReactElement, root);

    rendered.focus();
    rendered.blur();

    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockReset();
    spy.mockRestore();
  });

  // it.skip('should onPress propagate a event based keypress with <enter>', () => {
  //   const spy = jest.spyOn(events, 'press');
  //   const root = document.createElement('div');
  //   const ReactElement = <div onPress={spy} />;
  //   const rendered = render(ReactElement, root);

  //   // const InvalidEvent = new KeyboardEvent('keydown', {keyCode: 37});
  //   // document.dispatchEvent(InvalidEvent);

  //   // expect(spy).toHaveBeenCalledTimes(0);

  //   // const ValidEvent = new KeyboardEvent('keydown', {keyCode: 13}});
  //   // document.dispatchEvent(ValidEvent);
  //   // expect(spy).toHaveBeenCalledTimes(1);

  //   spy.mockReset();
  //   spy.mockRestore();
  // });

  it('should onblur not propagate a event when blurred', () => {
    const spy = jest.spyOn(events, 'blur');
    const root = document.createElement('div');
    const ReactElement = <input onblur={spy} />;
    const rendered = render(ReactElement, root);

    rendered.focus();
    rendered.blur();

    expect(spy).toHaveBeenCalledTimes(0);
    spy.mockReset();
    spy.mockRestore();
  });

  it('should onfocus not propagate a event when focused', () => {
    const spy = jest.spyOn(events, 'focus');
    const root = document.createElement('div');
    const ReactElement = <input onfocus={spy} />;
    const rendered = render(ReactElement, root);

    rendered.focus();

    expect(spy).toHaveBeenCalledTimes(0);
    spy.mockReset();
    spy.mockRestore();
  });

  it('should onclick not propagate a event when clicked', () => {
    const spy = jest.spyOn(events, 'click');
    const root = document.createElement('div');
    const ReactElement = <div onclick={spy}>one piece</div>;
    const rendered = render(ReactElement, root);

    rendered.click();

    expect(spy).toHaveBeenCalledTimes(0);
    spy.mockReset();
    spy.mockRestore();
  });
});
