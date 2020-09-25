import {is} from './is';
import {ReduxOMTEvent} from './ReduxOMTEvent';

/** @internal */
export interface ReduxOMTReadyEvent {
  type: ReduxOMTEvent.READY;
}

/** @internal */
export function createReduxOMTReadyEvent(): ReduxOMTReadyEvent {
  return {type: ReduxOMTEvent.READY};
}

/** @internal */
export function isReduxOMTReadyEvent(v: any): v is ReduxOMTReadyEvent {
  return is(v, ReduxOMTEvent.READY);
}
