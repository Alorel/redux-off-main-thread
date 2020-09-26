/** @internal */
import '../../common/declarations';
import {createInitialStateEvent} from '../../common/InitialStateEvent';
import {isInitialStateRequestEvent} from '../../common/InitialStateRequestEvent';
import {ReduxOMTEvent} from '../../common/ReduxOMTEvent';
import {timeoutListener} from '../../common/timeoutListener';
import {IS_ON_WORKER} from './support';

/**
 * Used to provide the initial state to a main thread worker initialised via {@link resolveWrappedStore}. This function
 * should be called immediately on the worker entrypoint.
 * @return A void promise that resolves once the initial state request has been fulfilled.
 */
export function provideReduxOMTInitialState<S = any>(state: S): Promise<void> {
  if (!IS_ON_WORKER) {
    return Promise.reject(new Error('provideReduxOMTInitialState can only be run on the worker thread'));
  }

  return timeoutListener(ReduxOMTEvent.INITIAL_STATE_REQUEST, isInitialStateRequestEvent)
    .then(
      () => {
        postMessage(createInitialStateEvent(state));
      },
      console.error
    );
}
