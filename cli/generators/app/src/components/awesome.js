// @flow
import React from 'react';

import './styles/awesome.css';

const Awesome = ({onClick}: {onClick?: Function}): React.Element<any> => (
  <a onClick={onClick} className="awesome">
    Click on this Awesome Component
  </a>
);

export default Awesome;
