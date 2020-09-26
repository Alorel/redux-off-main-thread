import {compare, Operation} from 'fast-json-patch';
import {AnyAction, Dispatch, Middleware, MiddlewareAPI} from 'redux';
import {isActionDispatchedEvent} from '../../common/ActionDispatchedEvent';
import {createActionProcessedEvent} from '../../common/ActionProcessedEvent';

/** @internal */
import '../../common/declarations';

import {getChangedPaths} from './getChangedPaths';
import {IS_ON_WORKER} from './support';

function process(action: AnyAction, oldState: any, newState: any): void {
  const diff: Operation[] = compare(oldState, newState);
  const changedPaths: string[][] | null = getChangedPaths(diff);

  const msg = changedPaths ?
    createActionProcessedEvent(action, changedPaths, diff) :
    createActionProcessedEvent(action);

  postMessage(msg);
}

const middleware: Middleware = (store: MiddlewareAPI) => {
  addEventListener('message', ({data}) => {
    if (isActionDispatchedEvent(data)) {
      store.dispatch(data.action);
    }
  });

  return (next: Dispatch) =>
    /* eslint-disable implicit-arrow-linebreak */
    (action: AnyAction): void => {
      const oldState: any = store.getState();
      next(action);
      process(action, oldState, store.getState());
    };
  /* eslint-enable implicit-arrow-linebreak */
};

/** Create a redux-off-main-thread middleware instance. This should be run on the worker thread. */
export function createReduxOMTMiddleware(): Middleware {
  if (!IS_ON_WORKER) {
    throw new Error('Not running in a worker context');
  }

  return middleware;
}
