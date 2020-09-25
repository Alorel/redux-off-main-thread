/** @internal */
export const IS_ON_WORKER: boolean = typeof self !== 'undefined' &&
  typeof window === 'undefined' &&
  typeof postMessage === 'function';
