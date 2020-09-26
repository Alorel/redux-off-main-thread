import {expect} from 'chai';
import {compare} from 'fast-json-patch';
import {AnyAction} from 'redux';
import {SinonSpy, fake} from 'sinon';
import {createActionDispatchedEvent} from '../../common/ActionDispatchedEvent';
import {createActionProcessedEvent} from '../../common/ActionProcessedEvent';
import {createInitialStateEvent} from '../../common/InitialStateEvent';
import {createReadyEvent} from '../../common/ReadyEvent';
import {FakeWorker} from '../../test-util/FakeWorker';
import {createWrappedStore} from './createWrappedStore';
import {DevtoolsExtensionFactory} from './DevtoolsExtension';
import {WrappedStore} from './wrapped-store/WrappedStore';

interface TestObj {
  a: number;

  b: number;
}

interface TestState {
  bar: TestObj;

  foo: TestObj;
}

describe('createWrappedStore', () => {
  describe('Should throw when...', () => {
    const cfgSpec: Array<[string, any]> = [
      ['Wrapped store init missing', null],
      ['InitialState missing', {}],
      ['Worker missing', {initialState: {}}]
    ];

    for (const [err, input] of cfgSpec) {
      it(err, () => {
        expect(() => createWrappedStore(input)).to.throw(err);
      });
    }

    it('replaceReducer is called', () => {
      const store = createWrappedStore({initialState: {}, worker: new FakeWorker()});
      expect(() => store.replaceReducer(null as any)).to.throw('replaceReducer unsupported');
    });
  });

  describe('event processing', () => {
    let store: WrappedStore<TestState>;
    let worker: FakeWorker;
    beforeEach(() => {
      worker = new FakeWorker();
      store = createWrappedStore<TestState>({
        initialState: {
          bar: {a: 3, b: 4},
          foo: {a: 1, b: 2}
        },
        worker
      });
    });

    it('Should not update state if it isn\'t a mutating action processed event', () => {
      const oldState = store.getState();
      worker.receiveEvent(createActionProcessedEvent({type: ''}));
      expect(store.getState()).to.eq(oldState);
    });

    it('Should mutate state if it\'s a mutating action processed event', () => {
      const oldState = store.getState();

      worker.receiveEvent(
        createActionProcessedEvent(
          {type: ''},
          [
            ['foo'],
            ['foo', 'a']
          ],
          compare(oldState, {
            ...oldState,
            foo: {
              ...oldState.foo,
              a: 1000
            }
          })
        )
      );

      const newState = store.getState();

      expect(oldState).to.not.eq(newState);
    });
  });

  describe('Init', () => {
    let worker: FakeWorker;
    let initialState: any;
    beforeEach(() => {
      worker = new FakeWorker();
      initialState = {foo: Math.random()};
    });

    it('Should just emit ready event if sync is disabled', () => {
      createWrappedStore({initialState, worker});
      expect(worker._postMessage.callCount).to.eq(1, 'callCount');
      expect(worker._postMessage.lastCall.lastArg).to.deep.eq(createReadyEvent(), 'Event');
    });

    it('Should emit ready & sync events if sync is enabled', () => {
      createWrappedStore({initialState, syncInitialState: true, worker});
      const calls = worker._postMessage.getCalls();
      expect(calls).to.have.lengthOf(2, 'callCount');

      expect(calls[0].lastArg).to.deep.eq(
        createInitialStateEvent(initialState),
        'Sync event'
      );
      expect(calls[1].lastArg).to.deep.eq(createReadyEvent(), 'Ready event');
    });
  });

  describe('Devtools', () => {
    let init: SinonSpy<[any]>;
    let send: SinonSpy<[AnyAction, any]>;
    before(() => {
      init = fake() as SinonSpy<any>;
      send = fake() as SinonSpy<any>;
      const value: DevtoolsExtensionFactory = {connect: () => ({init, send})};
      Object.defineProperty(global, '__REDUX_DEVTOOLS_EXTENSION__', {
        configurable: true,
        value
      });
    });

    after(() => {
      delete (global as any).__REDUX_DEVTOOLS_EXTENSION__;
    });

    describe('Event processing', () => {
      let store: WrappedStore<TestState>;
      let worker: FakeWorker;

      beforeEach(() => {
        worker = new FakeWorker();
        init.resetHistory();
        send.resetHistory();
        store = createWrappedStore<TestState>({
          devtoolsInit: true,
          initialState: {
            bar: {a: 3, b: 4},
            foo: {a: 1, b: 2}
          },
          worker
        });
      });

      it('Shouldn\'t update state or notify devtools if it\'s an irrelevant event', () => {
        const oldState = store.getState();
        worker.receiveEvent(createReadyEvent());

        expect(store.getState()).to.eq(oldState, 'State change');
        expect(send.callCount).to.eq(0, 'callCount');
      });

      it('Should leave state untouched but emit devtools event on non-mutating action', () => {
        const oldState = store.getState();
        worker.receiveEvent(createActionProcessedEvent({type: ''}));

        expect(store.getState()).to.eq(oldState, 'State change');
        expect(send.callCount).to.eq(1, 'callCount');
        expect(send.lastCall.args).to.deep.eq([{type: ''}, oldState], 'args');
      });

      it('Should mutate state & emit devtools event', () => {
        const oldState = store.getState();

        worker.receiveEvent(
          createActionProcessedEvent(
            {type: ''},
            [
              ['foo'],
              ['foo', 'a']
            ],
            compare(oldState, {
              ...oldState,
              foo: {
                ...oldState.foo,
                a: 1000
              }
            })
          )
        );

        const newState = store.getState();

        expect(oldState).to.not.eq(newState);
        expect(send.callCount).to.eq(1, 'callCount');
        expect(send.lastCall.args).to.deep.eq([{type: ''}, newState], 'args');
      });
    });

    it('Should init with current state', () => {
      const s = {foo: 1};
      createWrappedStore({devtoolsInit: true, initialState: s, worker: new FakeWorker()});
      expect(init.lastCall.lastArg).to.eq(s);
    });
  });

  it('dispatch should post to worker', () => {
    const worker = new FakeWorker();
    const store = createWrappedStore({
      initialState: {},
      worker
    });
    const action = {type: 'foobar'};
    store.dispatch(action);

    // 1 call for init, one for dispatch
    expect(worker._postMessage.callCount).to.eq(2, 'callCount');
    expect(worker._postMessage.lastCall.args).to.deep
      .eq([createActionDispatchedEvent(action)], 'args');
  });

  it('onChange should emit action, oldState and newState', () => {
    const worker = new FakeWorker();
    const store = createWrappedStore<TestState>({
      initialState: {
        bar: {a: 3, b: 4},
        foo: {a: 1, b: 2}
      },
      worker
    });
    const changeListener = fake();
    store.onChange(changeListener);
    const oldState = store.getState();
    const action = {type: ''};

    worker.receiveEvent(
      createActionProcessedEvent(
        action,
        [
          ['foo'],
          ['foo', 'a']
        ],
        compare(oldState, {
          ...oldState,
          foo: {
            ...oldState.foo,
            a: 1000
          }
        })
      )
    );

    const newState = store.getState();
    const call = changeListener.lastCall;

    expect(!!call).to.eq(true, 'Called');
    expect(call.args[0]).to.eq(action, 'action arg');
    expect(call.args[1]).to.eq(newState, 'new state arg');
    expect(call.args[2]).to.eq(oldState, 'old state arg');
  });

  it('subscribe() should be called when state changes', () => {
    const worker = new FakeWorker();
    const store = createWrappedStore<TestState>({
      initialState: {
        bar: {a: 3, b: 4},
        foo: {a: 1, b: 2}
      },
      worker
    });
    const changeListener = fake();
    store.subscribe(changeListener);
    const oldState = store.getState();
    const action = {type: ''};

    worker.receiveEvent(
      createActionProcessedEvent(
        action,
        [
          ['foo'],
          ['foo', 'a']
        ],
        compare(oldState, {
          ...oldState,
          foo: {
            ...oldState.foo,
            a: 1000
          }
        })
      )
    );

    expect(changeListener.callCount).to.eq(1);
  });
});
