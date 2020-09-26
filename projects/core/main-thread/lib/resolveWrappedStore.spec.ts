import {expect} from 'chai';
import {createInitialStateEvent, isInitialStateEvent} from '../../common/InitialStateEvent';
import {createInitialStateRequestEvent} from '../../common/InitialStateRequestEvent';
import {FakeWorker} from '../../test-util/FakeWorker';
import {CreateWrappedStoreInit} from './createWrappedStore';
import {resolveWrappedStore} from './resolveWrappedStore';

describe('resolveWrappedStore', function () {

  let worker: FakeWorker;
  before(async () => {
    worker = new FakeWorker();
    const storeInit: Omit<CreateWrappedStoreInit<any>, 'initialState'> = {
      syncInitialState: true,
      worker
    };
    const store$ = resolveWrappedStore(storeInit);
    worker.receiveEvent(createInitialStateEvent({foo: 'bar'}));
    await store$;
  });

  it('Should have posted initial state request message', () => {
    expect(worker._postMessage.firstCall.args[0]).to.deep.eq(createInitialStateRequestEvent());
  });

  it('Shouldn\'t have posted an initial state to the worker', () => {
    const found = worker._postMessage.getCalls().some(c => isInitialStateEvent(c.args[0]));
    expect(found).to.eq(false);
  });
});
