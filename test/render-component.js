require('babel-register')({});

const React = require('react');
const ReactDOM = require('react-dom/server');
const ReactTV = require('../src');

const ReactElement = React.createElement(
  'div', {babyComeBack: 'come back to me!'}, 'larger than life');

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

console.log('>', ReactTV.render(ReactElement));
console.log('>', ReactTV.render(
  React.createElement(
   'div', {}, ReactElement
  )
));

// console.log(ReactTV.render(TVComponentFromFunction));
// console.log(ReactTV.render(TVComponentFromClass));

// console.log(ReactDOM.renderToString(TVComponentFromFunction));
