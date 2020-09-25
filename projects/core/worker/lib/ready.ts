import {isReduxOMTReadyEvent} from '../../common/ReadyEvent';
import {ReduxOMTEvent} from '../../common/ReduxOMTEvent';
import {IS_ON_WORKER} from './support';
import {timeoutListener} from './timeoutListener';

const READY$: Promise<void> = IS_ON_WORKER ?
  timeoutListener(ReduxOMTEvent.READY, isReduxOMTReadyEvent) :
  null as any;

/**
 * Resolves when the worker receives a ready event, indicating that the main thread has finished setting up
 * event listeners. Should be instant unless you've created some weird environment e.g. during CI.
 * Rejects when called outside a worker thread.
 */
export function onReduxWorkerThreadReady(): Promise<void> {
  return READY$ || Promise.reject(new Error('Not on worker thread'));
}

