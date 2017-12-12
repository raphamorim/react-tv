import React from 'react'
import ReactTV, { Platform, renderOnAppLoaded } from 'react-tv'

class Clock extends React.Component {
  constructor() {
    super()
    this.state = { date: new Date() }
  }

  componentDidMount() {
    setInterval(() => this.setState({date: new Date()}), 1000)
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

const App = renderOnAppLoaded(Clock)

ReactTV.render(<App/>, document.getElementById('root'))
