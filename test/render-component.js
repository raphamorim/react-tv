require('babel-register')({});

const React = require('react');
const ReactDOM = require('react-dom/server');
const ReactTV = require('../src');

const ReactElement = React.createElement(
  'div', {babyComeBack: 'come back to me!'});

const TVComponentFromClass = React.createElement(
  class ClassBasedComponent extends React.Component {
    render() {
      return React.createElement(
        'div', null, `Hello ${this.props.toWhat}`);
    }
  },
{toWhat: 'nice'}, null);

const TVComponentFromFunction = React.createElement((props) => (
  React.createElement('div', null, `Pure ${props.myText}`)
), {myText: 'abc'}, null);

console.log('pure:', ReactElement);
console.log('class:', TVComponentFromClass);
console.log('function:', TVComponentFromFunction);

console.log(ReactTV.render(ReactElement));
console.log(ReactDOM.renderToString(TVComponentFromFunction));
console.log(ReactTV.render(TVComponentFromClass));
