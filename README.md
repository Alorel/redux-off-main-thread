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
- [Usage](#usage)
  - [Basic usage](#basic-usage)
  - [Sending default state from the main thread](#sending-default-state-from-the-main-thread)
  - [Adding Redux devtools support](#adding-redux-devtools-support)

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
2. Initialise a Worker wrapper on the main thread - this has the same API as a regular store, but with a few notable differences:
   - It does not have any reducers, `replaceReducer` throws an error
   - It does not have `[Symbo.observable]`
   - Actions do not synchronously update the state anymore, therefore the `subscribe()` function may not behave as expected
3. Use the store as usual.

# Usage

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

import {onReduxWorkerThreadReady} from '@alorel/redux-off-main-thread/worker';
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

import {onReduxWorkerThreadInitialStateReceived} from '@alorel/redux-off-main-thread/worker';
import {applyMiddleware, createStore} from 'redux';

/*
 * Optional, but lets you know when the main thread's finished adding event listeners - should be instant unless
 * you've created some weird setup for testing and the like
 */
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
  initialState: {some: {default: 'state'}},
  syncInitialState: true,
  worker
});
```
