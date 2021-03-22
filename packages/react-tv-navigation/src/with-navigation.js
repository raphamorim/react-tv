import PropTypes from 'prop-types';

import compose from 'recompose/compose';
import lifecycle from 'recompose/lifecycle';
import withContext from 'recompose/withContext';
import withStateHandlers from 'recompose/withStateHandlers';

import SpatialNavigation from './spatial-navigation';

const withNavigation = compose(
  withStateHandlers(
    {
      currentFocusPath: SpatialNavigation.getCurrentFocusedPath(),
    },
    {
      setFocus: ({ currentFocusPath }) => (focusPath, overwriteFocusPath) => {
        const newFocusPath = overwriteFocusPath || focusPath;
        if (currentFocusPath !== newFocusPath) {
          SpatialNavigation.setCurrentFocusedPath(newFocusPath);
          return { currentFocusPath: newFocusPath };
        }
      },
    }
  ),
  withContext(
    { setFocus: PropTypes.func, currentFocusPath: PropTypes.string },
    ({ setFocus, currentFocusPath }) => ({ setFocus, currentFocusPath }),
  ),
  lifecycle({
    componentDidMount() {
      SpatialNavigation.init(this.props.setFocus);
    },
    componentDidUpdate() {
      SpatialNavigation.init(this.props.setFocus);
    },
    componentWillUnmount() {
      SpatialNavigation.destroy();
    },
  }),
);

export default withNavigation;
