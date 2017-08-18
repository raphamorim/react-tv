/***
 * Welcome to the Tiny React Renderer.
 *
 * You should read this guide in the following order:
 *
 * 1. mount.js
 * 2. injection.js
 * 3. component.js
 * 4. Any of the appendices you find interesting and the many React renderer
 *    source files.
 */

/***
 * The ReconcileTransaction class provided here is the simplest scenario
 * possible. The source code here—including all callbacks beyond this point—is
 * the same as the ReactReconcileTransaction.js module in the React 15 source
 * code, but with the DOM event and selection handlers removed.
 *
 * Really interesting edge cases are managed from here, but nothing of
 * interest happens in a Tiny Renderer.
 */

'use strict';

const CallbackQueue = require('react/lib/CallbackQueue');
const PooledClass = require('react/lib/PooledClass');
const Transaction = require('react/lib/Transaction');

/**
 * Provides a `CallbackQueue` queue for collecting `onDOMReady` or analogous
 * callbacks during the performing of the transaction.
 */
const ON_RENDERER_READY_QUEUEING = {
  /**
   * Initializes the internal firmata `connected` queue.
   */
  initialize: function() {
    this.reactMountReady.reset();
  },

  /**
   * After Hardware is connected, invoke all registered `ready` callbacks.
   */
  close: function() {
    this.reactMountReady.notifyAll();
  },
};

/**
 * Executed within the scope of the `Transaction` instance. Consider these as
 * being member methods, but with an implied ordering while being isolated from
 * each other.
 */
const TRANSACTION_WRAPPERS = [ON_RENDERER_READY_QUEUEING];

function TinyRendererReconcileTransaction() {
  this.reinitializeTransaction();
  this.reactMountReady = CallbackQueue.getPooled(null);
}

const Mixin = {
  /**
   * @see Transaction
   * @abstract
   * @final
   * @return {array<object>} List of operation wrap procedures.
   */
  getTransactionWrappers: function() {
    return TRANSACTION_WRAPPERS;
  },

  /**
   * @return {object} The queue to collect `ready` callbacks with.
   */
  getReactMountReady: function() {
    return this.reactMountReady;
  },

  /**
   * `PooledClass` looks for this, and will invoke this before allowing this
   * instance to be reused.
   */
  destructor: function() {
    CallbackQueue.release(this.reactMountReady);
    this.reactMountReady = null;
  },
};

Object.assign(
  TinyRendererReconcileTransaction.prototype,
  Transaction.Mixin,
  TinyRendererReconcileTransaction,
  Mixin
);

PooledClass.addPoolingTo(TinyRendererReconcileTransaction);

module.exports = TinyRendererReconcileTransaction;

