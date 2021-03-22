# react-tv

[See react-tv repository for more details](https://github.com/raphamorim/react-tv)

To install `react-tv` (React Renderer):

```bash
$ yarn add react-tv
```

### `Platform`

When building a cross-platform TV app, you'll want to re-use as much code as possible. You'll probably have different scenarios where different code might be necessary.  
For instance, you may want to implement separated visual components for `LG-WebOS` and `Samsung-Tizen`.

React-TV provides the `Platform` module to easily organize your code and separate it by platform:

```js
import { Platform } from 'react-tv'

console.log(Platform('webos')) // true
console.log(Platform('tizen')) // false
console.log(Platform('orsay')) // false
```

### `renderOnAppLoaded`

Takes a component and returns a higher-order component version of that component, which renders only after application was launched, allows to not write diffent logics for many devices.

```js
import { renderOnAppLoaded } from 'react-tv'

const Component = () => (<div></div>)
const App = renderOnAppLoaded(Component)
```

### `findDOMNode`

Similar to [react-dom findDOMNode](https://reactjs.org/docs/react-dom.html#finddomnode)

### Navigation

If you want to start with Navigation for TVs. React-TV provides a package for spatial navigation with declarative support based on [Netflix navigation system](https://medium.com/netflix-techblog/pass-the-remote-user-input-on-tv-devices-923f6920c9a8). 

[React-TV Navigation](https://github.com/react-tv/react-tv-navigation) exports `withFocusable` and `withNavigation` which act as helpers for Navigation.

```jsx
import React from 'react'
import ReactTV from 'react-tv'
import { withFocusable, withNavigation } from 'react-tv-navigation'

const Item = ({focused, setFocus, focusPath}) => {
  focused = (focused) ? 'focused' : 'unfocused'
  return (
    <div onClick={() => { setFocus() }} >
      It's {focused} Item
    </div>
  )
}

const Button = ({setFocus}) => {
  return (
    <div onClick={() => { setFocus('item-1') }}>
      Back To First Item!
    </div>
  )
}

const FocusableItem = withFocusable(Item)
const FocusableButton = withFocusable(Button)

function App({currentFocusPath}) {
  return (
    <div>
      <h1>Current FocusPath: '{currentFocusPath}'</h1>,
      <FocusableItem focusPath='item-1'/>
      <FocusableItem focusPath='item-2'/>
      <FocusableButton
        focusPath='button'
        onEnterPress={() => console.log('Pressed enter on Button!')}/>
    </div>
  )
}

const NavigableApp = withNavigation(App)

ReactTV.render(<NavigableApp/>, document.querySelector('#app'))
```
