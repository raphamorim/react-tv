import React from 'react'
import ReactTV, { renderOnAppLoaded } from 'react-tv'

class Navigation extends React.Component {
  componentDidMount() {
    if (waterfall) {
      waterfall(document.querySelector('.waterfall'));
    }
  }

  render() {
    let items = []
    for (let i = 1; i <= 10; i++) {
      const clickHandler = (ev) =>
        console.log('click ' + i);

      items.push(
        <div
          class="item"
          onFocus={(ev) => console.log('focus ' + i)}
          onBlur={(ev) => console.log('blur ' + i)}
          onPress={(ev) => console.log('press ' + i)}
          onClick={(i !== 2) ? clickHandler : null}
          focusable={(i !== 2)}
          focused={(i === 3)}
        >
          {(i !== 2) ? i : null}
        </div>
      )
    }

    return (
      <div id='container'>
        <h1>React-TV Navigation</h1>
        <div class="waterfall">
          {items}
        </div>
      </div>
    )
  }
}

const App = renderOnAppLoaded(Navigation)

ReactTV.render(<App/>, document.querySelector('#root'))
