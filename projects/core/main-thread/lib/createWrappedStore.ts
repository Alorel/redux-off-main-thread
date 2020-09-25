import {applyPatch} from 'fast-json-patch';
import {Action, AnyAction} from 'redux';
import {EnhancerOptions} from 'redux-devtools-extension';
import {
  isActionProcessedEvent,
  isMutatingActionProcessedEvent,
  MutatingActionProcessedEvent
} from '../../common/ActionProcessedEvent';
import {createInitialStateEvent} from '../../common/InitialStateEvent';
import {createReduxOMTReadyEvent} from '../../common/ReadyEvent';
import {clonePath} from './clonePath';
import {DevtoolsExtensionFactory} from './DevtoolsExtension';
import {createSubscribers} from './wrapped-store/createSubscribers';
import {createDispatch} from './wrapped-store/dispatch';
import {replaceReducer} from './wrapped-store/replaceReducer';
import {WorkerPartial} from './wrapped-store/WorkerPartial';
import {WrappedStore} from './wrapped-store/WrappedStore';

/** @internal */
declare const __REDUX_DEVTOOLS_EXTENSION__: DevtoolsExtensionFactory;

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

function create<S, A extends Action>(
  {worker, initialState, syncInitialState, devtoolsInit}: CreateWrappedStoreInit<S>
): WrappedStore<S, A> {
  let currentState: S = initialState;
  const [onChange, notifyChangeSubscribers] = createSubscribers<S, A>();

  syncInitialState && worker.postMessage(createInitialStateEvent(currentState));

  function processMutationEvent({action, changedPaths, diff}: MutatingActionProcessedEvent<A>): void {
    let newState = {...currentState};
    for (let i = 0; i < changedPaths.length; i++) {
      newState = clonePath(newState, changedPaths[i]);
    }

    applyPatch(newState, diff, false, true);
    const oldState = currentState;
    currentState = newState;
    notifyChangeSubscribers(action, newState, oldState);
  }

  if (devtoolsInit && typeof __REDUX_DEVTOOLS_EXTENSION__ !== 'undefined') {
    const devtools = __REDUX_DEVTOOLS_EXTENSION__.connect<S, A>(devtoolsInit === true ? {} : devtoolsInit);
    devtools.init(currentState);

    worker.addEventListener('message', ({data}) => {
      if (!isActionProcessedEvent<A>(data)) {
        return;
      }
      if (isMutatingActionProcessedEvent<A>(data, true)) {
        processMutationEvent(data);
      }
      devtools.send(data.action, currentState);
    });
  } else {
    worker.addEventListener('message', ({data}) => {
      if (isMutatingActionProcessedEvent<A>(data)) {
        processMutationEvent(data);
      }
    });
  }

  worker.postMessage(createReduxOMTReadyEvent());

  return {
    dispatch: createDispatch<A>(worker),
    getState: (): S => currentState,
    onChange,
    replaceReducer,
    subscribe(listener): () => void {
      return onChange(() => {
        listener();
      });
    }
  } as Omit<WrappedStore<S, A>, (typeof Symbol)['observable']> as WrappedStore<S, A>;
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
export function createWrappedStore<S, A extends Action = AnyAction>(
  init: CreateWrappedStoreInit<S>
): WrappedStore<S, A> {
  if (!init) {
    throw new Error('Wrapped store init missing');
  } else if (!init.initialState) {
    throw new Error('InitialState missing');
  } else if (!init.worker) {
    throw new Error('Worker missing');
  }

  return create(init);
}
