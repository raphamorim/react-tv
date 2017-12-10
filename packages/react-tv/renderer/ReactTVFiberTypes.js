/**
 * Copyright (c) 2017-present, Raphael Amorim.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ReactTVFiberTypes
 * @flow
 */

export type Props = {
  children: null | Instance | Array<Instance>,
  toJSON?: Function,
};
export type Container = {};
export type Instance = {
  type: string | Function,
  props: Props,
};
export type TextInstance = null;
export type OpaqueHandle = Object;
export type HostContext = Object;
