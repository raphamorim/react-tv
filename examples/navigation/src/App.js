import React from 'react'
import ReactTV, { renderOnAppLoaded } from 'react-tv'
import { withFocusable, withNavigation } from '../../../packages/react-tv-navigation/src'

const Item = ({focused, setFocus, focusPath}) => {
  focused = (focused) ? 'focused' : 'unfocused'
  return (
    <div
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
      className={focused}
    >
      Log on console
    </div>
  )
}

const Image = ({focused, setFocus, focusPath}) => {
  focused = (focused) ? 'focused' : 'unfocused'
  return (
    <img
      className={focused}
      onClick={() => { setFocus() }}
      src='https://pbs.twimg.com/profile_images/922900899365732352/Ahcv30XE_400x400.jpg'
    />
  )
}

const FocusableItem = withFocusable(Item)
const FocusableButton = withFocusable(Button)
const FocusableImage = withFocusable(Image)

function ProgramList() {
  return (
    <div className='navigation'>
      <div className='program-list'>
        <FocusableItem focusPath='focusable-item-1'/>
        <FocusableItem focusPath='focusable-item-2'/>
        <FocusableItem focusPath='focusable-item-3'/>
        <FocusableItem focusPath='focusable-item-4'/>
        <FocusableItem focusPath='focusable-item-5'/>
        <FocusableItem focusPath='focusable-item-6'/>
        <div>
          <p>(press enter to log on console)</p>
          <FocusableButton onEnterPress={() => console.log('enter key was pressed')} focusPath='focusable-button'/>
        </div>
      </div>
      <div className='image'>
        <FocusableImage focusPath='focusable-image'/>
      </div>
    </div>
  )
}

function App({currentFocusPath}) {
  return (
    <div>
      <h1>Current FocusPath: '{currentFocusPath}'</h1>
      <ProgramList/>
    </div>
  )
}

const AppWithNavigation = renderOnAppLoaded(withNavigation(App))

ReactTV.render(<AppWithNavigation/>, document.querySelector('#root'))
