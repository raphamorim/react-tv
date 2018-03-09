const inspect = require('./../../../memory-inspector')
const ReactDOMRender = require('react-dom').render;
const ReactTVRender = require('react-tv').render;

// Passar reactElement
// Passar um render
// levanta um server e mata


const renderReactApp = (renderFN) => () => {
  const element = document.createElement('div');
  document.body.appendChild(element);
  // renderFN(<div>My Amazing App</div>, document.querySelector('#root'))
  console.log(1);
}

// Should not pass 5MB
inspect({
  evaluate: renderReactApp(ReactTVRender),
  delay: 100,
  maxMemoryLimit: 5 * 1048576,
  maxMemoryPercentThreshold: 90,
}).then((memoryReport) => {
  console.log(memoryReport)
})

