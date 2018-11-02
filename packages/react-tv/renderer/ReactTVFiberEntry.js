/**
 * Copyright (c) 2017-present, Raphael Amorim.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ReactTVFiberEntry
 * @flow
 */

// import type {HostConfig, Reconciler} from 'react-fiber-types';
// import type {ReactNodeList} from 'react-fiber-types/ReactTypes';
import type {
  Props,
  Container,
  Instance,
  TextInstance,
  HostContext,
} from './ReactTVFiberTypes';

import ReactTVFiberComponent from './ReactTVFiberComponent';
import ReactFiberReconciler from 'react-reconciler';
import {getChildNamespace} from './shared/DOMNamespaces';

import * as ReactDOMComponentTree from './ReactTVComponentTree';

import {
  ELEMENT_NODE,
  // TEXT_NODE,
  DOCUMENT_NODE,
  DOCUMENT_FRAGMENT_NODE,
  COMMENT_NODE,
} from './shared/HTMLNodeType';

const {
  createElement,
  createTextNode,
  setInitialProperties,
  diffProperties,
  updateProperties,
} = ReactTVFiberComponent;

const {precacheFiberNode, updateFiberProps} = ReactDOMComponentTree;

const ReactTVFiberRenderer = ReactFiberReconciler({
  createInstance(
    type: string,
    props: Props,
    rootContainerInstance: Container,
    hostContext: HostContext,
    internalInstanceHandle: Object
  ): Object {
    let parentNamespace: string;
    parentNamespace = hostContext;

    const domElement: Instance = createElement(
      type,
      props,
      rootContainerInstance,
      parentNamespace
    );

    precacheFiberNode(internalInstanceHandle, domElement);
    updateFiberProps(domElement, props);
    return domElement;
  },

  appendInitialChild(
    parentInstance: Instance,
    child: Instance | TextInstance
  ): void {
    parentInstance.appendChild(child);
  },

  finalizeInitialChildren(
    domElement: Instance,
    type: string,
    props: Props,
    rootContainerInstance: Container
  ): boolean {
    setInitialProperties(domElement, type, props, rootContainerInstance);
  },

  prepareUpdate(
    domElement: Instance,
    type: string,
    oldProps: Props,
    newProps: Props,
    rootContainerInstance: Container,
    hostContext: HostContext
  ): null | Array<mixed> {
    return diffProperties(
      domElement,
      type,
      oldProps,
      newProps,
      rootContainerInstance
    );
  },

  getRootHostContext(rootContainerInstance: Container): HostContext {
    let type;
    let namespace;
    const nodeType = rootContainerInstance.nodeType;
    switch (nodeType) {
      case DOCUMENT_NODE:
      case DOCUMENT_FRAGMENT_NODE: {
        type = nodeType === DOCUMENT_NODE ? '#document' : '#fragment';
        let root = (rootContainerInstance: any).documentElement;
        namespace = root ? root.namespaceURI : getChildNamespace(null, '');
        break;
      }
      default: {
        const container: any =
          nodeType === COMMENT_NODE
            ? rootContainerInstance.parentNode
            : rootContainerInstance;
        const ownNamespace = container.namespaceURI || null;
        type = container.tagName;
        namespace = getChildNamespace(ownNamespace, type);
        break;
      }
    }
    return namespace;
  },

  getChildHostContext(
    parentHostContext: HostContext,
    type: string
  ): HostContext {
    return getChildNamespace(parentHostContext, type);
  },

  getPublicInstance(instance: Instance | TextInstance) {
    return instance;
  },

  prepareForCommit(): void {
    // noop
  },

  mutation: {
    insertBefore(
      parentInstance: Instance,
      child: Instance | TextInstance,
      beforeChild: Instance | TextInstance
    ): void {
      parentInstance.insertBefore(child, beforeChild);
    },

    insertInContainerBefore(
      container: Container,
      child: Instance | TextInstance,
      beforeChild: Instance | TextInstance
    ): void {
      if (container.nodeType === COMMENT_NODE) {
        (container.parentNode: any).insertBefore(child, beforeChild);
      } else {
        container.insertBefore(child, beforeChild);
      }
    },

    appendChild(
      parentInstance: Instance | Container,
      child: Instance | TextInstance
    ): void {
      parentInstance.appendChild(child);
    },

    appendChildToContainer(
      container: Container,
      child: Instance | TextInstance
    ): void {
      if (container.nodeType === COMMENT_NODE) {
        (container.parentNode: any).insertBefore(child, container);
      } else {
        container.appendChild(child);
      }
    },

    removeChild(
      parentInstance: Instance | Container,
      child: Instance | TextInstance
    ): void {
      parentInstance.removeChild(child);
    },

    removeChildFromContainer(
      container: Container,
      child: Instance | TextInstance
    ): void {
      if (container.nodeType === COMMENT_NODE) {
        (container.parentNode: any).removeChild(child);
      } else {
        container.removeChild(child);
      }
    },

    commitTextUpdate(
      textInstance: TextInstance,
      oldText: string,
      newText: string
    ): void {
      textInstance.nodeValue = newText;
    },

    commitUpdate(
      domElement: Instance,
      updatePayload: Array<mixed>,
      type: string,
      oldProps: Props,
      newProps: Props,
      internalInstanceHandle: Object
    ): void {
      updateFiberProps(domElement, newProps);
      updateProperties(domElement, updatePayload, type, oldProps, newProps);
    },

    commitMount(
      domElement: Instance,
      type: string,
      newProps: Props,
      internalInstanceHandle: Object
    ) {},
  },

  shouldSetTextContent(props: Props): boolean {
    return (
      typeof props.children === 'string' || typeof props.children === 'number'
    );
  },

  resetTextContent(domElement: Instance): void {
    domElement.textContent = '';
  },

  resetAfterCommit(): void {},

  createTextInstance(
    text: string,
    rootContainerInstance: Container,
    hostContext: HostContext,
    internalInstanceHandle: Object
  ): TextInstance {
    let textNode: TextInstance = createTextNode(text, rootContainerInstance);
    precacheFiberNode(internalInstanceHandle, textNode);
    return textNode;
  },

  scheduleAnimationCallback() {},

  scheduleDeferredCallback() {},

  useSyncScheduling: true,

  now: () => {},
});

