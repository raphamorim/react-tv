import React from 'react'
import compose from 'recompose/compose'
import withStateHandlers from 'recompose/withStateHandlers'
import withState from 'recompose/withState'
import withContext from 'recompose/withContext'
import getContext from 'recompose/getContext'
import mapProps from 'recompose/mapProps'
import withHandlers from 'recompose/withHandlers'
import withReducer from 'recompose/withReducer'
import withProps from 'recompose/withProps'
import lifecycle from 'recompose/lifecycle'
import Spatial from './spatial'
import ReactTV, { renderOnAppLoaded } from 'react-tv'
import PropTypes from 'prop-types'

const SpatialNavigation = new Spatial()

function withFocusable(Component, config) {
  const { focusKey } = config
  SpatialNavigation.addFocusable(config.focusKey)

  return compose(
    getContext({
      setFocus: PropTypes.func,
      currentFocusKey: PropTypes.string,
    }),
    mapProps(({ currentFocusKey, setFocus, ...props }) => {
      SpatialNavigation.withSetState(setFocus)
      return {
        focused: currentFocusKey === config.focusKey,
        setFocus: setFocus.bind(this, config.focusKey),
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
        currentFocusKey: SpatialNavigation.getCurrentFocusedPath(),
      },
      {
        setFocus: ({currentFocusKey}) => (focusKey, overwriteFocusKey) => {
          SpatialNavigation.setCurrentFocusedPath(overwriteFocusKey || focusKey)
          return {
            currentFocusKey: overwriteFocusKey || focusKey
          }
        },
      }
    ),
    withContext(
      { setFocus: PropTypes.func, currentFocusKey: PropTypes.string },
      ({ setFocus, currentFocusKey }) => ({ setFocus, currentFocusKey }),
    ),
  )(Component)
}

const Item = ({focused, setFocus, focusKey}) => {
  focused = (focused) ? 'focused' : 'unfocused'
  return (
    <div tabindex="0" id={focusKey} className={focused} onClick={() => setFocus()}>
      It's {focused} Item
    </div>
  )
}

function ProgramList() {
  const Button = ({focused, setFocus, focusKey}) => {
    focused = (focused) ? 'btn-focused' : 'btn-unfocused'
    return (
      <div
        tabindex="0"
        id={focusKey}
        className={focused}
        onPress={() => { console.log(121); setFocus('focusKey-1')}}
      >
        To Top!
      </div>
    )
  }

  const FocusableItem1 = withFocusable(Item, {focusKey: 'focusKey-1'})
  const FocusableItem2 = withFocusable(Item, {focusKey: 'focusKey-2'})
  const FocusableItem3 = withFocusable(Item, {focusKey: 'focusKey-3'})
  const FocusableButton = withFocusable(Button, {focusKey: 'button'})
  const FocusableItem4 = withFocusable(Item, {focusKey: 'focusKey-4'})
  const FocusableItem5 = withFocusable(Item, {focusKey: 'focusKey-5'})
  const FocusableItem6 = withFocusable(Item, {focusKey: 'focusKey-6'})

  return (
    <div className='program-list'>
      <FocusableItem1/>
      <FocusableItem2/>
      <FocusableItem3/>
      <div>
        <p>(press enter on next for back to top)</p>
        <FocusableButton/>
      </div>
      <FocusableItem4/>
      <FocusableItem5/>
      <FocusableItem6/>
    </div>
  )
}

function App(props) {
  console.log('navigation', props)
  return (
    <div className='first-example'>
      <h1>Current FocusKey: "{props.currentFocusKey}"</h1>
      <ProgramList/>
    </div>
  )
}

const AppWithNavigation = renderOnAppLoaded(withNavigation(App))

ReactTV.render(<AppWithNavigation/>, document.querySelector('#root'))
