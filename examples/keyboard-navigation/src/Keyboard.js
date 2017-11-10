import React from 'react'
import ReactTV, { Platform, WebOSSimulator } from '../../../src/ReactTVEntry'

class Keyboard extends React.Component {
  constructor() {
    super()
    this.state = {lastInput: null}
  }

  render() {
    const { lastInput } = this.state;
    const lastInputPressed = (lastInput) ?
      `last input: ${lastInput}` :
      'input something!'

    let component = (
      <div class='container'>
        <h1>React-TV</h1>
        <p onInputPress={(input) => {this.setState({lastInput: input})}}>
          {lastInputPressed}
        </p>
      </div>
    )

    if (!Platform('webos')) {
      component = <WebOSSimulator>{component}</WebOSSimulator>
    }

    return component
  }
}

ReactTV.render(<Keyboard/>, document.getElementById('root'))
