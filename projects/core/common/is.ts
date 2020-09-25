import {ReduxOMTEvent} from './ReduxOMTEvent';

/** @internal */
export function is(obj: any, type: ReduxOMTEvent): boolean {
  return !!obj && obj.type === type;
}
