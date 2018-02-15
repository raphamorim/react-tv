import React from 'react';
import ReactTV from 'react-tv';
import { withNavigation, withFocusable } from 'react-tv-navigation';

const Poster = ({focused, setFocus, focusPath, src}) => {
  focused = (focused) ? 'focused' : 'unfocused'
  return (
    <div className='poster' onClick={() => { setFocus() }} >
      <img src={src}/>
    </div>
  )
}

const FocusablePoster = withFocusable(Poster)

class App extends React.Component {
  render() {
    return (
      <div>
        <div className='title'>React-TV Template</div>
        <div className='focus-info'>You're focused on: {this.props.currentFocusPath}</div>
        <div className='posters'>
          <FocusablePoster focusPath='focusable-poster-1' src={'https://upload.wikimedia.org/wikipedia/en/1/15/Dunkirk_Film_poster.jpg'}/>
          <FocusablePoster focusPath='focusable-poster-2' src={'https://upload.wikimedia.org/wikipedia/en/8/8a/Dark_Knight.jpg'}/>
          <FocusablePoster focusPath='focusable-poster-3' src={'https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg'}/>
        </div>
      </div>
    );
  }
}

const AppWithNavigation = withNavigation(App)

ReactTV.render(<AppWithNavigation/>, document.querySelector('#root'));
