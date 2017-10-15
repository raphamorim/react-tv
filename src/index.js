const reactTVRenderer = require('./Renderer');
const modules = require('./modules');

module.exports = {
  render: reactTVRenderer.render,
  Platform: modules.Platform,
};
