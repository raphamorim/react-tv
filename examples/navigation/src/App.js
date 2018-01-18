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
  const FocusableItem1 = withFocusable({focusPath: 'focusPath-1'})(Item)
  const FocusableItem2 = withFocusable({focusPath: 'focusPath-2'})(Item)
  const FocusableItem3 = withFocusable({focusPath: 'focusPath-3'})(Item)
  const FocusableItem4 = withFocusable({focusPath: 'focusPath-4'})(Item)
  const FocusableItem5 = withFocusable({focusPath: 'focusPath-5'})(Item)
  const FocusableItem6 = withFocusable({focusPath: 'focusPath-6'})(Item)
  const FocusableButton = withFocusable({focusPath: 'button'})(Button)
  const FocusableImage = withFocusable({focusPath: 'image'})(Image)

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
