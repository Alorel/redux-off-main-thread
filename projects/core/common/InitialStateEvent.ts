import {is} from './is';
import {ReduxOMTEvent} from './ReduxOMTEvent';

/** @internal */
export interface InitialStateEvent<S> {
  state: S;

  type: ReduxOMTEvent.INITIAL_STATE;
}

/** @internal */
export function createInitialStateEvent<S>(state: S): InitialStateEvent<S> {
  return {
    state,
    type: ReduxOMTEvent.INITIAL_STATE
  };
}

/** @internal */
export function isInitialStateEvent<S = any>(v: any): v is InitialStateEvent<S> {
  return is(v, ReduxOMTEvent.INITIAL_STATE);
}
