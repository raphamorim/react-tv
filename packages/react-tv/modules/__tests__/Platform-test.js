import {Platform} from '../../ReactTVEntry';

describe('Platform', () => {
  it('compare with undefined/null/invalid string should return false', () => {
    expect(Platform()).toEqual(false);
    expect(Platform(null)).toEqual(false);
    expect(Platform('')).toEqual(false);
  });

  it('[nodejs/web] platforms should return false', () => {
    expect(Platform('webos')).toEqual(false);
    expect(Platform('tizen')).toEqual(false);
    expect(Platform('orsay')).toEqual(false);
  });

  it('[lg-webos] should return "lg-webos"', () => {
    global.window.PalmSystem = {version: 1};

    expect(Platform('webos')).toEqual(true);
    expect(Platform('tizen')).toEqual(false);
    expect(Platform('orsay')).toEqual(false);

    global.window.PalmSystem = null;
  });
});
