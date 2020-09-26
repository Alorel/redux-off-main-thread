# redux-off-main-thread

A set of utilities for running Redux in a web worker.

[![CI](https://github.com/Alorel/redux-off-main-thread/workflows/Core/badge.svg?branch=master)](https://github.com/Alorel/redux-off-main-thread/actions?query=workflow%3ACore+branch%3Amaster+)
[![Coverage Status](https://coveralls.io/repos/github/Alorel/redux-off-main-thread/badge.svg?branch=master)](https://coveralls.io/github/Alorel/redux-off-main-thread)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/Alorel/redux-off-main-thread.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/Alorel/redux-off-main-thread/context:javascript)

-----

# Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Installation](#installation)
- [Overview](#overview)
- [Usage & Examples](#usage--examples)
  - [Basic usage](#basic-usage)
  - [Sending default state from the main thread](#sending-default-state-from-the-main-thread)
  - [Adding Redux devtools support](#adding-redux-devtools-support)
  - [Letting the worker provide the initial state](#letting-the-worker-provide-the-initial-state)
- [API](#api)
  - [Worker](#worker)
  - [Main thread](#main-thread)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Installation

Add the registry to `.npmrc`:

```bash
@alorel:registry=https://npm.pkg.github.com
```

Then install the library and its `fast-json-patch` dependency:

```bash
npm install fast-json-patch @alorel/redux-off-main-thread
```

Typescript users should additionally install the following packages for the typings:

```bash
npm install redux redux-devtools-extension
```

# Overview

The main thread should be used by the UI, not state management. This set of utilities aids in running Redux in
a web worker so your main thread doesn't slow down the UI! The general process is as follows:

1. Initialise your store with all its reducers on a web worker, apply the off main thread middleware.
1. Initialise a Worker wrapper on the main thread - this has the same API as a regular store, but with a few notable differences:
   - It does not have any reducers, `replaceReducer` throws an error
   - It does not have `[Symbol.observable]`
   - Actions do not synchronously update the state anymore, therefore the `subscribe()` function may not behave as expected
1. Use the store as usual: dispatch an action.
1. The action is serialised and sent to the web worker.
1. The worker passes it on to the real redux store - reducers are triggered at this point.
1. A diff of the state change is produced - this is where the `fast-json-patch` dependency comes in - and sent to the main thread along with the action that triggered it.
   - It would be much simpler to just overwrite the entire state object, but that would kill all the old object references and could potentially have a terrible effect on app performance as well as introducing bugs
1. The main thread's store wrapper clones only the paths that changed and applies the diff to the new state object.
1. A change is emitted.

# Usage & Examples

## Basic usage

```javascript
// common.js

export const STORE_DEFAULT_STATE = {
  foo: 'bar'
};
```

```javascript
// index.js

import {createWrappedStore} from '@alorel/redux-off-main-thread/main-thread';
import {STORE_DEFAULT_STATE} from './common';

const worker = new Worker('/worker.js');
const store = createWrappedStore({
  // Your store's initial state
  initialState: STORE_DEFAULT_STATE,
  worker
});
store.dispatch({type: 'some-action'});
```

```javascript
// worker.js

import {onReduxWorkerThreadReady, createReduxOMTMiddleware} from '@alorel/redux-off-main-thread/worker';
import {applyMiddleware, createStore} from 'redux';
import {STORE_DEFAULT_STATE} from './common';

/*
 * Optional, but lets you know when the main thread's finished adding event listeners - should be instant unless
 * you've created some weird setup for testing and the like
 */
onReduxWorkerThreadReady()
  .then(() => {
     // The redux-off-main-thread middleware should always be last
     const store = createStore(someReducerFunction, STORE_DEFAULT_STATE, applyMiddleware(createReduxOMTMiddleware()));
     // use the store as you please - it's now hooked up.
  });
```

## Sending default state from the main thread

Simply set `syncInitialState` to `true` when creating the wrapped store.

```javascript
// index.js

import {createWrappedStore} from '@alorel/redux-off-main-thread/main-thread';

const worker = new Worker('/worker.js');
const store = createWrappedStore({
  initialState: {some: {default: 'state'}},
  syncInitialState: true,
  worker
});
```

```javascript
// worker.js

import {onReduxWorkerThreadInitialStateReceived, createReduxOMTMiddleware} from '@alorel/redux-off-main-thread/worker';
import {applyMiddleware, createStore} from 'redux';

onReduxWorkerThreadInitialStateReceived()
  .then(initialState => {
     // The redux-off-main-thread middleware should always be last
     const store = createStore(someReducerFunction, initialState, applyMiddleware(createReduxOMTMiddleware()));
     // use the store as you please - it's now hooked up.
  });
```

## Adding Redux devtools support

Devtools are inaccessible by the worker thread so they can't be used normally. Additionally, actions don't synchronously
update the state anymore, making devtools somewhat useless. Simply pass a `devtoolsInit` option with either the enhancer
config object or `true`, which will default to `{}`.

```javascript
// index.js

import {createWrappedStore} from '@alorel/redux-off-main-thread/main-thread';

const worker = new Worker('/worker.js');
const store = createWrappedStore({
  devtoolsInit: true, // or pass an options object - see API
  initialState: {some: {default: 'state'}},
  worker
});
```

## Letting the worker provide the initial state

```javascript
// index.js

import {resolveWrappedStore} from '@alorel/redux-off-main-thread/main-thread';

const worker = new Worker('/worker.js');

// Same options as createWrappedStore, but initialState & syncInitialState are not allowed
resolveWrappedStore({worker})
  .then(store => {
    store.dispatch({type: 'foo'});
  })
```

```javascript
// worker.js

import {provideReduxOMTInitialState} from '@alorel/redux-off-main-thread/worker';

provideReduxOMTInitialState({someInitialState: 'foo'})
  .then(() => {
    // main thread promise resolved
  });
```

# API

Typescript definitions are provided for clarity

## Worker

```typescript
import {Middleware} from 'redux';


/** Create a redux-off-main-thread middleware instance. This should be run on the worker thread. */
export declare function createReduxOMTMiddleware(): Middleware;


/**
 * Resolves with the initial state when the worker receives an initial state message.
 * Rejects when called outside a worker thread.
 */
export declare function onReduxWorkerThreadInitialStateReceived(): Promise<any>;


/**
 * Resolves when the worker receives a ready event, indicating that the main thread has finished setting up
 * event listeners. Should be instant unless you've created some weird environment e.g. during CI.
 * Rejects when called outside a worker thread.
 */
export declare function onReduxWorkerThreadReady(): Promise<void>;


/**
 * Used to provide the initial state to a main thread worker initialised via {@link resolveWrappedStore}. This function
 * should be called immediately on the worker entrypoint.
 * @return A void promise that resolves once the initial state request has been fulfilled.
 */
export declare function provideReduxOMTInitialState<S = any>(state: S): Promise<void>;
```

## Main thread

```typescript
import type {Action, AnyAction, Store} from 'redux';
import type {EnhancerOptions} from 'redux-devtools-extension';


export declare type WorkerPartial = Pick<Worker, 'addEventListener' | 'postMessage' | 'removeEventListener'>;


/** A Redux store wrapped to run off the main thread */
export type WrappedStore<S, A extends Action = AnyAction> = Store<S, A> & {
  
  /**
   * Actions no longer mutate the state synchronously, therefore the store no longer behaves exactly as a regular
   * Redux store:
   * <code>
   *   const oldState = store.getState();
   *   store.dispatch({type: 'some-valid-action-that-should-mutate-the-state''});
   *   // True on an off-main-thread store, false on a regular store
   *   console.log(oldState === store.getState());
   * </code>
   * This method can be used to react to when the store off the main thread
   */
  onChange(listener: (action: A, newState: S, oldState: S) => void): () => void;
}


/** {@link createWrappedStore} initialisation config */
export interface CreateWrappedStoreInit<S> {
    /**
     * Options for enabling devtools support. Can be either an {@link EnhancerOptions} object or true,
     * which is equivalent to passing {}
     * @default false
     */
    devtoolsInit?: boolean | EnhancerOptions;
    /** Initial store state */
    initialState: S;
    /**
     * Having this as false requires the main thread and worker thread to set the same initial state from an object
     * somewhere in your codebase (and bundled by your build system) and is suitable for the
     * {@link https://github.com/Alorel/redux-off-main-thread/tree/master#basic-usage Basic usage} use case. You may
     * instead opt to only set this to true and send the initial state as a message to the worker; this is outlined in the
     * {@link https://github.com/Alorel/redux-off-main-thread/tree/master#sending-default-state-from-the-main-thread Sending default state from the main thread}
     * example.
     * @default false
     */
    syncInitialState?: boolean;
    /** The worker instance Redux is running on */
    worker: WorkerPartial;
}


/**
 * Create a wrapped store with the same API as a regular Redux store bar several differences:
 * <ul>
 *   <li>It does not have any reducers, replaceReducer throws an error</li>
 *   <li>It does not have a Symbol.observable</li>
 *   <li>Actions do not synchronously update the state anymore, therefore the subscribe() function may not behave as expected</li>
 *   <li>It has an extra onChange() method</li>
 * </ul>
 * @param init
 */
export declare function createWrappedStore<S, A extends Action = AnyAction>(init: CreateWrappedStoreInit<S>): WrappedStore<S, A>;


/** Same as a regular {@link CreateWrappedStoreInit}, but with initialState & syncInitialState omitted */
export declare type ResolveWrappedStoreInit<S> = Omit<CreateWrappedStoreInit<S>, 'initialState' | 'syncInitialState'>;


/**
 * Similar to {@link createWrappedStore}, but the store on the worker is used to provide the initial state via
 * {@link provideReduxOMTInitialState}.
 * @return A promise that resolves with a {@link WrappedStore} when the worker store is initialised.
 */
export declare function resolveWrappedStore<S, A extends Action>(init: ResolveWrappedStoreInit<S>): Promise<WrappedStore<S, A>>;
```
