import React from 'react'
import compose from 'recompose/compose'
import withStateHandlers from 'recompose/withStateHandlers'
import withState from 'recompose/withState'
import withContext from 'recompose/withContext'
import getContext from 'recompose/getContext'
import mapProps from 'recompose/mapProps'
import withHandlers from 'recompose/withHandlers'
import withReducer from 'recompose/withReducer'
import ReactTV, { renderOnAppLoaded } from 'react-tv'
import PropTypes from 'prop-types'

// TODO:
// select focus only in one
//

let focusKeys = [];
let focused = null;

const Navigation = {
  getCurrentFocusKey: () => focused,
  onFocusChange: () => null,
  setCurrentFocusKey: (focusKey) => {
    focused = focusKey
  },
}

function isFocused(focusKey) {
  focusKeys.push(focusKey)

  if (focusKey === Navigation.getCurrentFocusKey()) {
    setFocus(focusKey)
    return true;
  }

  return false;
}

function withFocusable(Component, config) {
  const { focusKey } = config
  return compose(
    getContext({
      setFocusKey: PropTypes.func,
      currentFocusKey: PropTypes.string,
    }),
    mapProps(({ currentFocusKey, setFocusKey, ...props }) => {
      return {
        focused: currentFocusKey === config.focusKey,
        setFocusKey: setFocusKey.bind(this, config.focusKey),
        focusKey: config.focusKey,
        ...props
      }
    }),
  )(Component)
}

function withNavigation(Component) {
  return compose(
    withStateHandlers(
      {
        currentFocusKey: Navigation.getCurrentFocusKey()
      },
      {
        setFocusKey: ({currentFocusKey}) => (focusKey) => {
          Navigation.setCurrentFocusKey(focusKey)
          return {
            currentFocusKey: focusKey
          }
        },
      }
    ),
    withContext(
      { setFocusKey: PropTypes.func, currentFocusKey: PropTypes.string },
      ({ setFocusKey, currentFocusKey }) => ({ setFocusKey, currentFocusKey }),
    ),
  )(Component)
}

const Item = ({focused, setFocusKey, focusKey}) => {
  focused = (focused) ? 'focused' : 'unfocused'
  return (
    <div className={focused} onClick={() => setFocusKey()}>
      It's {focused} Item
    </div>
  )
}

const FocusableItem1 = withFocusable(Item, {focusKey: 'focusKey-1'})
const FocusableItem2 = withFocusable(Item, {focusKey: 'focusKey-2'})
const FocusableItem3 = withFocusable(Item, {focusKey: 'focusKey-3'})

function FirstArea(props) {
  console.log('navigation', props)
  return (
    <div>
      <h1>Current FocusKey: "{props.currentFocusKey}"</h1>
      <FocusableItem1/>
      <FocusableItem2/>
      <FocusableItem3/>
    </div>
  )
}

const App = renderOnAppLoaded(withNavigation(FirstArea))

ReactTV.render(<App/>, document.querySelector('#root'))
