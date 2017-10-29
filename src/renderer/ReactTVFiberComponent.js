/**
 * Copyright (c) 2017-present, Raphael Amorim.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ReactTVFiberComponent
 * @flow
 */

import {
  Namespaces,
  getIntrinsicNamespace,
} from'./shared/DOMNamespaces';

import {
  DOCUMENT_NODE,
  DOCUMENT_FRAGMENT_NODE,
} from './shared/HTMLNodeType';

import * as DOMPropertyOperations from './shared/DOMPropertyOperations';
import isCustomComponent from './shared/utils/isCustomComponent';
import escapeTextContentForBrowser from './shared/utils/escapeTextContentForBrowser';

const CHILDREN = 'children';
const STYLE = 'style';
const HTML = '__html';
const {html: HTML_NAMESPACE} = Namespaces;

function setInitialDOMProperties(
  domElement: Element,
  rootContainerElement: Element | Document,
  nextProps: Object,
  isCustomComponentTag: boolean,
): void {
  for (var propKey in nextProps) {
    if (!nextProps.hasOwnProperty(propKey)) {
      continue;
    }
    let nextProp = nextProps[propKey];
    if (propKey === STYLE) {
      // Relies on `updateStylesByID` not mutating `styleUpdates`.
      // CSSPropertyOperations.setValueForStyles(domElement, nextProp);
    } else if (propKey === CHILDREN) {
      if (nextProp && nextProp.join) {
        nextProp = nextProp.join('');
      }

      domElement.textContent = escapeTextContentForBrowser(nextProp);
    } else if (isCustomComponentTag) {
      DOMPropertyOperations.setValueForAttribute(domElement, propKey, nextProp);
    } else if (nextProp != null) {
      domElement.setAttribute(propKey, nextProp);
    }
  }
}

function updateDOMProperties(
  domElement: Element,
  updatePayload: Array<any>,
  wasCustomComponentTag: boolean,
  isCustomComponentTag: boolean,
): void {
  console.log(updatePayload)
  for (var i = 0; i < updatePayload.length; i += 2) {
    var propKey = updatePayload[i];
    var propValue = updatePayload[i + 1];
    if (propKey === STYLE) {
      // CSSPropertyOperations.setValueForStyles(domElement, propValue);
    } else if (propKey === CHILDREN) {
      if (propValue && propValue.join)
        propValue = propValue.join('');

      domElement.textContent = escapeTextContentForBrowser(propValue);
    } else if (isCustomComponentTag) {
      if (propValue != null) {
        DOMPropertyOperations.setValueForAttribute(
          domElement,
          propKey,
          propValue,
        );
      } else {
        domElement.removeAttribute(propKey);
      }
    } else if (propValue != null) {
      domElement.setAttribute(propKey, propValue);
    } else {
      // If we're updating to null or undefined, we should remove the property
      // from the DOM node instead of inadvertently setting to a string. This
      // brings us in line with the same behavior we have on initial render.
      domElement.removeAttribute(propKey);
    }
  }
}

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
    let ownerDocument: Document = getOwnerDocumentFromRootContainer(
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

    return domElement;
  },

  createTextNode(text: string, rootContainerElement: Element | Document): Text {
    return getOwnerDocumentFromRootContainer(
      rootContainerElement,
    ).createTextNode(text);
  },

  updateProperties(
    domElement: Element,
    updatePayload: Array<any>,
    tag: string,
    lastRawProps: Object,
    nextRawProps: Object,
  ): void {
    var wasCustomComponentTag = isCustomComponent(tag, lastRawProps);
    var isCustomComponentTag = isCustomComponent(tag, nextRawProps);
    // Apply the diff.
    updateDOMProperties(
      domElement,
      updatePayload,
      wasCustomComponentTag,
      isCustomComponentTag,
    );
  },

  diffProperties(
    domElement: Element,
    tag: string,
    lastRawProps: Object,
    nextRawProps: Object,
    rootContainerElement: Element | Document,
  ): null | Array<mixed> {
    let updatePayload: null | Array<any> = null;

    let lastProps: Object = lastRawProps;
    let nextProps: Object = nextRawProps;

    var propKey;
    var styleName;
    var styleUpdates = null;
    for (propKey in lastProps) {
      if (
        nextProps.hasOwnProperty(propKey) ||
        !lastProps.hasOwnProperty(propKey) ||
        lastProps[propKey] == null
      ) {
        (updatePayload = updatePayload || []).push(propKey, nextProps[propKey]);
        continue;
      }
      if (propKey === STYLE) {
        var lastStyle = lastProps[propKey];
        for (styleName in lastStyle) {
          if (lastStyle.hasOwnProperty(styleName)) {
            if (!styleUpdates) {
              styleUpdates = {};
            }
            styleUpdates[styleName] = '';
          }
        }
      } else {
        // For all other deleted properties we add it to the queue. We use
        // the whitelist in the commit phase instead.
        (updatePayload = updatePayload || []).push(propKey, null);
      }
    }
    for (propKey in nextProps) {
      var nextProp = nextProps[propKey];
      var lastProp = lastProps != null ? lastProps[propKey] : undefined;
      if (
        !nextProps.hasOwnProperty(propKey) ||
        nextProp === lastProp ||
        (nextProp == null && lastProp == null)
      ) {
        continue;
      }
      if (propKey === STYLE) {
        if (lastProp) {
          // Unset styles on `lastProp` but not on `nextProp`.
          for (styleName in lastProp) {
            if (
              lastProp.hasOwnProperty(styleName) &&
              (!nextProp || !nextProp.hasOwnProperty(styleName))
            ) {
              if (!styleUpdates) {
                styleUpdates = {};
              }
              styleUpdates[styleName] = '';
            }
          }
          // Update styles that changed since `lastProp`.
          for (styleName in nextProp) {
            if (
              nextProp.hasOwnProperty(styleName) &&
              lastProp[styleName] !== nextProp[styleName]
            ) {
              if (!styleUpdates) {
                styleUpdates = {};
              }
              styleUpdates[styleName] = nextProp[styleName];
            }
          }
        } else {
          // Relies on `updateStylesByID` not mutating `styleUpdates`.
          if (!styleUpdates) {
            if (!updatePayload) {
              updatePayload = [];
            }
            updatePayload.push(propKey, styleUpdates);
          }
          styleUpdates = nextProp;
        }
      } else if (propKey === CHILDREN) {
        if (
          lastProp !== nextProp &&
          (typeof nextProp === 'string' || typeof nextProp === 'number')
        ) {
          (updatePayload = updatePayload || []).push(propKey, nextProp);
        }
      } else {
        // For any other property we always add it to the queue and then we
        // filter it out using the whitelist during the commit.
        (updatePayload = updatePayload || []).push(propKey, nextProp);
      }
    }
    if (styleUpdates) {
      (updatePayload = updatePayload || []).push(STYLE, styleUpdates);
    }

    return updatePayload;
  },

  setInitialProperties(
    domElement: Element,
    tag: string,
    rawProps: Object,
    rootContainerElement: Element | Document,
  ): void {
    var isCustomComponentTag = isCustomComponent(tag, rawProps);
    var props: Object = rawProps;

    setInitialDOMProperties(
      domElement,
      rootContainerElement,
      props,
      isCustomComponentTag,
    );
  },
}

export default ReactTVFiberComponent;
