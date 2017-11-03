/*
RESULT FROM: https://babeljs.io/repl/#?babili=false&browsers=&build=&builtIns=false&code_lz=MYewdgzgLgBACgGwIZQGYgE4FsYF4YBKApksFACoBqAdIiutgFCPDIQQwDCCIwA1jCIAPKETAATDsVJRqnEFgAO4MbADejGDGgoieGGpjjdALhhgiAdxgARXQAoAlDAC-zLRjHiiGJwc1aMACWqDD2dGiYWNSWRABGIBDOGoGBnlAArhhgYQGpWgA84kEAbgB8efmFABYAjGUAEkQIPAA0BhEMWC4FAPR1FVWpBdUATGUAkrBBHGpQ1TPUOqLUxitQIAAyvEgIRORBWEQAylAYQWAA5k49_eOVw73F5Q8wjpVulelZOUWlZeQFhwAIKKRTBDhIEpIILIOJ7GDgBAATxgKBgmwA4jAAOrxADyxz6z0GrkYn1AkBAe2oPGunSi72kZCo1E8Eh89m4vD47XEvAyRzAskuRCgAFE9kKoAAhZETcT2ADkGBAICgSscjiAA&debug=false&circleciRepo=&evaluate=false&lineWrap=true&presets=es2015%2Creact%2Cstage-2&targets=&version=6.26.0

const Platform = ReactTV.Platform

class Clock extends React.Component {
  state = { date: new Date() }

  render() {
    if (Platform.webos) {
      return (
        <div>
          <h1>Hello, {Platform}</h1>
          <h2>It is {this.state.date.toLocaleTimeString()}</h2>
        </div>
      )
    }

    return <div>This App is available only at LG WebOS</div>
  }
}

console.log(Platform)
ReactTV.render(Clock, document.getElementById('root'))
*/

'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Platform = ReactTV.Platform;

var Clock = function (_React$Component) {
  _inherits(Clock, _React$Component);

  function Clock() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Clock);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Clock.__proto__ || Object.getPrototypeOf(Clock)).call.apply(_ref, [this].concat(args))), _this), _this.state = { date: new Date() }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Clock, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      setInterval(function () {
        return _this2.setState({ date: new Date() });
      }, 1000);
    }
  }, {
    key: 'render',
    value: function render() {
      if (Platform.webos) {
        return React.createElement(
          'h1',
          null,
          'Time is ',
          this.state.date.toLocaleTimeString()
        );
      }

      return React.createElement(
        'h2',
        null,
        'This App is available only at LG WebOS'
      );
    }
  }]);

  return Clock;
}(React.Component);

function fn() {
      console.log('hatake kakashi...');
    };

const reactElement = React.createElement('div', {onClick: fn}, 'click');
ReactTV.render(reactElement, document.getElementById('root'));
