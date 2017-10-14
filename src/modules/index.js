module.exports = {
  Platform: {
    webos: (window && window.PalmSystem) ? true : false,
    tizen: false,
    orsay: false,
  }
}
