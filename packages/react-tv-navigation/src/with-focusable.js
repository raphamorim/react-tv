import ReactTV from 'react-tv';
import PropTypes from 'prop-types';

import compose from 'recompose/compose';
import mapProps from 'recompose/mapProps';
import lifecycle from 'recompose/lifecycle';
import getContext from 'recompose/getContext';
import setPropTypes from 'recompose/setPropTypes';
import withHandlers from 'recompose/withHandlers';

import SpatialNavigation from './spatial-navigation';

const withFocusable = compose(
  setPropTypes({
    focusPath: PropTypes.string.isRequired,
  }),
  getContext({
    setFocus: PropTypes.func,
    currentFocusPath: PropTypes.string,
  }),
  mapProps(({
    currentFocusPath,
    focusPath,
    setFocus = () => {},
    ...props
  }) => ({
    focused: currentFocusPath === focusPath,
    setFocus: setFocus.bind(null, focusPath),
    focusPath,
    ...props,
  })),
  withHandlers({
    onEnterPressHandler: ({ onEnterPress = () => {} }) => onEnterPress,
  }),
  lifecycle({
    addFocusable() {
      const { focusPath, onEnterPressHandler } = this.props;
      console.log(ReactTV.findDOMNode);
      SpatialNavigation.addFocusable(
        ReactTV.findDOMNode(this),
        { focusPath, onEnterPressHandler }
      );
    },
    componentDidMount() {
      this.addFocusable();
    },
    componentDidUpdate() {
      this.addFocusable();
    },
    componentWillUnmount() {
      SpatialNavigation.removeFocusable(
        ReactTV.findDOMNode(this),
        { onEnterPressHandler: this.props.onEnterPressHandler }
      );
    },
  }),
);

export default withFocusable;
