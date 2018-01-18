import React from 'react'
import ReactTV, { renderOnAppLoaded } from 'react-tv'
import { withFocusable, withNavigation } from 'react-tv-navigation'

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
  focused = (focused) ? 'focused' : 'unfocused'
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
    <div className='image'>
      <FocusableImage/>
    </div>
  ]
}

function App({currentFocusPath}) {
  return [
    <h1>Current FocusPath: '{currentFocusPath}'</h1>,
    <div className='navigation'>
      <ProgramList/>
    </div>
  ]
}

const AppWithNavigation = renderOnAppLoaded(withNavigation(App))

ReactTV.render(<AppWithNavigation/>, document.querySelector('#root'))
