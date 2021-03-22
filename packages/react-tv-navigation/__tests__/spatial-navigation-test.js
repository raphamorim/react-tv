import SpatialNavigation from '../src/spatial-navigation';

describe('SpatialNavigation', () => {
  let setStateSpy;

  beforeEach(() => {
    setStateSpy = jest.fn();
    SpatialNavigation.init(setStateSpy);
  });

  afterEach(() => {
    SpatialNavigation.destroy();
  });

  describe('on initialize', () => {
    it('listens to sn:focused event', () => {
      const event = new CustomEvent('sn:focused', {
        detail: { sectionId: 'focusPath' },
      });
      document.dispatchEvent(event);

      expect(setStateSpy).toHaveBeenCalled();
    });

    describe('when focusing the same focused element', () => {
      beforeEach(() => {
        SpatialNavigation.focusedPath = 'focusPath';
      });

      it('does nothing', () => {
        const event = new CustomEvent('sn:focused', {
          detail: { sectionId: 'focusPath' },
        });
        document.dispatchEvent(event);

        expect(setStateSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('on destroy', () => {
    it('stops listening to sn:focused', () => {
      SpatialNavigation.destroy();

      const event = new CustomEvent('sn:focused', {
        detail: { sectionId: 'focusPath' },
      });
      document.dispatchEvent(event);

      expect(setStateSpy).not.toHaveBeenCalled();
    });
  });
});
