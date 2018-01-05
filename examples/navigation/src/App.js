import React from 'react'
import compose from 'recompose/compose'
import withStateHandlers from 'recompose/withStateHandlers'
import ReactTV, { renderOnAppLoaded } from 'react-tv'

let focusKeys = [];

const Navigation = {
  getCurrentFocusKey: () => 'focusKey-2',
  onFocusChange: () => null,
  setFocus: (a, b) => {
    console.log(a, b)
  },
}

function isFocused(focusKey) {
  if (!focusKeys.length) {
    focusKeys.push(focusKey)
    // return true;
  }

  if (focusKey === Navigation.getCurrentFocusKey()) {
    return true;
  }

  return false;
}

function withFocusable(Component, config) {
  const { focusKey } = config
  const { setFocus } = Navigation
  return compose(
    withStateHandlers(
      {isFocused: isFocused(focusKey)},
      {
        setFocus: ({isFocused}) => (value) => ({
          isFocused: !isFocused
        }),
      }
    ),
  )(Component)
}

function withNavigation(Component) {
  return compose(
    withStateHandlers(
      {
        currentFocusKey: Navigation.getCurrentFocusKey()
      },
      {
        abc: () => null
      }
    )
  )(Component)
}

const Item = ({isFocused, setFocus}) => {
  const focused = (isFocused) ? 'focused' : 'unfocused'
  return (
    <div className={focused} onClick={() => setFocus(true)}>
      It's {focused} Item
    </div>
  )
}

const FocusableItem1 = withFocusable(Item, {focusKey: 'focusKey-1'})
const FocusableItem2 = withFocusable(Item, {focusKey: 'focusKey-2'})
const FocusableItem3 = withFocusable(Item, {focusKey: 'focusKey-3'})

function FirstArea({currentFocusKey}) {
  return (
    <div>
      <h1>Current FocusKey: "{currentFocusKey}"</h1>
      <FocusableItem1/>
      <FocusableItem2/>
      <FocusableItem3/>
    </div>
  )
}

const App = renderOnAppLoaded(withNavigation(FirstArea))

ReactTV.render(<App/>, document.querySelector('#root'))