const defaultContainer = {};
const roots = new Map();

const ReactTVRenderer = {
  render(element: React$Element<any>, container: any, callback: ?Function) {
    const containerKey =
      typeof container === 'undefined' ? defaultContainer : container;
    let root = roots.get(containerKey);
    if (!root) {
      root = ReactTVFiberRenderer.createContainer(containerKey);
      roots.set(container, root);
    }

    ReactTVFiberRenderer.updateContainer((element: any), root, null, callback);

    ReactTVFiberRenderer.injectIntoDevTools({
      bundleType: process.env.NODE_ENV === 'production' ? 0 : 1,
      version: '0.4.4',
      rendererPackageName: 'ReactTV',
      findHostInstanceByFiber: ReactTVFiberRenderer.findHostInstance,
    });

    return ReactTVFiberRenderer.getPublicRootInstance(root);
  },
  findDOMNode(componentOrElement: React$Element<any>) {
    if (componentOrElement == null) {
      return null;
    }
    if ((componentOrElement: any).nodeType === ELEMENT_NODE) {
      return (componentOrElement: any);
    }

    return ReactTVFiberRenderer.findHostInstance(componentOrElement);
  },
  unmountComponentAtNode(container: any) {
    const containerKey =
      typeof container === 'undefined' ? defaultContainer : container;
    const root = roots.get(containerKey);
    if (root) {
      ReactTVFiberRenderer.updateContainer(null, root, null, () => {
        roots.delete(container);
      });
    }
  },
};

export default ReactTVRenderer;
