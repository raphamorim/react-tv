/**
 * Copyright (c) 2017-present, Raphael Amorim.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ReactTVFiberComponent
 * @flow
 */

import {Namespaces, getIntrinsicNamespace} from './shared/DOMNamespaces';
import EventConstants from './events/EventConstants';
import {listenTo} from './events/ReactTVEventEmitter';

import {
  DOCUMENT_NODE,
  // DOCUMENT_FRAGMENT_NODE,
  TEXT_NODE,
} from './shared/HTMLNodeType';

import * as DOMPropertyOperations from './shared/DOMPropertyOperations';
import * as CSSPropertyOperations from './shared/CSSPropertyOperations';
import isCustomComponent from './shared/utils/isCustomComponent';
// import escapeTextContentForBrowser from './shared/utils/escapeTextContentForBrowser';

const CHILDREN = 'children';
const STYLE = 'style';
// const HTML = '__html';
const {html: HTML_NAMESPACE} = Namespaces;

function setTextContent(node, text) {
  if (text) {
    const firstChild = node.firstChild;

    if (
      firstChild &&
      firstChild === node.lastChild &&
      firstChild.nodeType === TEXT_NODE
    ) {
      firstChild.nodeValue = text;
      return;
    }
  }
  node.textContent = text;
}

function setInitialDOMProperties(
  tag: string,
  domElement: Element,
  rootContainerElement: Element | Document,
  nextProps: Object,
  isCustomComponentTag: boolean
): void {
  for (let propKey in nextProps) {
    if (!nextProps.hasOwnProperty(propKey)) {
      continue;
    }
    let nextProp = nextProps[propKey];
    if (propKey === STYLE) {
      CSSPropertyOperations.setValueForStyles(domElement, nextProp, () => '');
    } else if (propKey === CHILDREN) {
      // noop
    } else if (EventConstants.hasOwnProperty(propKey)) {
      if (nextProp) {
        ensureListeningTo(domElement, propKey, nextProp);
      }
    } else if (isCustomComponentTag) {
      DOMPropertyOperations.setValueForAttribute(domElement, propKey, nextProp);
    } else if (nextProp != null) {
      if (propKey === 'className') {
        propKey = 'class';
      }

      domElement.setAttribute(propKey, nextProp);
    }
  }
}

function updateDOMProperties(
  domElement: Element,
  updatePayload: Array<any>,
  wasCustomComponentTag: boolean,
  isCustomComponentTag: boolean
): void {
  for (let i = 0; i < updatePayload.length; i += 2) {
    let propKey = updatePayload[i];
    const propValue = updatePayload[i + 1];
    if (propKey === STYLE) {
      CSSPropertyOperations.setValueForStyles(domElement, propValue);
    } else if (propKey === CHILDREN) {
      setTextContent(domElement, propValue);
    } else if (isCustomComponentTag) {
      if (propValue != null) {
        DOMPropertyOperations.setValueForAttribute(
          domElement,
          propKey,
          propValue
        );
      } else {
        domElement.removeAttribute(propKey);
      }
    } else if (propValue != null) {
      if (propKey === 'className') {
        propKey = 'class';
      }

      domElement.setAttribute(propKey, propValue);
    } else {
      // If we're updating to null or undefined, we should remove the property
      // from the DOM node instead of inadvertently setting to a string. This
      // brings us in line with the same behavior we have on initial render.
      domElement.removeAttribute(propKey);
    }
  }
}

function ensureListeningTo(rootContainerElement, eventName, handler) {
  // const isDocumentOrFragment =
  //   rootContainerElement.nodeType === DOCUMENT_NODE ||
  //   rootContainerElement.nodeType === DOCUMENT_FRAGMENT_NODE;
  // const doc = isDocumentOrFragment
  //   ? rootContainerElement
  //   : rootContainerElement.ownerDocument;
  listenTo(eventName, rootContainerElement, handler);
}

function getOwnerDocumentFromRootContainer(
  rootContainerElement: Element | Document
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
    parentNamespace: string
  ): Element {
    // We create tags in the namespace of their parent container, except HTML
    // tags get no namespace.
    let ownerDocument: Document = getOwnerDocumentFromRootContainer(
      rootContainerElement
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
        const div = ownerDocument.createElement('div');
        div.innerHTML = '<script><' + '/script>'; // eslint-disable-line
        // This is guaranteed to yield a script element.
        const firstChild = ((div.firstChild: any): HTMLScriptElement);
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
      rootContainerElement
    ).createTextNode(text);
  },

  updateProperties(
    domElement: Element,
    updatePayload: Array<any>,
    tag: string,
    lastRawProps: Object,
    nextRawProps: Object
  ): void {
    const wasCustomComponentTag = isCustomComponent(tag, lastRawProps);
    const isCustomComponentTag = isCustomComponent(tag, nextRawProps);
    updateDOMProperties(
      domElement,
      updatePayload,
      wasCustomComponentTag,
      isCustomComponentTag
    );
  },

  diffProperties(
    domElement: Element,
    tag: string,
    lastRawProps: Object,
    nextRawProps: Object,
    rootContainerElement: Element | Document
  ): null | Array<mixed> {
    let updatePayload: null | Array<any> = null;

    const lastProps = lastRawProps;
    const nextProps = nextRawProps;

    let propKey;
    let styleName;
    let styleUpdates = null;
    for (propKey in lastProps) {
      if (
        nextProps.hasOwnProperty(propKey) ||
        !lastProps.hasOwnProperty(propKey) ||
        lastProps[propKey] == null
      ) {
        continue;
      }
      if (propKey === STYLE) {
        const lastStyle = lastProps[propKey];
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
      const nextProp = nextProps[propKey];
      const lastProp = lastProps != null ? lastProps[propKey] : undefined;
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
    rootContainerElement: Element | Document
  ): void {
    const isCustomComponentTag = isCustomComponent(tag, rawProps);
    const props: Object = rawProps;

    setInitialDOMProperties(
      tag,
      domElement,
      rootContainerElement,
      props,
      isCustomComponentTag
    );
  },
};

export default ReactTVFiberComponent;
