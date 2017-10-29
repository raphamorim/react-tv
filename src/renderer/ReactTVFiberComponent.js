/**
 * Copyright (c) 2017-present, Raphael Amorim.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ReactTVFiberComponent
 * @flow
 */

'use strict';

const {
  Namespaces: {html: HTML_NAMESPACE},
  getIntrinsicNamespace,
} = require('./shared/DOMNamespaces');

const {
  DOCUMENT_NODE,
  DOCUMENT_FRAGMENT_NODE,
} = require('./shared/HTMLNodeType');

function getOwnerDocumentFromRootContainer(
  rootContainerElement: Element | Document,
): Document {
  return rootContainerElement.nodeType === DOCUMENT_NODE
    ? (rootContainerElement: any)
    : rootContainerElement.ownerDocument;
}

const ReactTVFiberComponent = {
  createElement(
    type: *,
    props: Object,
    rootContainerElement: Element | Document,
    parentNamespace: string,
  ): Element {
    // We create tags in the namespace of their parent container, except HTML
    // tags get no namespace.
    const ownerDocument: Document = getOwnerDocumentFromRootContainer(
      rootContainerElement,
    );
    let domElement: Element;
    let namespaceURI = parentNamespace;
    if (namespaceURI === HTML_NAMESPACE) {
      namespaceURI = getIntrinsicNamespace(type);
    }
    if (namespaceURI === HTML_NAMESPACE) {
      if (type === 'script') {
        // Create the script via .innerHTML so its "parser-inserted" flag is
        // set to true and it does not execute
        var div = ownerDocument.createElement('div');
        div.innerHTML = '<script><' + '/script>'; // eslint-disable-line
        // This is guaranteed to yield a script element.
        var firstChild = ((div.firstChild: any): HTMLScriptElement);
        domElement = div.removeChild(firstChild);
      } else if (typeof props.is === 'string') {
        // $FlowIssue `createElement` should be updated for Web Components
        domElement = ownerDocument.createElement(type, {is: props.is});
      } else {
        // Separate else branch instead of using `props.is || undefined` above because of a Firefox bug.
        // See discussion in https://github.com/facebook/react/pull/6896
        // and discussion in https://bugzilla.mozilla.org/show_bug.cgi?id=1276240
        domElement = ownerDocument.createElement(type);
      }
    } else {
      domElement = ownerDocument.createElementNS(namespaceURI, type);
    }

    console.log(domElement)
    return domElement;
  },

  // createTextNode(text: string, rootContainerElement: Element | Document): Text {
  //   return getOwnerDocumentFromRootContainer(
  //     rootContainerElement,
  //   ).createTextNode(text);
  // },

  // setInitialProperties(
  //   domElement: Element,
  //   tag: string,
  //   rawProps: Object,
  //   rootContainerElement: Element | Document,
  // ): void {
  //   var isCustomComponentTag = isCustomComponent(tag, rawProps);
  //   if (__DEV__) {
  //     validatePropertiesInDevelopment(tag, rawProps);
  //     if (isCustomComponentTag && !didWarnShadyDOM && domElement.shadyRoot) {
  //       warning(
  //         false,
  //         '%s is using shady DOM. Using shady DOM with React can ' +
  //           'cause things to break subtly.',
  //         getCurrentFiberOwnerName() || 'A component',
  //       );
  //       didWarnShadyDOM = true;
  //     }
  // },
}

module.exports = ReactTVFiberComponent;
