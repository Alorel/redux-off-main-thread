/** @internal */
export const enum ReduxOMTEvent { // eslint-disable-line no-shadow
  ACTION_PROCESSED = 'romt:action-processed',
  ACTION_DISPATCHED = 'romt:dispatched',
  INITIAL_STATE = 'romt:initial-state',
  READY = 'romt:ready',
  INITIAL_STATE_REQUEST = 'romt:rq-initial-state'
}
