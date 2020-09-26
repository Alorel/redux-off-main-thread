import {is} from './is';
import {ReduxOMTEvent} from './ReduxOMTEvent';

/** @internal */
export interface InitialStateRequestEvent {
  type: ReduxOMTEvent.INITIAL_STATE_REQUEST;
}

/** @internal */
export function createInitialStateRequestEvent(): InitialStateRequestEvent {
  return {type: ReduxOMTEvent.INITIAL_STATE_REQUEST};
}

/** @internal */
export function isInitialStateRequestEvent(v: any): v is InitialStateRequestEvent {
  return is(v, ReduxOMTEvent.INITIAL_STATE_REQUEST);
}
