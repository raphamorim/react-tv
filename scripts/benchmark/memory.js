/*global React, ReactTV, ReactDOM*/

const inspect = require('./../../../memory-inspector');

const ReactPath =
  '/Users/hamorim/Documents/life/react-tv/node_modules/react/umd/react.production.min.js';
const ReactTVPath =
  '/Users/hamorim/Documents/life/react-tv/packages/react-tv/dist/react-tv.production.js';
const ReactDOMPath =
  '/Users/hamorim/Documents/life/react-tv/node_modules/react-dom/umd/react-dom.production.min.js';

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

  let render;
  if (window && window.ReactTV) {
    render = ReactTV.render;
    console.log('using react-tv');
  } else {
    render = ReactDOM.render;
    console.log('using react-dom');
  }

  render(React.createElement(Clock, null), document.getElementById('root'));
};

// Should not pass 5MB
inspect({
  evaluate: renderApp,
  scripts: [ReactPath, ReactTVPath],
  delay: 1000,
  maxMemoryLimit: 5 * 1048576,
  maxMemoryPercentThreshold: 90,
}).then(memoryReportTV => {
  console.log(memoryReportTV);

  inspect({
    evaluate: renderApp,
    scripts: [ReactPath, ReactDOMPath],
    delay: 3000,
    maxMemoryLimit: 5 * 1048576,
    maxMemoryPercentThreshold: 90,
  }).then(memoryReportDOM => {
    console.log(memoryReportDOM);
  });
});
