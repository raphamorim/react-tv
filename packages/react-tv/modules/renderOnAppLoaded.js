/**
 * Copyright (c) 2017-present, Célio Latorraca.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import React from 'react';

import Plaform from './Platform';

export default Component =>
  class extends React.Component {
    constructor() {
      super();
      this.state = {loaded: false};
    }

    componentDidMount() {
      if (Plaform('webos')) {
        this.bindWebOSLaunchEvent();
      } else {
        this.setState({loaded: true});
      }
    }

    bindWebOSLaunchEvent() {
      document.addEventListener(
        'webOSLaunch',
        () => {
          this.setState({loaded: true});
        },
        true
      );
    }

    render() {
      const {loaded} = this.state;
      let component = null;

      if (loaded) {
        component = <Component {...this.props} />;
      }
      return component;
    }
  };
