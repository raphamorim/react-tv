/* @flow */

export type Props = {
  children : null | Instance | Array<Instance>,
  toJSON ?: Function
};
export type Container = {};
export type Instance = {
  type: string | Function,
  props: Props,
};
export type TextInstance = null;
export type OpaqueHandle = Object;
export type HostContext = Object;

