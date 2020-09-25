import {Action, Dispatch} from 'redux';
import {createActionDispatchedEvent} from '../../../common/ActionDispatchedEvent';
import {WorkerPartial} from './WorkerPartial';

/** @internal */
export function createDispatch<A extends Action>(worker: WorkerPartial): Dispatch<A> {
  return function dispatch(action) {
    worker.postMessage(createActionDispatchedEvent(action));

    return action;
  };
}
