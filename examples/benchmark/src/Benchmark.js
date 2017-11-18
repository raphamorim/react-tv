import React from 'react'
import ReactTV from 'react-tv'
import ReactDOM from 'react-dom'

class Clock extends React.Component {
  render() {
    return (
      <div id='my-container'>
        <h1>20 leagues under the sea</h1>
        <div class='description'>
          <img src={'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Houghton_FC8_V5946_869ve_-_Verne%2C_frontispiece.jpg/800px-Houghton_FC8_V5946_869ve_-_Verne%2C_frontispiece.jpg'}/>
          <p>
            Twenty Thousand Leagues Under the Sea:
            A Tour of the Underwater World
            (French: Vingt mille lieues sous les mers:
              Tour du monde sous-marin</p>
        </div>
      </div>
    )
  }
}

function testReactTV() {
  const reactTVResults = document.querySelector('#react-tv');
  const times = 10000;
  let results = 0;

  for (var i = 0; i <= times; i++) {
    let start = window.performance.now();
    ReactTV.render(<Clock/>, document.createElement(`root-tv-${i}`))
    let end = window.performance.now();
    results += (end - start);
  }

  const finalizeInitialChildren = document.createElement('p');
  finalizeInitialChildren.textContent = results / times;
  reactTVResults.appendChild(finalizeInitialChildren);
}

function testReactDOM() {
  const reactTVResults = document.querySelector('#react-dom');
  const times = 10000;
  let results = 0;

  for (var i = 0; i <= times; i++) {
    let start = window.performance.now();
    ReactDOM.render(<Clock/>, document.createElement(`root-dom-${i}`))
    let end = window.performance.now();
    results += (end - start);
  }

  const finalizeInitialChildren = document.createElement('p');
  finalizeInitialChildren.textContent = results / times;
  reactTVResults.appendChild(finalizeInitialChildren);
}

setTimeout(() => {
  testReactTV();
}, 1000);

setTimeout(() => {
  testReactDOM();
}, 2000);
