import {expect} from 'chai';
import {isActionDispatchedEvent} from './ActionDispatchedEvent';
import {
  createActionProcessedEvent,
  isActionProcessedEvent,
  isMutatingActionProcessedEvent
} from './ActionProcessedEvent';
import {isInitialStateEvent} from './InitialStateEvent';
import {isInitialStateRequestEvent} from './InitialStateRequestEvent';
import {isReadyEvent} from './ReadyEvent';
import {ReduxOMTEvent} from './ReduxOMTEvent';

describe('common/events', function () {
  type Spec = [(v: any) => boolean, ReduxOMTEvent];
  const specs: { [k: string]: Spec } = {
    ActionDispatchedEvent: [isActionDispatchedEvent, ReduxOMTEvent.ACTION_DISPATCHED],
    ActionProcessedEvent: [isActionProcessedEvent, ReduxOMTEvent.ACTION_PROCESSED],
    InitialStateEvent: [isInitialStateEvent, ReduxOMTEvent.INITIAL_STATE],
    InitialStateRequestEvent: [isInitialStateRequestEvent, ReduxOMTEvent.INITIAL_STATE_REQUEST],
    ReadyEvent: [isReadyEvent, ReduxOMTEvent.READY]
  };

  for (const [suiteName, [predicate, event]] of Object.entries(specs)) {
    describe(suiteName, () => {
      it('Should return false if input is falsy', () => {
        expect(predicate(null)).to.eq(false);
      });

      it('Should return false if type doesn\'t match', () => {
        expect(predicate({type: event + 1})).to.eq(false);
      });

      it('Should return true  if type matches', () => {
        expect(predicate({type: event})).to.eq(true);
      });
    });
  }

  describe('MutatingActionProcessedEvent', () => {
    it('Should skip base check if skipBaseCheck=true', () => {
      expect(() => isMutatingActionProcessedEvent(null, true))
        .to.throw('Cannot read property \'changedPaths\' of null');
    });

    it('Should return false if changedPaths is falsy', () => {
      const evt = createActionProcessedEvent({type: ''}, null);
      expect(isMutatingActionProcessedEvent(evt)).to.eq(false);
    });
  });
});
