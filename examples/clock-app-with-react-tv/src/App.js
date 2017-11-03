import React from 'react'
import ReactTV, { Platform } from 'react-tv'

class Clock extends React.Component {
  constructor() {
    super()
    this.state = { date: new Date() }
  }

  render() {
    let currentPlatform = 'Browser'
    if (Platform('webos'))
      currentPlatform = 'LG WebOS'

    return (
      <div class='container'>
        <img src='https://i.imgur.com/9yhDR0Q.png'/>
        <h1>It's {this.state.date.toLocaleTimeString()}</h1>
        <p>You're in {currentPlatform}</p>
      </div>
    )
  }
}

ReactTV.render(<Clock/>, document.getElementById('root'))
