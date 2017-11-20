import React from 'react';
import ReactTV from 'react-tv';

class ReactTVApp extends React.Component {
  render() {
    return <div>{{REACTTVAPP}}</div>;
  }
}

ReactTV.render(<ReactTVApp />, document.querySelector('#root'));
