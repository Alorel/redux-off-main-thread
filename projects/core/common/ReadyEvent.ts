import {is} from './is';
import {ReduxOMTEvent} from './ReduxOMTEvent';

/** @internal */
export interface ReadyEvent {
  type: ReduxOMTEvent.READY;
}

/** @internal */
export function createReadyEvent(): ReadyEvent {
  return {type: ReduxOMTEvent.READY};
}

/** @internal */
export function isReadyEvent(v: any): v is ReadyEvent {
  return is(v, ReduxOMTEvent.READY);
}
