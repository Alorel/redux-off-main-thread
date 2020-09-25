import {isInitialStateEvent} from '../../common/InitialStateEvent';
import {ReduxOMTEvent} from '../../common/ReduxOMTEvent';
import {IS_ON_WORKER} from './support';
import {timeoutListener} from './timeoutListener';

const INITIAL_STATE$: Promise<any> = IS_ON_WORKER ?
  timeoutListener(ReduxOMTEvent.INITIAL_STATE, isInitialStateEvent, e => e.state) :
  null as any;

export function onReduxWorkerThreadInitialStateReceived(): Promise<any> {
  return INITIAL_STATE$ || Promise.reject(new Error('Not on worker thread'));
}
