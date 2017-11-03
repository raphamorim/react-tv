import React from 'react'
import ReactTV, { Platform } from 'react-tv'

class Clock extends React.Component {
  constructor() {
    super()
    this.state = { date: new Date() }
  }

  render() {
    if (Platform('webos')) {
      return (
        <h1>It is {this.state.date.toLocaleTimeString()}</h1>
      )
    }

    return <h2>This App is available only at LG WebOS</h2>
  }
}

ReactTV.render(<Clock/>, document.getElementById('root'))
