import React from 'react';
import {render, findDOMNode} from '../../ReactTVEntry';

describe('findDOMNode', () => {
  it('should return valid DOM Element', () => {
    const root = document.createElement('div');
    const expectedNode = document.createElement('p');
    expectedNode.textContent = 'Sure!';

    class Sure extends React.Component {
      componentDidMount() {
        expect(findDOMNode(this.input)).toEqual(expectedNode);
      }

      render() {
        return <p ref={node => (this.input = node)}>Sure!</p>;
      }
    }

    render(<Sure />, root);
  });
});
