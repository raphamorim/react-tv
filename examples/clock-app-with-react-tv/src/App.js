import React from 'react'
import ReactTV, { Platform } from 'react-tv'

class Clock extends React.Component {
  constructor() {
    super()
    this.state = { date: new Date() }
  }

  render() {
    if (!Platform('webos')) {
      return (
        <div className="webos">
          <img src="https://i.imgur.com/9yhDR0Q.png"/>
          <h1>It is {this.state.date.toLocaleTimeString()}</h1>
          <p>by React-TV</p>
        </div>
      )
    }

    return <h2>This App is available only at LG WebOS</h2>
  }
}

ReactTV.render(<Clock/>, document.getElementById('root'))
