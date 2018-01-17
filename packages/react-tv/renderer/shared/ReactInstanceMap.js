export default {
  remove: function remove(key) {
    key._reactInternalFiber = undefined;
  },
  get: function get(key) {
    return key._reactInternalFiber;
  },
  has: function has(key) {
    return key._reactInternalFiber !== undefined;
  },
  set: function set(key, value) {
    key._reactInternalFiber = value;
  },
};
