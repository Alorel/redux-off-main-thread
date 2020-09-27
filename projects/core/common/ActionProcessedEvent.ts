import {Operation} from 'fast-json-patch';
import {Action, AnyAction} from 'redux';
import {is} from './is';
import {ReduxOMTEvent} from './ReduxOMTEvent';

/** @internal */
export interface BaseActionProcessedEvent<A extends Action = AnyAction> {
  action: A;

  type: ReduxOMTEvent.ACTION_PROCESSED;
}

/** @internal */
export interface NoopActionProcessedEvent<A extends Action = AnyAction> extends BaseActionProcessedEvent<A> {
  changedPaths: null;
}

/** @internal */
export interface MutatingActionProcessedEvent<A extends Action = AnyAction>
  extends BaseActionProcessedEvent<A> {

  changedPaths: string[][];

  diff: Operation[];
}

/** @internal */
export function createActionProcessedEvent<A extends Action>(
  action: A,
  changedPaths?: null
): NoopActionProcessedEvent<A>;

/** @internal */
export function createActionProcessedEvent<A extends Action>(
  action: A,
  changedPaths: string[][],
  diff: Operation[]
): MutatingActionProcessedEvent<A>;

/** @internal */
export function createActionProcessedEvent(
  action: AnyAction,
  changedPaths?: null | string[][],
  diff?: Operation[]
): NoopActionProcessedEvent | MutatingActionProcessedEvent {
  const out: BaseActionProcessedEvent = {
    action,
    type: ReduxOMTEvent.ACTION_PROCESSED
  };

  if (changedPaths) {
    (out as MutatingActionProcessedEvent).changedPaths = changedPaths;
    (out as MutatingActionProcessedEvent).diff = diff as Operation[];
  } else {
    (out as NoopActionProcessedEvent).changedPaths = null;
  }

  return out as MutatingActionProcessedEvent;
}

/** @internal */
export function isActionProcessedEvent<A extends Action = AnyAction>(
  v: any
): v is (NoopActionProcessedEvent<A> | MutatingActionProcessedEvent<A>) {
  return is(v, ReduxOMTEvent.ACTION_PROCESSED);
}

/** @internal */
export function isMutatingActionProcessedEvent<A extends Action = AnyAction>(
  v: any
): v is MutatingActionProcessedEvent<A> {
  return Boolean(v.changedPaths);
}
