/*global React, ReactTV*/

const inspect = require('./../../../memory-inspector');
const ReactTVRender = require('../../packages/react-tv/dist/react-tv.umd.js')
  .render;

const ReactPath =
  '/Users/hamorim/Documents/life/react-tv/node_modules/react/umd/react.production.min.js';
const ReactTVPath =
  '/Users/hamorim/Documents/life/react-tv/packages/react-tv/dist/react-tv.development.js';

const renderApp = renderMethod => () => {
  class Clock extends React.Component {
    constructor() {
      super();
      this.state = {date: new Date()};
    }

    componentDidMount() {
      setInterval(() => this.setState({date: new Date()}), 1000);
    }

    render() {
      return React.createElement(
        'div',
        {class: 'container'},
        React.createElement('img', {src: 'https://i.imgur.com/9yhDR0Q.png'}),
        React.createElement(
          'h1',
          null,
          'You ',
          this.state.date.toLocaleTimeString()
        ),
        React.createElement('p', null, 'In Browser')
      );
    }
  }

  return ReactTV.render(
    React.createElement(Clock, null),
    document.getElementById('root')
  );
};

// Should not pass 5MB
inspect({
  evaluate: renderApp.bind(ReactTVRender),
  scripts: [ReactPath, ReactTVPath],
  delay: 100,
  maxMemoryLimit: 5 * 1048576,
  maxMemoryPercentThreshold: 90,
}).then(memoryReport => {
  console.log(memoryReport);
});
