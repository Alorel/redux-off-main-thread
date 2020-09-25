import {isReduxOMTReadyEvent} from '../../common/ReadyEvent';
import {ReduxOMTEvent} from '../../common/ReduxOMTEvent';
import {IS_ON_WORKER} from './support';
import {timeoutListener} from './timeoutListener';

const READY$: Promise<void> = IS_ON_WORKER ?
  timeoutListener(ReduxOMTEvent.READY, isReduxOMTReadyEvent) :
  null as any;

export function onReduxWorkerThreadReady(): Promise<void> {
  return READY$ || Promise.reject(new Error('Not on worker thread'));
}

