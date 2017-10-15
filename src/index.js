const reactTVRenderer = require('./renderer');
const modules = require('./modules');

module.exports = {
  render: reactTVRenderer.render,
  Platform: modules.Platform,
};
