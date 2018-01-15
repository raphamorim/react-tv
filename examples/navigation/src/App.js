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
  const { focusPath } = config
  SpatialNavigation.addFocusable(focusPath)

  return compose(
    getContext({
      setFocus: PropTypes.func,
      currentFocusPath: PropTypes.string,
    }),
    mapProps(({ currentFocusPath, setFocus, ...props }) => {
      SpatialNavigation.withSetState(setFocus)
      return {
        focused: currentFocusPath === focusPath,
        setFocus: setFocus.bind(this, focusPath),
        focusPath,
        ...props
      }
    }),
  )(Component)
}

function withNavigation(Component) {
  return compose(
    withStateHandlers(
      {
        currentFocusPath: SpatialNavigation.getCurrentFocusedPath(),
      },
      {
        setFocus: ({currentFocusPath}) => (focusPath, overwriteFocusPath) => {
          SpatialNavigation.setCurrentFocusedPath(overwriteFocusPath || focusPath)
          return {
            currentFocusPath: overwriteFocusPath || focusPath
          }
        },
      }
    ),
    withContext(
      { setFocus: PropTypes.func, currentFocusPath: PropTypes.string },
      ({ setFocus, currentFocusPath }) => ({ setFocus, currentFocusPath }),
    ),
  )(Component)
}

const Item = ({focused, setFocus, focusPath}) => {
  focused = (focused) ? 'focused' : 'unfocused'
  return (
    <div tabindex="0" id={focusPath} className={focused} onClick={() => setFocus()}>
      It's {focused} Item
    </div>
  )
}

function ProgramList() {
  const Button = ({focused, setFocus, focusPath}) => {
    focused = (focused) ? 'btn-focused' : 'btn-unfocused'
    return (
      <div
        tabindex="0"
        id={focusPath}
        className={focused}
        onPress={() => { console.log(121); setFocus('focusPath-1')}}
      >
        To Top!
      </div>
    )
  }

  const FocusableItem1 = withFocusable(Item, {focusPath: 'focusPath-1'})
  const FocusableItem2 = withFocusable(Item, {focusPath: 'focusPath-2'})
  const FocusableItem3 = withFocusable(Item, {focusPath: 'focusPath-3'})
  const FocusableButton = withFocusable(Button, {focusPath: 'button'})
  const FocusableItem4 = withFocusable(Item, {focusPath: 'focusPath-4'})
  const FocusableItem5 = withFocusable(Item, {focusPath: 'focusPath-5'})
  const FocusableItem6 = withFocusable(Item, {focusPath: 'focusPath-6'})

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
      <h1>Current FocusPath: "{props.currentFocusPath}"</h1>
      <ProgramList/>
    </div>
  )
}

const AppWithNavigation = renderOnAppLoaded(withNavigation(App))

ReactTV.render(<AppWithNavigation/>, document.querySelector('#root'))
