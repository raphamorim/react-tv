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
            Twenty Thousand Leagues Under the Sea: A Tour of the Underwater World (French: Vingt mille lieues sous les mers: Tour du monde sous-marin, "Twenty Thousand Leagues Under the Seas: A Tour of the Underwater World") is a classic science fiction novel by French writer Jules Verne published in 1870.
            The novel was originally serialized from March 1869 through June 1870 in Pierre-Jules Hetzel's periodical, the Magasin d'Éducation et de Récréation. The deluxe illustrated edition, published by Hetzel in November 1871, included 111 illustrations by Alphonse de Neuville and Édouard Riou. The book was highly acclaimed when released and still is now; it is regarded as one of the premiere adventure novels and one of Verne's greatest works, along with Around the World in Eighty Days and Journey to the Center of the Earth. The description of Nemo's ship, called the Nautilus, was considered ahead of its time, as it accurately describes features on submarines, which at the time were very primitive vessels.
          </p>
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
    ReactTV.render(<Clock/>, document.getElementById('root'))
    let end = window.performance.now();
    results += end - start;
  }

  var finalizeInitialChildren = document.createElement('p');
  finalizeInitialChildren.textContent = results / times;
  reactTVResults.appendChild(finalizeInitialChildren);
}


function testReactDOM() {
  const reactDOMResults = document.querySelector('#react-dom');
  const times = 10000;

  let results = 0;
  for (var i = 0; i <= times; i++) {
    let start = window.performance.now();
    ReactDOM.render(<Clock/>, document.createElement('root'));
    let end = window.performance.now();
    results += end - start;
  }

  var finalizeInitialChildren = document.createElement('p');
  finalizeInitialChildren.textContent = results / times;
  reactDOMResults.appendChild(finalizeInitialChildren);
}

testReactTV();
testReactDOM();
