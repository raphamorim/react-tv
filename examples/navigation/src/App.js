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

  return compose(
    getContext({
      setFocus: PropTypes.func,
      currentFocusPath: PropTypes.string,
    }),
    mapProps(({ currentFocusPath, setFocus, ...props }) => ({
      focused: currentFocusPath === focusPath,
      setFocus: setFocus.bind(this, focusPath),
      focusPath,
      ...props
    })),
    lifecycle({
      componentDidMount() {
        SpatialNavigation.addFocusable(focusPath)
      },
      componentWillUnmount() {
        SpatialNavigation.removeFocusable(focusPath)
      },
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
          const newFocusPath = overwriteFocusPath || focusPath
          if (currentFocusPath !== newFocusPath) {
            SpatialNavigation.setCurrentFocusedPath(newFocusPath)
            return { currentFocusPath: newFocusPath }
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
        SpatialNavigation.init(this.props.setFocus)
      },
      componentDidUpdate() {
        SpatialNavigation.init(this.props.setFocus)
      },
      componentWillUnmount() {
        SpatialNavigation.destroy()
      }
    }),
  )(Component)
}

const Item = ({focused, setFocus, focusPath}) => {
  focused = (focused) ? 'focused' : 'unfocused'
  return (
    <div
      id={focusPath}
      className={focused}
      onClick={() => { setFocus() }}
    >
      It's {focused} Item
    </div>
  )
}

const Button = ({focused, setFocus, focusPath}) => {
  focused = (focused) ? 'btn-focused' : 'btn-unfocused'
  return (
    <div
      id={focusPath}
      className={focused}
      onClick={() => { setFocus('focusPath-1') }}
    >
      To Top!
    </div>
  )
}

const Image = ({focused, setFocus, focusPath}) => {
  focused = (focused) ? 'btn-focused' : 'btn-unfocused'
  return (
    <img
      id={focusPath}
      className={focused}
      onClick={() => { setFocus() }}
      src='https://pbs.twimg.com/profile_images/922900899365732352/Ahcv30XE_400x400.jpg'
    />
  )
}

function ProgramList() {
  const FocusableItem1 = withFocusable(Item, {focusPath: 'focusPath-1'})
  const FocusableItem2 = withFocusable(Item, {focusPath: 'focusPath-2'})
  const FocusableItem3 = withFocusable(Item, {focusPath: 'focusPath-3'})
  const FocusableItem4 = withFocusable(Item, {focusPath: 'focusPath-4'})
  const FocusableItem5 = withFocusable(Item, {focusPath: 'focusPath-5'})
  const FocusableItem6 = withFocusable(Item, {focusPath: 'focusPath-6'})
  const FocusableButton = withFocusable(Button, {focusPath: 'button'})
  const FocusableImage = withFocusable(Image, {focusPath: 'image'})

  return [
    <div className='program-list'>
      <FocusableItem1/>
      <FocusableItem2/>
      <FocusableItem3/>
      <FocusableItem4/>
      <FocusableItem5/>
      <FocusableItem6/>
      <div>
        <p>(press enter on next for back to top)</p>
        <FocusableButton/>
      </div>
    </div>,
    <div className='video'>
      <FocusableImage/>
    </div>
  ]
}

function App(props) {
  return [
    <h1>Current FocusPath: '{props.currentFocusPath}'</h1>,
    <div className='navigation'>
      <ProgramList/>
    </div>
  ]
}

const AppWithNavigation = renderOnAppLoaded(withNavigation(App))

ReactTV.render(<AppWithNavigation/>, document.querySelector('#root'))
