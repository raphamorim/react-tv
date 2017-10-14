module.exports = {
  platform: {
    webos: (window && window.PalmSystem) ? true : false,
    tizen: false,
    orsay: false,
  }
}
