if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/react-tv.production.js');
} else {
  module.exports = require('./dist/react-tv.development.js');
}
