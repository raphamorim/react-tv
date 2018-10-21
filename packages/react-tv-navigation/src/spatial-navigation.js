import Navigation from './navigation';

class SpatialNavigation {
  constructor() {
    this.handleFocused = this.handleFocused.bind(this);

    this.destroy();
    this.bindFocusEvent();
  }

  init(updateState) {
    if (!this.setState) {
      this.setState = updateState;
    }

    Navigation.init();
    Navigation.focus();
    this.bindFocusEvent();
  }

  destroy() {
    this.focusedPath = null;
    this.setState = null;

    Navigation.uninit();
    this.unbindFocusEvent();
  }

  bindFocusEvent() {
    if (!this.listening) {
      this.listening = true;
      document.addEventListener('sn:focused', this.handleFocused);
    }
  }

  unbindFocusEvent() {
    document.removeEventListener('sn:focused', this.handleFocused);
    this.listening = false;
  }

  handleFocused(ev) {
    if (this.focusedPath !== ev.detail.sectionId) {
      this.setState(ev.detail.sectionId);
      Navigation.focus(ev.detail.sectionId);
    }
  }

  getCurrentFocusedPath() {
    return this.focusedPath;
  }

  setCurrentFocusedPath(focusPath) {
    this.focusedPath = focusPath;
    Navigation.focus(focusPath);
  }

  addFocusable(focusDOMElement, { focusPath, onEnterPressHandler }) {
    if (!focusDOMElement || Navigation.getSectionId(focusDOMElement)) {
      return;
    }

    this.removeFocusable(focusDOMElement, { onEnterPressHandler });

    const params = [{ selector: focusDOMElement }];
    if (focusPath) {
      params.unshift(focusPath);
    }

    focusDOMElement.addEventListener('sn:enter-down', onEnterPressHandler);
    const sectionId = Navigation.add(...params);
    Navigation.makeFocusable(sectionId);
  }

  removeFocusable(focusDOMElement, { onEnterPressHandler }) {
    const sectionId = Navigation.getSectionId(focusDOMElement);
    if (!sectionId) {
      return;
    }

    Navigation.remove(sectionId);
    focusDOMElement.removeEventListener('sn:enter-down', onEnterPressHandler);
  }
}

export default new SpatialNavigation();
