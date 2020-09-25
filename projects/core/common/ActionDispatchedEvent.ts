import {Action, AnyAction} from 'redux';
import {is} from './is';
import {ReduxOMTEvent} from './ReduxOMTEvent';

/** @internal */
export interface ActionDispatchedEvent<A extends Action = AnyAction> {
  action: A;

  type: ReduxOMTEvent.ACTION_DISPATCHED
}

/** @internal */
export function createActionDispatchedEvent<A extends Action>(action: A): ActionDispatchedEvent<A> {
  return {
    action,
    type: ReduxOMTEvent.ACTION_DISPATCHED
  };
}

/** @internal */
export function isActionDispatchedEvent<A extends Action = AnyAction>(v: any): v is ActionDispatchedEvent<A> {
  return is(v, ReduxOMTEvent.ACTION_DISPATCHED);
}
