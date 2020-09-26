import {Action} from 'redux';
import {isInitialStateEvent} from '../../common/InitialStateEvent';
import {createInitialStateRequestEvent} from '../../common/InitialStateRequestEvent';
import {ReduxOMTEvent} from '../../common/ReduxOMTEvent';
import {timeoutListener} from '../../common/timeoutListener';
import {createWrappedStore, CreateWrappedStoreInit} from './createWrappedStore';
import {WrappedStore} from './wrapped-store/WrappedStore';

/** Same as a regular {@link CreateWrappedStoreInit}, but with initialState & syncInitialState omitted */
export type ResolveWrappedStoreInit<S> = Omit<CreateWrappedStoreInit<S>, 'initialState' | 'syncInitialState'>;

/**
 * Similar to {@link createWrappedStore}, but the store on the worker is used to provide the initial state via
 * {@link provideReduxOMTInitialState}.
 * @return A promise that resolves with a {@link WrappedStore} when the worker store is initialised.
 */
export function resolveWrappedStore<S, A extends Action>(
  init: ResolveWrappedStoreInit<S>
): Promise<WrappedStore<S, A>> {
  const listener$: Promise<S> = timeoutListener(
    ReduxOMTEvent.INITIAL_STATE,
    isInitialStateEvent,
    msg => msg.state,
    init.worker
  );
  init.worker.postMessage(createInitialStateRequestEvent());

  return listener$
    .then(initialState => createWrappedStore<S, A>({
      ...init,
      initialState,
      syncInitialState: false
    }));
}
