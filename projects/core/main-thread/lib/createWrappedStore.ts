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

export interface CreateWrappedStoreInit<S> {
  devtoolsInit?: boolean | EnhancerOptions;

  initialState: S;

  syncInitialState?: boolean;

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
